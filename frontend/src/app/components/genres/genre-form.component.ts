import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GenreService } from '../../services/genre.service';

@Component({
  selector: 'app-genre-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h1>{{ isEditMode() ? '✏️ Modifier le genre' : '➕ Ajouter un genre' }}</h1>
        <button class="btn-link" routerLink="/genres">← Retour</button>
      </div>

      @if (error()) {
        <div class="error">
          <p>❌ {{ error() }}</p>
        </div>
      }

      <form [formGroup]="genreForm" (ngSubmit)="onSubmit()" class="genre-form">
        <div class="form-section">
          <h2>Informations du genre</h2>
          
          <div class="form-group">
            <label for="nom">Nom du genre *</label>
            <input 
              id="nom" 
              type="text" 
              formControlName="nom"
              placeholder="Ex: Science-Fiction"
            >
            @if (genreForm.get('nom')?.invalid && genreForm.get('nom')?.touched) {
              <span class="error-text">Le nom est requis</span>
            }
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              formControlName="description"
              rows="4"
              placeholder="Description du genre cinématographique..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" routerLink="/genres">
            Annuler
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="genreForm.invalid || submitting()"
          >
            {{ submitting() ? 'Enregistrement...' : (isEditMode() ? 'Modifier' : 'Ajouter') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 600px;
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

    .genre-form {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;
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
export class GenreFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private genreService = inject(GenreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  genreForm!: FormGroup;
  isEditMode = signal(false);
  genreId = signal<string | null>(null);
  error = signal<string | null>(null);
  submitting = signal(false);

  ngOnInit() {
    this.initForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.genreId.set(id);
      this.loadGenre(id);
    }
  }

  initForm() {
    this.genreForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['']
    });
  }

  loadGenre(id: string) {
    this.genreService.getGenreById(id).subscribe({
      next: (genre) => {
        this.genreForm.patchValue({
          nom: genre.nom,
          description: genre.description
        });
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement du genre');
      }
    });
  }

  onSubmit() {
    if (this.genreForm.invalid) {
      Object.keys(this.genreForm.controls).forEach(key => {
        this.genreForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formValue = this.genreForm.value;
    const genreData: any = {
      nom: formValue.nom
    };

    if (formValue.description) genreData.description = formValue.description;

    const request = this.isEditMode() 
      ? this.genreService.updateGenre(this.genreId()!, genreData)
      : this.genreService.createGenre(genreData);

    request.subscribe({
      next: (genre) => {
        this.submitting.set(false);
        this.router.navigate(['/genres', genre.id]);
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur lors de l\'enregistrement');
        this.submitting.set(false);
      }
    });
  }
}
