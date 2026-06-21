// src/app/features/auth/register/register.component.ts
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

type Role = 'tuteur' | 'professeur';

/**
 * RegisterComponent
 *
 * Responsabilité : formulaire d'inscription multi-rôle.
 * Affiche un formulaire différent selon l'onglet sélectionné.
 * Intègre le site de présentation Socrates (hero + stats).
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="register-page">
      <!-- ── HERO ── -->
      <div class="register-hero">
        <div class="hero-content">
          <div class="hero-tag">Rejoindre Socrates</div>
          <h1>L'<em>excellence</em><br>commence ici.</h1>
          <p>Répétiteurs diplômés, suivi personnalisé,<br>de la 6ème à la Terminale.</p>
          <div class="hero-stats">
            <div class="stat"><div class="stat-num">4<sup>e</sup></div><div class="stat-label">Prix d'excellence</div></div>
            <div class="stat"><div class="stat-num">4</div><div class="stat-label">Matières</div></div>
            <div class="stat"><div class="stat-num">6→T</div><div class="stat-label">Niveaux</div></div>
          </div>
        </div>
      </div>

      <!-- ── FORMULAIRE ── -->
      <div class="register-form-panel">
        <div class="form-header">
          <div class="auth-logo">Socrates</div>
          <p>Créez votre espace</p>
        </div>

        <!-- Onglets rôle -->
        <div class="role-tabs">
          <button class="role-tab" [class.active]="activeRole() === 'tuteur'"
                  (click)="setRole('tuteur')">Tuteur légal</button>
          <button class="role-tab" [class.active]="activeRole() === 'professeur'"
                  (click)="setRole('professeur')">Professeur</button>
        </div>

        <!-- TUTEUR -->
        @if (activeRole() === 'tuteur') {
          <form [formGroup]="tuteurForm" (ngSubmit)="onSubmitTuteur()" class="reg-form">
            <div class="form-row">
              <div class="field">
                <label>Nom</label>
                <input formControlName="nom" placeholder="Votre nom" [class.error]="isInvalid(tuteurForm, 'nom')">
              </div>
              <div class="field">
                <label>Prénom</label>
                <input formControlName="prenom" placeholder="Votre prénom" [class.error]="isInvalid(tuteurForm, 'prenom')">
              </div>
            </div>
            <div class="field">
              <label>Email</label>
              <input type="email" formControlName="email" placeholder="votre@email.com" [class.error]="isInvalid(tuteurForm, 'email')">
            </div>
            <div class="form-row">
              <div class="field">
                <label>Téléphone</label>
                <input formControlName="telephone" placeholder="+XXX XX XX XX XX">
              </div>
              <div class="field">
                <label>Lien avec l'élève</label>
                <select formControlName="typeLien">
                  <option value="">Sélectionner</option>
                  <option value="pere">Père</option>
                  <option value="mere">Mère</option>
                  <option value="tuteur">Tuteur légal</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Adresse</label>
              <input formControlName="adresse" placeholder="Adresse complète">
            </div>
            <div class="field">
              <label>Mot de passe</label>
              <input type="password" formControlName="password" placeholder="Minimum 8 caractères" [class.error]="isInvalid(tuteurForm, 'password')">
            </div>

            @if (errorMsg()) {
              <div class="alert-error">{{ errorMsg() }}</div>
            }
            @if (successMsg()) {
              <div class="alert-success">{{ successMsg() }}</div>
            }

            <button type="submit" class="btn-submit" [disabled]="loading()">
              {{ loading() ? 'Inscription…' : 'Créer mon espace tuteur' }}
            </button>
          </form>
        }

        <!-- PROFESSEUR -->
        @if (activeRole() === 'professeur') {
          <form [formGroup]="professeurForm" (ngSubmit)="onSubmitProfesseur()" class="reg-form">
            <div class="form-row">
              <div class="field">
                <label>Nom</label>
                <input formControlName="nom" placeholder="Votre nom" [class.error]="isInvalid(professeurForm, 'nom')">
              </div>
              <div class="field">
                <label>Prénom</label>
                <input formControlName="prenom" placeholder="Votre prénom" [class.error]="isInvalid(professeurForm, 'prenom')">
              </div>
            </div>
            <div class="field">
              <label>Email</label>
              <input type="email" formControlName="email" placeholder="votre@email.com" [class.error]="isInvalid(professeurForm, 'email')">
            </div>
            <div class="form-row">
              <div class="field">
                <label>Téléphone</label>
                <input formControlName="telephone" placeholder="+XXX XX XX XX XX">
              </div>
              <div class="field">
                <label>Tarif horaire</label>
                <input type="number" formControlName="tarifHoraire" placeholder="Ex: 5000">
              </div>
            </div>
            <div class="field">
              <label>Disponibilités</label>
              <textarea formControlName="disponibilites" placeholder="Lundi et mercredi après-midi…" rows="2"></textarea>
            </div>
            <div class="field">
              <label>Mot de passe</label>
              <input type="password" formControlName="password" placeholder="Minimum 8 caractères" [class.error]="isInvalid(professeurForm, 'password')">
            </div>

            @if (errorMsg()) {
              <div class="alert-error">{{ errorMsg() }}</div>
            }
            @if (successMsg()) {
              <div class="alert-success">{{ successMsg() }}</div>
            }

            <button type="submit" class="btn-submit" [disabled]="loading()">
              {{ loading() ? 'Envoi…' : 'Soumettre ma candidature' }}
            </button>
            <p class="form-note">Votre dossier sera examiné sous 48h.</p>
          </form>
        }

        <div class="auth-footer">
          Déjà un compte ? <a routerLink="/auth/login">Se connecter</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh; display: grid; grid-template-columns: 1fr 480px;
      background: var(--dark);
    }

    /* Hero */
    .register-hero {
      display: flex; align-items: center; padding: 4rem;
      background: radial-gradient(ellipse 80% 70% at 40% 40%, rgba(201,151,58,.09) 0%, transparent 70%);
      border-right: 1px solid rgba(201,151,58,.08);
    }
    .hero-content .hero-tag {
      display: inline-block; border: 1px solid var(--gold); color: var(--gold);
      font-size: .72rem; letter-spacing: .14em; text-transform: uppercase;
      padding: .3rem .8rem; margin-bottom: 1.5rem;
    }
    .hero-content h1 {
      font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 900;
      color: var(--white); line-height: 1.1; margin-bottom: 1.2rem;
    }
    .hero-content h1 em { color: var(--gold); font-style: italic; }
    .hero-content p { color: var(--text-muted); font-size: 1rem; line-height: 1.8; margin-bottom: 2.5rem; }
    .hero-stats { display: flex; gap: 2.5rem; }
    .stat-num { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 700; color: var(--gold); }
    .stat-label { font-size: .72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; margin-top: .2rem; }

    /* Form panel */
    .register-form-panel {
      padding: 3rem 2.5rem; background: var(--dark-2); overflow-y: auto;
      display: flex; flex-direction: column;
    }
    .form-header { margin-bottom: 2rem; }
    .auth-logo { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900; color: var(--gold); }
    .form-header p { font-size: .85rem; color: var(--text-muted); margin-top: .3rem; }

    .role-tabs { display: flex; margin-bottom: 2rem; }
    .role-tab {
      flex: 1; padding: .75rem; background: var(--dark-3);
      border: 1px solid rgba(201,151,58,.15); color: var(--text-muted);
      cursor: pointer; font-size: .83rem; letter-spacing: .06em; text-transform: uppercase;
      transition: all .2s; border-right: none; font-family: 'DM Sans', sans-serif;
    }
    .role-tab:last-child { border-right: 1px solid rgba(201,151,58,.15); }
    .role-tab.active { background: var(--gold); color: var(--dark); font-weight: 500; border-color: var(--gold); }

    .reg-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: .35rem; }
    .field label { font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); }
    .field input, .field select, .field textarea {
      background: var(--dark-3); border: 1px solid rgba(201,151,58,.15);
      color: var(--text); padding: .65rem .9rem; outline: none;
      font-family: 'DM Sans', sans-serif; font-size: .88rem; transition: border-color .2s;
    }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--gold); }
    .field input.error, .field select.error { border-color: #f87171; }
    .field select option { background: var(--dark-3); }
    .field textarea { resize: vertical; }

    .alert-error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: #f87171; padding: .7rem 1rem; font-size: .83rem; }
    .alert-success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); color: #4ade80; padding: .7rem 1rem; font-size: .83rem; }

    .btn-submit {
      background: var(--gold); color: var(--dark); padding: .85rem;
      border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
      font-weight: 500; font-size: .88rem; letter-spacing: .08em;
      text-transform: uppercase; transition: background .2s; margin-top: .5rem;
    }
    .btn-submit:hover:not(:disabled) { background: var(--gold-light); }
    .btn-submit:disabled { opacity: .6; cursor: not-allowed; }
    .form-note { font-size: .75rem; color: var(--text-muted); text-align: center; }

    .auth-footer { text-align: center; margin-top: auto; padding-top: 1.5rem; font-size: .83rem; color: var(--text-muted); }
    .auth-footer a { color: var(--gold); text-decoration: none; margin-left: .3rem; }
  `]
})
export class RegisterComponent {
  activeRole = signal<Role>('tuteur');
  loading    = signal(false);
  errorMsg   = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  tuteurForm: FormGroup;
  professeurForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.tuteurForm = this.fb.group({
      nom:       ['', Validators.required],
      prenom:    ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      telephone: [''],
      typeLien:  ['', Validators.required],
      adresse:   [''],
      password:  ['', [Validators.required, Validators.minLength(8)]]
    });

    this.professeurForm = this.fb.group({
      nom:           ['', Validators.required],
      prenom:        ['', Validators.required],
      email:         ['', [Validators.required, Validators.email]],
      telephone:     [''],
      tarifHoraire:  [null],
      disponibilites:[''],
      password:      ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  setRole(role: Role): void {
    this.activeRole.set(role);
    this.errorMsg.set(null);
    this.successMsg.set(null);
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const ctrl = form.get(field)!;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  onSubmitTuteur(): void {
    if (this.tuteurForm.invalid) { this.tuteurForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);
    this.auth.inscrireTuteur(this.tuteurForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Compte créé ! Vous pouvez vous connecter.');
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.detail ?? 'Erreur lors de l\'inscription.');
      }
    });
  }

  onSubmitProfesseur(): void {
    if (this.professeurForm.invalid) { this.professeurForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);
    this.auth.inscrireProfesseur(this.professeurForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Candidature envoyée ! Notre équipe vous contactera sous 48h.');
        this.professeurForm.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.detail ?? 'Erreur lors de l\'inscription.');
      }
    });
  }
}
