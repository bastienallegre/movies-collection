import { Injectable } from '@angular/core';

/**
 * Service de configuration pour l'API backend
 */
@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  /**
   * URL de base de l'API backend
   * En développement: http://localhost:3000/api
   * En production: cette valeur sera surchargée par les variables d'environnement
   */
  private readonly API_BASE_URL = 'http://localhost:3000/api';

  /**
   * Retourne l'URL de base de l'API
   */
  getApiUrl(): string {
    return this.API_BASE_URL;
  }

  /**
   * Construit l'URL complète pour un endpoint
   */
  getEndpointUrl(endpoint: string): string {
    return `${this.API_BASE_URL}${endpoint}`;
  }
}
