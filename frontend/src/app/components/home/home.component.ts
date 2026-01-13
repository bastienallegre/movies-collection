import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <div class="hero">
        <h1>🎬 Bienvenue dans Movies Collection</h1>
        <p class="hero-subtitle">
          Gérez votre collection de films, suivez vos visionnages et découvrez de nouveaux chef-d'œuvres
        </p>
        <div class="hero-actions">
          <button class="btn-primary" routerLink="/movies">
            Voir mes films
          </button>
          <button class="btn-secondary" routerLink="/movies/new">
            Ajouter un film
          </button>
        </div>
      </div>

      <div class="stats-section">
        <h2>Statistiques</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎞️</div>
            <div class="stat-value">{{ totalMovies() }}</div>
            <div class="stat-label">Films au total</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">{{ watchedMovies() }}</div>
            <div class="stat-label">Films vus</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-value">{{ toWatchMovies() }}</div>
            <div class="stat-label">À voir</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">{{ inProgressMovies() }}</div>
            <div class="stat-label">En cours</div>
          </div>
        </div>
      </div>

      @if (recentMovies().length > 0) {
        <div class="recent-section">
          <h2>Films récemment ajoutés</h2>
          <div class="movies-grid">
            @for (movie of recentMovies(); track movie.id) {
              <div class="movie-card" [routerLink]="['/movies', movie.id]">
                @if (movie.affiche_url) {
                  <img [src]="movie.affiche_url" [alt]="movie.titre" class="movie-poster">
                } @else {
                  <div class="movie-poster-placeholder">
                    <span>🎬</span>
                  </div>
                }
                
                <div class="movie-info">
                  <h3>{{ movie.titre }}</h3>
                  <p class="movie-year">{{ movie.annee }}</p>
                  
                  @if (movie.note) {
                    <div class="movie-rating">
                      ⭐ {{ movie.note }}/10
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .hero {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
      margin-bottom: 3rem;
    }

    .hero h1 {
      margin: 0 0 1rem 0;
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      margin: 0 0 2rem 0;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .stats-section {
      margin-bottom: 3rem;
    }

    h2 {
      color: #333;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .recent-section h2 {
      margin-bottom: 1.5rem;
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .movie-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .movie-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .movie-poster {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }

    .movie-poster-placeholder {
      width: 100%;
      height: 300px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
    }

    .movie-info {
      padding: 1rem;
    }

    .movie-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .movie-year {
      color: #666;
      margin: 0 0 0.5rem 0;
    }

    .movie-rating {
      font-size: 0.9rem;
      color: #666;
    }

    .btn-primary {
      background: white;
      color: #667eea;
      border: 2px solid white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-primary:hover {
      background: rgba(255, 255, 255, 0.9);
    }

    .btn-secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class HomeComponent implements OnInit {
  private movieService = inject(MovieService);

  totalMovies = signal(0);
  watchedMovies = signal(0);
  toWatchMovies = signal(0);
  inProgressMovies = signal(0);
  recentMovies = signal<Movie[]>([]);

  ngOnInit() {
    this.loadStats();
    this.loadRecentMovies();
  }

  loadStats() {
    // Charger les films vus
    this.movieService.getWatchedMovies(0, 1000).subscribe({
      next: (response) => {
        this.watchedMovies.set(response.total);
      }
    });

    // Charger les films à voir
    this.movieService.getMoviesToWatch(0, 1000).subscribe({
      next: (response) => {
        this.toWatchMovies.set(response.total);
      }
    });

    // Charger les films en cours
    this.movieService.getMoviesInProgress(0, 1000).subscribe({
      next: (response) => {
        this.inProgressMovies.set(response.total);
      }
    });

    // Charger le total
    this.movieService.getMovies({ limit: 1 }).subscribe({
      next: (response) => {
        this.totalMovies.set(response.total);
      }
    });
  }

  loadRecentMovies() {
    this.movieService.getMovies({ limit: 6, sort: 'date_ajout', order: 'desc' }).subscribe({
      next: (response) => {
        this.recentMovies.set(response.movies);
      }
    });
  }
}
