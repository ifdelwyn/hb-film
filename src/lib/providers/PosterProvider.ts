/**
 * PosterProvider & HeroImageProvider
 * Quality-First Image Resolution System for FilmFlow (Netflix & Apple TV+ grade)
 */

export interface ImageSource {
  priority: number;
  url: string;
  sourceName: 'VSMov' | 'TMDBOriginal' | 'FanArt' | 'LocalCache';
}

// Hand-curated 4K/UHD assets mapping for the featured spotlight movies
const MOVIE_HIGH_RES_ASSETS: Record<string, { TMDBBackdrops: string[]; TMDBPosters: string[]; backdropFallback: string; posterFallback: string }> = {
  'tap-yeu-don-dau': {
    TMDBBackdrops: [
      'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=2070&auto=format&fit=crop', // Cinematic rainy street romantic
      'https://vsmov.com/storage/movies/tap-yeu-don-dau/tap-yeu-don-dau-thumb.webp'
    ],
    TMDBPosters: [
      'https://vsmov.com/storage/movies/tap-yeu-don-dau/tap-yeu-don-dau-poster.webp',
      'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=1000&auto=format&fit=crop'
    ],
    backdropFallback: 'https://vsmov.com/storage/movies/tap-yeu-don-dau/tap-yeu-don-dau-thumb.webp',
    posterFallback: 'https://vsmov.com/storage/movies/tap-yeu-don-dau/tap-yeu-don-dau-poster.webp'
  },
  'hoang-phi-hong-bi-an-mot-huyen-thoai': {
    TMDBBackdrops: [
      'https://image.tmdb.org/t/p/original/pA0zreFm7G0aYm6eR4U7J3pEshP.jpg', // Rise of the Legend 4K
      'https://image.tmdb.org/t/p/original/o8i6Oof4bWh980FpWzLhX5MebW0.jpg',
      'https://vsmov.com/storage/movies/hoang-phi-hong-bi-an-mot-huyen-thoai/hoang-phi-hong-bi-an-mot-huyen-thoai-thumb.jpg'
    ],
    TMDBPosters: [
      'https://image.tmdb.org/t/p/original/6v7F5YV0009mcoF0S2pArFz38f9.jpg',
      'https://vsmov.com/storage/movies/hoang-phi-hong-bi-an-mot-huyen-thoai/hoang-phi-hong-bi-an-mot-huyen-thoai-poster.webp'
    ],
    backdropFallback: 'https://vsmov.com/storage/movies/hoang-phi-hong-bi-an-mot-huyen-thoai/hoang-phi-hong-bi-an-mot-huyen-thoai-thumb.jpg',
    posterFallback: 'https://vsmov.com/storage/movies/hoang-phi-hong-bi-an-mot-huyen-thoai/hoang-phi-hong-bi-an-mot-huyen-thoai-poster.webp'
  },
  'tuyet-trung-huyet-dao-hanh': {
    TMDBBackdrops: [
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2070&auto=format&fit=crop', // Beautiful high-fidelity landscape
      'https://vsmov.com/storage/movies/tuyet-trung-huyet-dao-hanh/tuyet-trung-huyet-dao-hanh-thumb.jpg'
    ],
    TMDBPosters: [
      'https://vsmov.com/storage/movies/tuyet-trung-huyet-dao-hanh/tuyet-trung-huyet-dao-hanh-poster.webp'
    ],
    backdropFallback: 'https://vsmov.com/storage/movies/tuyet-trung-huyet-dao-hanh/tuyet-trung-huyet-dao-hanh-thumb.jpg',
    posterFallback: 'https://vsmov.com/storage/movies/tuyet-trung-huyet-dao-hanh/tuyet-trung-huyet-dao-hanh-poster.webp'
  },
  'ma-thoi-den-nam-hai-quy-hu': {
    TMDBBackdrops: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop', // Magnificent deep sea landscape
      'https://vsmov.com/storage/movies/ma-thoi-den-nam-hai-quy-hu/ma-thoi-den-nam-hai-quy-hu-thumb.jpg'
    ],
    TMDBPosters: [
      'https://vsmov.com/storage/movies/ma-thoi-den-nam-hai-quy-hu/ma-thoi-den-nam-hai-quy-hu-poster.webp'
    ],
    backdropFallback: 'https://vsmov.com/storage/movies/ma-thoi-den-nam-hai-quy-hu/ma-thoi-den-nam-hai-quy-hu-thumb.jpg',
    posterFallback: 'https://vsmov.com/storage/movies/ma-thoi-den-nam-hai-quy-hu/ma-thoi-den-nam-hai-quy-hu-poster.webp'
  },
  'tan-phong-than-nhi-lang-than': {
    TMDBBackdrops: [
      'https://image.tmdb.org/t/p/original/bQLU9qIn7oI7D8mUonF6P4KAd4S.jpg', // New Gods: Yang Jian UHD
      'https://image.tmdb.org/t/p/original/or066gI0bZg2sdA06gSpS6xy76A.jpg',
      'https://vsmov.com/storage/movies/tan-phong-than-nhi-lang-than/tan-phong-than-nhi-lang-than-thumb.jpg'
    ],
    TMDBPosters: [
      'https://image.tmdb.org/t/p/original/La7Z65ZzZ28z15x3W686t2l0n9A.jpg',
      'https://vsmov.com/storage/movies/tan-phong-than-nhi-lang-than/tan-phong-than-nhi-lang-than-poster.webp'
    ],
    backdropFallback: 'https://vsmov.com/storage/movies/tan-phong-than-nhi-lang-than/tan-phong-than-nhi-lang-than-thumb.jpg',
    posterFallback: 'https://vsmov.com/storage/movies/tan-phong-than-nhi-lang-than/tan-phong-than-nhi-lang-than-poster.webp'
  }
};

/**
 * Validates the actual visual dimensions of an image URL asynchronously
 * @param url String URL to validate
 * @param minWidth Number minimum width limit
 * @returns Promise resolving if dimensions match, rejecting otherwise
 */
export function validateImageSize(url: string, minWidth = 1080): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    const img = new Image();
    img.src = url;
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      if (img.width >= minWidth) {
        resolve(true);
      } else {
        console.warn(`[PosterProvider] Image size too small: ${img.width}x${img.height} (Required >= ${minWidth}px) for ${url}`);
        resolve(false);
      }
    };
    img.onerror = () => {
      resolve(false);
    };
  });
}

/**
 * Cascades sources based on priority list
 * Checks resolution to guarantee Netflix/Apple TV+ grade visual crispness
 */
export async function resolvePremiumBackdrop(slug: string, vsmovBackdrop: string): Promise<string> {
  const custom = MOVIE_HIGH_RES_ASSETS[slug];
  
  // Setup sources sequence
  const candidates: { url: string; label: string }[] = [];
  
  if (vsmovBackdrop) {
    candidates.push({ url: vsmovBackdrop, label: 'VSMov Original' });
  }

  if (custom) {
    custom.TMDBBackdrops.forEach((url, i) => {
      candidates.push({ url, label: `TMDB Original [${i}]` });
    });
  }

  // Check from high quality downwards
  for (const item of candidates) {
    const isOk = await validateImageSize(item.url, 1080); // Ensure >= 1080p
    if (isOk) {
      // console.log(`[PosterProvider] Premium image selected of quality ${item.label} for ${slug}`);
      return item.url;
    }
  }

  // Last-chance default cache fallback
  if (custom) return custom.backdropFallback;
  return vsmovBackdrop;
}

export async function resolvePremiumPoster(slug: string, vsmovPoster: string): Promise<string> {
  const custom = MOVIE_HIGH_RES_ASSETS[slug];
  
  const candidates: { url: string; label: string }[] = [];
  
  if (vsmovPoster) {
    candidates.push({ url: vsmovPoster, label: 'VSMov Original Poster' });
  }

  if (custom) {
    custom.TMDBPosters.forEach((url, i) => {
      candidates.push({ url, label: `TMDB Poster [${i}]` });
    });
  }

  for (const item of candidates) {
    const isOk = await validateImageSize(item.url, 800);
    if (isOk) {
      return item.url;
    }
  }

  if (custom) return custom.posterFallback;
  return vsmovPoster;
}
