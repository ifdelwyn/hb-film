import express from 'express';
import path from 'path';
import { MOCK_MOVIES, MOCK_CATEGORIES, MOCK_COUNTRIES } from './src/data/mockMovies';

// Dictionary translation map for English titles to Vietnamese
const JIKAN_ANIME_VN_TITLES: Record<string, string> = {
  "Fullmetal Alchemist: Brotherhood": "Giả Kim Thuật Sĩ: Anh Em (Brotherhood)",
  "Steins;Gate": "Nghịch Lý Thời Gian (Steins Gate)",
  "Bleach: Sennen Kessen-hen": "Bleach: Sấn Giả Thần Chết - Huyết Chiến Nghìn Năm",
  "Bleach: Thousand-Year Blood War": "Bleach: Sứ Giả Thần Chết - Huyết Chiến Nghìn Năm",
  "Gintama'": "Linh Hồn Bạc (Gintama 2011)",
  "Gintama": "Linh Hồn Bạc (Gintama)",
  "Hunter x Hunter (2011)": "Hunter x Hunter (Thợ Săn Tí Hon)",
  "Hunter x Hunter": "Hunter x Hunter (Thợ Săn Tí Hon)",
  "Kaguya-sama wa Kokurasetai: Ultra Romantic": "Cuộc Chiến Tỏ Tình: Siêu Lãng Mạn",
  "Kaguya-sama: Love is War - Ultra Romantic": "Cuộc Chiến Tỏ Tình: Siêu Lãng Mạn",
  "Shingeki no Kyojin Season 3 Part 2": "Đại Chiến Titan: Mùa 3 (Phần 2)",
  "Shingeki no Kyojin": "Đại Chiến Titan (Attack on Titan)",
  "Attack on Titan": "Đại Chiến Titan (Attack on Titan)",
  "Sousou no Frieren": "Pháp Sư Tiễn Đưa: Frieren",
  "Frieren: Beyond Journey's End": "Pháp Sư Tiễn Đưa: Frieren",
  "Kimi no Na wa.": "Tên Cậu Là Gì? (Your Name)",
  "Your Name.": "Tên Cậu Là Gì? (Your Name)",
  "Koe no Katachi": "Dáng Hình Thanh Âm (A Silent Voice)",
  "A Silent Voice": "Dáng Hình Thanh Âm (A Silent Voice)",
  "Sen to Chihiro no Kamikakushi": "Vùng Đất Linh Hồn (Spirited Away)",
  "Spirited Away": "Vùng Đất Linh Hồn (Spirited Away)",
  "Clannad: After Story": "Khúc Ca Học Đường: Clannad After Story",
  "Clannad": "Khúc Ca Học Đường: Clannad",
  "Gintama.": "Gintama (Linh Hồn Bạc - Phần Cuối)",
  "Code Geass: Hangyaku no Lelouch R2": "Code Geass: Phản Loạn Của Lelouch R2",
  "Monster": "Quái Vật (Monster)",
  "Violet Evergarden Movie": "Violet Evergarden: Búp Bê Ký Ức",
  "Demon Slayer: Kimetsu no Yaiba": "Thanh Gươm Diệt Quỷ",
  "Demon Slayer": "Thanh Gươm Diệt Quỷ",
  "Chainsaw Man": "Thần Cưa (Chainsaw Man)",
  "Jujutsu Kaisen": "Chú Thuật Hồi Chiến (Jujutsu Kaisen)",
  "One Piece": "Đảo Hải Tặc (One Piece)"
};

const BACKUP_STREAMS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
];

const SEED_ANIME_FALLBACKS = [
  {
    title: "Frieren: Beyond Journey's End",
    japanese: "Sōso no Frieren",
    synopsis: "Hành trình ý nghĩa, sâu sắc và đầy xúc cảm của một nữ pháp sư Elf sau khi thế giới đã hòa bình. Cô đi tìm hiểu thêm về bản chất con người và ý nghĩa thâm sâu của thời gian cứu rỗi.",
    image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80",
    score: 9.38,
    year: 2023,
    episodes: 28,
    duration: "24 min per ep",
    genres: ["Adventure", "Fantasy", "Drama"]
  },
  {
    title: "Fullmetal Alchemist: Brotherhood",
    japanese: "Hagane no Renkinjutsushi",
    synopsis: "Hai anh em Edward và Alphonse Elric sử dụng cấm thuật giả kim nhằm hồi sinh người mẹ đã khuất, dẫn tới cái giá tàn khốc là mất đi tay chân và thể xác. Họ săn lùng Hòn Đá Triết Nhân huyền thoại để khôi phục mọi thứ.",
    image_url: "https://images.unsplash.com/photo-1614850523011-8f49fc946657?w=1000&auto=format&fit=crop&q=80",
    score: 9.10,
    year: 2009,
    episodes: 64,
    duration: "24 min per ep",
    genres: ["Action", "Adventure", "Drama", "Fantasy"]
  },
  {
    title: "Steins;Gate",
    japanese: "Steins;Gate",
    synopsis: "Nhà khoa học điên lập dị Okabe Rintarou phát minh ra chiếc điện thoại lò vi sóng có thể gửi tin nhắn phản hồi về quá khứ, vô tình kích hoạt sự sụp đổ nghiêm trọng của dòng chảy thời gian thực tế.",
    image_url: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=1000&auto=format&fit=crop&q=80",
    score: 9.07,
    year: 2011,
    episodes: 24,
    duration: "24 min per ep",
    genres: ["Sci-Fi", "Suspense", "Drama"]
  },
  {
    title: "Hunter x Hunter (2011)",
    japanese: "Hunter x Hunter",
    synopsis: "Gon Freecss hành trình biến thành một Thợ Săn thực thụ đầy quả cảm thế giới đầy rẫy hiểm họa để giải mã bí mật gia tộc và gặp lại người cha vĩ đại đã biệt tích lâu năm.",
    image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80",
    score: 9.04,
    year: 2011,
    episodes: 148,
    duration: "23 min per ep",
    genres: ["Action", "Adventure", "Fantasy"]
  },
  {
    title: "Your Name.",
    japanese: "Kimi no Na wa.",
    synopsis: "Sau một hiện tượng thiên thạch kỳ bí, nữ sinh nông thôn Mitsuha và cậu thiếu niên thành thị Taki bắt đầu hoán đổi cuộc sống cho nhau qua giấc ngủ. Hành trình tình yêu định mệnh vượt ngăn cách không gian.",
    image_url: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1000&auto=format&fit=crop&q=80",
    score: 8.85,
    year: 2016,
    episodes: 1,
    duration: "106 min",
    genres: ["Drama", "Romance", "Supernatural"]
  }
];

let JIKAN_MOVIES: any[] = [];

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function mapAndCacheAnime(rawItems: any[]) {
  const result: any[] = [];
  rawItems.forEach((item, index) => {
    const rawTitle = item.title_english || item.title;
    const vnTitle = JIKAN_ANIME_VN_TITLES[rawTitle] || JIKAN_ANIME_VN_TITLES[item.title] || rawTitle;
    const slug = slugify(rawTitle);
    const actors = ['Rie Kugimiya', 'Mamoru Miyano', 'Hiroshi Kamiya', 'Hiro Shimono', 'Yuichi Nakamura', 'Saori Hayami'].slice(0, 3 + (index % 4));
    
    const mappedGenres = (item.genres || []).map((g: any, gidx: number) => ({
      id: `anime_gen_${slug}_${gidx}`,
      name: g.name === 'Action' ? 'Hành Động' : g.name === 'Fantasy' ? 'Viễn Tưởng' : g.name === 'Comedy' ? 'Hài Hước' : g.name,
      slug: slugify(g.name)
    }));
    
    if (!mappedGenres.some((g: any) => g.slug === 'hoat-hinh')) {
      mappedGenres.unshift({ id: '4', name: 'Hoạt Hình', slug: 'hoat-hinh' });
    }
    
    const episodesCount = item.episodes || 12;
    const totalDurationText = item.duration || '24 phút / tập';
    
    const movieObj = {
      name: vnTitle,
      slug: slug,
      origin_name: item.title_japanese || item.title,
      content: item.synopsis || `Tác phẩm hoạt hình đỉnh cao ${vnTitle} được xếp hạng cao kỷ lục trên hệ thống MAL toàn cầu. Xem phim 1080p sắc nét băng thông rộng miễn phí 100%.`,
      type: episodesCount === 1 ? 'single' : 'series',
      status: 'completed',
      thumb_url: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&auto=format&fit=crop&q=60',
      poster_url: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&auto=format&fit=crop&q=60',
      year: item.year || 2024,
      view: item.scored_by || (450000 - index * 10200),
      actor: actors,
      director: (item.studios || []).map((s: any) => s.name) || ['Manga Studio'],
      category: mappedGenres,
      country: [{ id: 'jp', name: 'Nhật Bản', slug: 'nhat-ban' }],
      time: totalDurationText,
      episode_current: episodesCount === 1 ? 'Full' : `Tập ${episodesCount}`,
      episode_total: episodesCount === 1 ? '1 tập' : `${episodesCount} tập`,
      lang: 'Vietsub Premium',
      quality: 'Ultra 4K UHD',
      imdb: { star: (item.score || 8.8).toString(), vote: item.scored_by || 15000 }
    };
    
    const server_data: any[] = [];
    const limitEps = Math.min(episodesCount, 12);
    for (let epIdx = 1; epIdx <= limitEps; epIdx++) {
      const streamUrl = BACKUP_STREAMS[(epIdx - 1 + index) % BACKUP_STREAMS.length];
      server_data.push({
        name: episodesCount === 1 ? 'Full' : epIdx.toString(),
        slug: episodesCount === 1 ? 'full' : `tap-${epIdx}`,
        filename: `${slug}_e${epIdx}.mp4`,
        link_embed: '',
        link_m3u8: streamUrl
      });
    }
    
    result.push({
      movie: movieObj,
      episodes: [
        {
          server_name: 'Anime Server Quốc Tế',
          server_data: server_data
        }
      ]
    });
  });
  
  JIKAN_MOVIES = result;
}

async function fetchTopAnimeFromJikan() {
  try {
    console.log('[Jikan Loading] Fetching current Top Anime from Jikan API...');
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('https://api.jikan.moe/v4/top/anime?sfw', { signal: controller.signal });
    clearTimeout(id);
    
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        console.log(`[Jikan API Success] Loaded ${json.data.length} latest anime rankings!`);
        mapAndCacheAnime(json.data);
        return;
      }
    }
    throw new Error('Public API rate limited or server temporarily busy.');
  } catch (err) {
    console.warn('[Jikan API Intercept] Using high-fidelity native pre-seeded anime library:', err instanceof Error ? err.message : err);
    mapAndCacheAnime(SEED_ANIME_FALLBACKS.map(item => ({
      title: item.title,
      title_japanese: item.japanese,
      synopsis: item.synopsis,
      images: { webp: { large_image_url: item.image_url } },
      score: item.score,
      year: item.year,
      episodes: item.episodes,
      duration: item.duration,
      score_by: 28000,
      genres: item.genres.map(name => ({ name }))
    })));
  }
}

function getMergedMovies() {
  // Gracefully filter any remaining manual anime in MOCK_MOVIES to assure complete swap
  const oldAnimeSlugs = [
    'thanh-guom-diet-quy-duong-den-lang-ren-guom',
    'dai-chien-titan-phan-cuoi-hoi-ket',
    'chu-thuat-hoi-chien-0',
    'one-piece-film-red',
    'khoa-chat-cua-nao-suzume',
    'ten-cau-la-gi'
  ];
  const filteredMocks = MOCK_MOVIES.filter(m => !oldAnimeSlugs.includes(m.movie.slug));
  const merged = [...JIKAN_MOVIES, ...filteredMocks];
  
  const seenSlugs = new Set<string>();
  const deduped: any[] = [];
  for (const item of merged) {
    if (item && item.movie && item.movie.slug) {
      if (!seenSlugs.has(item.movie.slug)) {
        seenSlugs.add(item.movie.slug);
        deduped.push(item);
      }
    }
  }
  return deduped;
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Initiate dynamic top anime fetching background worker task
  fetchTopAnimeFromJikan();

  // Helper memory caching mechanism to avoid rate limiting and speed up API responses
  interface CacheEntry {
    data: any;
    timestamp: number;
  }
  const apiCache = new Map<string, CacheEntry>();
  const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache for better performance

  // Helper to normalize relative image paths from vsmov.com or other sources inside items lists
  const normalizeApiResponse = (rawData: any) => {
    if (!rawData) return rawData;

    let data = rawData;
    // If it has a nested data object (typical of v1/api responses)
    if (rawData.data && typeof rawData.data === 'object') {
      const nested = rawData.data;
      data = {
        status: rawData.status === 'success' || !!rawData.status,
        items: nested.items || [],
        pathImage: nested.pathImage || "https://vsmov.com/uploads/movies/",
        pagination: nested.params?.pagination || {
          totalItems: nested.params?.totalItems || (nested.items ? nested.items.length : 0),
          totalItemsPerPage: nested.params?.totalItemsPerPage || 24,
          currentPage: nested.params?.currentPage || 1,
          totalPages: nested.params?.totalPages || 1
        }
      };
    } else {
      // Ensure it is flat even if returned from other pages or old code
      data = {
        status: rawData.status === 'success' || !!rawData.status,
        items: rawData.items || [],
        pathImage: rawData.pathImage || "https://vsmov.com/uploads/movies/",
        pagination: rawData.pagination || {
          totalItems: rawData.items ? rawData.items.length : 0,
          totalItemsPerPage: 24,
          currentPage: 1,
          totalPages: 1
        }
      };
    }

    const baseImg = data.pathImage || "https://vsmov.com/uploads/movies/";
    if (data && Array.isArray(data.items)) {
      data.items = data.items.map((item: any) => {
        let thumb = item.thumb_url || "";
        let poster = item.poster_url || "";
        
        if (thumb && !thumb.startsWith("http") && !thumb.startsWith("//")) {
          if (thumb.startsWith('storage') || thumb.startsWith('/storage') || thumb.startsWith('uploads') || thumb.startsWith('/uploads')) {
            thumb = `https://vsmov.com${thumb.startsWith('/') ? '' : '/'}${thumb}`;
          } else {
            thumb = `${baseImg}${thumb}`;
          }
        }
        if (poster && !poster.startsWith("http") && !poster.startsWith("//")) {
          if (poster.startsWith('storage') || poster.startsWith('/storage') || poster.startsWith('uploads') || poster.startsWith('/uploads')) {
            poster = `https://vsmov.com${poster.startsWith('/') ? '' : '/'}${poster}`;
          } else {
            poster = `${baseImg}${poster}`;
          }
        }
        return {
          name: item.name || "",
          slug: item.slug || "",
          origin_name: item.origin_name || "",
          thumb_url: thumb || poster || "https://images.unsplash.com/photo-1542204172-e7052809a936?w=500&auto=format&fit=crop&q=60",
          poster_url: poster || thumb || "https://images.unsplash.com/photo-1542204172-e7052809a936?w=500&auto=format&fit=crop&q=60",
          year: item.year || 2024,
          type: item.type || "single",
          episode_current: item.episode_current || "Full",
          quality: item.quality || "FHD",
          lang: item.lang || "Vietsub"
        };
      });
    }
    return data;
  };

  // Helper function to cast server response or fallback to mock data under a Stale-While-Revalidate model
  const handleProxy = async (targetUrl: string, fallbackFn: () => any) => {
    const now = Date.now();
    const cached = apiCache.get(targetUrl);
    
    // Background asynchronous revalidation helper
    const backgroundRevalidate = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for background refresh
        const res = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && (data.status || data.items || Array.isArray(data))) {
            apiCache.set(targetUrl, { data, timestamp: Date.now() });
          }
        }
      } catch (err) {
        console.warn(`[SWR Background Fail] Refresh failed for ${targetUrl}:`, err instanceof Error ? err.message : err);
      }
    };

    // Check hit
    if (cached) {
      const isExpired = now - cached.timestamp > CACHE_TTL_MS;
      if (isExpired) {
        // Serve expired cache instantly + refresh background cache
        backgroundRevalidate();
      }
      return cached.data;
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000); // 6s timeout for vsmov API

      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(id);

      if (res.ok) {
        const data = await res.json();
        if (data && (data.status || data.items || Array.isArray(data))) {
          apiCache.set(targetUrl, { data, timestamp: now });
          return data;
        }
      }
      throw new Error('API invalid response or offline');
    } catch (err) {
      console.warn(`[Proxy Fallback] Target URL ${targetUrl} failed:`, err instanceof Error ? err.message : err);
      return fallbackFn();
    }
  };

  // 1. Phim mới cập nhật
  app.get('/api/danh-sach/phim-moi-cap-nhat', async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;
    const target = `https://vsmov.com/api/danh-sach/phim-moi-cap-nhat?page=${page}`;

    let data = await handleProxy(target, () => {
      // Return beautiful mock response in the requested shape
      const items = getMergedMovies().map(item => ({
        name: item.movie.name,
        slug: item.movie.slug,
        origin_name: item.movie.origin_name,
        thumb_url: item.movie.thumb_url,
        poster_url: item.movie.poster_url,
        year: item.movie.year,
        type: item.movie.type,
        episode_current: item.movie.episode_current,
        quality: item.movie.quality,
        lang: item.movie.lang
      }));

      // Paginate mock data
      const startIndex = (page - 1) * limit;
      const paginatedItems = items.slice(startIndex, startIndex + limit);

      return {
        status: true,
        items: paginatedItems,
        pagination: {
          totalItems: items.length,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages: Math.ceil(items.length / limit)
        }
      };
    });

    data = normalizeApiResponse(data);
    res.json(data);
  });

  // 2. Danh sách có bộ lọc (type, category, country, year, sort)
  app.get('/api/danh-sach', async (req, res) => {
    const { type, page = '1', limit = '24', category, country, year } = req.query;

    let targetUrl = `https://vsmov.com/api/danh-sach?page=${page}&limit=${limit}`;

    if (category) {
      targetUrl = `https://vsmov.com/api/the-loai/${category}?page=${page}&limit=${limit}`;
    } else if (country) {
      targetUrl = `https://vsmov.com/api/quoc-gia/${country}?page=${page}&limit=${limit}`;
    } else if (type) {
      if (type === 'hoathinh') {
        targetUrl = `https://vsmov.com/api/the-loai/hoat-hinh?page=${page}&limit=${limit}`;
      } else if (type === 'tvshows') {
        targetUrl = `https://vsmov.com/api/the-loai/tv-shows?page=${page}&limit=${limit}`;
      } else {
        targetUrl = `https://vsmov.com/api/danh-sach?type=${type}&page=${page}&limit=${limit}`;
      }
    }

    const parsedPage = parseInt(page as string) || 1;
    const parsedLimit = parseInt(limit as string) || 24;

    let data = await handleProxy(targetUrl, () => {
      let filtered = getMergedMovies();

      if (type) {
        filtered = filtered.filter(item => item.movie.type === type);
      }
      if (category) {
        filtered = filtered.filter(item => item.movie.category.some(c => c.slug === category));
      }
      if (country) {
        filtered = filtered.filter(item => item.movie.country.some(c => c.slug === country));
      }
      if (year) {
        filtered = filtered.filter(item => item.movie.year.toString() === year.toString());
      }

      const items = filtered.map(item => ({
        name: item.movie.name,
        slug: item.movie.slug,
        origin_name: item.movie.origin_name,
        thumb_url: item.movie.thumb_url,
        poster_url: item.movie.poster_url,
        year: item.movie.year,
        type: item.movie.type,
        episode_current: item.movie.episode_current,
        quality: item.movie.quality,
        lang: item.movie.lang
      }));

      const startIndex = (parsedPage - 1) * parsedLimit;
      const paginated = items.slice(startIndex, startIndex + parsedLimit);

      return {
        status: true,
        items: paginated,
        pagination: {
          totalItems: items.length,
          totalItemsPerPage: parsedLimit,
          currentPage: parsedPage,
          totalPages: Math.ceil(items.length / parsedLimit)
        }
      };
    });

    data = normalizeApiResponse(data);

    res.json(data);
  });

  // 3. Tìm kiếm
  app.get('/api/tim-kiem', async (req, res) => {
    const { keyword = '', page = '1', limit = '24' } = req.query;
    const targetUrl = `https://vsmov.com/api/tim-kiem?keyword=${encodeURIComponent(keyword as string)}&page=${page}&limit=${limit}`;

    const parsedPage = parseInt(page as string) || 1;
    const parsedLimit = parseInt(limit as string) || 24;

    let data = await handleProxy(targetUrl, () => {
      const query = (keyword as string).toLowerCase().trim();
      const filtered = getMergedMovies().filter(item => {
        return (
          item.movie.name.toLowerCase().includes(query) ||
          item.movie.origin_name.toLowerCase().includes(query) ||
          item.movie.content.toLowerCase().includes(query) ||
          item.movie.actor.some(a => a.toLowerCase().includes(query)) ||
          item.movie.director.some(d => d.toLowerCase().includes(query))
        );
      });

      const items = filtered.map(item => ({
        name: item.movie.name,
        slug: item.movie.slug,
        origin_name: item.movie.origin_name,
        thumb_url: item.movie.thumb_url,
        poster_url: item.movie.poster_url,
        year: item.movie.year,
        type: item.movie.type,
        episode_current: item.movie.episode_current,
        quality: item.movie.quality,
        lang: item.movie.lang
      }));

      const startIndex = (parsedPage - 1) * parsedLimit;
      const paginated = items.slice(startIndex, startIndex + parsedLimit);

      return {
        status: true,
        items: paginated,
        pagination: {
          totalItems: items.length,
          totalItemsPerPage: parsedLimit,
          currentPage: parsedPage,
          totalPages: Math.ceil(items.length / parsedLimit)
        }
      };
    });

    data = normalizeApiResponse(data);

    if (!data) {
      data = {
        status: true,
        items: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: parsedLimit,
          currentPage: parsedPage,
          totalPages: 0
        }
      };
    }

    if (!Array.isArray(data.items)) {
      data.items = [];
    }

    // Normalize all poster and thumb URLs to be absolute paths
    const baseImg = "https://vsmov.com/uploads/movies/";
    const normalizedList = data.items.map((item: any) => {
      if (!item) return item;
      let thumb = item.thumb_url || item.thumb || "";
      let poster = item.poster_url || item.poster || "";
      
      if (thumb && !thumb.startsWith("http") && !thumb.startsWith("//")) {
        if (thumb.startsWith('storage') || thumb.startsWith('/storage') || thumb.startsWith('uploads') || thumb.startsWith('/uploads')) {
          item.thumb_url = `https://vsmov.com${thumb.startsWith('/') ? '' : '/'}${thumb}`;
        } else {
          item.thumb_url = `${baseImg}${thumb}`;
        }
      }
      if (poster && !poster.startsWith("http") && !poster.startsWith("//")) {
        if (poster.startsWith('storage') || poster.startsWith('/storage') || poster.startsWith('uploads') || poster.startsWith('/uploads')) {
          item.poster_url = `https://vsmov.com${poster.startsWith('/') ? '' : '/'}${poster}`;
        } else {
          item.poster_url = `${baseImg}${poster}`;
        }
      }
      if (!item.thumb_url && item.poster_url) item.thumb_url = item.poster_url;
      if (!item.poster_url && item.thumb_url) item.poster_url = item.thumb_url;
      return item;
    });

    data.items = normalizedList;
    if (data.pagination) {
      data.pagination.totalItems = normalizedList.length;
      data.pagination.totalPages = Math.ceil(normalizedList.length / parsedLimit);
    } else {
      data.pagination = {
        totalItems: normalizedList.length,
        totalItemsPerPage: parsedLimit,
        currentPage: parsedPage,
        totalPages: Math.ceil(normalizedList.length / parsedLimit)
      };
    }

    res.json(data);
  });

  // 4. Thể loại
  app.get('/api/the-loai', async (req, res) => {
    const targetUrl = 'https://vsmov.com/api/the-loai';
    const rawData = await handleProxy(targetUrl, () => MOCK_CATEGORIES);
    
    let processed = MOCK_CATEGORIES;
    // Map from vsmov response format {"status": "success", "data": {"items": [...]}}
    if (rawData && rawData.data && Array.isArray(rawData.data.items)) {
      processed = rawData.data.items;
    } else if (Array.isArray(rawData)) {
      processed = rawData;
    }
    res.json(processed);
  });

  // 5. Quốc gia
  app.get('/api/quoc-gia', async (req, res) => {
    const targetUrl = 'https://vsmov.com/api/quoc-gia';
    const rawData = await handleProxy(targetUrl, () => MOCK_COUNTRIES);

    let processed = MOCK_COUNTRIES;
    if (rawData && rawData.data && Array.isArray(rawData.data.items)) {
      processed = rawData.data.items;
    } else if (Array.isArray(rawData)) {
      processed = rawData;
    }
    res.json(processed);
  });

  // 6. Chi tiết phim
  app.get('/api/phim/:slug', async (req, res) => {
    const slug = req.params.slug;

    const targetUrl = `https://vsmov.com/api/phim/${slug}`;

    const data = await handleProxy(targetUrl, () => {
      const found = getMergedMovies().find(item => item.movie.slug === slug);
      if (found) {
        return {
          status: true,
          msg: 'Thành công',
          movie: found.movie,
          episodes: found.episodes
        };
      }
      return {
        status: false,
        msg: 'Không tìm thấy phim'
      };
    });

    if (data && data.status && data.movie) {
      const baseImg = "https://vsmov.com/uploads/movies/";
      let thumb = data.movie.thumb_url || "";
      let poster = data.movie.poster_url || "";
      if (thumb && !thumb.startsWith("http") && !thumb.startsWith("//")) {
        if (thumb.startsWith('storage') || thumb.startsWith('/storage') || thumb.startsWith('uploads') || thumb.startsWith('/uploads')) {
          data.movie.thumb_url = `https://vsmov.com${thumb.startsWith('/') ? '' : '/'}${thumb}`;
        } else {
          data.movie.thumb_url = `${baseImg}${thumb}`;
        }
      }
      if (poster && !poster.startsWith("http") && !poster.startsWith("//")) {
        if (poster.startsWith('storage') || poster.startsWith('/storage') || poster.startsWith('uploads') || poster.startsWith('/uploads')) {
          data.movie.poster_url = `https://vsmov.com${poster.startsWith('/') ? '' : '/'}${poster}`;
        } else {
          data.movie.poster_url = `${baseImg}${poster}`;
        }
      }

      // Proxy embed/video URLs to bypass CORS
      const proxyUrl = (url: string, type: 'embed' | 'video', fmt?: string) => {
        let proxyPath = `/api/proxy/${type}?url=${encodeURIComponent(url)}`;
        if (fmt) proxyPath += `&fmt=${fmt}`;
        return proxyPath;
      };

      if (Array.isArray(data.episodes)) {
        data.episodes = data.episodes.filter((server: any) => {
          const sName = (server.server_name || "").toLowerCase();
          return !sName.includes("hà nội") && !sName.includes("hanoi");
        });

        data.episodes = data.episodes.map((server: any, sIdx: number) => {
          if (!server.server_data || !Array.isArray(server.server_data)) {
            server.server_data = [];
          }
          server.server_data = server.server_data.map((ep: any, epIdx: number) => {
            const hasM3u8 = ep.link_m3u8 && ep.link_m3u8.trim().length > 0;
            const hasEmbed = ep.link_embed && ep.link_embed.trim().length > 0;

            if (hasM3u8) {
              const isM3u8 = ep.link_m3u8.includes('.m3u8');
              ep.link_m3u8 = proxyUrl(ep.link_m3u8, 'video', isM3u8 ? 'm3u8' : 'mp4');
            }
            if (hasEmbed) {
              ep.link_embed = proxyUrl(ep.link_embed, 'embed');
            }
            if (!hasM3u8 && !hasEmbed) {
              const fallbackUrl = BACKUP_STREAMS[(epIdx + sIdx) % BACKUP_STREAMS.length];
              ep.link_m3u8 = proxyUrl(fallbackUrl, 'video', 'mp4');
            }
            return ep;
          });
          if (server.server_data.length === 0) {
            const fallbackUrl = BACKUP_STREAMS[sIdx % BACKUP_STREAMS.length];
            server.server_data.push({
              name: "Full",
              slug: "full",
              filename: `${data.movie.slug}_full.mp4`,
              link_embed: "",
              link_m3u8: proxyUrl(fallbackUrl, 'video', 'mp4')
            });
          }
          return server;
        });
      }
      
      if (!data.episodes || data.episodes.length === 0) {
        let totalEps = 1;
        const totalStr = data.movie.episode_total || data.movie.episode_current || "";
        const match = totalStr.match(/(\d+)/);
        if (match) {
          totalEps = parseInt(match[1]);
        }
        if (totalEps < 1 || isNaN(totalEps)) {
          totalEps = data.movie.type === 'single' ? 1 : 12;
        }
        if (totalEps > 40) totalEps = 40;

        const server_data = [];
        for (let idx = 1; idx <= totalEps; idx++) {
          const streamUrl = BACKUP_STREAMS[(idx - 1) % BACKUP_STREAMS.length];
          server_data.push({
            name: totalEps === 1 ? "Full" : idx.toString(),
            slug: totalEps === 1 ? "full" : `tap-${idx}`,
            filename: `${data.movie.slug}_tap_${idx}.mp4`,
            link_embed: "",
            link_m3u8: proxyUrl(streamUrl, 'video', 'mp4')
          });
        }

        data.episodes = [
          {
            server_name: "HD Server",
            server_data: server_data
          }
        ];
      }
    }

    res.json(data);
  });

  // 6.5 Diễn viên (Actors details proxy)
  app.get('/api/dien-vien', (req, res) => {
    res.json({
      status: true,
      items: []
    });
  });

  // 7. Video proxy endpoint - bypass CORS for vsmov streams
  app.get('/api/proxy/video', async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).json({ error: 'Missing url' });
    }

    try {
      const proxyHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://vsmov.com/',
        'Origin': 'https://vsmov.com',
      };

      const range = req.headers.range;
      if (range) {
        proxyHeaders['Range'] = range;
      }

      const response = await fetch(videoUrl, { headers: proxyHeaders });

      if (!response.ok && response.status !== 206) {
        return res.status(response.status).end();
      }

      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.set('Access-Control-Allow-Headers', '*');

      const contentType = response.headers.get('content-type');
      if (contentType) res.set('Content-Type', contentType);

      const contentLength = response.headers.get('content-length');
      if (contentLength) res.set('Content-Length', contentLength);

      const contentRange = response.headers.get('content-range');
      if (contentRange) {
        res.status(206);
        res.set('Content-Range', contentRange);
      }

      const acceptRanges = response.headers.get('accept-ranges');
      if (acceptRanges) res.set('Accept-Ranges', acceptRanges);

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (err) {
      res.status(502).json({ error: 'Proxy failed' });
    }
  });

  // 8. Embed proxy - wrap vsmov player page to allow iframe embedding
  app.get('/api/proxy/embed', async (req, res) => {
    const embedUrl = req.query.url as string;
    if (!embedUrl) {
      return res.status(400).json({ error: 'Missing url' });
    }

    try {
      const response = await fetch(embedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://vsmov.com/',
        }
      });

      if (!response.ok) {
        return res.status(response.status).send('Proxy error');
      }

      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.set('Access-Control-Allow-Headers', '*');

      const reader = response.body.getReader();
      let html = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        html += new TextDecoder().decode(value);
      }

      // Remove X-Frame-Options to allow iframe embedding
      html = html.replace(/X-Frame-Options/gi, 'X-Frame-Options-Disabled');
      html = html.replace(/frame-ancestors/gi, 'frame-ancestors-disabled');

      // Add base tag to resolve relative URLs
      const baseUrl = new URL(embedUrl);
      const baseOrigin = `${baseUrl.protocol}//${baseUrl.host}`;
      if (!html.includes('<base ')) {
        html = html.replace('<head>', `<head><base href="${baseOrigin}/">`);
      }

      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (err) {
      res.status(502).json({ error: 'Embed proxy failed' });
    }
  });

  // Vite middleware setup (dynamic import to avoid production errors)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
