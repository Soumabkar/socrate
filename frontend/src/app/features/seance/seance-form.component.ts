// src/app/features/seance/seance-form.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  EleveApiService, ProfesseurApiService,
  CoursApiService, PrestationApiService, SeanceApiService
} from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { EleveResponse, ProfesseurResponse, CoursResponse, PrestationResponse } from '../../core/models';

@Component({
  selector: 'app-seance-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <span class="page-tag">Séances</span>
        <h1>Planifier une séance</h1>
      </div>

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="field">
            <label>Prestation *</label>
            <select formControlName="prestationId" (change)="onPrestationChange()" [class.error]="isInvalid('prestationId')">
              <option value="">Sélectionner une prestation</option>
              @for (p of prestations(); track p.id) {
                <option [value]="p.id">{{ p.nomEleve }} — {{ p.periodicite }} ({{ p.statut }})</option>
              }
            </select>
          </div>

          <div class="field">
            <label>Élève *</label>
            <select formControlName="eleveId" [class.error]="isInvalid('eleveId')">
              <option value="">Sélectionner un élève</option>
              @for (e of eleves(); track e.id) {
                <option [value]="e.id">{{ e.prenom }} {{ e.nom }}</option>
              }
            </select>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Professeur *</label>
              <select formControlName="professeurId" [class.error]="isInvalid('professeurId')">
                <option value="">Sélectionner un professeur validé</option>
                @for (p of professeurs(); track p.id) {
                  @if (p.valide) {
                    <option [value]="p.id">{{ p.prenom }} {{ p.nom }}</option>
                  }
                }
              </select>
            </div>
            <div class="field">
              <label>Cours *</label>
              <select formControlName="coursId" [class.error]="isInvalid('coursId')">
                <option value="">Sélectionner un cours</option>
                @for (c of cours(); track c.id) {
                  <option [value]="c.id">{{ c.nomMatiere }} — {{ c.niveau }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Date et heure *</label>
              <input type="datetime-local" formControlName="dateHeureDebut" [class.error]="isInvalid('dateHeureDebut')">
            </div>
            <div class="field">
              <label>Durée (minutes) *</label>
              <input type="number" formControlName="dureeMinutes" min="15" step="15" placeholder="60" [class.error]="isInvalid('dureeMinutes')">
            </div>
          </div>

          <div class="field">
            <label>Adresse du domicile *</label>
            <input formControlName="adresseDomicile" placeholder="Adresse où aura lieu la séance">
          </div>

          <div class="field">
            <label>Notes (optionnel)</label>
            <textarea formControlName="notes" rows="3" placeholder="Chapitres à aborder, matériel nécessaire…"></textarea>
          </div>

          @if (errorMsg()) { <div class="alert-error">{{ errorMsg() }}</div> }
          @if (successMsg()) { <div class="alert-success">{{ successMsg() }}</div> }

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="router.navigate(['/seances'])">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Planification…' : 'Planifier la séance' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-tag { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
    h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--white); margin-top: .3rem; margin-bottom: 2rem; }
    .form-card { background: var(--dark-2); border: 1px solid rgba(201,151,58,.12); padding: 2rem; max-width: 800px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1.2rem; }
    .field label { font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); }
    .field input, .field select, .field textarea { background: var(--dark-3); border: 1px solid rgba(201,151,58,.15); color: var(--text); padding: .75rem 1rem; outline: none; font-size: .9rem; font-family: 'DM Sans', sans-serif; resize: vertical; }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--gold); }
    .field input.error, .field select.error { border-color: var(--danger); }
    .alert-error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--danger); padding: .75rem 1rem; font-size: .85rem; margin-bottom: 1rem; }
    .alert-success { background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.3); color: var(--success); padding: .75rem 1rem; font-size: .85rem; margin-bottom: 1rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn-primary { background: var(--gold); color: var(--dark); padding: .7rem 1.8rem; border: none; cursor: pointer; font-size: .85rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }
    .btn-secondary { background: transparent; color: var(--text-muted); padding: .7rem 1.8rem; border: 1px solid rgba(201,151,58,.2); cursor: pointer; font-size: .85rem; }
    .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
  `]
})
export class SeanceFormComponent implements OnInit {
  form: FormGroup;
  prestations = signal<PrestationResponse[]>([]);
  eleves      = signal<EleveResponse[]>([]);
  professeurs = signal<ProfesseurResponse[]>([]);
  cours       = signal<CoursResponse[]>([]);
  loading     = signal(false);
  errorMsg    = signal<string | null>(null);
  successMsg  = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private eleveApi: EleveApiService,
    private profApi: ProfesseurApiService,
    private coursApi: CoursApiService,
    private prestationApi: PrestationApiService,
    private seanceApi: SeanceApiService,
    public auth: AuthService,
    public router: Router
  ) {
    this.form = this.fb.group({
      prestationId:    ['', Validators.required],
      eleveId:         ['', Validators.required],
      professeurId:    ['', Validators.required],
      coursId:         ['', Validators.required],
      dateHeureDebut:  ['', Validators.required],
      dureeMinutes:    [60, [Validators.required, Validators.min(15)]],
      adresseDomicile: [''],
      notes:           ['']
    });
  }

  ngOnInit() {
    const tuteurId = this.auth.currentUser()?.userId;
    if (tuteurId) {
      this.prestationApi.findAll().subscribe({ next: d => this.prestations.set(d) });
    }
    this.eleveApi.findAll().subscribe({ next: d => this.eleves.set(d) });
    this.profApi.findAll().subscribe({ next: d => this.professeurs.set(d) });
    this.coursApi.findAll().subscribe({ next: d => this.cours.set(d) });
  }

  onPrestationChange() {
    const prestId = this.form.get('prestationId')?.value;
    const prest = this.prestations().find(p => p.id === prestId);
    if (prest) {
      this.form.patchValue({ eleveId: prest.eleveId });
    }
  }

  isInvalid(f: string) {
    const c = this.form.get(f)!;
    return c.invalid && (c.dirty || c.touched);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.seanceApi.create(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Séance planifiée avec succès !');
        setTimeout(() => this.router.navigate(['/seances']), 1200);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.detail ?? 'Erreur lors de la planification');
      }
    });
  }
}
