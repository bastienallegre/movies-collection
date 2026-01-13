import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CollectionService } from '../../services/collection.service';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models';

@Component({
  selector: 'app-collection-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h1>{{ isEditMode() ? '✏️ Modifier la collection' : '➕ Ajouter une collection' }}</h1>
        <button class="btn-link" routerLink="/collections">← Retour</button>
      </div>

      @if (error()) {
        <div class="error">
          <p>❌ {{ error() }}</p>
        </div>
      }

      <form [formGroup]="collectionForm" (ngSubmit)="onSubmit()" class="collection-form">
        <div class="form-section">
          <h2>Informations de la collection</h2>
          
          <div class="form-group">
            <label for="nom">Nom de la collection *</label>
            <input 
              id="nom" 
              type="text" 
              formControlName="nom"
              placeholder="Ex: Le Seigneur des Anneaux"
            >
            @if (collectionForm.get('nom')?.invalid && collectionForm.get('nom')?.touched) {
              <span class="error-text">Le nom est requis</span>
            }
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              formControlName="description"
              rows="4"
              placeholder="Description de la collection de films..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="affiche_url">URL de l'affiche</label>
            <input 
              id="affiche_url" 
              type="url" 
              formControlName="affiche_url"
              placeholder="https://image.tmdb.org/t/p/w500/..."
            >
          </div>
        </div>

        <div class="form-section">
          <h2>Films de la collection</h2>
          
          <div class="form-group">
            <label>Sélectionner les films</label>
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                [ngModelOptions]="{standalone: true}"
                placeholder="Rechercher un film..."
                (input)="onSearchChange()"
              >
            </div>
            
            <div class="movies-list">
              @for (movie of filteredMovies(); track movie.id) {
                <label class="movie-checkbox">
                  <input 
                    type="checkbox" 
                    [value]="movie.id"
                    [checked]="isMovieSelected(movie.id)"
                    (change)="onMovieChange(movie.id, $event)"
                  >
                  <div class="movie-info">
                    <span class="movie-title">{{ movie.titre }}</span>
                    <span class="movie-year">({{ movie.annee }})</span>
                  </div>
                </label>
              }
              
              @if (filteredMovies().length === 0) {
                <p class="no-results">Aucun film trouvé</p>
              }
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" routerLink="/collections">
            Annuler
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="collectionForm.invalid || submitting()"
          >
            {{ submitting() ? 'Enregistrement...' : (isEditMode() ? 'Modifier' : 'Ajouter') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .form-header h1 {
      margin: 0;
      color: #333;
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

    .error {
      background: #fee;
      border: 1px solid #fcc;
      padding: 1rem;
      border-radius: 8px;
      color: #c33;
      margin-bottom: 1rem;
    }

    .collection-form {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #eee;
    }

    .form-section:last-of-type {
      border-bottom: none;
    }

    .form-section h2 {
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 1.3rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }

    input[type="text"],
    input[type="url"],
    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.3s;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    textarea {
      resize: vertical;
    }

    .search-box {
      margin-bottom: 1rem;
    }

    .movies-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 0.5rem;
    }

    .movie-checkbox {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      cursor: pointer;
      transition: background 0.2s;
      border-radius: 4px;
      font-weight: normal;
    }

    .movie-checkbox:hover {
      background: #f5f5f5;
    }

    .movie-checkbox input[type="checkbox"] {
      width: auto;
      cursor: pointer;
    }

    .movie-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .movie-title {
      font-weight: 500;
    }

    .movie-year {
      color: #666;
      font-size: 0.9rem;
    }

    .no-results {
      text-align: center;
      color: #999;
      padding: 2rem;
    }

    .error-text {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: opacity 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
      padding: 0.75rem 2rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }
  `]
})
export class CollectionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private collectionService = inject(CollectionService);
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  collectionForm!: FormGroup;
  isEditMode = signal(false);
  collectionId = signal<string | null>(null);
  error = signal<string | null>(null);
  submitting = signal(false);

  allMovies = signal<Movie[]>([]);
  filteredMovies = signal<Movie[]>([]);
  searchQuery = '';
  selectedMovies: Set<string> = new Set();

  ngOnInit() {
    this.initForm();
    this.loadMovies();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.collectionId.set(id);
      this.loadCollection(id);
    }
  }

  initForm() {
    this.collectionForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      affiche_url: ['']
    });
  }

  loadMovies() {
    this.movieService.getMovies({ limit: 1000 }).subscribe({
      next: (response) => {
        this.allMovies.set(response.movies);
        this.filteredMovies.set(response.movies);
      },
      error: (err) => {
        console.error('Erreur chargement films:', err);
      }
    });
  }

  loadCollection(id: string) {
    this.collectionService.getCollectionById(id).subscribe({
      next: (collection) => {
        this.collectionForm.patchValue({
          nom: collection.nom,
          description: collection.description
        });

        // Charger les films sélectionnés
        collection.movie_ids.forEach(id => this.selectedMovies.add(id));
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement de la collection');
      }
    });
  }

  onSearchChange() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredMovies.set(this.allMovies());
    } else {
      const filtered = this.allMovies().filter(movie => 
        movie.titre.toLowerCase().includes(query)
      );
      this.filteredMovies.set(filtered);
    }
  }

  onMovieChange(movieId: string, event: any) {
    if (event.target.checked) {
      this.selectedMovies.add(movieId);
    } else {
      this.selectedMovies.delete(movieId);
    }
  }

  isMovieSelected(movieId: string): boolean {
    return this.selectedMovies.has(movieId);
  }

  onSubmit() {
    if (this.collectionForm.invalid) {
      Object.keys(this.collectionForm.controls).forEach(key => {
        this.collectionForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formValue = this.collectionForm.value;
    const collectionData: any = {
      nom: formValue.nom,
      movie_ids: Array.from(this.selectedMovies)
    };

    if (formValue.description) collectionData.description = formValue.description;
    if (formValue.affiche_url) collectionData.affiche_url = formValue.affiche_url;

    const request = this.isEditMode() 
      ? this.collectionService.updateCollection(this.collectionId()!, collectionData)
      : this.collectionService.createCollection(collectionData);

    request.subscribe({
      next: (collection) => {
        this.submitting.set(false);
        this.router.navigate(['/collections', collection.id]);
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur lors de l\'enregistrement');
        this.submitting.set(false);
      }
    });
  }
}
