// ─── Tuteur Routes ────────────────────────────────────────────────────────────
// src/app/features/tuteur/tuteur.routes.ts
import { Routes } from '@angular/router';
export const TUTEUR_ROUTES: Routes = [
  { path: 'profil', loadComponent: () => import('./tuteur-profil.component').then(m => m.TuteurProfilComponent) },
  { path: '', redirectTo: 'profil', pathMatch: 'full' }
];

// ─── Professeur Routes ────────────────────────────────────────────────────────
// src/app/features/professeur/professeur.routes.ts
import { Routes } from '@angular/router';
export const PROFESSEUR_ROUTES: Routes = [
  { path: 'profil', loadComponent: () => import('./professeur-profil.component').then(m => m.ProfesseurProfilComponent) },
  { path: '', redirectTo: 'profil', pathMatch: 'full' }
];
export const ADMIN_ROUTES: Routes = [
  { path: 'professeurs', loadComponent: () => import('./admin-professeurs.component').then(m => m.AdminProfesseursComponent) },
  { path: '', redirectTo: 'professeurs', pathMatch: 'full' }
];

// ─── Eleve Routes ─────────────────────────────────────────────────────────────
// src/app/features/eleve/eleve.routes.ts
import { Routes } from '@angular/router';
export const ELEVE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./eleve-list.component').then(m => m.EleveListComponent) },
  { path: 'nouveau', loadComponent: () => import('./eleve-form.component').then(m => m.EleveFormComponent) }
];

// ─── Seance Routes ────────────────────────────────────────────────────────────
// src/app/features/seance/seance.routes.ts
import { Routes } from '@angular/router';
export const SEANCE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./seance-list.component').then(m => m.SeanceListComponent) },
  { path: 'nouvelle', loadComponent: () => import('./seance-form.component').then(m => m.SeanceFormComponent) }
];

// ─── Prestation Routes ────────────────────────────────────────────────────────
// src/app/features/prestation/prestation.routes.ts
import { Routes } from '@angular/router';
export const PRESTATION_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./prestation-list.component').then(m => m.PrestationListComponent) },
  { path: 'nouvelle', loadComponent: () => import('./prestation-form.component').then(m => m.PrestationFormComponent) },
  { path: ':id', loadComponent: () => import('./prestation-detail.component').then(m => m.PrestationDetailComponent) }
];

// ─── Paiement Routes ──────────────────────────────────────────────────────────
// src/app/features/paiement/paiement.routes.ts
import { Routes } from '@angular/router';
export const PAIEMENT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./paiement-list.component').then(m => m.PaiementListComponent) }
];
