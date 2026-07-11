import { 
  MovieListResponse, 
  MovieDetailResponse, 
  Category, 
  Country, 
  MovieListParams 
} from '../../types/movie';

// Helper function to fetch from local proxy
async function fetchFromApi<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
    
  const url = `${path}${query ? `?${query}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API fetch error on path: ${url} (status: ${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function fetchMovieList(params: MovieListParams = {}): Promise<MovieListResponse> {
  return fetchFromApi<MovieListResponse>('/api/danh-sach', {
    type: params.type || '',
    page: params.page || 1,
    limit: params.limit || 24,
    sort_field: params.sort_field || 'modified_time',
    sort_type: params.sort_type || 'desc',
    category: params.category || '',
    country: params.country || '',
    year: params.year || ''
  });
}

export async function fetchPhimMoi(page = 1, limit = 24): Promise<MovieListResponse> {
  return fetchFromApi<MovieListResponse>('/api/danh-sach/phim-moi-cap-nhat', { page, limit });
}

export async function fetchMovieDetail(slug: string): Promise<MovieDetailResponse> {
  return fetchFromApi<MovieDetailResponse>(`/api/phim/${slug}`);
}

export async function searchMovies(keyword: string, page = 1, limit = 24): Promise<MovieListResponse> {
  return fetchFromApi<MovieListResponse>('/api/tim-kiem', { keyword, page, limit });
}

export async function fetchGenres(): Promise<Category[]> {
  return fetchFromApi<Category[]>('/api/the-loai');
}

export async function fetchCountries(): Promise<Country[]> {
  return fetchFromApi<Country[]>('/api/quoc-gia');
}

export async function fetchByGenre(slug: string, page = 1, limit = 24): Promise<MovieListResponse> {
  return fetchMovieList({ category: slug, page, limit });
}

export async function fetchByCountry(slug: string, page = 1, limit = 24): Promise<MovieListResponse> {
  return fetchMovieList({ country: slug, page, limit });
}

export async function fetchByYear(year: string | number, page = 1, limit = 24): Promise<MovieListResponse> {
  return fetchMovieList({ year, page, limit });
}

export function getAbsoluteFrontEndImageUrl(url: string | undefined | null): string {
  if (!url) return 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&auto=format&fit=crop&q=80';
  let absUrl = url.trim();
  if (!absUrl.startsWith('http://') && !absUrl.startsWith('https://') && !absUrl.startsWith('//')) {
    // If it's a relative path, let's normalize it!
    const trimmedUrl = absUrl.replace(/^\//, '');
    if (trimmedUrl.startsWith('uploads/movies/') || trimmedUrl.startsWith('upload/vod/') || trimmedUrl.startsWith('uploads/') || trimmedUrl.startsWith('upload/')) {
      absUrl = `https://phimimg.com/${trimmedUrl}`;
    } else {
      absUrl = `https://img.ophim.live/uploads/movies/${trimmedUrl}`;
    }
  } else if (absUrl.startsWith('//')) {
    absUrl = `https:${absUrl}`;
  }

  // Ensure it's proxied via wsrv.nl if it belongs to one of the blocked domains
  const proxyDomains = [
    'phimimg.com',
    'ophimimg.com',
    'img.ophim.live',
    'img.phimapi.com',
    'phim.nguonc.com',
    'img.nguonphim.tv',
    'api.nguonphim.tv',
    'ophim1.com',
    'ophim17.cc',
    'phimapi.com',
    'myanimelist.net',
    'cdn.myanimelist.net',
    'image.tmdb.org'
  ];

  const needsProxy = proxyDomains.some(domain => absUrl.includes(domain));
  const isAlreadyProxied = absUrl.includes('image.php?url=') || absUrl.includes('wsrv.nl') || absUrl.includes('weserv.nl');

  if (needsProxy && !isAlreadyProxied) {
    return `https://wsrv.nl/?url=${encodeURIComponent(absUrl)}`;
  }
  return absUrl;
}

