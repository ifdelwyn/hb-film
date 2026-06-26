// src/services/tmdbService.ts
import { MovieListItem } from '../types/movie';

const TMDB_KEY = '258b3339f75a903dd4ee5de4e9542bc2';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

const TMDB_GENRES: Record<number, string> = {
  28: "Hành Động",
  12: "Phiêu Lưu",
  16: "Hoạt Hình",
  35: "Hài",
  80: "Hình Sự",
  99: "Tài Liệu",
  18: "Chính Kịch",
  10751: "Gia Đình",
  14: "Kỳ Ảo",
  36: "Lịch Sử",
  27: "Kinh Dị",
  10402: "Nhạc",
  9648: "Bí Ẩn",
  10749: "Lãng Mạn",
  878: "Khoa Học Viễn Tưởng",
  10770: "Phim TV",
  53: "Gây Cấn",
  10752: "Chiến Tranh",
  37: "Tây Phương"
};

// Caching Helpers with TTL 2 hours
function getCachedData(key: string): any | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    if (now - timestamp < twoHours) {
      return data;
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error('Error reading localStorage cache:', e);
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Error setting localStorage cache:', e);
  }
}

// Fetch helper with 1 Retry logic
async function fetchWithRetry(url: string, retries = 1): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying fetch for URL: ${url}. Retries left: ${retries - 1}`);
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

// Global API Request handler with caching and language parameters
async function fetchTmdb(endpoint: string, params: Record<string, string | number> = {}): Promise<any> {
  const queryParams = new URLSearchParams({
    endpoint,
    language: 'vi-VN',
    region: 'VN',
    ...params
  } as any);

  const cacheKey = `tmdb_cache_${endpoint}_${queryParams.toString()}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `/api/tmdb-proxy?${queryParams.toString()}`;
  const data = await fetchWithRetry(url, 1);
  setCachedData(cacheKey, data);
  return data;
}

// Normalize a TMDB Movie Item to conform to both requested schema & internal app structures
export function normalizeTmdbMovie(item: any): any {
  if (!item) return null;

  const release_year = item.release_date ? new Date(item.release_date).getFullYear() : 2024;
  const rating = item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 7.5;
  const genres = (item.genre_ids || []).map((id: number) => TMDB_GENRES[id] || '').filter(Boolean);
  
  if (genres.length === 0 && item.genres) {
    genres.push(...item.genres.map((g: any) => g.name));
  }

  const title = item.title || item.original_title || 'Phim TMDB';
  const original_title = item.original_title || '';
  const id = `tmdb_${item.id}`;
  const slug = `tmdb-${item.id}`; // custom unique slug identifier

  const poster_path = item.poster_path;
  const backdrop_path = item.backdrop_path;
  const poster_url = poster_path ? `${IMG_URL}${poster_path}` : '/assets/no-poster.jpg';
  const backdrop_url = backdrop_path ? `https://image.tmdb.org/t/p/original${backdrop_path}` : poster_url;

  return {
    id,
    slug,
    source: 'tmdb',
    title,
    name: title, // Support components that expect movie.name
    original_title,
    origin_name: original_title, // Support components that expect movie.origin_name
    overview: item.overview || 'Mô tả phim đang được cập nhật.',
    content: item.overview || 'Mô tả phim đang được cập nhật.', // Support components that expect movie.content
    poster_url,
    backdrop_url,
    thumb_url: backdrop_url, // Support components that expect movie.thumb_url
    release_year,
    year: release_year, // Support components that expect movie.year
    release_date: item.release_date || '',
    vote_average: item.vote_average || 0,
    rating,
    imdb: {
      star: rating.toString(),
      vote: item.vote_count ? item.vote_count.toLocaleString() : '100'
    },
    genres,
    category: genres.map((g: string) => ({ id: g, name: g, slug: g })), // Support components that expect movie.category
    country: [{ id: 'au-my', name: 'Âu Mỹ', slug: 'au-my' }], // default or placeholder country
    runtime: item.runtime || 100,
    time: item.runtime ? `${item.runtime} phút` : '100 phút', // Support components that expect movie.time
    type: 'single', // 'series' or 'single'
    episode_current: 'Full',
    episode_total: '1 tập',
    quality: 'FHD',
    lang: 'Vietsub'
  };
}

// 1. Toàn bộ Movie Conan (collection ID = 39199) ~29 phim
export async function fetchConanMovies(): Promise<any[]> {
  try {
    const res = await fetchTmdb(`/collection/39199`);
    if (res && Array.isArray(res.parts)) {
      const normalized = res.parts.map(normalizeTmdbMovie).filter(Boolean);
      // Sort newest first as required
      return normalized.sort((a, b) => b.year - a.year);
    }
  } catch (err) {
    console.error('Error fetching Conan collection:', err);
  }
  return [];
}

// 2. Toàn bộ Movie Doraemon (Sử dụng Tìm kiếm cho độ bền bỉ cao nhất)
export async function fetchDoraemonMovies(): Promise<any[]> {
  try {
    const [page1, page2] = await Promise.all([
      fetchTmdb(`/search/movie`, { query: 'Doraemon', page: 1 }).catch(() => ({ results: [] })),
      fetchTmdb(`/search/movie`, { query: 'Doraemon', page: 2 }).catch(() => ({ results: [] }))
    ]);
    
    const results = [...(page1.results || []), ...(page2.results || [])];
    if (results.length > 0) {
      const normalized = results.map(normalizeTmdbMovie).filter(Boolean);
      // Lọc các phim thực sự chứa chữ Doraemon để đảm bảo chính xác
      const filtered = normalized.filter(item => 
        item.title.toLowerCase().includes('doraemon') || 
        item.original_title.toLowerCase().includes('doraemon')
      );
      // Sắp xếp mới nhất lên đầu
      return filtered.sort((a, b) => b.year - a.year);
    }
  } catch (err) {
    console.error('Error fetching Doraemon search results:', err);
  }
  return [];
}

// 3. Anime movie nổi tiếng khác (genre_id=16 là Animation)
// Lấy 5 trang = ~100 phim, gọi page 1->5 rồi concat
export async function fetchAnimeMovies(page = 1): Promise<any[]> {
  try {
    const res = await fetchTmdb(`/discover/movie`, {
      with_genres: 16,
      sort_by: 'popularity.desc',
      page
    });
    if (res && Array.isArray(res.results)) {
      return res.results.map(normalizeTmdbMovie).filter(Boolean);
    }
  } catch (err) {
    console.error(`Error fetching Anime movies page ${page}:`, err);
  }
  return [];
}

// Hàm bổ trợ tải trọn vẹn 5 trang Anime movies (khoảng 100 phim)
export async function fetchAllAnimeMovies(): Promise<any[]> {
  const pages = [1, 2, 3, 4, 5];
  try {
    const promises = pages.map(p => fetchAnimeMovies(p));
    const results = await Promise.all(promises);
    return results.flat();
  } catch (err) {
    console.error('Error in fetchAllAnimeMovies:', err);
    // Fallback to page 1
    return fetchAnimeMovies(1);
  }
}

// 4. Phim hành động/phiêu lưu thịnh hành (trending/week)
export async function fetchTrending(page = 1): Promise<any[]> {
  try {
    const res = await fetchTmdb(`/trending/movie/week`, { page });
    if (res && Array.isArray(res.results)) {
      return res.results.map(normalizeTmdbMovie).filter(Boolean);
    }
  } catch (err) {
    console.error(`Error fetching trending movies page ${page}:`, err);
  }
  return [];
}

// Hàm bổ trợ tải 3 trang trending (khoảng 60 phim)
export async function fetchAllTrending(): Promise<any[]> {
  const pages = [1, 2, 3];
  try {
    const promises = pages.map(p => fetchTrending(p));
    const results = await Promise.all(promises);
    return results.flat();
  } catch (err) {
    console.error('Error in fetchAllTrending:', err);
    return fetchTrending(1);
  }
}

// 5. Phim chiếu rạp hiện tại
export async function fetchNowPlaying(page = 1): Promise<any[]> {
  try {
    const res = await fetchTmdb(`/movie/now_playing`, { page });
    if (res && Array.isArray(res.results)) {
      return res.results.map(normalizeTmdbMovie).filter(Boolean);
    }
  } catch (err) {
    console.error(`Error fetching now playing movies page ${page}:`, err);
  }
  return [];
}

// 6. Phim sắp chiếu
export async function fetchUpcoming(page = 1): Promise<any[]> {
  try {
    const res = await fetchTmdb(`/movie/upcoming`, { page });
    if (res && Array.isArray(res.results)) {
      return res.results.map(normalizeTmdbMovie).filter(Boolean);
    }
  } catch (err) {
    console.error(`Error fetching upcoming movies page ${page}:`, err);
  }
  return [];
}

// 7. Top rated all time (lấy 3 trang)
export async function fetchTopRated(page = 1): Promise<any[]> {
  try {
    const res = await fetchTmdb(`/movie/top_rated`, { page });
    if (res && Array.isArray(res.results)) {
      return res.results.map(normalizeTmdbMovie).filter(Boolean);
    }
  } catch (err) {
    console.error(`Error fetching top rated movies page ${page}:`, err);
  }
  return [];
}

export async function fetchAllTopRated(): Promise<any[]> {
  const pages = [1, 2, 3];
  try {
    const promises = pages.map(p => fetchTopRated(p));
    const results = await Promise.all(promises);
    return results.flat();
  } catch (err) {
    console.error('Error in fetchAllTopRated:', err);
    return fetchTopRated(1);
  }
}

// 8. Tìm kiếm (dùng cho SearchBar/SearchScreen)
export async function searchMovies(keyword: string): Promise<any[]> {
  if (!keyword || !keyword.trim()) return [];
  try {
    const res = await fetchTmdb(`/search/movie`, {
      query: keyword.trim()
    });
    if (res && Array.isArray(res.results)) {
      return res.results.map(normalizeTmdbMovie).filter(Boolean);
    }
  } catch (err) {
    console.error(`Error searching movies for keyword ${keyword}:`, err);
  }
  return [];
}
