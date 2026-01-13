/**
 * Interface pour les liens HATEOAS
 */
export interface HateoasLink {
  href: string;
  method?: string;
  rel?: string;
}

export interface HateoasLinks {
  self?: HateoasLink;
  update?: HateoasLink;
  delete?: HateoasLink;
  all?: HateoasLink;
  movies?: HateoasLink;
  director?: HateoasLink;
  genres?: HateoasLink[];
  collections?: HateoasLink;
  prev?: HateoasLink;
  next?: HateoasLink;
  [key: string]: HateoasLink | HateoasLink[] | undefined;
}

/**
 * Interface pour un film
 */
export interface Movie {
  id: string;
  titre: string;
  annee: number;
  director_id: string;
  genre_ids: string[];
  duree?: number;
  synopsis?: string;
  statut: 'a_voir' | 'vu' | 'en_cours';
  note?: number;
  commentaire?: string;
  affiche_url?: string;
  tmdb_id?: number;
  tags?: string[];
  date_ajout: string;
  date_visionnage?: string;
  _links?: HateoasLinks;
}

/**
 * Interface pour un film avec détails enrichis
 */
export interface MovieDetail extends Movie {
  director?: DirectorSummary;
  genres?: GenreSummary[];
}

/**
 * Interface pour un réalisateur
 */
export interface Director {
  id: string;
  nom: string;
  prenom: string;
  date_naissance?: string;
  nationalite?: string;
  biographie?: string;
  photo_url?: string;
  nombre_films: number;
  _links?: HateoasLinks;
}

/**
 * Interface pour un réalisateur avec ses films
 */
export interface DirectorDetail extends Director {
  movies?: MovieSummary[];
}

/**
 * Interface pour un genre
 */
export interface Genre {
  id: string;
  nom: string;
  description?: string;
  nombre_films: number;
  _links?: HateoasLinks;
}

/**
 * Interface pour un genre avec ses films
 */
export interface GenreDetail extends Genre {
  movies?: MovieSummary[];
}

/**
 * Interface pour une collection
 */
export interface Collection {
  id: string;
  nom: string;
  description?: string;
  is_public: boolean;
  date_creation: string;
  nombre_films: number;
  movie_ids: string[];
  _links?: HateoasLinks;
}

/**
 * Interface pour une collection avec ses films
 */
export interface CollectionDetail extends Collection {
  movies?: MovieSummary[];
}

/**
 * Résumés pour les relations
 */
export interface MovieSummary {
  id: string;
  titre: string;
  annee: number;
  affiche_url?: string;
  _links?: HateoasLinks;
}

export interface DirectorSummary {
  id: string;
  nom: string;
  prenom: string;
  _links?: HateoasLinks;
}

export interface GenreSummary {
  id: string;
  nom: string;
  _links?: HateoasLinks;
}

/**
 * Interfaces pour les réponses paginées de l'API
 */
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  _links: HateoasLinks;
}

export interface MoviesResponse extends PaginatedResponse<Movie> {
  movies: Movie[];
}

export interface DirectorsResponse extends PaginatedResponse<Director> {
  directors: Director[];
}

export interface GenresResponse extends PaginatedResponse<Genre> {
  genres: Genre[];
}

export interface CollectionsResponse extends PaginatedResponse<Collection> {
  collections: Collection[];
}

/**
 * Interface pour les paramètres de requête
 */
export interface MovieQueryParams {
  status?: 'a_voir' | 'vu' | 'en_cours';
  genre_id?: string;
  director_id?: string;
  collection_id?: string;
  sort?: 'titre' | 'annee' | 'note' | 'date_ajout';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}

export interface DirectorQueryParams {
  page?: number;
  limit?: number;
  sort?: 'nom' | 'nombre_films';
}

export interface GenreQueryParams {
  page?: number;
  limit?: number;
}

export interface CollectionQueryParams {
  page?: number;
  limit?: number;
}

/**
 * Interface pour les statistiques
 */
export interface Statistics {
  total_movies: number;
  movies_watched: number;
  movies_to_watch: number;
  movies_in_progress: number;
  total_directors: number;
  total_genres: number;
  total_collections: number;
  average_rating: number;
  total_watch_time_minutes: number;
}
