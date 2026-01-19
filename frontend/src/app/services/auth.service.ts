import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // Signaux pour l'état d'authentification
  public currentUser = signal<User | null>(this.getUserFromStorage());
  public isAuthenticated = signal<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    // Vérifier si le token est toujours valide au démarrage
    if (this.hasToken()) {
      this.validateToken().subscribe({
        error: () => this.logout()
      });
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiConfig.getApiUrl()}/auth/register`,
      data
    ).pipe(
      tap(response => {
        if (response.success) {
          this.saveAuthData(response.data.token, response.data.user);
        }
      })
    );
  }

  /**
   * Connexion d'un utilisateur
   */
  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiConfig.getApiUrl()}/auth/login`,
      data
    ).pipe(
      tap(response => {
        if (response.success) {
          this.saveAuthData(response.data.token, response.data.user);
        }
      })
    );
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Obtenir le profil de l'utilisateur connecté
   */
  getProfile(): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.get<{ success: boolean; data: { user: User } }>(
      `${this.apiConfig.getApiUrl()}/auth/me`
    ).pipe(
      tap(response => {
        if (response.success) {
          this.saveUser(response.data.user);
        }
      })
    );
  }

  /**
   * Valider le token actuel
   */
  validateToken(): Observable<any> {
    return this.getProfile();
  }

  /**
   * Mettre à jour le mot de passe
   */
  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(
      `${this.apiConfig.getApiUrl()}/auth/password`,
      { currentPassword, newPassword }
    );
  }

  /**
   * Obtenir le token stocké
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Vérifier si un token existe
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Sauvegarder les données d'authentification
   */
  private saveAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.saveUser(user);
    this.isAuthenticated.set(true);
  }

  /**
   * Sauvegarder l'utilisateur
   */
  private saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  /**
   * Récupérer l'utilisateur depuis le localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}
