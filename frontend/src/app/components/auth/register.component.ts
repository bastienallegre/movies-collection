import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterData } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>📝 Inscription</h2>
        <p class="subtitle">Créez votre compte pour gérer votre collection de films</p>

        @if (errorMessage()) {
          <div class="alert alert-error">
            {{ errorMessage() }}
          </div>
        }

        @if (successMessage()) {
          <div class="alert alert-success">
            {{ successMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label for="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="registerData.username"
              required
              minlength="3"
              maxlength="50"
              placeholder="Votre nom d'utilisateur"
              [disabled]="isLoading()"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="registerData.email"
              required
              email
              placeholder="votre@email.com"
              [disabled]="isLoading()"
            />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="registerData.password"
              required
              minlength="6"
              placeholder="Au moins 6 caractères"
              [disabled]="isLoading()"
            />
            <small class="help-text">Minimum 6 caractères</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              required
              minlength="6"
              placeholder="Répétez votre mot de passe"
              [disabled]="isLoading()"
            />
            @if (confirmPassword && registerData.password !== confirmPassword) {
              <small class="error-text">Les mots de passe ne correspondent pas</small>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="!registerForm.form.valid || registerData.password !== confirmPassword || isLoading()"
          >
            @if (isLoading()) {
              <span>Inscription en cours...</span>
            } @else {
              <span>S'inscrire</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Vous avez déjà un compte ? <a routerLink="/login">Se connecter</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 2rem;
    }

    .auth-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2.5rem;
      width: 100%;
      max-width: 450px;
    }

    h2 {
      margin: 0 0 0.5rem 0;
      color: #1a202c;
      font-size: 1.875rem;
      text-align: center;
    }

    .subtitle {
      color: #718096;
      text-align: center;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .alert-error {
      background-color: #fee;
      color: #c53030;
      border: 1px solid #fc8181;
    }

    .alert-success {
      background-color: #e6fffa;
      color: #047857;
      border: 1px solid #81e6d9;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2d3748;
      font-weight: 500;
      font-size: 0.95rem;
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    input:disabled {
      background-color: #f7fafc;
      cursor: not-allowed;
    }

    .help-text {
      display: block;
      margin-top: 0.25rem;
      color: #718096;
      font-size: 0.85rem;
    }

    .error-text {
      display: block;
      margin-top: 0.25rem;
      color: #c53030;
      font-size: 0.85rem;
    }

    .btn {
      width: 100%;
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: #3182ce;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2c5282;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      color: #718096;
      font-size: 0.95rem;
    }

    .auth-footer a {
      color: #3182ce;
      text-decoration: none;
      font-weight: 600;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  registerData: RegisterData = {
    username: '',
    email: '',
    password: ''
  };

  confirmPassword = '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set('Compte créé avec succès ! Redirection...');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.error || 'Erreur lors de la création du compte'
        );
      }
    });
  }
}
