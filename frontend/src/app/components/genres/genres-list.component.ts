import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GenreService } from '../../services/genre.service';
import { AuthService } from '../../services/auth.service';
import { Genre } from '../../models';

@Component({
  selector: 'app-genres-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="genres-container">
      <div class="header">
        <h1>🎭 Genres</h1>
        @if (authService.isAuthenticated()) {
          <button class="btn-primary" routerLink="/genres/new">
            ➕ Ajouter un genre
          </button>
        }
      </div>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
      }

      @if (error()) {
        <div class="error">
          <p>❌ {{ error() }}</p>
        </div>
      }

      <div class="genres-grid">
        @for (genre of genres(); track genre.id) {
          <div class="genre-card">
            <div class="genre-content">
              <h3>{{ genre.nom }}</h3>
              @if (genre.description) {
                <p class="description">{{ genre.description }}</p>
              }
              <div class="stats">
                <span class="stat">📽️ {{ genre.nombre_films }} film{{ genre.nombre_films > 1 ? 's' : '' }}</span>
              </div>
            </div>
            
            @if (authService.isAuthenticated()) {
              <div class="genre-actions">
                <a [routerLink]="['/genres', genre.id, 'edit']" class="btn-icon edit" title="Modifier">✏️</a>
                <button (click)="deleteGenre(genre)" class="btn-icon delete" title="Supprimer">🗑️</button>
              </div>
            }
          </div>
        }
      </div>

      @if (genres().length === 0 && !loading()) {
        <div class="empty-state">
          <p>Aucun genre pour le moment</p>
          @if (authService.isAuthenticated()) {
            <button class="btn-primary" routerLink="/genres/new">
              Ajouter le premier genre
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .genres-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: opacity 0.3s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .loading {
      text-align: center;
      padding: 3rem;
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
      background: #fee;
      border: 1px solid #fcc;
      padding: 1rem;
      border-radius: 8px;
      color: #c33;
      margin-bottom: 1rem;
    }

    .genres-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .genre-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    .genre-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .genre-content h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.25rem;
    }

    .description {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stats {
      color: #888;
      font-size: 0.85rem;
      margin-top: auto;
    }

    .genre-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.4rem;
      border-radius: 4px;
      transition: background-color 0.2s;
      text-decoration: none;
    }

    .btn-icon:hover {
      background-color: #f0f0f0;
    }

    .btn-icon.delete:hover {
      background-color: #fee;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
      background: #f9f9f9;
      border-radius: 12px;
    }
  `]
})
export class GenresListComponent implements OnInit {
  private genreService = inject(GenreService);
  public authService = inject(AuthService);

  genres = signal<Genre[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadGenres();
  }

  loadGenres() {
    this.loading.set(true);
    this.genreService.getAllGenres().subscribe({
      next: (response) => {
        this.genres.set(response.genres || []); // Assuming response structure
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement genres', err);
        this.error.set('Impossible de charger les genres');
        this.loading.set(false);
      }
    });
  }

  deleteGenre(genre: Genre) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le genre "${genre.nom}" ?`)) {
      return;
    }

    this.genreService.deleteGenre(genre.id).subscribe({
      next: () => {
        this.genres.update(list => list.filter(g => g.id !== genre.id));
      },
      error: (err) => {
        this.error.set('Erreur lors de la suppression du genre');
        // Reload list to ensure state is consistent
        this.loadGenres();
      }
    });
  }
}
