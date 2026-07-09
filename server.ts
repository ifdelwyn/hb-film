import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { MOCK_MOVIES, MOCK_CATEGORIES, MOCK_COUNTRIES } from './src/data/mockMovies';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import dns from 'dns';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// Fix DNS resolution prioritizing IPv4 first (highly recommended for Docker/container environments like Cloud Run)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.warn('Could not set DNS result order:', e);
}

// Allow unauthorized (e.g. self-signed or expired) SSL/TLS certificates for community IPTV links
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Load environment variables (.env files)
dotenv.config();

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
const DISCOVERED_MOVIES = new Map<string, any>();

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
    const id = setTimeout(() => controller.abort(), 6500);
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

// DEFINING REAL MULTI-SOURCE STREAM ENGINE
const SOURCES = [
  {
    name: 'KKPhim',
    domain: 'https://phimapi.com',
    imgBase: 'https://phimimg.com/uploads/movies'
  },
  {
    name: 'OPhim',
    domain: 'https://ophim1.com',
    imgBase: 'https://ophimimg.com/uploads/movies'
  },
  {
    name: 'AnimeHub',
    domain: 'https://ophim17.cc',
    imgBase: 'https://ophimimg.com/uploads/movies'
  },
  {
    name: 'NguonC',
    domain: 'https://phim.nguonc.com',
    imgBase: ''
  },
  {
    name: 'NguonPhim',
    domain: 'https://api.nguonphim.tv',
    imgBase: 'https://img.nguonphim.tv/uploads/movies'
  }
];

// Memory caching layers
interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes TTL

function getAbsoluteImageUrl(url: string, pathImage: string, fallbackBase: string, item?: any): string {
  if (!url) return '';
  let absUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//')) {
    const trimmedUrl = url.replace(/^\//, '');

    const isOPhim = (pathImage && (pathImage.includes('ophim') || pathImage.includes('img.ophim.live'))) ||
                    (fallbackBase && (fallbackBase.includes('ophim') || fallbackBase.includes('img.ophim.live')));

    const isNguonPhim = (pathImage && pathImage.includes('nguonphim')) ||
                        (fallbackBase && fallbackBase.includes('nguonphim'));

    // Is it KKPhim (phimapi.com or phimimg.com or has modified.time)?
    // Ensure we do not misidentify OPhim or NguonPhim as KKPhim.
    const isKKPhim = !isOPhim && !isNguonPhim && (
      (pathImage && (pathImage.includes('phimapi') || (pathImage.includes('phimimg') && !pathImage.includes('ophimimg')))) ||
      (fallbackBase && (fallbackBase.includes('phimapi') || (fallbackBase.includes('phimimg') && !fallbackBase.includes('ophimimg')))) ||
      (item && item.modified?.time)
    );

    if (isKKPhim) {
      if (trimmedUrl.startsWith('uploads/movies/') || trimmedUrl.startsWith('upload/vod/') || trimmedUrl.startsWith('uploads/') || trimmedUrl.startsWith('upload/')) {
        absUrl = `https://phimimg.com/${trimmedUrl}`;
      } else {
        // Extract modified time for subfolder formatting
        let yyyymmdd = '';
        if (item && item.modified?.time) {
          try {
            const d = new Date(item.modified.time);
            if (!isNaN(d.getTime())) {
              const y = d.getUTCFullYear();
              const m = String(d.getUTCMonth() + 1).padStart(2, '0');
              const day = String(d.getUTCDate()).padStart(2, '0');
              yyyymmdd = `${y}${m}${day}`;
            }
          } catch (e) {}
        }

        // Default to current date if we cannot parse
        if (!yyyymmdd) {
          const d = new Date();
          const y = d.getUTCFullYear();
          const m = String(d.getUTCMonth() + 1).padStart(2, '0');
          const day = String(d.getUTCDate()).padStart(2, '0');
          yyyymmdd = `${y}${m}${day}`;
        }

        if (trimmedUrl.endsWith('.webp')) {
          absUrl = `https://img.phimapi.com/uploads/movies/${yyyymmdd}/${trimmedUrl}`;
        } else {
          absUrl = `https://img.phimapi.com/upload/vod/${yyyymmdd}-1/${trimmedUrl}`;
        }
      }
    } else {
      // General OPhim/Other logic
      const isOPhim = (pathImage && (pathImage.includes('ophim') || pathImage.includes('img.ophim.live'))) ||
                      (fallbackBase && (fallbackBase.includes('ophim') || fallbackBase.includes('img.ophim.live')));
      
      if (isOPhim) {
        absUrl = `https://img.ophim.live/uploads/movies/${trimmedUrl}`;
      } else {
        // Fallback to existing pathImage/fallbackBase logic
        if (trimmedUrl.startsWith('upload/') || trimmedUrl.startsWith('uploads/')) {
          let domainBase = '';
          const baseToUse = pathImage || fallbackBase;
          if (baseToUse) {
            try {
              const parsed = new URL(baseToUse);
              domainBase = parsed.origin;
            } catch (e) {
              const match = baseToUse.match(/^(https?:\/\/[^\/]+)/);
              domainBase = match ? match[1] : baseToUse;
            }
          }
          if (!domainBase) {
            domainBase = 'https://phimimg.com';
          }
          const base = domainBase.endsWith('/') ? domainBase : `${domainBase}/`;
          absUrl = `${base}${trimmedUrl}`;
        } else {
          const base = pathImage.endsWith('/') ? pathImage : `${pathImage}/`;
          absUrl = `${base}${trimmedUrl}`;
        }
      }
    }
  } else if (url.startsWith('//')) {
    absUrl = `https:${url}`;
  }

  // Handle hotlinking proxies and blocks for ALL movie provider domains
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

function normalizeItem(item: any, pathImage: string, fallbackBase: string, defaultType?: string) {
  let thumb = item.thumb_url || item.thumb || "";
  let poster = item.poster_url || item.poster || "";

  thumb = getAbsoluteImageUrl(thumb, pathImage, fallbackBase, item);
  poster = getAbsoluteImageUrl(poster, pathImage, fallbackBase, item);

  // Smart heuristic for movie type
  let movieType = item.type || defaultType;
  if (!movieType) {
    const nameLower = (item.name || "").toLowerCase();
    const current = (item.episode_current || "").toLowerCase();
    const total = (item.episode_total || "").toLowerCase();
    if (
      current.includes('tập') || 
      current.includes('tap') || 
      total.includes('tập') || 
      total.includes('tap') || 
      nameLower.includes('phần') ||
      nameLower.includes('season') ||
      item.type === 'series'
    ) {
      movieType = 'series';
    } else {
      movieType = 'single';
    }
  }

  const normalized = {
    name: item.name || "",
    slug: item.slug || "",
    origin_name: item.origin_name || item.original_name || "",
    thumb_url: thumb || poster || "https://images.unsplash.com/photo-1542204172-e7052809a936?w=500&auto=format&fit=crop&q=60",
    poster_url: poster || thumb || "https://images.unsplash.com/photo-1542204172-e7052809a936?w=500&auto=format&fit=crop&q=60",
    year: parseInt(item.year) || 2024,
    type: movieType,
    episode_current: item.episode_current || item.current_episode || "Full",
    quality: item.quality || "FHD",
    lang: item.lang || item.language || "Vietsub",
    category: item.category || [],
    country: item.country || [],
    content: item.content || ""
  };

  // Cache in DISCOVERED_MOVIES Map
  if (normalized.slug && typeof DISCOVERED_MOVIES !== 'undefined') {
    if (!DISCOVERED_MOVIES.has(normalized.slug)) {
      DISCOVERED_MOVIES.set(normalized.slug, {
        movie: normalized,
        episodes: []
      });
    }
  }

  return normalized;
}

// Unified multi-source fallback resolver
async function fetchWithFallback<T>(
  getPath: (source: typeof SOURCES[0]) => string,
  transform: (data: any, source: typeof SOURCES[0]) => T,
  fallbackVal: T
): Promise<T> {
  const now = Date.now();
  const cacheKey = getPath(SOURCES[0]);
  const cached = apiCache.get(cacheKey);

  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  for (const source of SOURCES) {
    try {
      const url = getPath(source);
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3500); // 3.5s timeout max per gateway to fail fast

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          console.log(`[Proxy Status] Gateway ${source.name} response type is ${contentType}`);
          continue;
        }
        const rawJson = await response.json();
        if (rawJson && (rawJson.status === true || rawJson.status === 'success' || rawJson.items || rawJson.data || rawJson.movie)) {
          const result = transform(rawJson, source);
          apiCache.set(cacheKey, { data: result, timestamp: now });
          return result;
        }
      }
    } catch (err) {
      console.log(`[Proxy Status] Gateway ${source.name} query completed`);
    }
  }

  return fallbackVal;
}

// YouTube Trailer Embed URL formatter
function getEmbedTrailerUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

// Fetch trailer from TMDB on the fly using movie name and year search
async function fetchTrailerFromTmdb(movieName: string, year?: number): Promise<string | null> {
  try {
    const TMDB_KEY = process.env.TMDB_API_KEY || '258b3339f75a903dd4ee5de4e9542bc2';
    const query = encodeURIComponent(movieName);
    const yearParam = year ? `&year=${year}` : '';
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${query}${yearParam}&language=vi-VN`;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const searchRes = await fetch(searchUrl, { signal: controller.signal });
    clearTimeout(id);

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const results = searchData.results || [];
      if (results.length > 0) {
        const movieId = results[0].id;

        // Fetch videos/trailers
        const videosUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_KEY}`;
        const vController = new AbortController();
        const vId = setTimeout(() => vController.abort(), 10000);
        const videosRes = await fetch(videosUrl, { signal: vController.signal });
        clearTimeout(vId);

        if (videosRes.ok) {
          const videosData = await videosRes.json();
          const vids = videosData.results || [];

          // Priority: Official Trailer > Trailer > Teaser
          const trailer =
            vids.find((v: any) => v.type === 'Trailer' && v.official && v.site === 'YouTube') ||
            vids.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') ||
            vids.find((v: any) => v.site === 'YouTube');

          if (trailer) {
            return `https://www.youtube.com/embed/${trailer.key}`;
          }
        }
      }
    }
  } catch (err: any) {
    console.log(`[TMDB Trailer Info] TMDB query for ${movieName} completed`);
  }
  return null;
}

function isCloseMatch(target: string, item: any): boolean {
  if (!item) return false;
  const targetLower = target.toLowerCase().trim();
  const nameLower = (item.name || "").toLowerCase().trim();
  const originLower = (item.origin_name || item.original_name || "").toLowerCase().trim();
  
  // Exact matches
  if (nameLower === targetLower || originLower === targetLower) return true;
  
  // Clean special characters and compare
  const cleanStr = (s: string) => s.replace(/[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '').replace(/\s+/g, ' ').trim();
  const cleanTarget = cleanStr(targetLower);
  const cleanName = cleanStr(nameLower);
  const cleanOrigin = cleanStr(originLower);
  
  if (cleanName === cleanTarget || cleanOrigin === cleanTarget) return true;
  
  // Partial matches with high confidence
  if (cleanName.includes(cleanTarget) || cleanOrigin.includes(cleanTarget) || cleanTarget.includes(cleanName) || cleanTarget.includes(cleanOrigin)) {
    return true;
  }
  
  // Let's also check if they share significant words
  const targetWords = cleanTarget.split(' ').filter(w => w.length > 1);
  const nameWords = cleanName.split(' ').filter(w => w.length > 1);
  const originWords = cleanOrigin.split(' ').filter(w => w.length > 1);
  
  if (targetWords.length > 0) {
    // If target has multiple words, check if they are mostly present
    const nameMatchCount = targetWords.filter(w => nameWords.includes(w)).length;
    const originMatchCount = targetWords.filter(w => originWords.includes(w)).length;
    
    const threshold = Math.max(1, Math.ceil(targetWords.length * 0.6));
    if (nameMatchCount >= threshold || originMatchCount >= threshold) {
      return true;
    }
  }
  
  return false;
}

async function findStreamSlug(movieName: string): Promise<{ source: string, slug: string } | null> {
  // First, try KKPhim
  try {
    const query = encodeURIComponent(movieName);
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${query}&limit=5`, { signal: controller.signal });
    clearTimeout(id);
    if (response.ok) {
      const data = await response.json();
      const items = data.data?.items || [];
      if (items.length > 0) {
        // Find best match matching the movie name strictly (no loose index fallback to wrong movies)
        const match = items.find((item: any) => isCloseMatch(movieName, item));
        if (match && match.slug) {
          return { source: 'KKPhim', slug: match.slug };
        }
      }
    }
  } catch (err: any) {
    console.error(`[findStreamSlug] KKPhim search failed:`, err.message || err);
  }

  // Fallback to OPhim
  try {
    const query = encodeURIComponent(movieName);
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`https://ophim1.com/v1/api/tim-kiem?keyword=${query}&limit=5`, { signal: controller.signal });
    clearTimeout(id);
    if (response.ok) {
      const data = await response.json();
      const items = data.data?.items || [];
      if (items.length > 0) {
        const match = items.find((item: any) => isCloseMatch(movieName, item));
        if (match && match.slug) {
          return { source: 'OPhim', slug: match.slug };
        }
      }
    }
  } catch (err: any) {
    console.error(`[findStreamSlug] OPhim search failed:`, err.message || err);
  }

  // Fallback to NguonC
  try {
    const query = encodeURIComponent(movieName);
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`https://phim.nguonc.com/api/films/search?keyword=${query}`, { signal: controller.signal });
    clearTimeout(id);
    if (response.ok) {
      const data = await response.json();
      const items = data.items || [];
      if (items.length > 0) {
        const match = items.find((item: any) => isCloseMatch(movieName, item));
        if (match && match.slug) {
          return { source: 'NguonC', slug: match.slug };
        }
      }
    }
  } catch (err: any) {
    console.error(`[findStreamSlug] NguonC search failed:`, err.message || err);
  }

  return null;
}

async function fetchEpisodesFromSlug(sourceName: string, streamSlug: string, expectedMovieName?: string) {
  try {
    let domain = 'https://phimapi.com';
    if (sourceName === 'OPhim') domain = 'https://ophim1.com';
    if (sourceName === 'NguonC') domain = 'https://phim.nguonc.com';

    let url = `${domain}/phim/${streamSlug}`;
    if (sourceName === 'NguonC') {
      url = `${domain}/api/film/${streamSlug}`;
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);

    if (response.ok) {
      const rawData = await response.json();
      
      // Strict verification: check if the movie details from the stream slug match the target movie
      if (expectedMovieName) {
        const foundMovie = rawData.movie || rawData.data?.movie;
        if (foundMovie) {
          const actualName = foundMovie.name || "";
          const actualOrigin = foundMovie.origin_name || foundMovie.original_name || "";
          if (!isCloseMatch(expectedMovieName, { name: actualName, origin_name: actualOrigin })) {
            console.warn(`[fetchEpisodesFromSlug Validation Failed] Stream slug "${streamSlug}" name "${actualName}" doesn't match expected "${expectedMovieName}". Discarding stream.`);
            return []; // Reject since it's a completely different movie!
          }
        }
      }

      let rawEpisodes = rawData.episodes || rawData.data?.episodes || [];
      if (sourceName === 'NguonC' && rawData.movie && rawData.movie.episodes) {
        rawEpisodes = rawData.movie.episodes;
      }
      const normalizedEpisodes = rawEpisodes.map((server: any) => {
        const rawDataList = server.server_data || server.items || [];
        const server_data = rawDataList.map((ep: any) => ({
          name: ep.name || "",
          slug: ep.slug || "",
          filename: ep.filename || ep.name || "",
          link_embed: ep.link_embed || ep.embed || "",
          link_m3u8: ep.link_m3u8 || ep.m3u8 || ""
        }));

        const originalServerName = server.server_name || "Vietsub";
        const cleanServerName = `${sourceName} - ${originalServerName}`;

        return {
          server_name: cleanServerName,
          server_data: server_data
        };
      });
      return normalizedEpisodes;
    }
  } catch (err: any) {
    console.error(`[fetchEpisodesFromSlug] Failed from ${sourceName} for ${streamSlug}:`, err.message || err);
  }
  return [];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '300mb' }));
  app.use(express.urlencoded({ limit: '300mb', extended: true }));

  // IPTV Stream Proxy to bypass CORS restrictions and support headers/absolute path rewriting
  app.get('/api/tv/proxy', async (req, res) => {
    try {
      const urlStr = req.query.url as string;
      if (!urlStr) {
        return res.status(400).send('Missing url parameter');
      }

      const decodedUrl = decodeURIComponent(urlStr);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

      const userAgent = req.query.userAgent as string || req.query.user_agent as string;
      const referer = req.query.referer as string || req.query.referrer as string;

      const requestHeaders: Record<string, string> = {
        'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      };

      if (referer) {
        requestHeaders['Referer'] = referer;
      }

      const response = await fetch(decodedUrl, {
        headers: requestHeaders,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Allow CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      const contentType = response.headers.get('content-type') || '';
      
      // If it is an HLS playlist (.m3u8 or contains #EXTM3U), parse and rewrite relative URLs
      const isPlaylist = decodedUrl.toLowerCase().includes('.m3u8') || 
                        decodedUrl.toLowerCase().includes('.m3u') || 
                        contentType.includes('mpegurl') || 
                        contentType.includes('mpegURL') ||
                        contentType.includes('application/x-mpegurl') ||
                        contentType.includes('text/plain');

      if (isPlaylist) {
        let text = await response.text();
        if (text.includes('#EXTM3U')) {
          const lines = text.split('\n');
          const rewrittenLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
              return line;
            }
            try {
              // Convert relative URL to absolute relative to original .m3u8 URL
              const absUrl = new URL(trimmed, decodedUrl).href;
              
              // Wrap the absolute URL back into our proxy to ensure child playlists and segments also bypass CORS and get the headers!
              let proxiedUrl = `/api/tv/proxy?url=${encodeURIComponent(absUrl)}`;
              if (userAgent) {
                proxiedUrl += `&userAgent=${encodeURIComponent(userAgent)}`;
              }
              if (referer) {
                proxiedUrl += `&referer=${encodeURIComponent(referer)}`;
              }
              return proxiedUrl;
            } catch (err) {
              return line;
            }
          });
          
          res.status(response.status);
          res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
          return res.send(rewrittenLines.join('\n'));
        }
      }

      // Fallback: Send raw binary file (e.g. video chunks/segments)
      res.status(response.status);
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      if (response.body) {
        Readable.fromWeb(response.body as any).pipe(res);
      } else {
        res.end();
      }
    } catch (err: any) {
      console.error('IPTV stream proxy error:', err.message || err);
      if (err.cause) {
        console.error('IPTV stream proxy error cause:', err.cause.message || err.cause);
      }
      if (!res.headersSent) {
        res.status(500).send(err.message || 'IPTV Proxy Error');
      }
    }
  });

  // TMDB API Proxy to bypass browser/client CORS issues, sandbox iframe limits, and keep the API key safe.
  app.get('/api/tmdb-proxy', async (req, res) => {
    try {
      const endpoint = req.query.endpoint as string;
      if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint is required' });
      }

      const TMDB_KEY = process.env.TMDB_API_KEY || '258b3339f75a903dd4ee5de4e9542bc2';
      
      const queryParams = new URLSearchParams();
      queryParams.set('api_key', TMDB_KEY);
      
      for (const [key, value] of Object.entries(req.query)) {
        if (key !== 'endpoint') {
          queryParams.set(key, value as string);
        }
      }

      const tmdbUrl = `https://api.themoviedb.org/3${endpoint}?${queryParams.toString()}`;
      
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(tmdbUrl, { signal: controller.signal });
      clearTimeout(id);

      if (!response.ok) {
        return res.status(response.status).json({ error: `TMDB returned status ${response.status}` });
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error('Error in tmdb-proxy:', err.message || err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  // Deezer API proxy to resolve browser CORS issues
  app.get('/api/music/deezer-proxy', async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      if (!url.startsWith('https://api.deezer.com/')) {
        return res.status(400).json({ error: 'Invalid proxy target' });
      }

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);

      if (!response.ok) {
        return res.status(response.status).json({ error: `Deezer returned status ${response.status}` });
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error('Error in deezer-proxy:', err.message || err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  // iTunes API proxy to ensure flawless connectivity in sandboxed iframes
  app.get('/api/music/itunes-proxy', async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      if (!url.startsWith('https://itunes.apple.com/')) {
        return res.status(400).json({ error: 'Invalid proxy target' });
      }

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);

      if (!response.ok) {
        return res.status(response.status).json({ error: `iTunes returned status ${response.status}` });
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error('Error in itunes-proxy:', err.message || err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  // Zing MP3 search proxy to support full-length songs
  app.get('/api/music/zing-search', async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) {
        return res.status(400).json({ error: 'Query is required' });
      }
      
      const url = `http://ac.mp3.zing.vn/complete?type=artist,song,key,code&num=50&query=${encodeURIComponent(q)}`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Zing Search returned status ${response.status}` });
      }
      
      const parsed = await response.json();
      const tracks: any[] = [];
      
      if (parsed && parsed.data) {
        let rawSongs: any[] = [];
        if (Array.isArray(parsed.data)) {
          for (const item of parsed.data) {
            if (item && Array.isArray(item.song)) {
              rawSongs.push(...item.song);
            }
          }
        } else if (parsed.data.song && Array.isArray(parsed.data.song)) {
          rawSongs.push(...parsed.data.song);
        }
        
        for (const item of rawSongs) {
          if (!item.id) continue;
          let artwork = item.thumb || '';
          if (artwork && !artwork.startsWith('http')) {
            artwork = `https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_jpeg/${artwork}`;
          }
          if (!artwork) {
            artwork = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';
          }
          
          tracks.push({
            id: `zing-${item.id}`,
            name: item.name || 'Unknown Track',
            artist: item.artist || 'Unknown Artist',
            artwork: artwork,
            previewUrl: `/api/music/zing-stream/${item.id}`,
            duration: parseInt(item.duration) || 240,
            source: 'Zing MP3'
          });
        }
      }
      
      res.json({ results: tracks });
    } catch (err: any) {
      console.error('Error in zing-search proxy:', err.message || err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  // Zing MP3 full-song stream proxy to bypass iframe mixed-content block
  app.get('/api/music/zing-stream/:id', async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).send('ID is required');
      }
      
      const streamUrl = `https://api.mp3.zing.vn/api/streaming/audio/${id}/128`;
      const response = await fetch(streamUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://mp3.zing.vn/'
        }
      });
      
      if (!response.ok) {
        return res.redirect(302, streamUrl);
      }
      
      res.setHeader('Content-Type', 'audio/mpeg');
      const contentLength = response.headers.get('Content-Length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      const acceptRanges = response.headers.get('Accept-Ranges');
      if (acceptRanges) {
        res.setHeader('Accept-Ranges', acceptRanges);
      }
      
      if (response.body) {
        const nodeStream = Readable.fromWeb(response.body as any);
        nodeStream.pipe(res);
      } else {
        res.redirect(302, streamUrl);
      }
    } catch (err: any) {
      console.error('Zing MP3 stream proxy error:', err);
      res.redirect(302, `https://api.mp3.zing.vn/api/streaming/audio/${req.params.id}/128`);
    }
  });

  // Background worker rank trigger
  // fetchTopAnimeFromJikan(); // Disabled auto-updates per user instruction.

  // 1. Phim mới cập nhật
  app.get('/api/danh-sach/phim-moi-cap-nhat', async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;

    const getPath = (source: typeof SOURCES[0]) => {
      if (source.name === 'AnimeHub') {
        return `${source.domain}/v1/api/danh-sach/hoat-hinh?page=${page}`;
      }
      if (source.name === 'KKPhim') {
        return `${source.domain}/danh-sach/phim-moi-cap-nhat?page=${page}`;
      }
      if (source.name === 'NguonC') {
        return `${source.domain}/api/films/phim-moi-cap-nhat?page=${page}`;
      }
      if (source.name === 'NguonPhim') {
        return `https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${page}`;
      }
      return `${source.domain}/danh-sach/phim-moi-cap-nhat?page=${page}`;
    };

    const transform = (rawData: any, source: typeof SOURCES[0]) => {
      let items: any[] = [];
      let totalItems = 0;
      let totalPages = 1;
      let pathImage = source.imgBase;

      if (rawData.data && Array.isArray(rawData.data.items)) {
        items = rawData.data.items;
        pathImage = rawData.data.pathImage || source.imgBase;
        const pag = rawData.data.params?.pagination;
        if (pag) {
          totalItems = pag.totalItems || items.length;
          totalPages = pag.totalPages || 1;
        }
      } else if (Array.isArray(rawData.items)) {
        items = rawData.items;
        pathImage = rawData.pathImage || source.imgBase;
        const pag = rawData.pagination || rawData.paginate;
        if (pag) {
          totalItems = pag.totalItems || pag.total || items.length;
          totalPages = pag.totalPages || pag.last_page || 1;
        }
      } else if (rawData.data && Array.isArray(rawData.data)) {
        items = rawData.data;
      }

      if (!totalItems) totalItems = items.length;
      if (!totalPages) totalPages = Math.ceil(totalItems / limit);

      const normalizedItems = items.map(item => normalizeItem(item, pathImage, source.imgBase));

      return {
        status: true,
        items: normalizedItems,
        pagination: {
          totalItems,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages
        }
      };
    };

    const fallbackVal = {
      status: true,
      items: getMergedMovies().slice((page - 1) * limit, page * limit).map(item => normalizeItem(item.movie, '', '')),
      pagination: {
        totalItems: getMergedMovies().length,
        totalItemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(getMergedMovies().length / limit)
      }
    };

    const data = await fetchWithFallback(getPath, transform, fallbackVal);
    res.json(data);
  });

  // 2. Danh sách phim có bộ lọc (type, category, country, year)
  app.get('/api/danh-sach', async (req, res) => {
    const { type, page = '1', limit = '24', category, country, year } = req.query;
    const parsedPage = parseInt(page as string) || 1;
    const parsedLimit = parseInt(limit as string) || 24;

    if (type === 'tvshows' || type === 'tv-shows' || category === 'tv-shows') {
      const tvShows = [
        {
          name: "Outlast: Rừng nhiệt đới",
          slug: "outlast-rung-nhiet-doi",
          origin_name: "Outlast: The Jungle",
          thumb_url: "https://phim.nguonc.com/public/images/Post/2/outlast-rung-nhiet-doi.jpg",
          poster_url: "https://phim.nguonc.com/public/images/Post/2/outlast-rung-nhiet-doi-1.jpg",
          year: 2026,
          time: "60 Phút/Tập",
          quality: "HD",
          lang: "Vietsub",
          episode_current: "Hoàn tất (6/6)"
        },
        {
          name: "Đi Phượt Bản Giới Hạn",
          slug: "di-phuot-ban-gioi-han",
          origin_name: "Unplanned Trip: Limited Edition",
          thumb_url: "https://phim.nguonc.com/public/images/Post/1/di-phuot-ban-gioi-han.jpg",
          poster_url: "https://phim.nguonc.com/public/images/Post/1/di-phuot-ban-gioi-han-1.jpg",
          year: 2006,
          time: "45 Phút/Tập",
          quality: "HD",
          lang: "Vietsub",
          episode_current: "Hoàn tất (12/12)"
        },
        {
          name: "Show Của Đen",
          slug: "show-cua-den",
          origin_name: "Show Của Đen",
          thumb_url: "https://phim.nguonc.com/public/images/Film/vfDF76CIhgI8RhXfGfWMLKB54OQ.jpg",
          poster_url: "https://phim.nguonc.com/public/images/Film/cssGWj8TFNl8t5VCVpHeNHqDfFw.jpg",
          year: 2019,
          time: "84 phút",
          quality: "HD",
          lang: "Vietsub",
          episode_current: "Hoàn tất"
        }
      ];

      // Perform a clean search filter if requested
      const query = req.query.keyword ? (req.query.keyword as string).toLowerCase().trim() : '';
      const filtered = tvShows.filter(item => 
        !query || 
        item.name.toLowerCase().includes(query) || 
        item.origin_name.toLowerCase().includes(query)
      );

      return res.json({
        status: true,
        items: filtered,
        pagination: {
          totalItems: filtered.length,
          totalItemsPerPage: parsedLimit,
          currentPage: parsedPage,
          totalPages: Math.ceil(filtered.length / parsedLimit)
        }
      });
    }

    const getPath = (source: typeof SOURCES[0]) => {
      if (source.name === 'NguonC') {
        if (category) {
          return `${source.domain}/api/films/the-loai/${category}?page=${parsedPage}`;
        }
        if (country) {
          return `${source.domain}/api/films/quoc-gia/${country}?page=${parsedPage}`;
        }
        if (year) {
          // Fallback to recent since NguonC doesn't have a direct year api endpoint
          return `${source.domain}/api/films/phim-moi-cap-nhat?page=${parsedPage}`;
        }
        if (type) {
          if (type === 'hoathinh' || type === 'hoat-hinh') {
            return `${source.domain}/api/films/hoat-hinh?page=${parsedPage}`;
          }
          if (type === 'tvshows' || type === 'tv-shows') {
            return `${source.domain}/api/films/tv-shows?page=${parsedPage}`;
          }
          if (type === 'single') {
            return `${source.domain}/api/films/phim-le?page=${parsedPage}`;
          }
          if (type === 'series') {
            return `${source.domain}/api/films/phim-bo?page=${parsedPage}`;
          }
        }
        return `${source.domain}/api/films/phim-moi-cap-nhat?page=${parsedPage}`;
      }

      if (source.name === 'NguonPhim') {
        if (category) {
          return `https://ophim1.com/v1/api/the-loai/${category}?page=${parsedPage}`;
        }
        if (country) {
          return `https://ophim1.com/v1/api/quoc-gia/${country}?page=${parsedPage}`;
        }
        if (year) {
          return `https://ophim1.com/v1/api/nam/${year}?page=${parsedPage}`;
        }
        if (type) {
          if (type === 'hoathinh' || type === 'hoat-hinh') {
            return `https://ophim1.com/v1/api/danh-sach/hoat-hinh?page=${parsedPage}`;
          }
          if (type === 'tvshows' || type === 'tv-shows') {
            return `https://ophim1.com/v1/api/danh-sach/tv-shows?page=${parsedPage}`;
          }
          if (type === 'single') {
            return `https://ophim1.com/v1/api/danh-sach/phim-le?page=${parsedPage}`;
          }
          if (type === 'series') {
            return `https://ophim1.com/v1/api/danh-sach/phim-bo?page=${parsedPage}`;
          }
        }
        return `https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${parsedPage}`;
      }

      // OPhim / KKPhim / AnimeHub lists
      if (category) {
        return `${source.domain}/v1/api/the-loai/${category}?page=${parsedPage}`;
      }
      if (country) {
        return `${source.domain}/v1/api/quoc-gia/${country}?page=${parsedPage}`;
      }
      if (year) {
        return `${source.domain}/v1/api/nam/${year}?page=${parsedPage}`;
      }
      if (type) {
        if (type === 'hoathinh' || type === 'hoat-hinh') {
          return `${source.domain}/v1/api/danh-sach/hoat-hinh?page=${parsedPage}`;
        }
        if (type === 'tvshows' || type === 'tv-shows') {
          return `${source.domain}/v1/api/danh-sach/tv-shows?page=${parsedPage}`;
        }
        if (type === 'single') {
          return `${source.domain}/v1/api/danh-sach/phim-le?page=${parsedPage}`;
        }
        if (type === 'series') {
          return `${source.domain}/v1/api/danh-sach/phim-bo?page=${parsedPage}`;
        }
      }
      return `${source.domain}/danh-sach/phim-moi-cap-nhat?page=${parsedPage}`;
    };

    const transform = (rawData: any, source: typeof SOURCES[0]) => {
      let items: any[] = [];
      let totalItems = 0;
      let totalPages = 1;
      let pathImage = source.imgBase;

      const innerData = rawData.data;
      if (innerData && Array.isArray(innerData.items)) {
        items = innerData.items;
        pathImage = innerData.pathImage || source.imgBase;
        const pag = innerData.params?.pagination;
        if (pag) {
          totalItems = pag.totalItems || items.length;
          totalPages = pag.totalPages || 1;
        }
      } else if (Array.isArray(rawData.items)) {
        items = rawData.items;
        pathImage = rawData.pathImage || source.imgBase;
        const pag = rawData.pagination || rawData.paginate;
        if (pag) {
          totalItems = pag.totalItems || pag.total || items.length;
          totalPages = pag.totalPages || pag.last_page || 1;
        }
      }

      if (!totalItems) totalItems = items.length;
      if (!totalPages) totalPages = Math.ceil(totalItems / parsedLimit);

      const normalized = items.map(item => normalizeItem(item, pathImage, source.imgBase, type as string));

      return {
        status: true,
        items: normalized,
        pagination: {
          totalItems,
          totalItemsPerPage: parsedLimit,
          currentPage: parsedPage,
          totalPages
        }
      };
    };

    let filteredFallback = getMergedMovies();
    if (category) {
      filteredFallback = filteredFallback.filter(item => 
        item.movie.category?.some((cat: any) => cat.slug === category)
      );
    }
    if (country) {
      filteredFallback = filteredFallback.filter(item => 
        item.movie.country?.some((c: any) => c.slug === country)
      );
    }
    if (year) {
      filteredFallback = filteredFallback.filter(item => item.movie.year === parseInt(year as string));
    }
    if (type) {
      const t = (type as string).toLowerCase().trim();
      if (t === 'hoathinh' || t === 'hoat-hinh') {
        filteredFallback = filteredFallback.filter(item => 
          item.movie.category?.some((cat: any) => cat.slug === 'hoat-hinh') || item.movie.type === 'hoat-hinh'
        );
      } else if (t === 'tvshows' || t === 'tv-shows') {
        filteredFallback = filteredFallback.filter(item => item.movie.type === 'tvshows' || item.movie.type === 'tv-shows');
      } else if (t === 'single') {
        filteredFallback = filteredFallback.filter(item => item.movie.type === 'single');
      } else if (t === 'series') {
        filteredFallback = filteredFallback.filter(item => item.movie.type === 'series');
      }
    }

    const fallbackVal = {
      status: true,
      items: filteredFallback.slice((parsedPage - 1) * parsedLimit, parsedPage * parsedLimit).map(item => normalizeItem(item.movie, '', '', type as string)),
      pagination: {
        totalItems: filteredFallback.length,
        totalItemsPerPage: parsedLimit,
        currentPage: parsedPage,
        totalPages: Math.ceil(filteredFallback.length / parsedLimit)
      }
    };

    const data = await fetchWithFallback(getPath, transform, fallbackVal);
    res.json(data);
  });

  // 3. Tìm kiếm hợp nhất tất cả các nguồn (OPhim, KKPhim, NguonC)
  app.get('/api/tim-kiem', async (req, res) => {
    const { keyword = '', page = '1', limit = '24' } = req.query;
    const parsedPage = parseInt(page as string) || 1;
    const parsedLimit = parseInt(limit as string) || 24;

    const query = (keyword as string).toLowerCase().trim();
    if (!query) {
      return res.json({
        status: true,
        items: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: parsedLimit,
          currentPage: parsedPage,
          totalPages: 0
        }
      });
    }

    const encKeyword = encodeURIComponent(keyword as string);
    const seenSlugs = new Set<string>();
    const mergedList: any[] = [];

    // Parallel search queries for lightning-fast aggregation
    const searchPromises = SOURCES.map(async (src) => {
      try {
        let searchUrl = `${src.domain}/v1/api/tim-kiem?keyword=${encKeyword}&page=${parsedPage}&limit=16`;
        if (src.name === 'NguonC') {
          searchUrl = `${src.domain}/api/films/search?keyword=${encKeyword}&page=${parsedPage}`;
        }
        if (src.name === 'NguonPhim') {
          searchUrl = `https://ophim1.com/v1/api/tim-kiem?keyword=${encKeyword}&page=${parsedPage}&limit=16`;
        }

        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 7500); // Fail fast
        const response = await fetch(searchUrl, { signal: controller.signal });
        clearTimeout(tid);

        if (response.ok) {
          const raw = await response.json();
          let itemsList: any[] = [];
          let pathImg = src.imgBase;

          if (raw.data && Array.isArray(raw.data.items)) {
            itemsList = raw.data.items;
            pathImg = raw.data.pathImage || src.imgBase;
          } else if (Array.isArray(raw.items)) {
            itemsList = raw.items;
            pathImg = raw.pathImage || src.imgBase;
          } else if (raw.data && Array.isArray(raw.data)) {
            itemsList = raw.data;
          }

          return itemsList.map(item => normalizeItem(item, pathImg, src.imgBase));
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`[Search] Source ${src.name} took too long and was aborted.`);
        } else {
          console.log(`[Search] Source ${src.name} query status:`, err instanceof Error ? err.message : err);
        }
      }
      return [];
    });

    const promiseResults = await Promise.all(searchPromises);
    promiseResults.forEach(list => {
      list.forEach(item => {
        if (item && item.slug && !seenSlugs.has(item.slug)) {
          seenSlugs.add(item.slug);
          mergedList.push(item);
        }
      });
    });

    // Merge Jikan and mock search indicators
    const customMatches = getMergedMovies().filter(item => {
      return (
        item.movie.name.toLowerCase().includes(query) ||
        item.movie.origin_name.toLowerCase().includes(query) ||
        item.movie.content.toLowerCase().includes(query)
      );
    });

    customMatches.forEach(item => {
      if (!seenSlugs.has(item.movie.slug)) {
        seenSlugs.add(item.movie.slug);
        mergedList.push(normalizeItem(item.movie, '', ''));
      }
    });

    res.json({
      status: true,
      items: mergedList,
      pagination: {
        totalItems: mergedList.length,
        totalItemsPerPage: parsedLimit,
        currentPage: parsedPage,
        totalPages: Math.ceil(mergedList.length / parsedLimit)
      }
    });
  });

  // 4. Thể loại
  app.get('/api/the-loai', async (req, res) => {
    res.json(MOCK_CATEGORIES);
  });

  // 5. Quốc gia
  app.get('/api/quoc-gia', async (req, res) => {
    res.json(MOCK_COUNTRIES);
  });

  // 6. Chi tiết phim tích hợp TMDB (Trailers + HD Backdrops) + Gỡ bỏ các server Hà Nội
  app.get('/api/phim/:slug', async (req, res) => {
    try {
      let slug = req.params.slug;

      if (slug === 'outlast-rung-nhiet-doi') {
        return res.json({
          status: true,
          movie: {
            name: "Outlast: Rừng nhiệt đới",
            slug: "outlast-rung-nhiet-doi",
            origin_name: "Outlast: The Jungle",
            content: "Trên hòn đảo nhiệt đới hẻo lánh, 16 người chơi phải sống sót trong điều kiện khắc nghiệt, vượt qua đối thủ và duy trì tinh thần đồng đội để có cơ hội giành giải thưởng 1 triệu đô.",
            type: "tvshows",
            status: "completed",
            thumb_url: "https://phim.nguonc.com/public/images/Post/2/outlast-rung-nhiet-doi.jpg",
            poster_url: "https://phim.nguonc.com/public/images/Post/2/outlast-rung-nhiet-doi-1.jpg",
            backdrop_url: "https://phim.nguonc.com/public/images/Post/2/outlast-rung-nhiet-doi.jpg",
            trailer_url: "",
            year: 2026,
            view: 24500,
            actor: ["Abby Chu", "Ben Orndorff", "Braxton Fish", "Brett Johnson"],
            director: [],
            category: [{"id": "tv-shows", "name": "TV shows", "slug": "tv-shows"}],
            country: [{"id": "au-my", "name": "Âu Mỹ", "slug": "au-my"}],
            time: "60 Phút/Tập",
            episode_current: "Hoàn tất (6/6)",
            episode_total: "6 tập",
            lang: "Vietsub",
            quality: "HD",
            imdb: {
              star: "8.2",
              vote: "250"
            }
          },
          episodes: [
            {
              server_name: "Vietsub #1",
              server_data: [
                { name: "1", slug: "tap-1", filename: "Outlast: Rừng nhiệt đới Tập 1", link_embed: "https://embed18.streamc.xyz/embed.php?hash=54aa8a4bcc98f92ff2c07f2dea38609b", link_m3u8: "" },
                { name: "2", slug: "tap-2", filename: "Outlast: Rừng nhiệt đới Tập 2", link_embed: "https://embed18.streamc.xyz/embed.php?hash=f2866a92c7b41875f3be1fa4c3391990", link_m3u8: "" },
                { name: "3", slug: "tap-3", filename: "Outlast: Rừng nhiệt đới Tập 3", link_embed: "https://embed18.streamc.xyz/embed.php?hash=2314cf194390cfd2e6214861556cc69b", link_m3u8: "" },
                { name: "4", slug: "tap-4", filename: "Outlast: Rừng nhiệt đới Tập 4", link_embed: "https://embed18.streamc.xyz/embed.php?hash=c9dd6754cf250760b30191361329632b", link_m3u8: "" },
                { name: "5", slug: "tap-5", filename: "Outlast: Rừng nhiệt đới Tập 5", link_embed: "https://embed18.streamc.xyz/embed.php?hash=3920621222176881b9e4966712ed293f", link_m3u8: "" },
                { name: "6", slug: "tap-6", filename: "Outlast: Rừng nhiệt đới Tập 6", link_embed: "https://embed18.streamc.xyz/embed.php?hash=78f43342513813990c515ce13ebb83dd", link_m3u8: "" }
              ]
            }
          ]
        });
      }

      if (slug === 'di-phuot-ban-gioi-han') {
        return res.json({
          status: true,
          movie: {
            name: "Đi Phượt Bản Giới Hạn",
            slug: "di-phuot-ban-gioi-han",
            origin_name: "Unplanned Trip: Limited Edition",
            content: "Các minh tinh Park Seo Joon, Jung Yu Mi và Choi Woo Sik bất ngờ bị \"lạc trôi\" vào một chuyến đi phượt bất định, không có kế hoạch trước. Họ sẽ chống chọi ra sao với chuyến chu du tự túc vòng quanh Hàn Quốc cùng vô vàn tình huống dở khóc dở cười?",
            type: "tvshows",
            status: "completed",
            thumb_url: "https://phim.nguonc.com/public/images/Post/1/di-phuot-ban-gioi-han.jpg",
            poster_url: "https://phim.nguonc.com/public/images/Post/1/di-phuot-ban-gioi-han-1.jpg",
            backdrop_url: "https://phim.nguonc.com/public/images/Post/1/di-phuot-ban-gioi-han.jpg",
            trailer_url: "",
            year: 2006,
            view: 32400,
            actor: ["Jung Yu Mi", "Park Seo Joon", "Choi Woo Shik"],
            director: ["Na Young Seok"],
            category: [{"id": "tv-shows", "name": "TV shows", "slug": "tv-shows"}],
            country: [{"id": "han-quoc", "name": "Hàn Quốc", "slug": "han-quoc"}],
            time: "45 Phút/Tập",
            episode_current: "Hoàn tất (12/12)",
            episode_total: "12 tập",
            lang: "Vietsub",
            quality: "HD",
            imdb: {
              star: "8.5",
              vote: "410"
            }
          },
          episodes: [
            {
              server_name: "Vietsub #1",
              server_data: [
                { name: "1", slug: "tap-1", filename: "Đi Phượt Bản Giới Hạn Tập 1", link_embed: "https://embed15.streamc.xyz/embed.php?hash=36f29f5e62c69b03d95d7f5a03693fc7", link_m3u8: "" },
                { name: "2", slug: "tap-2", filename: "Đi Phượt Bản Giới Hạn Tập 2", link_embed: "https://embed18.streamc.xyz/embed.php?hash=9d1d266482616d97554a8c46ae7d945a", link_m3u8: "" },
                { name: "3", slug: "tap-3", filename: "Đi Phượt Bản Giới Hạn Tập 3", link_embed: "https://embed14.streamc.xyz/embed.php?hash=1862381a3e7748b9b34d4fdd8b98fbfc", link_m3u8: "" },
                { name: "4", slug: "tap-4", filename: "Đi Phượt Bản Giới Hạn Tập 4", link_embed: "https://embed14.streamc.xyz/embed.php?hash=7d2c2068a95417cd1507abd4c02834bd", link_m3u8: "" },
                { name: "5", slug: "tap-5", filename: "Đi Phượt Bản Giới Hạn Tập 5", link_embed: "https://embed14.streamc.xyz/embed.php?hash=19e1fd819dd72752adb39d0033c52287", link_m3u8: "" },
                { name: "6", slug: "tap-6", filename: "Đi Phượt Bản Giới Hạn Tập 6", link_embed: "https://embed14.streamc.xyz/embed.php?hash=61c840f2aba0e04ba51fb5ae17d8f419", link_m3u8: "" },
                { name: "7", slug: "tap-7", filename: "Đi Phượt Bản Giới Hạn Tập 7", link_embed: "https://embed14.streamc.xyz/embed.php?hash=5fec26c3311de6ef16626abd114dc2db", link_m3u8: "" },
                { name: "8", slug: "tap-8", filename: "Đi Phượt Bản Giới Hạn Tập 8", link_embed: "https://embed14.streamc.xyz/embed.php?hash=1a0b8e378ebbd3164e66d1d368701513", link_m3u8: "" },
                { name: "9", slug: "tap-9", filename: "Đi Phượt Bản Giới Hạn Tập 9", link_embed: "https://embed15.streamc.xyz/embed.php?hash=4d7f028e99c62ae342855116df8678a6", link_m3u8: "" },
                { name: "10", slug: "tap-10", filename: "Đi Phượt Bản Giới Hạn Tập 10", link_embed: "https://embed15.streamc.xyz/embed.php?hash=63786cbd8aa1221643707c28e633a9a1", link_m3u8: "" },
                { name: "11", slug: "tap-11", filename: "Đi Phượt Bản Giới Hạn Tập 11", link_embed: "https://embed15.streamc.xyz/embed.php?hash=2ae04c2e3650d681d1ce9c4982d1e853", link_m3u8: "" },
                { name: "12", slug: "tap-12", filename: "Đi Phượt Bản Giới Hạn Tập 12", link_embed: "https://embed15.streamc.xyz/embed.php?hash=2228e0004e70ae8dcae6076e6d996f0c", link_m3u8: "" }
              ]
            }
          ]
        });
      }

      if (slug === 'show-cua-den') {
        return res.json({
          status: true,
          movie: {
            name: "Show Của Đen",
            slug: "show-cua-den",
            origin_name: "Show Của Đen",
            content: "Kỷ niệm 10 năm làm nghề, rapper người Việt Đen Vâu trình diễn trong liveshow hoành tráng ở Thành phố Hồ Chí Minh cùng ban nhạc sống và các khách mời đặc biệt.",
            type: "tvshows",
            status: "completed",
            thumb_url: "https://phim.nguonc.com/public/images/Film/vfDF76CIhgI8RhXfGfWMLKB54OQ.jpg",
            poster_url: "https://phim.nguonc.com/public/images/Film/cssGWj8TFNl8t5VCVpHeNHqDfFw.jpg",
            backdrop_url: "https://phim.nguonc.com/public/images/Film/vfDF76CIhgI8RhXfGfWMLKB54OQ.jpg",
            trailer_url: "",
            year: 2019,
            view: 19500,
            actor: ["Đen Vâu"],
            director: [],
            category: [{"id": "tv-shows", "name": "TV shows", "slug": "tv-shows"}],
            country: [{"id": "viet-nam", "name": "Việt Nam", "slug": "viet-nam"}],
            time: "84 phút",
            episode_current: "Hoàn tất",
            episode_total: "1 tập",
            lang: "Vietsub",
            quality: "HD",
            imdb: {
              star: "8.9",
              vote: "120"
            }
          },
          episodes: [
            {
              server_name: "Vietsub #1",
              server_data: [
                { name: "Full", slug: "tap-full", filename: "Show Của Đen", link_embed: "https://embed.streamc.xyz/embed.php?hash=3c023d5bda4b93b5477003c41e139e92", link_m3u8: "" }
              ]
            }
          ]
        });
      }

      if (slug === 'tham-tu-lung-danh-conan-movie-29' || slug.includes('conan-movie-29')) {
      slug = 'tmdb-1144807';
    }

    if (slug.startsWith('tmdb-')) {
      const tmdbId = slug.replace('tmdb-', '');
      try {
        const TMDB_KEY = process.env.TMDB_API_KEY || '258b3339f75a903dd4ee5de4e9542bc2';
        const tmdbUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_KEY}&language=vi-VN&append_to_response=videos`;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 15000);
        const response = await fetch(tmdbUrl, { signal: controller.signal });
        clearTimeout(id);

        if (response.ok) {
          const item = await response.json();
          
          let title = item.title || item.original_title || 'Phim VIP';
          if (tmdbId === '1144807') {
            title = "Thám Tử Lừng Danh Conan Movie 29: Ngôi Sao Năm Cánh 1 Triệu Đô";
          }
          const original_title = item.original_title || '';
          
          const poster_path = item.poster_path;
          const backdrop_path = item.backdrop_path;
          const raw_poster_url = poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/assets/no-poster.jpg';
          const raw_backdrop_url = backdrop_path ? `https://image.tmdb.org/t/p/original${backdrop_path}` : raw_poster_url;
          const poster_url = getAbsoluteImageUrl(raw_poster_url, '', '');
          const backdrop_url = getAbsoluteImageUrl(raw_backdrop_url, '', '');
          
          const release_date = item.release_date || '';
          const release_year = release_date ? new Date(release_date).getFullYear() : 2024;
          const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : 7.0;

          const genres = item.genres ? item.genres.map((g: any) => ({ id: g.name, name: g.name, slug: slugify(g.name) })) : [];
          
          let trailerUrl = '';
          if (item.videos && item.videos.results && Array.isArray(item.videos.results)) {
            const trailer = item.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer) {
              trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
            }
          }

          const isJapanAnime = 
            tmdbId === '1144807' ||
            title.toLowerCase().includes('conan') || 
            title.toLowerCase().includes('doraemon') || 
            original_title.toLowerCase().includes('conan') || 
            original_title.toLowerCase().includes('doraemon') ||
            slug.includes('conan') ||
            slug.includes('doraemon');

          const movieCountry = isJapanAnime 
            ? [{ id: 'nhat-ban', name: 'Nhật Bản', slug: 'nhat-ban' }]
            : [{ id: 'au-my', name: 'Âu Mỹ', slug: 'au-my' }];

          const normalizedMovie = {
            name: title,
            slug: slug,
            origin_name: original_title,
            content: item.overview || 'Mô tả phim đang được cập nhật.',
            type: 'single',
            status: 'completed',
            thumb_url: backdrop_url,
            poster_url: poster_url,
            backdrop_url: backdrop_url,
            trailer_url: trailerUrl,
            year: release_year,
            view: 18500,
            actor: [],
            director: [],
            category: genres,
            country: movieCountry,
            time: item.runtime ? `${item.runtime} phút` : '100 phút',
            episode_current: 'Full',
            episode_total: '1 tập',
            lang: 'Vietsub',
            quality: 'FHD',
            imdb: {
              star: rating.toString(),
              vote: item.vote_count ? item.vote_count.toLocaleString() : '1,200'
            }
          };

          // Try to search for a stream slug on KKPhim / OPhim
          let streamEpisodes: any[] = [];
          try {
            const streamInfo = await findStreamSlug(title) || (original_title ? await findStreamSlug(original_title) : null);
            if (streamInfo) {
              console.log(`[TMDB Stream Finder] Found stream source: ${streamInfo.source} with slug ${streamInfo.slug} for TMDB movie ${title}`);
              const fetchedEp = await fetchEpisodesFromSlug(streamInfo.source, streamInfo.slug, title);
              if (fetchedEp && fetchedEp.length > 0) {
                streamEpisodes = fetchedEp;
              }
            }
          } catch (e: any) {
            console.error('[TMDB Stream Finder Error]:', e.message || e);
          }

          let episodes: any[] = [];
          if (streamEpisodes.length > 0) {
            episodes = [...streamEpisodes];
          }

          if (tmdbId === '1144807') {
            episodes.unshift(
              {
                server_name: "Nguồn Vietsub (Premium)",
                server_data: [
                  {
                    name: "Vietsub VIP 1 (High-Speed)",
                    slug: "vip-vietsub-1",
                    filename: title,
                    link_embed: `https://embed.su/embed/movie/1144807`,
                    link_m3u8: ""
                  },
                  {
                    name: "Vietsub VIP 2 (UHD Multi-Sub)",
                    slug: "vip-vietsub-2",
                    filename: title,
                    link_embed: `https://vidsrc.to/embed/movie/1144807`,
                    link_m3u8: ""
                  },
                  {
                    name: "Vietsub VIP 3 (Tokyo CDN)",
                    slug: "vip-vietsub-3",
                    filename: title,
                    link_embed: `https://vidsrc.cc/v2/embed/movie/1144807`,
                    link_m3u8: ""
                  }
                ]
              },
              {
                server_name: "Nguồn Lồng Tiếng (Premium)",
                server_data: [
                  {
                    name: "Lồng Tiếng VIP 1 (High-Speed)",
                    slug: "vip-longtieng-1",
                    filename: title,
                    link_embed: `https://embed.su/embed/movie/1144807`,
                    link_m3u8: ""
                  },
                  {
                    name: "Lồng Tiếng VIP 2 (Tokyo Server)",
                    slug: "vip-longtieng-2",
                    filename: title,
                    link_embed: `https://vidsrc.to/embed/movie/1144807`,
                    link_m3u8: ""
                  },
                  {
                    name: "Lồng Tiếng VIP 3 (Backup CDN)",
                    slug: "vip-longtieng-3",
                    filename: title,
                    link_embed: `https://vidsrc.cc/v2/embed/movie/1144807`,
                    link_m3u8: ""
                  }
                ]
              }
            );
          }

          // Always add standard fallback embeds at the end
          episodes.push({
            server_name: "Dự phòng (Vidsrc/EmbedSu)",
            server_data: [
              {
                name: "Vidsrc Player (FHD)",
                slug: "embed-stream",
                filename: title,
                link_embed: `https://vidsrc.to/embed/movie/${tmdbId}`,
                link_m3u8: ""
              },
              {
                name: "EmbedSu Player (FHD)",
                slug: "embed-stream-2",
                filename: title,
                link_embed: `https://embed.su/embed/movie/${tmdbId}`,
                link_m3u8: ""
              }
            ]
          });

          return res.json({
            status: true,
            movie: normalizedMovie,
            episodes: episodes
          });
        }
      } catch (err: any) {
        console.error(`[TMDB Detail Catch] Failed to fetch tmdb id ${tmdbId}:`, err.message || err);
      }
    }

    // Fast-path interceptor for custom Jikan anime or pre-seeded mocks
    const foundCustom = getMergedMovies().find(item => item.movie.slug === slug);
    if (foundCustom) {
      let finalEpisodes = [...foundCustom.episodes];

      // If the mock movie episodes are empty or unplayable, try to resolve real stream links!
      const needsStream = finalEpisodes.length === 0 || finalEpisodes.some(srv => 
        !srv.server_data || 
        srv.server_data.length === 0 || 
        srv.server_data.some((ep: any) => !ep.link_embed || ep.link_embed.trim() === "" || ep.link_m3u8?.includes("commondatastorage.googleapis.com"))
      );

      if (needsStream) {
        try {
          const searchTitle = foundCustom.movie.name;
          const streamInfo = await findStreamSlug(searchTitle) || 
                             (foundCustom.movie.origin_name ? await findStreamSlug(foundCustom.movie.origin_name) : null);
          if (streamInfo) {
            const fetchedEp = await fetchEpisodesFromSlug(streamInfo.source, streamInfo.slug, searchTitle);
            if (fetchedEp && fetchedEp.length > 0) {
              // Prepend the working stream servers while preserving mock servers for compliance
              finalEpisodes = [...fetchedEp, ...foundCustom.episodes];
            }
          }
        } catch (e: any) {
          console.error(`[Mock Movie Stream Repair] Failed to search stream for ${slug}:`, e.message || e);
        }
      }

      return res.json({
        status: true,
        msg: 'Thành công',
        movie: foundCustom.movie,
        episodes: finalEpisodes
      });
    }

    const getPath = (source: typeof SOURCES[0]) => {
      if (source.name === 'NguonC') {
        return `${source.domain}/api/film/${slug}`;
      }
      if (source.name === 'NguonPhim') {
        return `https://phimapi.com/phim/${slug}`;
      }
      return `${source.domain}/phim/${slug}`;
    };

    const transform = (rawData: any, source: typeof SOURCES[0]) => {
      if (!rawData || (!rawData.movie && !rawData.data?.movie)) return null;

      const movieData = rawData.movie || rawData.data?.movie;

      // Special NguonC categories flattener
      if (source.name === 'NguonC' && movieData && movieData.category) {
        let flatCats: any[] = [];
        try {
          const catsObj = movieData.category;
          for (const key of Object.keys(catsObj)) {
            const groupItem = catsObj[key];
            if (groupItem && Array.isArray(groupItem.list)) {
              flatCats.push(...groupItem.list);
            }
          }
        } catch (e) {}
        movieData.category = flatCats;
      }

      // Map NguonC casts to actor
      if (movieData && !movieData.actor && movieData.casts) {
        movieData.actor = movieData.casts;
      }

      let rawEpisodes = rawData.episodes || rawData.data?.episodes || [];
      if (source.name === 'NguonC' && movieData && movieData.episodes) {
        rawEpisodes = movieData.episodes;
      }

      let poster = movieData.poster_url || movieData.poster || "";
      let thumb = movieData.thumb_url || movieData.thumb || "";

      const pathImage = rawData.pathImage || rawData.data?.pathImage || source.imgBase;
      poster = getAbsoluteImageUrl(poster, pathImage, source.imgBase);
      thumb = getAbsoluteImageUrl(thumb, pathImage, source.imgBase);

      const parseCategoryOrCountry = (data: any) => {
        if (!data) return [];
        let items: any[] = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (typeof data === 'object') {
          if (data.name || data.slug) {
            items = [data];
          } else {
            items = Object.values(data);
          }
        } else if (typeof data === 'string') {
          items = data.split(',').map(s => ({ name: s.trim() })).filter(x => x.name);
        }
        return items.map((cat: any) => {
          if (!cat) return null;
          const name = cat.name || (typeof cat === 'string' ? cat : "");
          const slug = cat.slug || (name ? slugify(name) : "");
          const id = cat.id || slug || slugify(name);
          return { id, name, slug };
        }).filter((x): x is { id: string; name: string; slug: string } => x !== null && !!x.name);
      };

      const category = parseCategoryOrCountry(movieData.category);

      let country = parseCategoryOrCountry(movieData.country);

      const isJapanAnime = 
        (movieData.name || "").toLowerCase().includes("conan") || 
        (movieData.name || "").toLowerCase().includes("doraemon") || 
        (movieData.name || "").toLowerCase().includes("khuyển dạ xoa") || 
        (movieData.name || "").toLowerCase().includes("inuyasha") || 
        (movieData.slug || "").includes("conan") || 
        (movieData.slug || "").includes("doraemon") || 
        (movieData.slug || "").includes("khuyen-da-xoa") || 
        (movieData.slug || "").includes("inuyasha") || 
        (movieData.origin_name || movieData.original_name || "").toLowerCase().includes("conan") ||
        (movieData.origin_name || movieData.original_name || "").toLowerCase().includes("doraemon") ||
        (movieData.origin_name || movieData.original_name || "").toLowerCase().includes("inuyasha");

      if (isJapanAnime) {
        country = [{ id: 'nhat-ban', name: 'Nhật Bản', slug: 'nhat-ban' }];
      }

      const actors = Array.isArray(movieData.actor) 
        ? movieData.actor.filter(Boolean) 
        : (typeof movieData.actor === 'string' ? movieData.actor.split(',').map((a: string) => a.trim()).filter(Boolean) : []);

      const directors = Array.isArray(movieData.director) 
        ? movieData.director.filter(Boolean) 
        : (typeof movieData.director === 'string' ? movieData.director.split(',').map((d: string) => d.trim()).filter(Boolean) : []);

      // Smart heuristic for movie type
      let movieType = movieData.type;
      if (!movieType) {
        const nameLower = (movieData.name || "").toLowerCase();
        const current = (movieData.episode_current || "").toLowerCase();
        const total = (movieData.episode_total || "").toLowerCase();
        if (
          current.includes('tập') || 
          current.includes('tap') || 
          total.includes('tập') || 
          total.includes('tap') || 
          nameLower.includes('phần') ||
          nameLower.includes('season') ||
          movieData.type === 'series'
        ) {
          movieType = 'series';
        } else {
          movieType = 'single';
        }
      }

      const normalizedMovie = {
        name: movieData.name || "",
        slug: movieData.slug || "",
        origin_name: movieData.origin_name || movieData.original_name || "",
        content: movieData.content || movieData.description || "",
        type: movieType,
        status: movieData.status || "completed",
        thumb_url: thumb || poster,
        poster_url: poster || thumb,
        backdrop_url: thumb || poster,
        trailer_url: getEmbedTrailerUrl(movieData.trailer_url || movieData.trailer || ""),
        year: parseInt(movieData.year) || 2024,
        view: parseInt(movieData.view) || 12500,
        actor: actors,
        director: directors,
        category: category,
        country: country,
        time: movieData.time || "120 phút",
        episode_current: movieData.episode_current || "Full",
        episode_total: movieData.episode_total || "1 tập",
        lang: movieData.lang || "Vietsub",
        quality: movieData.quality || "FHD",
        imdb: {
          star: movieData.imdb?.star || movieData.imdb_rating || "7.5",
          vote: movieData.imdb?.vote || "1,200"
        }
      };

      const normalizedEpisodes = rawEpisodes.map((server: any) => {
        const rawDataList = server.server_data || server.items || [];
        const server_data = rawDataList.map((ep: any) => ({
          name: ep.name || "",
          slug: ep.slug || "",
          filename: ep.filename || "",
          link_embed: ep.link_embed || ep.embed || "",
          link_m3u8: ep.link_m3u8 || ep.m3u8 || ""
        }));

        const originalServerName = server.server_name || "Vietsub";
        const cleanServerName = originalServerName === "Default" || originalServerName === "Default Server" || originalServerName === "Kênh truyền tải"
          ? source.name
          : `${source.name} - ${originalServerName}`;

        return {
          server_name: cleanServerName,
          server_data: server_data
        };
      });

      return {
        status: true,
        movie: normalizedMovie,
        episodes: normalizedEpisodes
      };
    };

    // Parallel fetch across all three sources for robust fallback & comprehensive stream choice
    const fetchPromises = SOURCES.map(async (source) => {
      try {
        const url = getPath(source);
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 4000); // 4s timeout max per gateway to fail fast
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            console.warn(`[Proxy Detail] Source ${source.name} returned non-JSON content type: ${contentType}`);
            return null;
          }
          const rawJson = await response.json();
          if (rawJson && (rawJson.status === true || rawJson.status === 'success' || rawJson.items || rawJson.data || rawJson.movie)) {
            const result = transform(rawJson, source);
            return { source, data: result };
          }
        }
      } catch (err) {
        console.log(`[Proxy Detail Info] Source ${source.name} query for slug ${slug} completed`);
      }
      return null;
    });

    const results = await Promise.all(fetchPromises);
    const validResults = results.filter((r): r is { source: typeof SOURCES[0], data: any } => r !== null && r.data !== null);

    if (validResults.length > 0) {
      // Prioritize the highest-ranking successful source's movie metadata (main title, poster, etc.)
      const primaryResult = validResults[0].data;

      // Aggregate all servers from successful sources in sequence
      const combinedEpisodes: any[] = [];
      for (const item of validResults) {
        if (item.data && Array.isArray(item.data.episodes)) {
          combinedEpisodes.push(...item.data.episodes);
        }
      }

      const data = {
        status: true,
        movie: primaryResult.movie,
        episodes: combinedEpisodes
      };

      // Automatically fetch YouTube trailer via TMDB search if not already present
      if (data.movie && (!data.movie.trailer_url || data.movie.trailer_url.trim() === "")) {
        try {
          const fetchedTrailer = await fetchTrailerFromTmdb(data.movie.name, data.movie.year);
          if (fetchedTrailer) {
            data.movie.trailer_url = fetchedTrailer;
          }
        } catch (e) {
          console.error("Failed to automatically fetch TMDB trailer:", e);
        }
      }

      // Clean/rename Hanoi servers and split mixed Vietsub/Lồng Tiếng sources dynamically
      if (Array.isArray(data.episodes)) {
        const processedServers: any[] = [];

        for (const server of data.episodes) {
          if (!server || !server.server_name) continue;

          // Replace "#Hà Nội" / "Hà Nội" / "Hanoi" with "Chất Lượng Cao" or similar high-quality tag
          let cleanServerName = server.server_name
            .replace(/#?hà\s*nội/gi, 'Chất Lượng Cao')
            .replace(/#?hanoi/gi, 'Chất Lượng Cao')
            .trim();

          const serverDataList = server.server_data || [];
          
          const vietsubList: any[] = [];
          const longTiengList: any[] = [];

          for (const ep of serverDataList) {
            const epName = (ep.name || "").toLowerCase();
            const epFilename = (ep.filename || "").toLowerCase();
            const epSlug = (ep.slug || "").toLowerCase();

            const isLongTieng = 
              epName.includes("lồng tiếng") || 
              epName.includes("long tieng") || 
              epFilename.includes("lồng tiếng") || 
              epFilename.includes("long tieng") || 
              epSlug.includes("long-tieng") || 
              epSlug.includes("longtieng");

            if (isLongTieng) {
              longTiengList.push(ep);
            } else {
              vietsubList.push(ep);
            }
          }

          // If we have a mix of both types, split into separate servers (Vietsub and Lồng Tiếng)
          if (vietsubList.length > 0 && longTiengList.length > 0) {
            const baseServerName = cleanServerName
              .replace(/\(vietsub\s*\+\s*lồng\s*tiếng\)/gi, '')
              .replace(/vietsub\s*\+\s*lồng\s*tiếng/gi, '')
              .replace(/\(lồng\s*tiếng\s*\+\s*vietsub\)/gi, '')
              .trim();

            processedServers.push({
              server_name: `${baseServerName} (Vietsub)`,
              server_data: vietsubList
            });

            processedServers.push({
              server_name: `${baseServerName} (Lồng Tiếng)`,
              server_data: longTiengList
            });
          } else {
            processedServers.push({
              server_name: cleanServerName,
              server_data: serverDataList
            });
          }
        }

        // Apply backup stream resolution to processed servers and remove trailers
        let finalServers = processedServers.map((server: any, sIdx: number) => {
          if (!server.server_data || !Array.isArray(server.server_data)) {
            server.server_data = [];
          }
          // Filter out trailer episodes from the main watch list
          server.server_data = server.server_data.filter((ep: any) => {
            const epName = (ep.name || "").toLowerCase();
            const epSlug = (ep.slug || "").toLowerCase();
            return epName !== "trailer" && epSlug !== "trailer";
          });

          server.server_data = server.server_data.map((ep: any, epIdx: number) => {
            const hasM3u8 = ep.link_m3u8 && ep.link_m3u8.trim().length > 0;
            const hasEmbed = ep.link_embed && ep.link_embed.trim().length > 0;
            if (!hasM3u8 && !hasEmbed) {
              ep.link_m3u8 = BACKUP_STREAMS[(epIdx + sIdx) % BACKUP_STREAMS.length];
            }
            return ep;
          });
          return server;
        });

        // Inject high-fidelity Dub/Lồng Tiếng source for Japan Anime (Conan, Doraemon, Inuyasha / Khuyển Dạ Xoa)
        const nameLower = (data.movie.name || "").toLowerCase();
        const originLower = (data.movie.origin_name || "").toLowerCase();
        const slugLower = (data.movie.slug || "").toLowerCase();

        const CONAN_DUB_LINKS = [
          "https://embed11.streamc.xyz/embed.php?hash=12431887de49d3195fa2f7c8e340bdfc", // 1
          "https://embed11.streamc.xyz/embed.php?hash=14f5e0bce5f578d0d512b929ac9dab32", // 2
          "https://embed13.streamc.xyz/embed.php?hash=23b601f75a66e884629dc76f5835d87e", // 3
          "https://embed11.streamc.xyz/embed.php?hash=6eb647968d105ee3665057d33b516e12", // 4
          "https://embed15.streamc.xyz/embed.php?hash=8031c6caa4374290e369ec5284a523d", // 5
          "https://embed15.streamc.xyz/embed.php?hash=a4697d82f5b247a4bf6559e0d47658f4", // 6
          "https://embed13.streamc.xyz/embed.php?hash=70a71298cf88fe8ff95df397ac99d013", // 7
          "https://embed13.streamc.xyz/embed.php?hash=f4927f9b364f5478617568b10a4e7b34", // 8
          "https://embed12.streamc.xyz/embed.php?hash=8d30d19edaebd174368df6120be117cc", // 9
          "https://embed11.streamc.xyz/embed.php?hash=ce88df16c07c74557508c96e4e8d903e", // 10
          "https://embed11.streamc.xyz/embed.php?hash=f8d0f6823014b722de22184b7a6fa52e", // 11
          "https://embed14.streamc.xyz/embed.php?hash=4e962cee03e2b7675cc0f3e9c5964331", // 12
          "https://embed14.streamc.xyz/embed.php?hash=d20aae96aaeeaa2e70aadc6d39fef631", // 13
          "https://embed13.streamc.xyz/embed.php?hash=1a4029493b51b1db9f3f570681bbc68a", // 14
          "https://embed13.streamc.xyz/embed.php?hash=66e1bb27626c24980983a3a13e254dec", // 15
          "https://embed13.streamc.xyz/embed.php?hash=fd5ba9307675432d6d311856c0c88e42", // 16
          "https://embed13.streamc.xyz/embed.php?hash=5962e618cb1095217fee6919b61cc2c9", // 17
          "https://embed15.streamc.xyz/embed.php?hash=e86a1ada062afbee8447c45f7bbfd054", // 18
          "https://embed12.streamc.xyz/embed.php?hash=df69fe6ee9cb5450679619811a8bd32a", // 19
          "https://embed15.streamc.xyz/embed.php?hash=99a80be8221e05ddbc2d633b28ffc670", // 20
          "https://embed11.streamc.xyz/embed.php?hash=0389601836cc731009d844747781182b", // 21
          "https://embed4.streamc.xyz/embed.php?hash=5a2004a816b5a3d6267518e79ed09a99", // 22
          "https://embed11.streamc.xyz/embed.php?hash=0499c5c68fd03dd8115fb4bfb954e519", // 23 (Thuyết minh) - đặc biệt
          "https://embed14.streamc.xyz/embed.php?hash=f1c48e5f6cf92a91861e31794dfda570", // 24
          "https://embed15.streamc.xyz/embed.php?hash=c2e1f4304b47846f5c68eef4e142ac7a", // 25 (Thuyết minh) - đặc biệt
          "https://embed15.streamc.xyz/embed.php?hash=5a6e9113ee6117e92f0d0aee38e302e6", // 26
          "https://embed15.streamc.xyz/embed.php?hash=71e546aa0c86ed1c407742e0aa9818a1"  // 27
        ];

        function getConanMovieNum(name: string, origin: string, slug: string, year: number): number {
          const n = (name || "").toLowerCase();
          const o = (origin || "").toLowerCase();
          const s = (slug || "").toLowerCase();

          const slugMatch = s.match(/conan(?:-movie)?-(\d+)/);
          if (slugMatch) {
            const num = parseInt(slugMatch[1], 10);
            if (num >= 1 && num <= 27) return num;
          }

          if (n.includes("chọc trời") || n.includes("choc troi") || o.includes("skyscraper") || s.includes("bom-choc-troi") || s.includes("ke-danh-bom")) return 1;
          if (n.includes("mục tiêu thứ 14") || n.includes("muc tieu thu 14") || n.includes("mục tiêu số 14") || o.includes("fourteenth target") || o.includes("14th target") || s.includes("muc-tieu")) return 2;
          if (n.includes("phù thủy cuối cùng") || n.includes("phu thuy cuoi cung") || o.includes("last wizard") || s.includes("phu-thuy")) return 3;
          if (n.includes("thủ phạm trong đôi mắt") || n.includes("thu pham trong doi mat") || o.includes("captured in her eyes") || o.includes("capturing in her eyes") || s.includes("thu-pham")) return 4;
          if (n.includes("thiên đường") || n.includes("thien duong") || o.includes("countdown to heaven") || s.includes("thien-duong")) return 5;
          if (n.includes("bóng ma đường baker") || n.includes("bong ma duong baker") || o.includes("phantom of baker") || s.includes("baker")) return 6;
          if (n.includes("mê cung") || n.includes("me cung") || o.includes("crossroad in the ancient") || s.includes("me-cung")) return 7;
          if (n.includes("ảo thuật") || n.includes("ao thuat") || o.includes("magician of the silver") || s.includes("ao-thuat")) return 8;
          if (n.includes("âm mưu trên biển") || n.includes("am muu tren bien") || o.includes("strategy above the depths") || s.includes("am-muu")) return 9;
          if (n.includes("bài hát cầu hồn") || n.includes("bai hat cau hon") || o.includes("private eyes") || s.includes("bai-hat-cau-hon") || s.includes("requiem")) return 10;
          if (n.includes("kho báu") || n.includes("kho bau") || o.includes("jolly roger") || s.includes("kho-bau")) return 11;
          if (n.includes("sợ hãi tột cùng") || n.includes("so hai tot cung") || o.includes("full score of fear") || s.includes("so-hai")) return 12;
          if (n.includes("truy lùng tổ chức") || n.includes("truy lung to chuc") || o.includes("raven chaser") || s.includes("truy-lung")) return 13;
          if (n.includes("tàu chiến lửng lơ") || n.includes("tau chien lung lo") || o.includes("lost ship") || s.includes("tau-chien")) return 14;
          if (n.includes("15 phút tĩnh lặng") || n.includes("15 phut tinh lang") || o.includes("quarter of silence") || s.includes("15-phut")) return 15;
          if (n.includes("tiền đạo thứ 11") || n.includes("tien dao thu 11") || o.includes("eleventh striker") || s.includes("tien-dao")) return 16;
          if (n.includes("mắt thần") || n.includes("mat than") || o.includes("private eye in the distant") || s.includes("mat-than")) return 17;
          if (n.includes("bắn tỉa") || n.includes("ban tia") || o.includes("dimensional sniper") || s.includes("ban-tia")) return 18;
          if (n.includes("hoa hướng dương") || n.includes("hoa huong duong") || o.includes("sunflowers of inferno") || s.includes("hoa-huong-duong")) return 19;
          if (n.includes("ác mộng") || n.includes("ac mong") || o.includes("darkest nightmare") || s.includes("ac-mong")) return 20;
          if (n.includes("tình ca màu đỏ thẫm") || n.includes("tinh ca mau do") || n.includes("tình ca đỏ thẫm") || o.includes("crimson love letter") || s.includes("tinh-ca")) return 21;
          if (n.includes("hành pháp") || n.includes("hanh phap") || o.includes("zero the enforcer") || s.includes("hanh-phap")) return 22;
          if (n.includes("cú đấm sapphire") || n.includes("cu dam sapphire") || o.includes("fist of blue sapphire") || s.includes("cu-dam")) return 23;
          if (n.includes("viên đạn đỏ") || n.includes("vien dan do") || o.includes("scarlet bullet") || s.includes("vien-dan-do")) return 24;
          if (n.includes("nàng dâu") || n.includes("nang dau") || o.includes("bride of halloween") || s.includes("nang-dau")) return 25;
          if (n.includes("tàu ngầm sắt") || n.includes("tau ngam sat") || o.includes("black iron submarine") || s.includes("tau-ngam")) return 26;
          if (n.includes("ngôi sao năm cánh") || n.includes("ngoi sao nam canh") || o.includes("pentagram") || s.includes("ngoi-sao-nam-canh")) return 27;

          if (year === 1997) return 1;
          if (year === 1998) return 2;
          if (year === 1999) return 3;
          if (year === 2000) return 4;
          if (year === 2001) return 5;
          if (year === 2002) return 6;
          if (year === 2003) return 7;
          if (year === 2004) return 8;
          if (year === 2005) return 9;
          if (year === 2006) return 10;
          if (year === 2007) return 11;
          if (year === 2008) return 12;
          if (year === 2009) return 13;
          if (year === 2010) return 14;
          if (year === 2011) return 15;
          if (year === 2012) return 16;
          if (year === 2013) return 17;
          if (year === 2014) return 18;
          if (year === 2015) return 19;
          if (year === 2016) return 20;
          if (year === 2017) return 21;
          if (year === 2018) return 22;
          if (year === 2019) return 23;
          if (year === 2021) return 24;
          if (year === 2022) return 25;
          if (year === 2023) return 26;
          if (year === 2024) return 27;

          return 0;
        }

        const isConan = nameLower.includes("conan") || originLower.includes("conan") || slugLower.includes("conan");
        const conanMovieNum = isConan ? getConanMovieNum(data.movie.name, data.movie.origin_name || data.movie.original_name, data.movie.slug, data.movie.year || data.movie.release_year) : 0;

        if (conanMovieNum >= 1 && conanMovieNum <= 27) {
          const isSpecial = conanMovieNum === 23 || conanMovieNum === 25;
          const serverLabel = isSpecial ? "Chất Lượng Cao (Thuyết Minh)" : "Chất Lượng Cao (Lồng Tiếng)";
          const streamUrl = CONAN_DUB_LINKS[conanMovieNum - 1];

          // Make sure first server is named containing (Vietsub) if not already
          if (finalServers.length > 0) {
            const firstSvr = finalServers[0];
            const fsNameLower = (firstSvr.server_name || "").toLowerCase();
            if (!fsNameLower.includes("vietsub")) {
              firstSvr.server_name = `${firstSvr.server_name} (Vietsub)`;
            }
          }

          // Filter out existing Lồng Tiếng/Thuyết Minh to avoid duplicates
          finalServers = finalServers.filter((svr: any) => {
            const sNameLower = (svr.server_name || "").toLowerCase();
            return !sNameLower.includes("lồng tiếng") && !sNameLower.includes("thuyết minh") && !sNameLower.includes("long tieng");
          });

          // Append high-fidelity dub server
          finalServers.push({
            server_name: serverLabel,
            server_data: [
              {
                name: "Full HD",
                slug: "full",
                filename: data.movie.name,
                link_embed: streamUrl,
                link_m3u8: ""
              }
            ]
          });
        } else {
          // Fallback for other Anime or non-mainline Conan movies
          const isConanOrAnime = 
            nameLower.includes("conan") || 
            nameLower.includes("doraemon") || 
            nameLower.includes("khuyển dạ xoa") || 
            nameLower.includes("inuyasha") || 
            originLower.includes("conan") || 
            originLower.includes("doraemon") || 
            originLower.includes("inuyasha") || 
            slugLower.includes("conan") || 
            slugLower.includes("doraemon") || 
            slugLower.includes("inuyasha");

          if (isConanOrAnime && finalServers.length > 0) {
            const hasLongTieng = finalServers.some((svr: any) => {
              const sName = (svr.server_name || "").toLowerCase();
              return sName.includes("lồng tiếng") || sName.includes("long tieng") || sName.includes("longtieng") || sName.includes("thuyết minh");
            });

            if (!hasLongTieng) {
              const sourceServer = finalServers[0];
              const copiedData = JSON.parse(JSON.stringify(sourceServer.server_data));
              finalServers.push({
                server_name: "Chất Lượng Cao (Lồng Tiếng)",
                server_data: copiedData
              });
            }
          }
        }

        data.episodes = finalServers;
      }

      if (data.movie && data.movie.slug) {
        DISCOVERED_MOVIES.set(data.movie.slug, {
          movie: data.movie,
          episodes: data.episodes
        });
      }

      return res.json(data);
    }

      res.status(404).json({ status: false, msg: 'Không tìm thấy phim' });
    } catch (err: any) {
      console.error(`[API Phim Detail Error] for slug "${req.params.slug}":`, err);
      res.status(500).json({ status: false, msg: 'Lỗi máy chủ khi lấy chi tiết phim.', error: err.message });
    }
  });

  // 6.25 Library & Sources Diagnostic Scanner
  app.get('/api/admin/scan', async (req, res) => {
    // 1. Measure live gateway latencies
    const latencyResults = await Promise.all(
      SOURCES.map(async (src) => {
        const start = Date.now();
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 3000);
          const response = await fetch(`${src.domain}/danh-sach/phim-moi-cap-nhat?page=1`, { signal: controller.signal });
          clearTimeout(id);
          const latency = Date.now() - start;
          return {
            name: src.name,
            domain: src.domain,
            status: response.ok ? 'Hoạt động' : 'Nguồn lỗi',
            latency: `${latency}ms`
          };
        } catch {
          return {
            name: src.name,
            domain: src.domain,
            status: 'Nguồn lỗi',
            latency: 'Không kết nối được'
          };
        }
      })
    );

    // 2. Scan critical spotlight/featured movies to detect stream integrity
    const slugsToScan = [
      'tan-phong-than-nhi-lang-than',
      'tap-yeu-don-dau',
      'hoang-phi-hong-bi-an-mot-huyen-thoai',
      'ma-thoi-den-nam-hai-quy-hu',
      'truong-nguyet-tan-minh',
      'nhat-niem-quan-son',
      'phon-hoa',
      'than-an'
    ];

    const scannedItems = await Promise.all(
      slugsToScan.map(async (slug) => {
        const match = getMergedMovies().find(m => m.movie.slug === slug);
        const name = match ? match.movie.name : (slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

        let kkphimFound = false;
        let ophimFound = false;
        let animehubFound = false;
        let hasM3u8 = false;
        let hasEmbed = false;

        const checkPromises = SOURCES.map(async (source) => {
          const url = `${source.domain}/phim/${slug}`;

          try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3500);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(id);

            if (response.ok) {
              const json = await response.json();
              if (json && (json.status === true || json.status === 'success' || json.movie)) {
                if (source.name === 'KKPhim') kkphimFound = true;
                if (source.name === 'OPhim') ophimFound = true;
                if (source.name === 'AnimeHub') animehubFound = true;

                const epSource = json.episodes || (json.data && json.data.episodes);
                if (Array.isArray(epSource)) {
                  epSource.forEach((srv: any) => {
                    const serverData = srv.server_data || srv.items || [];
                    if (Array.isArray(serverData)) {
                      serverData.forEach((ep: any) => {
                        if (ep.link_m3u8 || ep.m3u8) hasM3u8 = true;
                        if (ep.link_embed || ep.embed) hasEmbed = true;
                      });
                    }
                  });
                }
              }
            }
          } catch {
            // ignore timeout/error on single source
          }
        });

        await Promise.all(checkPromises);

        const totalCheckedSources = (kkphimFound ? 1 : 0) + (ophimFound ? 1 : 0) + (animehubFound ? 1 : 0);
        let status = 'Hoạt động';

        if (totalCheckedSources === 0) {
          status = 'Thiếu nguồn';
        } else if (!hasM3u8 && !hasEmbed) {
          status = 'Nguồn lỗi';
        }

        return {
          slug,
          name,
          status,
          sourcesChecked: {
            KKPhim: kkphimFound,
            OPhim: ophimFound,
            AnimeHub: animehubFound
          },
          hasM3u8,
          hasEmbed,
          lastChecked: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      })
    );

    res.json({
      status: true,
      latencies: latencyResults,
      scannedMovies: scannedItems,
      systemHealth: latencyResults.filter(r => r.status === 'Hoạt động').length >= 2 ? 'Hoạt động ổn định' : 'Nguồn lỗi một phần'
    });
  });

  // 6.5 Diễn viên (Actors details proxy)
  app.get('/api/dien-vien', (req, res) => {
    res.json({
      status: true,
      items: []
    });
  });

  // 6.6 Watch Party Rooms check
  app.get('/api/watch-party/room/:id', (req, res) => {
    const { id } = req.params;
    const room = watchPartyRooms.get(id);
    if (!room) {
      return res.status(404).json({ status: false, message: 'Không tìm thấy phòng xem chung' });
    }
    res.json({
      status: true,
      room: {
        id: room.id,
        movieSlug: room.movieSlug,
        movieName: room.movieName,
        movieThumb: room.movieThumb,
        episodeSlug: room.episodeSlug
      }
    });
  });

  // 6.7 AI Movie Recommendations (using Gemini API gemini-3.5-flash)
  app.post('/api/recommend', async (req, res) => {
    try {
      const { currentMovieSlug, currentMovie: reqCurrentMovie, userPrompt } = req.body;
      
      if (!currentMovieSlug) {
        return res.status(400).json({ status: false, message: 'Missing currentMovieSlug' });
      }

      // Merge base movies and discovered movies
      const allMovies = [...getMergedMovies()];
      for (const [slug, item] of DISCOVERED_MOVIES.entries()) {
        if (!allMovies.some(m => m.movie.slug === slug)) {
          allMovies.push(item);
        }
      }

      const dbMovie = allMovies.find(m => m.movie.slug === currentMovieSlug);
      const currentMovie = dbMovie?.movie || reqCurrentMovie;
      
      const currentMovieInfo = currentMovie ? {
        name: currentMovie.name,
        origin_name: currentMovie.origin_name || currentMovie.original_name,
        content: currentMovie.content,
        genres: Array.isArray(currentMovie.category)
          ? currentMovie.category.map((g: any) => g.name || g)
          : [],
        year: currentMovie.year
      } : null;

      const currentGenres = currentMovieInfo ? currentMovieInfo.genres : [];

      // Fallback recommendations list in case of errors/no key
      const getFallbackRecs = () => {
        return allMovies
          .filter(m => m.movie.slug !== currentMovieSlug)
          .map(m => {
            const mGenres = Array.isArray(m.movie.category)
              ? m.movie.category.map((g: any) => g.name || g)
              : [];
            
            // 1. Calculate genre overlap
            const overlap = mGenres.filter(g => currentGenres.includes(g)).length;
            
            // 2. Year similarity score
            let yearScore = 0;
            if (currentMovieInfo && currentMovieInfo.year && m.movie.year) {
              const diff = Math.abs(currentMovieInfo.year - m.movie.year);
              if (diff === 0) yearScore = 5;
              else if (diff <= 2) yearScore = 3;
              else if (diff <= 5) yearScore = 1;
            }

            // 3. Keyword matching (title and content)
            let keywordScore = 0;
            if (currentMovieInfo) {
              const cleanCurrentName = currentMovieInfo.name.toLowerCase();
              const cleanTargetName = m.movie.name.toLowerCase();
              const words = cleanCurrentName.split(' ');
              words.forEach(w => {
                if (w.length > 2 && cleanTargetName.includes(w)) {
                  keywordScore += 4;
                }
              });

              if (currentMovieInfo.content && m.movie.content) {
                const currentContent = currentMovieInfo.content.toLowerCase();
                const targetContent = m.movie.content.toLowerCase();
                const commonWords = ['hành động', 'tình cảm', 'phiêu lưu', 'viễn tưởng', 'kinh dị', 'hài hước', 'chiến tranh', 'gia đình', 'kịch tính'];
                commonWords.forEach(word => {
                  if (currentContent.includes(word) && targetContent.includes(word)) {
                    keywordScore += 2;
                  }
                });
              }
            }

            // 4. Type match
            const typeScore = (currentMovie && currentMovie.type === m.movie.type) ? 3 : 0;

            const totalScore = (overlap * 10) + yearScore + keywordScore + typeScore;

            return { item: m, score: totalScore, mGenres };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(x => {
            const commonGenres = x.mGenres.filter(g => currentGenres.includes(g));
            const genreText = commonGenres.length > 0 ? commonGenres.join(', ') : x.mGenres.slice(0, 2).join(', ');
            
            let dynamicReason = `Dựa trên phong cách điện ảnh tương đồng và thể loại ${genreText}, tác phẩm này chắc chắn sẽ cuốn hút bạn từ những phút đầu tiên.`;
            if (currentMovieInfo) {
              if (x.score > 15) {
                dynamicReason = `Kế thừa trọn vẹn mạch truyện kịch tính, nét diễn xuất đặc sắc và không khí điện ảnh hoành tráng giống như siêu phẩm ${currentMovieInfo.name}.`;
              } else if (commonGenres.length > 1) {
                dynamicReason = `Mang lại cảm xúc kịch tính đồng điệu với ${currentMovieInfo.name} thông qua sự hòa quyện hoàn hảo của chất phim ${genreText}.`;
              }
            }
            
            return {
              slug: x.item.movie.slug,
              reason: dynamicReason
            };
          });
      };

      let recommendations: Array<{ slug: string; reason: string }> = [];
      let isAiGenerated = false;

      // Check if API key is present
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
        try {
          const { GoogleGenAI, Type } = await import('@google/genai');
          const aiClient = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });

          const candidates = allMovies.map(item => ({
            name: item.movie.name,
            slug: item.movie.slug,
            genres: Array.isArray(item.movie.category)
              ? item.movie.category.map((g: any) => g.name || g)
              : [],
            year: item.movie.year
          }));

          const systemInstruction = `Bạn là Trợ lý Gợi ý Phim thông minh siêu cấp của rạp phim cao cấp FilmFlow.
Nhiệm vụ của bạn là phân tích sâu sắc tác phẩm điện ảnh người dùng đang xem và đề xuất đúng 3 bộ phim tương đồng, chất lượng nhất từ danh sách Candidate Pool có sẵn.
Hãy phân tích sự liên kết về nội dung, thể loại, cảm xúc hoặc không gian nghệ thuật để đưa ra quyết định thông thái nhất.
Nếu người xem gửi kèm lời nhắn cá nhân (userPrompt), bạn hãy ưu tiên tuyệt đối việc tìm kiếm sự tương thích với tâm trạng, sở thích hoặc yêu cầu cụ thể của họ trong Candidate Pool.
Bạn PHẢI trả về JSON khớp 100% với cấu trúc responseSchema được yêu cầu. Tuyệt đối không được chế tạo hay đề xuất phim không nằm trong Candidate Pool.`;

          const prompt = `Phim hiện tại người dùng đang xem:
${JSON.stringify(currentMovieInfo, null, 2)}

Yêu cầu cụ thể của người xem (nếu có):
"${userPrompt || "Không có yêu cầu cụ thể, gợi ý dựa trên sự tương đồng về nội dung và thể loại phim hiện tại."}"

Danh Sách Phim Có Sẵn trong kho (Candidate Pool):
${JSON.stringify(candidates, null, 2)}

Hãy chọn ra đúng 3 bộ phim từ kho có sẵn phù hợp nhất để đề xuất, kèm lý do thuyết phục bằng tiếng Việt thân thiện, hấp dẫn.`;

          const response = await aiClient.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    slug: {
                      type: Type.STRING,
                      description: "Slug của phim được đề xuất, phải trùng khớp 100% với slug trong kho có sẵn."
                    },
                    reason: {
                      type: Type.STRING,
                      description: "Lý do đề xuất thuyết phục, hấp dẫn bằng tiếng Việt (khoảng 1-2 câu ngắn gọn, súc tích)."
                    }
                  },
                  required: ["slug", "reason"]
                }
              }
            }
          });

          if (response.text) {
            let text = response.text.trim();
            if (text.startsWith('```')) {
              text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
            }
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const validRecs = parsed.filter(item => 
                item && typeof item.slug === 'string' && allMovies.some(m => m.movie.slug === item.slug)
              );
              if (validRecs.length > 0) {
                recommendations = validRecs;
                isAiGenerated = true;
              }
            }
          }
        } catch (err: any) {
          const errMsg = typeof err === 'string' ? err : (err?.message || JSON.stringify(err) || '');
          const isRateLimit = errMsg.includes('429') || 
                             errMsg.includes('RESOURCE_EXHAUSTED') || 
                             errMsg.includes('quota') || 
                             errMsg.includes('limit') || 
                             errMsg.includes('exceeded');
          const isBusy = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('demand');

          if (isRateLimit) {
            console.log('[Info] Đạt giới hạn hạn ngạch hoặc hạn mức tần suất Gemini API (429). Đã tự động chuyển sang chế độ gợi ý phim dự phòng thông minh.');
          } else if (isBusy) {
            console.log('[Info] Trợ lý Gemini AI đang bận hoặc quá tải (503). Đã tự động kích hoạt bộ gợi ý phim dự phòng.');
          } else {
            console.log('[Info] Đã tự động chuyển sang chế độ gợi ý phim dự phòng:', errMsg.slice(0, 150));
          }
        }
      }

      // Fallback if AI recommendations failed or wasn't run
      if (recommendations.length === 0) {
        recommendations = getFallbackRecs();
      }

      // Map recommendations to full movie data
      const recommendedItems = recommendations.map(rec => {
        const found = allMovies.find(m => m.movie.slug === rec.slug);
        if (!found) return null;
        return {
          ...found.movie,
          aiReason: rec.reason
        };
      }).filter(Boolean);

      res.json({
        status: true,
        isAiGenerated,
        items: recommendedItems
      });
    } catch (globalErr: any) {
      console.error('Recommend API global error:', globalErr);
      res.status(500).json({ status: false, message: 'Lỗi máy chủ khi xử lý gợi ý phim.' });
    }
  });

  // API route for receiving reports (Báo lỗi hệ thống, báo cáo phim, báo cáo người dùng)
  app.post('/api/report', async (req, res) => {
    try {
      const { type, email, content, title, extraData, images, video, smtpConfig } = req.body;
      if (!type || !content) {
        return res.status(400).json({ status: false, message: 'Vui lòng điền đầy đủ loại báo cáo và nội dung!' });
      }

      console.log(`[Report Received] Type: ${type}, Sender: ${email || 'Anonymous'}, Title: ${title || 'No Title'}`);

      // Determine report name
      let reportName = 'Báo cáo vi phạm';
      if (type === 'bug') reportName = 'Báo lỗi hệ thống';
      else if (type === 'movie') reportName = 'Báo cáo lỗi phim';
      else if (type === 'user') reportName = 'Báo cáo người dùng';

      let emailText = `Hệ thống FilmFlow vừa nhận được ${reportName.toUpperCase()} mới:\n\n`;
      emailText += `========================================================\n`;
      emailText += `Loại báo cáo: ${reportName}\n`;
      emailText += `Email người gửi: ${email || 'Khách ẩn danh'}\n`;
      if (title) emailText += `Tiêu đề: ${title}\n`;
      emailText += `Nội dung chi tiết:\n${content}\n`;
      
      if (extraData && typeof extraData === 'object') {
        emailText += `\nThông tin chi tiết đính kèm:\n`;
        for (const [key, val] of Object.entries(extraData)) {
          emailText += `- ${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}\n`;
        }
      }

      // Add attachment info to email text
      if (images && Array.isArray(images) && images.length > 0) {
        emailText += `\n[Đính kèm] Số lượng ảnh: ${images.length} ảnh\n`;
      }
      if (video && video.base64) {
        emailText += `\n[Đính kèm] Video: ${video.name || 'video_attachment.mp4'}\n`;
      }

      emailText += `========================================================\n`;
      emailText += `Thời gian nhận: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} (UTC+7)\n`;
      emailText += `Hệ thống FilmFlow Cloud Streaming Service\n`;

      // Check if SMTP is configured
      const smtpHost = smtpConfig?.host || process.env.SMTP_HOST;
      const smtpPort = smtpConfig?.port || process.env.SMTP_PORT || '587';
      const smtpUser = smtpConfig?.user || process.env.SMTP_USER;
      const smtpPass = smtpConfig?.pass || process.env.SMTP_PASS;
      const smtpFrom = smtpConfig?.fromEmail || process.env.SMTP_FROM_EMAIL || 'reports@filmflow.com';
      const smtpTo = smtpConfig?.toEmail || process.env.SMTP_TO_EMAIL || 'muahakhongcoem@proton.me';

      let sentRealEmail = false;
      let smtpError = '';

      // Construct attachments list for nodemailer
      const nodemailerAttachments: any[] = [];
      if (images && Array.isArray(images)) {
        images.forEach((imgBase64, idx) => {
          if (imgBase64 && typeof imgBase64 === 'string') {
            // Find content type if possible, or default to image/png
            let extension = 'png';
            const match = imgBase64.match(/^data:image\/(\w+);base64,/);
            if (match && match[1]) {
              extension = match[1];
            }
            nodemailerAttachments.push({
              filename: `hinh_anh_dinh_kem_${idx + 1}.${extension}`,
              path: imgBase64
            });
          }
        });
      }

      if (video && video.base64 && typeof video.base64 === 'string') {
        nodemailerAttachments.push({
          filename: video.name || 'video_dinh_kem.mp4',
          path: video.base64
        });
      }

      if (smtpHost && smtpUser && smtpPass) {
        try {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: smtpPort === '465',
            auth: {
              user: smtpUser,
              pass: smtpPass
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          await transporter.sendMail({
            from: `"FilmFlow Reports" <${smtpFrom}>`,
            to: smtpTo,
            subject: `[FilmFlow] ${reportName} - ${title || 'Báo cáo mới'}`,
            text: emailText,
            attachments: nodemailerAttachments
          });

          sentRealEmail = true;
          console.log(`[SMTP Mailer] Sent real email report with ${nodemailerAttachments.length} attachments successfully to ${smtpTo}`);
        } catch (mailErr: any) {
          smtpError = mailErr.message || String(mailErr);
          console.error(`[SMTP Mailer Error] Failed to send real email via SMTP:`, smtpError);
        }
      } else {
        console.log(`[SMTP Mailer Skip] SMTP not fully configured. Logged to console as fallback.`);
        smtpError = 'SMTP chưa được cấu hình. Vui lòng thiết lập cấu hình SMTP trong phần nâng cao bên dưới.';
      }

      res.json({
        status: true,
        message: sentRealEmail 
          ? 'Báo cáo đã được gửi thực tế về hòm thư đại diện thành công!' 
          : 'Hệ thống đã nhận phản hồi nhưng chưa gửi được email thực tế.',
        sentRealEmail,
        smtpError,
        targetEmail: smtpTo,
        loggedText: emailText,
        attachmentsCount: nodemailerAttachments.length
      });
    } catch (err: any) {
      console.error('Report submission API error:', err);
      res.status(500).json({ status: false, message: 'Lỗi máy chủ khi xử lý báo cáo của bạn.' });
    }
  });

  // Vite development vs production compiler
  if (process.env.NODE_ENV !== 'production') {
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

  const server = http.createServer(app);

  // Initialize WebSocket Server for Watch Party Realtime sync
  const wss = new WebSocketServer({ server });

  interface User {
    id: string;
    username: string;
    avatar: string;
    ws: WebSocket;
  }

  interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    text: string;
    timestamp: number;
  }

  interface Room {
    id: string;
    movieSlug: string;
    movieName: string;
    movieThumb: string;
    episodeSlug: string;
    playback: {
      isPlaying: boolean;
      currentTime: number;
      lastUpdated: number;
      updatedBy: string;
    };
    users: User[];
    messages: Message[];
  }

  const watchPartyRooms = new Map<string, Room>();

  wss.on('connection', (ws) => {
    let currentRoomId: string | null = null;
    let currentUserId: string | null = null;

    ws.on('message', (messageStr) => {
      try {
        const payload = JSON.parse(messageStr.toString());
        const { type, roomId, userId, username, avatar, movieSlug, movieName, movieThumb, episodeSlug, data } = payload;

        if (type === 'join') {
          currentRoomId = roomId;
          currentUserId = userId;

          let room = watchPartyRooms.get(roomId);
          if (!room) {
            room = {
              id: roomId,
              movieSlug: movieSlug || '',
              movieName: movieName || '',
              movieThumb: movieThumb || '',
              episodeSlug: episodeSlug || '',
              playback: {
                isPlaying: false,
                currentTime: 0,
                lastUpdated: Date.now(),
                updatedBy: 'Hệ thống'
              },
              users: [],
              messages: [
                {
                  id: Math.random().toString(36).substring(2),
                  senderId: 'system',
                  senderName: 'Hệ thống',
                  senderAvatar: '',
                  text: `Phòng xem chung đã được khởi tạo. Chia sẻ mã phòng: ${roomId} để cùng thưởng thức!`,
                  timestamp: Date.now()
                }
              ]
            };
            watchPartyRooms.set(roomId, room);
          }

          // Avoid duplicate users
          room.users = room.users.filter(u => u.id !== userId);
          room.users.push({
            id: userId,
            username,
            avatar,
            ws
          });

          // Add join message
          room.messages.push({
            id: Math.random().toString(36).substring(2),
            senderId: 'system',
            senderName: 'Hệ thống',
            senderAvatar: '',
            text: `Thành viên "${username}" đã tham gia phòng.`,
            timestamp: Date.now()
          });

          // Broadcast join to all in the room
          broadcastToRoom(roomId, {
            type: 'room_state',
            room: serializeRoom(room)
          });
        }

        else if (type === 'chat') {
          if (!currentRoomId) return;
          const room = watchPartyRooms.get(currentRoomId);
          if (!room) return;

          const newMessage: Message = {
            id: Math.random().toString(36).substring(2),
            senderId: userId,
            senderName: username,
            senderAvatar: avatar,
            text: data.text,
            timestamp: Date.now()
          };

          room.messages.push(newMessage);
          if (room.messages.length > 100) {
            room.messages.shift();
          }

          broadcastToRoom(currentRoomId, {
            type: 'chat_message',
            message: newMessage
          });
        }

        else if (type === 'playback') {
          if (!currentRoomId) return;
          const room = watchPartyRooms.get(currentRoomId);
          if (!room) return;

          room.playback = {
            isPlaying: data.isPlaying,
            currentTime: data.currentTime,
            lastUpdated: Date.now(),
            updatedBy: username
          };

          broadcastToRoom(currentRoomId, {
            type: 'playback_sync',
            playback: room.playback,
            triggeredBy: username
          }, ws); // exclude sender to prevent loops
        }

        else if (type === 'reaction') {
          if (!currentRoomId) return;
          broadcastToRoom(currentRoomId, {
            type: 'reaction',
            emoji: data.emoji,
            username: username
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && currentUserId) {
        const room = watchPartyRooms.get(currentRoomId);
        if (room) {
          const departingUser = room.users.find(u => u.id === currentUserId);
          room.users = room.users.filter(u => u.id !== currentUserId);

          if (departingUser) {
            room.messages.push({
              id: Math.random().toString(36).substring(2),
              senderId: 'system',
              senderName: 'Hệ thống',
              senderAvatar: '',
              text: `Thành viên "${departingUser.username}" đã rời phòng.`,
              timestamp: Date.now()
            });
          }

          if (room.users.length === 0) {
            setTimeout(() => {
              const r = watchPartyRooms.get(currentRoomId!);
              if (r && r.users.length === 0) {
                watchPartyRooms.delete(currentRoomId!);
                console.log(`Cleaned up empty room: ${currentRoomId}`);
              }
            }, 10000);
          } else {
            broadcastToRoom(currentRoomId, {
              type: 'room_state',
              room: serializeRoom(room)
            });
          }
        }
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket client error:', err);
    });
  });

  function broadcastToRoom(roomId: string, messageObj: any, excludeWs?: WebSocket) {
    const room = watchPartyRooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(messageObj);
    room.users.forEach((user) => {
      if (user.ws !== excludeWs && user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(messageStr);
      }
    });
  }

  function serializeRoom(room: Room) {
    return {
      id: room.id,
      movieSlug: room.movieSlug,
      movieName: room.movieName,
      movieThumb: room.movieThumb,
      episodeSlug: room.episodeSlug,
      playback: room.playback,
      users: room.users.map(u => ({ id: u.id, username: u.username, avatar: u.avatar })),
      messages: room.messages
    };
  }

  async function preloadTrendingMovies() {
    const sourcesToPreload = [
      { name: 'KKPhim', url: 'https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1' },
      { name: 'OPhim', url: 'https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1' }
    ];

    for (const src of sourcesToPreload) {
      try {
        const res = await fetch(src.url).then(r => r.json());
        let items: any[] = [];
        let pathImage = '';
        if (res.data && Array.isArray(res.data.items)) {
          items = res.data.items;
          pathImage = res.data.pathImage || '';
        } else if (Array.isArray(res.items)) {
          items = res.items;
          pathImage = res.pathImage || '';
        }

        items.forEach(item => {
          const normalized = normalizeItem(item, pathImage, src.name === 'KKPhim' ? 'https://phimimg.com/uploads/movies' : 'https://ophimimg.com/uploads/movies');
          if (normalized && normalized.slug) {
            DISCOVERED_MOVIES.set(normalized.slug, {
              movie: {
                ...normalized,
                category: item.category || [],
                country: item.country || [],
                content: item.content || `${normalized.name} - Phim chất lượng cao, lôi cuốn hấp dẫn.`
              },
              episodes: []
            });
          }
        });
        console.log(`[Preload] Successfully preloaded trending movies from ${src.name}`);
      } catch (err) {
        console.error(`[Preload] Failed to preload from ${src.name}:`, err);
      }
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    // Auto-update/preload disabled per user request. Movies are only loaded on-demand.
    console.log('[Info] Auto-updating of movies on startup is currently disabled.');
  });
}

startServer();
