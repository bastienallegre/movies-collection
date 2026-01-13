import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DirectorService } from '../../services/director.service';
import { Director } from '../../models';

@Component({
  selector: 'app-directors-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="directors-container">
      <div class="header">
        <h1>🎬 Réalisateurs</h1>
        <button class="btn-primary" routerLink="/directors/new">
          ➕ Ajouter un réalisateur
        </button>
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

      <div class="directors-grid">
        @for (director of directors(); track director.id) {
          <div class="director-card" [routerLink]="['/directors', director.id]">
            @if (director.photo_url) {
              <img [src]="director.photo_url" [alt]="director.prenom + ' ' + director.nom" class="director-photo">
            } @else {
              <div class="director-photo-placeholder">
                <span>🎥</span>
              </div>
            }
            
            <div class="director-info">
              <h3>{{ director.prenom }} {{ director.nom }}</h3>
              
              @if (director.nationalite) {
                <p class="nationalite">{{ director.nationalite }}</p>
              }
              
              <div class="stats">
                <span class="stat">📽️ {{ director.nombre_films }} film{{ director.nombre_films > 1 ? 's' : '' }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      @if (directors().length === 0 && !loading()) {
        <div class="empty-state">
          <p>Aucun réalisateur pour le moment</p>
          <button class="btn-primary" routerLink="/directors/new">
            Ajouter le premier réalisateur
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .directors-container {
      padding: 2rem;
      max-width: 1400px;
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
    }

    .directors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }

    .director-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .director-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .director-photo {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }

    .director-photo-placeholder {
      width: 100%;
      height: 300px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
    }

    .director-info {
      padding: 1.5rem;
    }

    .director-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.2rem;
    }

    .nationalite {
      margin: 0 0 1rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      font-size: 0.9rem;
      color: #667eea;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #999;
    }

    .empty-state p {
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
  `]
})
export class DirectorsListComponent implements OnInit {
  private directorService = inject(DirectorService);

  directors = signal<Director[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadDirectors();
  }

  loadDirectors() {
    this.directorService.getAllDirectors().subscribe({
      next: (response) => {
        this.directors.set(response.directors);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des réalisateurs');
        this.loading.set(false);
      }
    });
  }
}
