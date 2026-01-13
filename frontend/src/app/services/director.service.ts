import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Director,
  DirectorDetail,
  DirectorsResponse,
  DirectorQueryParams
} from '../models';
import { ApiConfigService } from './api-config.service';

/**
 * Service pour gérer les réalisateurs
 */
@Injectable({
  providedIn: 'root'
})
export class DirectorService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  
  private readonly endpoint = '/api/directors';

  /**
   * Récupère la liste des réalisateurs avec pagination
   */
  getDirectors(params?: DirectorQueryParams): Observable<DirectorsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
    }

    const url = this.apiConfig.getEndpointUrl(this.endpoint);
    return this.http.get<DirectorsResponse>(url, { params: httpParams });
  }

  /**
   * Récupère un réalisateur par son ID avec tous ses films
   */
  getDirectorById(id: string): Observable<DirectorDetail> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.get<DirectorDetail>(url);
  }

  /**
   * Crée un nouveau réalisateur
   */
  createDirector(director: Partial<Director>): Observable<Director> {
    const url = this.apiConfig.getEndpointUrl(this.endpoint);
    return this.http.post<Director>(url, director);
  }

  /**
   * Met à jour un réalisateur existant
   */
  updateDirector(id: string, director: Partial<Director>): Observable<Director> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.put<Director>(url, director);
  }

  /**
   * Supprime un réalisateur
   */
  deleteDirector(id: string): Observable<void> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.delete<void>(url);
  }

  /**
   * Récupère tous les réalisateurs (sans pagination)
   */
  getAllDirectors(): Observable<DirectorsResponse> {
    return this.getDirectors({ limit: 1000 });
  }
}
