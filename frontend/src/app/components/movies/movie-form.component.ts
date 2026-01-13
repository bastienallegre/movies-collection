import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { DirectorService } from '../../services/director.service';
import { GenreService } from '../../services/genre.service';
import { Director, Genre } from '../../models';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h1>{{ isEditMode() ? '✏️ Modifier le film' : '➕ Ajouter un film' }}</h1>
        <button class="btn-link" routerLink="/movies">← Retour</button>
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

      <form [formGroup]="movieForm" (ngSubmit)="onSubmit()" class="movie-form">
        <div class="form-section">
          <h2>Informations principales</h2>
          
          <div class="form-group">
            <label for="titre">Titre *</label>
            <input 
              id="titre" 
              type="text" 
              formControlName="titre"
              placeholder="Ex: Inception"
            >
            @if (movieForm.get('titre')?.invalid && movieForm.get('titre')?.touched) {
              <span class="error-text">Le titre est requis</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="annee">Année *</label>
              <input 
                id="annee" 
                type="number" 
                formControlName="annee"
                placeholder="2010"
                min="1888"
                [max]="currentYear"
              >
              @if (movieForm.get('annee')?.invalid && movieForm.get('annee')?.touched) {
                <span class="error-text">Année invalide</span>
              }
            </div>

            <div class="form-group">
              <label for="duree">Durée (minutes)</label>
              <input 
                id="duree" 
                type="number" 
                formControlName="duree"
                placeholder="148"
                min="1"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="director_id">Réalisateur *</label>
            <select id="director_id" formControlName="director_id">
              <option value="">Sélectionnez un réalisateur</option>
              @for (director of directors(); track director.id) {
                <option [value]="director.id">
                  {{ director.prenom }} {{ director.nom }}
                </option>
              }
            </select>
            @if (movieForm.get('director_id')?.invalid && movieForm.get('director_id')?.touched) {
              <span class="error-text">Le réalisateur est requis</span>
            }
          </div>

          <div class="form-group">
            <label>Genres</label>
            <div class="checkbox-group">
              @for (genre of genres(); track genre.id) {
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [value]="genre.id"
                    [checked]="isGenreSelected(genre.id)"
                    (change)="onGenreChange(genre.id, $event)"
                  >
                  <span>{{ genre.nom }}</span>
                </label>
              }
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Synopsis et description</h2>
          
          <div class="form-group">
            <label for="synopsis">Synopsis</label>
            <textarea 
              id="synopsis" 
              formControlName="synopsis"
              rows="4"
              placeholder="Résumé du film..."
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

          <div class="form-group">
            <label for="tmdb_id">TMDB ID</label>
            <input 
              id="tmdb_id" 
              type="number" 
              formControlName="tmdb_id"
              placeholder="27205"
            >
          </div>
        </div>

        <div class="form-section">
          <h2>Suivi personnel</h2>
          
          <div class="form-group">
            <label for="statut">Statut *</label>
            <select id="statut" formControlName="statut">
              <option value="a_voir">À voir</option>
              <option value="en_cours">En cours</option>
              <option value="vu">Vu</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="note">Note (sur 10)</label>
              <input 
                id="note" 
                type="number" 
                formControlName="note"
                placeholder="9.5"
                min="0"
                max="10"
                step="0.1"
              >
            </div>

            <div class="form-group">
              <label for="date_visionnage">Date de visionnage</label>
              <input 
                id="date_visionnage" 
                type="date" 
                formControlName="date_visionnage"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="commentaire">Mon avis</label>
            <textarea 
              id="commentaire" 
              formControlName="commentaire"
              rows="3"
              placeholder="Votre commentaire personnel..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="tags">Tags (séparés par des virgules)</label>
            <input 
              id="tags" 
              type="text" 
              formControlName="tagsString"
              placeholder="chef-d'œuvre, science-fiction, mindfuck"
            >
            <small class="help-text">Ex: chef-d'œuvre, science-fiction, mindfuck</small>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" routerLink="/movies">
            Annuler
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="movieForm.invalid || submitting()"
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

    .movie-form {
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }

    input[type="text"],
    input[type="number"],
    input[type="url"],
    input[type="date"],
    select,
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
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    textarea {
      resize: vertical;
    }

    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: normal;
      margin: 0;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      cursor: pointer;
    }

    .error-text {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .help-text {
      display: block;
      color: #666;
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

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MovieFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private movieService = inject(MovieService);
  private directorService = inject(DirectorService);
  private genreService = inject(GenreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  movieForm!: FormGroup;
  isEditMode = signal(false);
  movieId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitting = signal(false);

  directors = signal<Director[]>([]);
  genres = signal<Genre[]>([]);
  selectedGenres: Set<string> = new Set();

  currentYear = new Date().getFullYear() + 5;

  ngOnInit() {
    this.initForm();
    this.loadDirectors();
    this.loadGenres();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.movieId.set(id);
      this.loadMovie(id);
    }
  }

  initForm() {
    this.movieForm = this.fb.group({
      titre: ['', Validators.required],
      annee: ['', [Validators.required, Validators.min(1888), Validators.max(this.currentYear)]],
      director_id: ['', Validators.required],
      duree: [''],
      synopsis: [''],
      affiche_url: [''],
      tmdb_id: [''],
      statut: ['a_voir', Validators.required],
      note: ['', [Validators.min(0), Validators.max(10)]],
      date_visionnage: [''],
      commentaire: [''],
      tagsString: ['']
    });
  }

  loadDirectors() {
    this.directorService.getAllDirectors().subscribe({
      next: (response) => {
        this.directors.set(response.directors);
      },
      error: (err) => {
        console.error('Erreur chargement réalisateurs:', err);
      }
    });
  }

  loadGenres() {
    this.genreService.getAllGenres().subscribe({
      next: (response) => {
        this.genres.set(response.genres);
      },
      error: (err) => {
        console.error('Erreur chargement genres:', err);
      }
    });
  }

  loadMovie(id: string) {
    this.loading.set(true);
    this.movieService.getMovieById(id).subscribe({
      next: (movie) => {
        this.movieForm.patchValue({
          titre: movie.titre,
          annee: movie.annee,
          director_id: movie.director_id,
          duree: movie.duree,
          synopsis: movie.synopsis,
          affiche_url: movie.affiche_url,
          tmdb_id: movie.tmdb_id,
          statut: movie.statut,
          note: movie.note,
          date_visionnage: movie.date_visionnage ? movie.date_visionnage.split('T')[0] : '',
          commentaire: movie.commentaire,
          tagsString: movie.tags?.join(', ') || ''
        });

        // Charger les genres sélectionnés
        movie.genre_ids.forEach(id => this.selectedGenres.add(id));

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement du film');
        this.loading.set(false);
      }
    });
  }

  onGenreChange(genreId: string, event: any) {
    if (event.target.checked) {
      this.selectedGenres.add(genreId);
    } else {
      this.selectedGenres.delete(genreId);
    }
  }

  isGenreSelected(genreId: string): boolean {
    return this.selectedGenres.has(genreId);
  }

  onSubmit() {
    if (this.movieForm.invalid) {
      Object.keys(this.movieForm.controls).forEach(key => {
        this.movieForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formValue = this.movieForm.value;
    
    // Préparer les données
    const movieData: any = {
      titre: formValue.titre,
      annee: parseInt(formValue.annee),
      director_id: formValue.director_id,
      genre_ids: Array.from(this.selectedGenres),
      statut: formValue.statut
    };

    if (formValue.duree) movieData.duree = parseInt(formValue.duree);
    if (formValue.synopsis) movieData.synopsis = formValue.synopsis;
    if (formValue.affiche_url) movieData.affiche_url = formValue.affiche_url;
    if (formValue.tmdb_id) movieData.tmdb_id = parseInt(formValue.tmdb_id);
    if (formValue.note) movieData.note = parseFloat(formValue.note);
    if (formValue.date_visionnage) movieData.date_visionnage = new Date(formValue.date_visionnage).toISOString();
    if (formValue.commentaire) movieData.commentaire = formValue.commentaire;
    
    // Traiter les tags
    if (formValue.tagsString) {
      movieData.tags = formValue.tagsString
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
    }

    // Créer ou mettre à jour
    const request = this.isEditMode() 
      ? this.movieService.updateMovie(this.movieId()!, movieData)
      : this.movieService.createMovie(movieData);

    request.subscribe({
      next: (movie) => {
        this.submitting.set(false);
        this.router.navigate(['/movies', movie.id]);
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur lors de l\'enregistrement');
        this.submitting.set(false);
      }
    });
  }
}
