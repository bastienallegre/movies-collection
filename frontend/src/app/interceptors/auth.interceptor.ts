import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

/**
 * Intercepteur HTTP pour ajouter automatiquement le token JWT aux requêtes
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Cloner la requête et ajouter le header Authorization si un token existe
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Gérer les erreurs d'authentification
  return next(req).pipe(
    catchError((error) => {
      // Si le token est expiré ou invalide (401), déconnecter l'utilisateur
      if (error.status === 401 && authService.hasToken()) {
        console.warn('Token expiré ou invalide, déconnexion automatique');
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
