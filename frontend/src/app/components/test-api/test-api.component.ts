import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models';

/**
 * Composant de test pour vérifier que les services fonctionnent
 */
@Component({
  selector: 'app-test-api',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h1>Test de l'API Movies</h1>
      
      @if (loading()) {
        <p>Chargement...</p>
      }
      
      @if (error()) {
        <div class="error">
          <p>Erreur: {{ error() }}</p>
        </div>
      }
      
      @if (movies().length > 0) {
        <div class="success">
          <p>✅ Connexion à l'API réussie!</p>
          <p>{{ movies().length }} films récupérés</p>
        </div>
        
        <div class="movies-list">
          <h2>Films:</h2>
          @for (movie of movies(); track movie.id) {
            <div class="movie-card">
              <h3>{{ movie.titre }} ({{ movie.annee }})</h3>
              <p>Statut: {{ movie.statut }}</p>
              @if (movie.note) {
                <p>Note: {{ movie.note }}/10</p>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .test-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
    
    .error {
      background: #fee;
      border: 1px solid #fcc;
      padding: 1rem;
      border-radius: 4px;
      color: #c33;
    }
    
    .success {
      background: #efe;
      border: 1px solid #cfc;
      padding: 1rem;
      border-radius: 4px;
      color: #3c3;
      margin-bottom: 1rem;
    }
    
    .movies-list {
      margin-top: 2rem;
    }
    
    .movie-card {
      background: #f9f9f9;
      border: 1px solid #ddd;
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
    }
    
    .movie-card h3 {
      margin: 0 0 0.5rem 0;
      color: #555;
    }
    
    .movie-card p {
      margin: 0.25rem 0;
      color: #777;
    }
  `]
})
export class TestApiComponent implements OnInit {
  private movieService = inject(MovieService);
  
  movies = signal<Movie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.loading.set(true);
    this.error.set(null);

    this.movieService.getMovies({ limit: 10 }).subscribe({
      next: (response) => {
        this.movies.set(response.movies);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur lors du chargement des films');
        this.loading.set(false);
        console.error('Erreur:', err);
      }
    });
  }
}
