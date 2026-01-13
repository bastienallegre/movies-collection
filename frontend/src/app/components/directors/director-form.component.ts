import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DirectorService } from '../../services/director.service';

@Component({
  selector: 'app-director-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h1>{{ isEditMode() ? '✏️ Modifier le réalisateur' : '➕ Ajouter un réalisateur' }}</h1>
        <button class="btn-link" routerLink="/directors">← Retour</button>
      </div>

      @if (error()) {
        <div class="error">
          <p>❌ {{ error() }}</p>
        </div>
      }

      <form [formGroup]="directorForm" (ngSubmit)="onSubmit()" class="director-form">
        <div class="form-section">
          <h2>Identité</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="prenom">Prénom *</label>
              <input 
                id="prenom" 
                type="text" 
                formControlName="prenom"
                placeholder="Ex: Christopher"
              >
              @if (directorForm.get('prenom')?.invalid && directorForm.get('prenom')?.touched) {
                <span class="error-text">Le prénom est requis</span>
              }
            </div>

            <div class="form-group">
              <label for="nom">Nom *</label>
              <input 
                id="nom" 
                type="text" 
                formControlName="nom"
                placeholder="Ex: Nolan"
              >
              @if (directorForm.get('nom')?.invalid && directorForm.get('nom')?.touched) {
                <span class="error-text">Le nom est requis</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label for="photo_url">URL de la photo</label>
            <input 
              id="photo_url" 
              type="url" 
              formControlName="photo_url"
              placeholder="https://image.tmdb.org/t/p/w500/..."
            >
          </div>

          <div class="form-group">
            <label for="nationalite">Nationalité</label>
            <input 
              id="nationalite" 
              type="text" 
              formControlName="nationalite"
              placeholder="Ex: Britannique"
            >
          </div>

          <div class="form-group">
            <label for="biographie">Biographie</label>
            <textarea 
              id="biographie" 
              formControlName="biographie"
              rows="6"
              placeholder="Courte biographie du réalisateur..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" routerLink="/directors">
            Annuler
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="directorForm.invalid || submitting()"
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

    .director-form {
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

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DirectorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private directorService = inject(DirectorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  directorForm!: FormGroup;
  isEditMode = signal(false);
  directorId = signal<string | null>(null);
  error = signal<string | null>(null);
  submitting = signal(false);

  ngOnInit() {
    this.initForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.directorId.set(id);
      this.loadDirector(id);
    }
  }

  initForm() {
    this.directorForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      photo_url: [''],
      nationalite: [''],
      biographie: ['']
    });
  }

  loadDirector(id: string) {
    this.directorService.getDirectorById(id).subscribe({
      next: (director) => {
        this.directorForm.patchValue({
          prenom: director.prenom,
          nom: director.nom,
          photo_url: director.photo_url,
          nationalite: director.nationalite,
          biographie: director.biographie
        });
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement du réalisateur');
      }
    });
  }

  onSubmit() {
    if (this.directorForm.invalid) {
      Object.keys(this.directorForm.controls).forEach(key => {
        this.directorForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formValue = this.directorForm.value;
    const directorData: any = {
      prenom: formValue.prenom,
      nom: formValue.nom
    };

    if (formValue.photo_url) directorData.photo_url = formValue.photo_url;
    if (formValue.nationalite) directorData.nationalite = formValue.nationalite;
    if (formValue.biographie) directorData.biographie = formValue.biographie;

    const request = this.isEditMode() 
      ? this.directorService.updateDirector(this.directorId()!, directorData)
      : this.directorService.createDirector(directorData);

    request.subscribe({
      next: (director) => {
        this.submitting.set(false);
        this.router.navigate(['/directors', director.id]);
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur lors de l\'enregistrement');
        this.submitting.set(false);
      }
    });
  }
}
