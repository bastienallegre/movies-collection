import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">
          🎬 Movies Collection
        </a>
        
        <ul class="nav-links">
          <li>
            <a routerLink="/movies" routerLinkActive="active">Films</a>
          </li>
          <li>
            <a routerLink="/directors" routerLinkActive="active">Réalisateurs</a>
          </li>
          <li>
            <a routerLink="/genres" routerLinkActive="active">Genres</a>
          </li>
          <li>
            <a routerLink="/collections" routerLinkActive="active">Collections</a>
          </li>
        </ul>

        <div class="nav-auth">
          @if (authService.isAuthenticated()) {
            <span class="user-info">👤 {{ authService.currentUser()?.username }}</span>
            <button class="btn-logout" (click)="logout()">Déconnexion</button>
          } @else {
            <a routerLink="/login" class="btn-login" routerLinkActive="active">Connexion</a>
            <a routerLink="/register" class="btn-register" routerLinkActive="active">Inscription</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }
    
    .nav-brand {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      text-decoration: none;
      transition: opacity 0.3s;
    }
    
    .nav-brand:hover {
      opacity: 0.8;
    }
    
    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
      margin: 0;
      padding: 0;
      flex: 1;
    }
    
    .nav-links a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    
    .nav-links a:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .nav-links a.active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .nav-auth {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      color: white;
      font-weight: 500;
      padding: 0.5rem 1rem;
      background-color: rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .btn-login, .btn-register {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s;
      font-weight: 500;
    }

    .btn-login {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .btn-login:hover {
      background-color: rgba(255, 255, 255, 0.25);
    }

    .btn-register {
      background-color: rgba(255, 255, 255, 0.25);
    }

    .btn-register:hover {
      background-color: rgba(255, 255, 255, 0.35);
    }

    .btn-logout {
      background-color: rgba(239, 68, 68, 0.9);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s;
    }

    .btn-logout:hover {
      background-color: rgba(220, 38, 38, 1);
    }

    @media (max-width: 768px) {
      .nav-container {
        flex-direction: column;
        gap: 1rem;
      }

      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
