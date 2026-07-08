export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
}

export interface IMDB {
  id?: string;
  star?: string;
  vote?: number;
}

export interface Movie {
  name: string;
  slug: string;
  origin_name: string;
  content: string;
  type: 'series' | 'single' | string;
  status: 'completed' | 'ongoing' | 'trailer';
  thumb_url: string;
  poster_url: string;
  is_copyright?: boolean;
  sub_docquyen?: boolean;
  chieurap?: boolean;
  year: number;
  view: number;
  actor: string[];
  director: string[];
  category: Category[];
  country: Country[];
  time: string;
  episode_current: string;
  episode_total: string;
  lang: string;
  quality: string;
  imdb?: IMDB;
}

export interface EpisodeData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface EpisodeServer {
  server_name: string;
  server_data: EpisodeData[];
}

export interface MovieDetailResponse {
  status: boolean;
  msg: string;
  movie: Movie;
  episodes: EpisodeServer[];
}

export interface MovieListParams {
  type?: 'single' | 'series' | string;
  page?: number;
  limit?: number;
  sort_field?: 'modified_time' | 'year';
  sort_type?: 'desc' | 'asc';
  category?: string;
  country?: string;
  year?: string | number;
}

export interface MovieListItem {
  name: string;
  slug: string;
  origin_name: string;
  thumb_url: string;
  poster_url: string;
  year: number;
  type: 'series' | 'single' | string;
  episode_current: string;
  quality: string;
  lang: string;
}

export interface MovieListResponse {
  status: boolean;
  items: MovieListItem[];
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}
