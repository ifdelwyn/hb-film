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

const movieDetailCache = new Map<string, MovieDetailResponse>();

export async function fetchMovieDetail(slug: string): Promise<MovieDetailResponse> {
  if (movieDetailCache.has(slug)) {
    return movieDetailCache.get(slug)!;
  }
  const result = await fetchFromApi<MovieDetailResponse>(`/api/phim/${slug}`);
  movieDetailCache.set(slug, result);
  return result;
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
