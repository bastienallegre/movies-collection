import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Collection,
  CollectionDetail,
  CollectionsResponse,
  CollectionQueryParams
} from '../models';
import { ApiConfigService } from './api-config.service';

/**
 * Service pour gérer les collections
 */
@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  
  private readonly endpoint = '/api/collections';

  /**
   * Récupère la liste des collections avec pagination
   */
  getCollections(params?: CollectionQueryParams): Observable<CollectionsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    }

    const url = this.apiConfig.getEndpointUrl(this.endpoint);
    return this.http.get<CollectionsResponse>(url, { params: httpParams });
  }

  /**
   * Récupère une collection par son ID avec tous ses films
   */
  getCollectionById(id: string): Observable<CollectionDetail> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.get<CollectionDetail>(url);
  }

  /**
   * Crée une nouvelle collection
   */
  createCollection(collection: Partial<Collection>): Observable<Collection> {
    const url = this.apiConfig.getEndpointUrl(this.endpoint);
    return this.http.post<Collection>(url, collection);
  }

  /**
   * Met à jour une collection existante
   */
  updateCollection(id: string, collection: Partial<Collection>): Observable<Collection> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.put<Collection>(url, collection);
  }

  /**
   * Supprime une collection
   */
  deleteCollection(id: string): Observable<void> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${id}`);
    return this.http.delete<void>(url);
  }

  /**
   * Ajoute un film à une collection
   */
  addMovieToCollection(collectionId: string, movieId: string): Observable<Collection> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${collectionId}/movies`);
    return this.http.post<Collection>(url, { movie_id: movieId });
  }

  /**
   * Retire un film d'une collection
   */
  removeMovieFromCollection(collectionId: string, movieId: string): Observable<Collection> {
    const url = this.apiConfig.getEndpointUrl(`${this.endpoint}/${collectionId}/movies/${movieId}`);
    return this.http.delete<Collection>(url);
  }

  /**
   * Récupère toutes les collections (sans pagination)
   */
  getAllCollections(): Observable<CollectionsResponse> {
    return this.getCollections({ limit: 1000 });
  }
}
