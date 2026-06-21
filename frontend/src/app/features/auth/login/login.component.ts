// src/app/features/auth/login/login.component.ts
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

/**
 * LoginComponent
 *
 * Responsabilité : formulaire de connexion avec gestion d'erreur.
 * Utilise Reactive Forms pour la validation et les signaux
 * pour l'état de chargement (loading, erreur).
 *
 * Pattern : Smart Component (gère son propre état et ses interactions)
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">Socrates</div>
          <h1>Connexion</h1>
          <p>Accédez à votre espace personnel</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="votre@email.com"
                   [class.error]="isInvalid('email')">
            @if (isInvalid('email')) {
              <span class="field-error">Email invalide</span>
            }
          </div>

          <div class="field">
            <label>Mot de passe</label>
            <input type="password" formControlName="password" placeholder="••••••••"
                   [class.error]="isInvalid('password')">
            @if (isInvalid('password')) {
              <span class="field-error">Minimum 6 caractères</span>
            }
          </div>

          @if (errorMessage()) {
            <div class="alert-error">{{ errorMessage() }}</div>
          }

          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) { <span>Connexion…</span> }
            @else { <span>Se connecter</span> }
          </button>
        </form>

        <div class="auth-footer">
          Pas encore de compte ?
          <a routerLink="/auth/register">S'inscrire</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--dark);
      background-image: radial-gradient(ellipse 80% 60% at 50% 30%, rgba(201,151,58,.07) 0%, transparent 70%);
    }
    .auth-card {
      width: 420px; padding: 3rem;
      background: var(--dark-2); border: 1px solid rgba(201,151,58,.15);
    }
    .auth-header { text-align: center; margin-bottom: 2.5rem; }
    .auth-logo { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: var(--gold); }
    .auth-header h1 { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--white); margin: .8rem 0 .3rem; }
    .auth-header p { font-size: .85rem; color: var(--text-muted); }

    .auth-form { display: flex; flex-direction: column; gap: 1.2rem; }
    .field { display: flex; flex-direction: column; gap: .4rem; }
    .field label { font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); }
    .field input {
      background: var(--dark-3); border: 1px solid rgba(201,151,58,.15);
      color: var(--text); padding: .75rem 1rem; outline: none;
      font-family: 'DM Sans', sans-serif; font-size: .9rem; transition: border-color .2s;
    }
    .field input:focus { border-color: var(--gold); }
    .field input.error { border-color: #f87171; }
    .field-error { font-size: .75rem; color: #f87171; }

    .alert-error {
      background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
      color: #f87171; padding: .75rem 1rem; font-size: .85rem;
    }

    .btn-submit {
      background: var(--gold); color: var(--dark); padding: .9rem;
      border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
      font-weight: 500; font-size: .9rem; letter-spacing: .08em;
      text-transform: uppercase; margin-top: .5rem; transition: background .2s;
    }
    .btn-submit:hover:not(:disabled) { background: var(--gold-light); }
    .btn-submit:disabled { opacity: .6; cursor: not-allowed; }

    .auth-footer { text-align: center; margin-top: 1.5rem; font-size: .85rem; color: var(--text-muted); }
    .auth-footer a { color: var(--gold); text-decoration: none; margin-left: .3rem; }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading  = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field)!;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Email ou mot de passe incorrect');
      }
    });
  }
}
