// src/app/features/prestation/prestation-form.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EleveApiService, PrestationApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { EleveResponse } from '../../core/models';

@Component({
  selector: 'app-prestation-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <span class="page-tag">Prestations</span>
        <h1>Nouvelle prestation</h1>
      </div>

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="field">
            <label>Élève *</label>
            <select formControlName="eleveId" [class.error]="isInvalid('eleveId')">
              <option value="">Sélectionner un élève</option>
              @for (eleve of eleves(); track eleve.id) {
                <option [value]="eleve.id">{{ eleve.prenom }} {{ eleve.nom }} — {{ eleve.niveauScolaire }}</option>
              }
            </select>
          </div>

          <div class="field">
            <label>Périodicité *</label>
            <select formControlName="periodicite" [class.error]="isInvalid('periodicite')">
              <option value="">Sélectionner</option>
              <option value="HEBDOMADAIRE">Hebdomadaire</option>
              <option value="MENSUELLE">Mensuelle</option>
              <option value="TRIMESTRIELLE">Trimestrielle</option>
              <option value="LIBRE">Libre</option>
            </select>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Date de début *</label>
              <input type="date" formControlName="dateDebut" [class.error]="isInvalid('dateDebut')">
            </div>
            <div class="field">
              <label>Date de fin (optionnel)</label>
              <input type="date" formControlName="dateFin">
            </div>
          </div>

          @if (errorMsg()) { <div class="alert-error">{{ errorMsg() }}</div> }
          @if (successMsg()) { <div class="alert-success">{{ successMsg() }}</div> }

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="router.navigate(['/prestations'])">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Création…' : 'Créer la prestation' }}
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
    .field input, .field select { background: var(--dark-3); border: 1px solid rgba(201,151,58,.15); color: var(--text); padding: .75rem 1rem; outline: none; font-size: .9rem; font-family: 'DM Sans', sans-serif; }
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
export class PrestationFormComponent implements OnInit {
  form: FormGroup;
  eleves = signal<EleveResponse[]>([]);
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private eleveApi: EleveApiService,
    private prestationApi: PrestationApiService,
    public auth: AuthService,
    public router: Router
  ) {
    this.form = this.fb.group({
      eleveId:    ['', Validators.required],
      periodicite:['', Validators.required],
      dateDebut:  ['', Validators.required],
      dateFin:    ['']
    });
  }

  ngOnInit() {
    this.eleveApi.findAll().subscribe({ next: data => this.eleves.set(data) });
  }

  isInvalid(f: string) {
    const c = this.form.get(f)!;
    return c.invalid && (c.dirty || c.touched);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const tuteurId = this.auth.currentUser()!.userId;
    this.prestationApi.create({ ...this.form.value, tuteurId }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Prestation créée avec succès !');
        setTimeout(() => this.router.navigate(['/prestations']), 1200);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.detail ?? 'Erreur lors de la création');
      }
    });
  }
}
