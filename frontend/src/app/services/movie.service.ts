import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Movie,
  MovieDetail,
  MoviesResponse,
  MovieQueryParams
} from '../models';
import { ApiConfigService } from './api-config.service';

/**
 * Service pour gérer les films
 */
@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  
  private readonly endpoint = '/api/movies';

  /**
   * Récupère la liste des films avec filtres et pagination
   */
  getMovies(params?: MovieQueryParams): Observable<MoviesResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.genre_id) httpParams = httpParams.set('genre_id', params.genre_id);
      if (params.director_id) httpParams = httpParams.set('director_id', params.director_id);
      if (params.collection_id) httpParams = httpParams.set('collection_id', params.collection_id);
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.order) httpParams = httpParams.set('order', params.order);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    const url = this.apiConfig.getEndpointUrl(this.endpoint);
    return this.http.get<MoviesResponse>(url, { params: httpParams });
  }

  /**
   * Récupère un film par son ID avec tous les détails
   */
  getMovieById(id: string): Observable<MovieDetail> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.get<MovieDetail>(url);
  }

  /**
   * Crée un nouveau film
   */
  createMovie(movie: Partial<Movie>): Observable<Movie> {
    const url = this.apiConfig.getEndpointUrl(this.endpoint);
    return this.http.post<Movie>(url, movie);
  }

  /**
   * Met à jour un film existant
   */
  updateMovie(id: string, movie: Partial<Movie>): Observable<Movie> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.put<Movie>(url, movie);
  }

  /**
   * Supprime un film
   */
  deleteMovie(id: string): Observable<void> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.delete<void>(url);
  }

  /**
   * Récupère les films à voir
   */
  getMoviesToWatch(page: number = 0, limit: number = 20): Observable<MoviesResponse> {
    return this.getMovies({ status: 'a_voir', page, limit });
  }

  /**
   * Récupère les films vus
   */
  getWatchedMovies(page: number = 0, limit: number = 20): Observable<MoviesResponse> {
    return this.getMovies({ status: 'vu', page, limit });
  }

  /**
   * Récupère les films en cours
   */
  getMoviesInProgress(page: number = 0, limit: number = 20): Observable<MoviesResponse> {
    return this.getMovies({ status: 'en_cours', page, limit });
  }

  /**
   * Récupère les films d'un réalisateur
   */
  getMoviesByDirector(directorId: string, page: number = 0, limit: number = 20): Observable<MoviesResponse> {
    return this.getMovies({ director_id: directorId, page, limit });
  }

  /**
   * Récupère les films d'un genre
   */
  getMoviesByGenre(genreId: string, page: number = 0, limit: number = 20): Observable<MoviesResponse> {
    return this.getMovies({ genre_id: genreId, page, limit });
  }

  /**
   * Récupère les films d'une collection
   */
  getMoviesByCollection(collectionId: string, page: number = 0, limit: number = 20): Observable<MoviesResponse> {
    return this.getMovies({ collection_id: collectionId, page, limit });
  }

  /**
   * Recherche des films par titre
   */
  searchMovies(query: string, page: number = 0, limit: number = 20): Observable<MoviesResponse> {
    return this.getMovies({ search: query, page, limit });
  }
}
