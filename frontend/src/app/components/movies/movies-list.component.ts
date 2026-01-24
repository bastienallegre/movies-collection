import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { AuthService } from '../../services/auth.service';
import { Movie } from '../../models';

@Component({
  selector: 'app-movies-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="movies-container">
      <div class="header">
        <h1>📽️ Films</h1>
        @if (authService.isAuthenticated()) {
          <button class="btn-primary" routerLink="/movies/new">
            ➕ Ajouter un film
          </button>
        }
      </div>

      <!-- Filtres -->
      <div class="filters">
        <div class="filter-group">
          <label>Statut:</label>
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()">
            <option value="">Tous</option>
            <option value="a_voir">À voir</option>
            <option value="vu">Vus</option>
            <option value="en_cours">En cours</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tri:</label>
          <select [(ngModel)]="sortBy" (change)="onFilterChange()">
            <option value="date_ajout">Date d'ajout</option>
            <option value="titre">Titre</option>
            <option value="annee">Année</option>
            <option value="note">Note</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Ordre:</label>
          <select [(ngModel)]="sortOrder" (change)="onFilterChange()">
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </div>

        <div class="search-box">
          <input 
            type="text" 
            placeholder="Rechercher un film..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          />
        </div>
      </div>

      <!-- Chargement -->
      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Chargement des films...</p>
        </div>
      }

      <!-- Erreur -->
      @if (error()) {
        <div class="error">
          <p>❌ {{ error() }}</p>
          <button class="btn-secondary" (click)="loadMovies()">Réessayer</button>
        </div>
      }

      <!-- Liste des films -->
      @if (!loading() && !error() && movies().length > 0) {
        <div class="stats">
          <p>{{ total() }} film(s) trouvé(s)</p>
        </div>

        <div class="movies-grid">
          @for (movie of movies(); track movie.id) {
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
                
                <div class="movie-status">
                  <span [class]="'status-badge status-' + movie.statut">
                    {{ getStatusLabel(movie.statut) }}
                  </span>
                </div>

                @if (movie.note) {
                  <div class="movie-rating">
                    ⭐ {{ movie.note }}/10
                  </div>
                }

                @if (movie.duree) {
                  <div class="movie-duration">
                    🕐 {{ movie.duree }} min
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (total() > limit) {
          <div class="pagination">
            <button 
              class="btn-secondary"
              [disabled]="page === 0"
              (click)="previousPage()"
            >
              ← Précédent
            </button>
            
            <span class="page-info">
              Page {{ page + 1 }} / {{ totalPages() }}
            </span>
            
            <button 
              class="btn-secondary"
              [disabled]="page >= totalPages() - 1"
              (click)="nextPage()"
            >
              Suivant →
            </button>
          </div>
        }
      }

      <!-- Aucun résultat -->
      @if (!loading() && !error() && movies().length === 0) {
        <div class="empty-state">
          <p>Aucun film trouvé</p>
          <button class="btn-primary" routerLink="/movies/new">
            Ajouter votre premier film
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .movies-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #555;
      font-size: 0.9rem;
    }

    .filter-group select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-width: 150px;
    }

    .search-box {
      flex: 1;
      min-width: 250px;
    }

    .search-box input {
      width: 100%;
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .stats {
      margin-bottom: 1rem;
      color: #666;
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
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

    .movie-status {
      margin: 0.5rem 0;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
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

    .movie-rating, .movie-duration {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.25rem;
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
      text-align: center;
      padding: 2rem;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      color: #c33;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-info {
      color: #666;
      font-weight: 500;
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

    .btn-secondary:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class MoviesListComponent implements OnInit {
  private movieService = inject(MovieService);
  public authService = inject(AuthService);

  movies = signal<Movie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  total = signal(0);

  // Filtres
  statusFilter = '';
  sortBy = 'date_ajout';
  sortOrder = 'desc';
  searchQuery = '';

  // Pagination
  page = 0;
  limit = 20;

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.loading.set(true);
    this.error.set(null);

    const params: any = {
      page: this.page,
      limit: this.limit,
      sort: this.sortBy,
      order: this.sortOrder
    };

    if (this.statusFilter) {
      params.status = this.statusFilter;
    }

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.movieService.getMovies(params).subscribe({
      next: (response) => {
        this.movies.set(response.movies);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur lors du chargement des films');
        this.loading.set(false);
      }
    });
  }

  onFilterChange() {
    this.page = 0; // Reset to first page
    this.loadMovies();
  }

  onSearch() {
    this.page = 0; // Reset to first page
    this.loadMovies();
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.loadMovies();
    }
  }

  nextPage() {
    if (this.page < this.totalPages() - 1) {
      this.page++;
      this.loadMovies();
    }
  }

  totalPages() {
    return Math.ceil(this.total() / this.limit);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'a_voir': 'À voir',
      'vu': 'Vu',
      'en_cours': 'En cours'
    };
    return labels[status] || status;
  }
}
