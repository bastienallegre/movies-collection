import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/**
 * Service pour gérer les erreurs HTTP
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  /**
   * Gère les erreurs HTTP et retourne un message utilisateur friendly
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          break;
        case 400:
          errorMessage = error.error?.error || 'Requête invalide';
          break;
        case 404:
          errorMessage = error.error?.error || 'Ressource non trouvée';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error?.error || error.message}`;
      }
    }

    console.error('Erreur HTTP:', error);
    console.error('Message:', errorMessage);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Extrait le message d'erreur d'une erreur HTTP
   */
  getErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Une erreur est survenue';
  }
}
