import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  `]
})
export class NavbarComponent {}
