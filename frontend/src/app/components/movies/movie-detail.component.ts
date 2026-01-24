import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { AuthService } from '../../services/auth.service';
import { MovieDetail } from '../../models';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="movie-detail-container">
      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
      }

      @if (error()) {
        <div class="error">
          <p>❌ {{ error() }}</p>
          <button class="btn-secondary" routerLink="/movies">Retour à la liste</button>
        </div>
      }

      @if (movie()) {
        <div class="movie-detail">
          <div class="back-button">
            <button class="btn-link" routerLink="/movies">← Retour à la liste</button>
          </div>

          <div class="movie-header">
            @if (movie()!.affiche_url) {
              <img [src]="movie()!.affiche_url" [alt]="movie()!.titre" class="movie-poster-large">
            } @else {
              <div class="movie-poster-placeholder-large">
                <span>🎬</span>
              </div>
            }

            <div class="movie-header-info">
              <h1>{{ movie()!.titre }}</h1>
              <p class="movie-year">{{ movie()!.annee }}</p>

              <div class="movie-badges">
                <span [class]="'status-badge status-' + movie()!.statut">
                  {{ getStatusLabel(movie()!.statut) }}
                </span>

                @if (movie()!.note) {
                  <span class="rating-badge">
                    ⭐ {{ movie()!.note }}/10
                  </span>
                }
              </div>

              <div class="movie-meta">
                @if (movie()!.duree) {
                  <div class="meta-item">
                    <span class="meta-icon">🕐</span>
                    <span>{{ movie()!.duree }} minutes</span>
                  </div>
                }

                @if (movie()!.director) {
                  <div class="meta-item">
                    <span class="meta-icon">🎬</span>
                    <a [routerLink]="['/directors', movie()!.director!.id]">
                      {{ movie()!.director!.prenom }} {{ movie()!.director!.nom }}
                    </a>
                  </div>
                }

                @if (movie()!.date_ajout) {
                  <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <span>Ajouté le {{ formatDate(movie()!.date_ajout) }}</span>
                  </div>
                }

                @if (movie()!.date_visionnage) {
                  <div class="meta-item">
                    <span class="meta-icon">👁️</span>
                    <span>Vu le {{ formatDate(movie()!.date_visionnage!) }}</span>
                  </div>
                }
              </div>

              @if (authService.isAuthenticated()) {
                <div class="action-buttons">
                  <button class="btn-primary" [routerLink]="['/movies', movie()!.id, 'edit']">
                    ✏️ Modifier
                  </button>
                  <button class="btn-danger" (click)="deleteMovie()">
                    🗑️ Supprimer
                  </button>
                </div>
              }
            </div>
          </div>

          @if (movie()!.synopsis) {
            <div class="movie-section">
              <h2>Synopsis</h2>
              <p class="synopsis">{{ movie()!.synopsis }}</p>
            </div>
          }

          @if (movie()!.genres && movie()!.genres!.length > 0) {
            <div class="movie-section">
              <h2>Genres</h2>
              <div class="genre-list">
                @for (genre of movie()!.genres; track genre.id) {
                  <a [routerLink]="['/genres', genre.id]" class="genre-badge">
                    {{ genre.nom }}
                  </a>
                }
              </div>
            </div>
          }

          @if (movie()!.tags && movie()!.tags!.length > 0) {
            <div class="movie-section">
              <h2>Tags</h2>
              <div class="tags-list">
                @for (tag of movie()!.tags; track tag) {
                  <span class="tag-badge">{{ tag }}</span>
                }
              </div>
            </div>
          }

          @if (movie()!.commentaire) {
            <div class="movie-section">
              <h2>Mon avis</h2>
              <p class="comment">{{ movie()!.commentaire }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .movie-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .loading {
      text-align: center;
      padding: 4rem;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      text-align: center;
      padding: 2rem;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      color: #c33;
    }

    .back-button {
      margin-bottom: 1rem;
    }

    .btn-link {
      background: none;
      border: none;
      color: #667eea;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.5rem 1rem;
      transition: opacity 0.3s;
    }

    .btn-link:hover {
      opacity: 0.7;
    }

    .movie-detail {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .movie-header {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
      padding: 2rem;
    }

    .movie-poster-large {
      width: 100%;
      height: auto;
      border-radius: 8px;
    }

    .movie-poster-placeholder-large {
      width: 100%;
      height: 450px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6rem;
    }

    .movie-header-info h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .movie-year {
      font-size: 1.2rem;
      color: #666;
      margin: 0 0 1rem 0;
    }

    .movie-badges {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .status-badge, .rating-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .status-a_voir {
      background: #e3f2fd;
      color: #1976d2;
    }

    .status-vu {
      background: #e8f5e9;
      color: #388e3c;
    }

    .status-en_cours {
      background: #fff3e0;
      color: #f57c00;
    }

    .rating-badge {
      background: #fff8e1;
      color: #f57f17;
    }

    .movie-meta {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
    }

    .meta-icon {
      font-size: 1.2rem;
    }

    .meta-item a {
      color: #667eea;
      text-decoration: none;
    }

    .meta-item a:hover {
      text-decoration: underline;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    .movie-section {
      padding: 2rem;
      border-top: 1px solid #eee;
    }

    .movie-section h2 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.3rem;
    }

    .synopsis, .comment {
      line-height: 1.6;
      color: #555;
      margin: 0;
    }

    .genre-list, .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .genre-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s;
    }

    .genre-badge:hover {
      opacity: 0.8;
    }

    .tag-badge {
      background: #f5f5f5;
      color: #666;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: opacity 0.3s;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: opacity 0.3s;
    }

    .btn-danger:hover {
      opacity: 0.9;
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }

    @media (max-width: 768px) {
      .movie-header {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MovieDetailComponent implements OnInit {
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public authService = inject(AuthService);

  movie = signal<MovieDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMovie(id);
    }
  }

  loadMovie(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.movieService.getMovieById(id).subscribe({
      next: (movie) => {
        this.movie.set(movie);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur lors du chargement du film');
        this.loading.set(false);
      }
    });
  }

  deleteMovie() {
    if (!this.movie()) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${this.movie()!.titre}" ?`)) {
      this.movieService.deleteMovie(this.movie()!.id).subscribe({
        next: () => {
          this.router.navigate(['/movies']);
        },
        error: (err) => {
          alert('Erreur lors de la suppression: ' + err.message);
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'a_voir': 'À voir',
      'vu': 'Vu',
      'en_cours': 'En cours'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
