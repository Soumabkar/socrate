// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const APP_ROUTES: Routes = [
  // Authentification (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Application (protégée)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./app.component').then(m => m.AppShellComponent),
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      // Élèves
      { path: 'eleves',         loadComponent: () => import('./features/eleve/eleve-list.component').then(m => m.EleveListComponent) },
      { path: 'eleves/nouveau', loadComponent: () => import('./features/eleve/eleve-form.component').then(m => m.EleveFormComponent) },

      // Prestations
      { path: 'prestations',           loadComponent: () => import('./features/prestation/prestation-list.component').then(m => m.PrestationListComponent) },
      { path: 'prestations/nouvelle',  loadComponent: () => import('./features/prestation/prestation-form.component').then(m => m.PrestationFormComponent) },

      // Séances
      { path: 'seances',          loadComponent: () => import('./features/seance/seance-list.component').then(m => m.SeanceListComponent) },
      { path: 'seances/nouvelle', loadComponent: () => import('./features/seance/seance-form.component').then(m => m.SeanceFormComponent) },

      // Paiements
      { path: 'paiements', loadComponent: () => import('./features/paiement/paiement-list.component').then(m => m.PaiementListComponent) },

      // Professeur
      { path: 'professeur/profil', loadComponent: () => import('./features/professeur/admin-professeurs.component').then(m => m.AdminProfesseursComponent) },

      // Admin
      { path: 'admin/professeurs', loadComponent: () => import('./features/professeur/admin-professeurs.component').then(m => m.AdminProfesseursComponent) },
    ]
  },

  { path: '**', redirectTo: '/auth/login' }
];
