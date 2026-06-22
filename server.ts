import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MOCK_MOVIES, MOCK_CATEGORIES, MOCK_COUNTRIES } from './src/data/mockMovies';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper memory caching mechanism to avoid rate limiting and speed up API responses
  interface CacheEntry {
    data: any;
    timestamp: number;
  }
  const apiCache = new Map<string, CacheEntry>();
  const CACHE_TTL_MS = 15 * 60 * 1000; // Snappy 15 minutes cache memory

  // Helper function to cast server response or fallback to mock data
  const handleProxy = async (targetUrl: string, fallbackFn: () => any) => {
    const now = Date.now();
    const cached = apiCache.get(targetUrl);
    
    // Check hit
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000); // 4s timeout for fast loads

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
      // Give expired cache entry as recovery
      if (cached) {
        console.log(`[Proxy Exception Recovery] Using expired cache for ${targetUrl}`);
        return cached.data;
      }
      return fallbackFn();
    }
  };

  // 1. Phim mới cập nhật
  app.get('/api/danh-sach/phim-moi-cap-nhat', async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;
    const target = `https://vsmov.com/api/danh-sach/phim-moi-cap-nhat?page=${page}&limit=${limit}`;

    const data = await handleProxy(target, () => {
      // Return beautiful mock response in the requested shape
      const items = MOCK_MOVIES.map(item => ({
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

    res.json(data);
  });

  // 2. Danh sách có bộ lọc (type, category, country, year, sort)
  app.get('/api/danh-sach', async (req, res) => {
    const { type, page = '1', limit = '24', category, country, year } = req.query;
    const qType = type ? `&type=${type}` : '';
    const qCat = category ? `&category=${category}` : '';
    const qCount = country ? `&country=${country}` : '';
    const qYear = year ? `&year=${year}` : '';

    const targetUrl = `https://vsmov.com/api/danh-sach?page=${page}&limit=${limit}${qType}${qCat}${qCount}${qYear}`;

    const parsedPage = parseInt(page as string) || 1;
    const parsedLimit = parseInt(limit as string) || 24;

    const data = await handleProxy(targetUrl, () => {
      let filtered = MOCK_MOVIES;

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

    res.json(data);
  });

  // 3. Tìm kiếm
  app.get('/api/tim-kiem', async (req, res) => {
    const { keyword = '', page = '1', limit = '24' } = req.query;
    const targetUrl = `https://vsmov.com/api/tim-kiem?keyword=${encodeURIComponent(keyword as string)}&page=${page}&limit=${limit}`;

    const parsedPage = parseInt(page as string) || 1;
    const parsedLimit = parseInt(limit as string) || 24;

    const data = await handleProxy(targetUrl, () => {
      const query = (keyword as string).toLowerCase().trim();
      const filtered = MOCK_MOVIES.filter(item => {
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

    res.json(data);
  });

  // 4. Thể loại
  app.get('/api/the-loai', async (req, res) => {
    const targetUrl = 'https://vsmov.com/api/the-loai';
    const data = await handleProxy(targetUrl, () => MOCK_CATEGORIES);
    res.json(data);
  });

  // 5. Quốc gia
  app.get('/api/quoc-gia', async (req, res) => {
    const targetUrl = 'https://vsmov.com/api/quoc-gia';
    const data = await handleProxy(targetUrl, () => MOCK_COUNTRIES);
    res.json(data);
  });

  // 6. Chi tiết phim
  app.get('/api/phim/:slug', async (req, res) => {
    const slug = req.params.slug;
    const targetUrl = `https://vsmov.com/api/phim/${slug}`;

    const data = await handleProxy(targetUrl, () => {
      const found = MOCK_MOVIES.find(item => item.movie.slug === slug);
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

    res.json(data);
  });

  // Vite middleware setup
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
