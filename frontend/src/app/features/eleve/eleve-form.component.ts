// src/app/features/eleve/eleve-form.component.ts
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EleveApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-eleve-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <span class="page-tag">Élèves</span>
        <h1>Inscrire un élève</h1>
      </div>

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="field">
              <label>Nom *</label>
              <input formControlName="nom" placeholder="Nom de l'élève" [class.error]="isInvalid('nom')">
            </div>
            <div class="field">
              <label>Prénom *</label>
              <input formControlName="prenom" placeholder="Prénom de l'élève" [class.error]="isInvalid('prenom')">
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Date de naissance</label>
              <input type="date" formControlName="dateNaissance">
            </div>
            <div class="field">
              <label>Niveau scolaire *</label>
              <select formControlName="niveauScolaire" [class.error]="isInvalid('niveauScolaire')">
                <option value="">Sélectionner</option>
                <option value="6eme">6ème</option>
                <option value="5eme">5ème</option>
                <option value="4eme">4ème</option>
                <option value="3eme">3ème</option>
                <option value="2nde">Seconde</option>
                <option value="1ere">Première</option>
                <option value="Terminale">Terminale</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Adresse du domicile</label>
            <input formControlName="adresse" placeholder="Adresse où auront lieu les cours">
          </div>

          <div class="field">
            <label>Téléphone</label>
            <input formControlName="telephone" placeholder="+XXX XX XX XX XX">
          </div>

          @if (errorMsg()) {
            <div class="alert-error">{{ errorMsg() }}</div>
          }
          @if (successMsg()) {
            <div class="alert-success">{{ successMsg() }}</div>
          }

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="router.navigate(['/eleves'])">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Enregistrement…' : 'Inscrire l\'élève' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-tag { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
    h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--white); margin-top: .3rem; margin-bottom: 2rem; }
    .form-card { background: var(--dark-2); border: 1px solid rgba(201,151,58,.12); padding: 2rem; max-width: 700px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1.2rem; }
    .field label { font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); }
    .field input, .field select {
      background: var(--dark-3); border: 1px solid rgba(201,151,58,.15);
      color: var(--text); padding: .75rem 1rem; outline: none; font-size: .9rem;
      font-family: 'DM Sans', sans-serif;
    }
    .field input:focus, .field select:focus { border-color: var(--gold); }
    .field input.error, .field select.error { border-color: var(--danger); }
    .alert-error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--danger); padding: .75rem 1rem; font-size: .85rem; margin-bottom: 1rem; }
    .alert-success { background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.3); color: var(--success); padding: .75rem 1rem; font-size: .85rem; margin-bottom: 1rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn-primary { background: var(--gold); color: var(--dark); padding: .7rem 1.8rem; border: none; cursor: pointer; font-size: .85rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }
    .btn-secondary { background: transparent; color: var(--text-muted); padding: .7rem 1.8rem; border: 1px solid rgba(201,151,58,.2); cursor: pointer; font-size: .85rem; }
    .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
  `]
})
export class EleveFormComponent {
  form: FormGroup;
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private eleveApi: EleveApiService,
    public auth: AuthService,
    public router: Router
  ) {
    this.form = this.fb.group({
      nom:           ['', Validators.required],
      prenom:        ['', Validators.required],
      dateNaissance: [''],
      niveauScolaire:['', Validators.required],
      adresse:       [''],
      telephone:     ['']
    });
  }

  isInvalid(f: string) {
    const c = this.form.get(f)!;
    return c.invalid && (c.dirty || c.touched);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);

    const tuteurId = this.auth.currentUser()!.userId;
    this.eleveApi.create({ ...this.form.value, tuteurId }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Élève inscrit avec succès !');
        setTimeout(() => this.router.navigate(['/eleves']), 1200);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.detail ?? 'Erreur lors de l\'inscription');
      }
    });
  }
}
