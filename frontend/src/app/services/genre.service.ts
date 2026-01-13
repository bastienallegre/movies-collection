import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Genre,
  GenreDetail,
  GenresResponse,
  GenreQueryParams
} from '../models';
import { ApiConfigService } from './api-config.service';

/**
 * Service pour gérer les genres
 */
@Injectable({
  providedIn: 'root'
})
export class GenreService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  
  private readonly endpoint = '/api/genres';

  /**
   * Récupère la liste des genres avec pagination
   */
  getGenres(params?: GenreQueryParams): Observable<GenresResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    }

    const url = this.apiConfig.getEndpointUrl(this.endpoint);
    return this.http.get<GenresResponse>(url, { params: httpParams });
  }

  /**
   * Récupère un genre par son ID avec tous ses films
   */
  getGenreById(id: string): Observable<GenreDetail> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.get<GenreDetail>(url);
  }

  /**
   * Crée un nouveau genre
   */
  createGenre(genre: Partial<Genre>): Observable<Genre> {
    const url = this.apiConfig.getEndpointUrl(this.endpoint);
    return this.http.post<Genre>(url, genre);
  }

  /**
   * Met à jour un genre existant
   */
  updateGenre(id: string, genre: Partial<Genre>): Observable<Genre> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.put<Genre>(url, genre);
  }

  /**
   * Supprime un genre
   */
  deleteGenre(id: string): Observable<void> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.delete<void>(url);
  }

  /**
   * Récupère tous les genres (sans pagination)
   */
  getAllGenres(): Observable<GenresResponse> {
    return this.getGenres({ limit: 1000 });
  }
}
