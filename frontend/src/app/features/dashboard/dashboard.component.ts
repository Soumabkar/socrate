// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TuteurApiService, ProfesseurApiService } from '../../core/services/api.service';

/**
 * DashboardComponent – Tableau de bord adaptatif
 *
 * Responsabilité : afficher un résumé de l'activité selon le rôle.
 * - TUTEUR    : nb élèves, prestations en cours, paiements en attente
 * - PROFESSEUR: séances planifiées, évaluations à faire
 * - ADMIN     : statistiques globales
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <span class="page-tag">Vue d'ensemble</span>
        <h1>Bonjour, <em>{{ auth.currentUser()?.nomComplet }}</em></h1>
        <p>{{ today }}</p>
      </div>

      <!-- Cards d'action rapide par rôle -->
      @if (auth.isTuteur()) {
        <div class="cards-grid">
          <a routerLink="/eleves" class="dash-card">
            <div class="card-icon">👤</div>
            <div class="card-body">
              <div class="card-title">Mes élèves</div>
              <div class="card-sub">Gérer les profils</div>
            </div>
            <div class="card-arrow">→</div>
          </a>
          <a routerLink="/prestations" class="dash-card">
            <div class="card-icon">📋</div>
            <div class="card-body">
              <div class="card-title">Prestations</div>
              <div class="card-sub">Suivi mensuel / hebdo</div>
            </div>
            <div class="card-arrow">→</div>
          </a>
          <a routerLink="/seances" class="dash-card">
            <div class="card-icon">📅</div>
            <div class="card-body">
              <div class="card-title">Séances</div>
              <div class="card-sub">Calendrier & statuts</div>
            </div>
            <div class="card-arrow">→</div>
          </a>
          <a routerLink="/paiements" class="dash-card">
            <div class="card-icon">💳</div>
            <div class="card-body">
              <div class="card-title">Paiements</div>
              <div class="card-sub">Historique & solde</div>
            </div>
            <div class="card-arrow">→</div>
          </a>
        </div>
      }

      @if (auth.isProfesseur()) {
        <div class="cards-grid">
          <a routerLink="/seances" class="dash-card">
            <div class="card-icon">📅</div>
            <div class="card-body">
              <div class="card-title">Mes séances</div>
              <div class="card-sub">Planifiées & réalisées</div>
            </div>
            <div class="card-arrow">→</div>
          </a>
          <a routerLink="/evaluations" class="dash-card">
            <div class="card-icon">⭐</div>
            <div class="card-body">
              <div class="card-title">Évaluations</div>
              <div class="card-sub">Notes et commentaires</div>
            </div>
            <div class="card-arrow">→</div>
          </a>
          <a routerLink="/professeur/profil" class="dash-card">
            <div class="card-icon">🎓</div>
            <div class="card-body">
              <div class="card-title">Mon profil</div>
              <div class="card-sub">Habilitations & tarif</div>
            </div>
            <div class="card-arrow">→</div>
          </a>
        </div>
      }

      @if (auth.isAdmin()) {
        <div class="cards-grid">
          <a routerLink="/admin/professeurs" class="dash-card">
            <div class="card-icon">✅</div>
            <div class="card-body">
              <div class="card-title">Valider professeurs</div>
              <div class="card-sub">Candidatures en attente</div>
            </div>
            <div class="card-arrow">→</div>
          </a>
          <a routerLink="/eleves" class="dash-card">
            <div class="card-icon">👥</div>
            <div class="card-body">
              <div class="card-title">Tous les élèves</div>
              <div class="card-sub">Gestion globale</div>
            </div>
            <div class="card-arrow">→</div>
          </a>
          <a routerLink="/prestations" class="dash-card">
            <div class="card-icon">📊</div>
            <div class="card-body">
              <div class="card-title">Toutes les prestations</div>
              <div class="card-sub">Vue administrateur</div>
            </div>
            <div class="card-arrow">→</div>
          </a>
        </div>
      }

      <!-- Bandeau Prix Excellence -->
      <div class="excellence-banner">
        <span class="trophy">★</span>
        <div>
          <strong>Prix de l'Excellence — 4ème édition</strong>
          <p>Socrates récompense chaque année les élèves les plus méritants.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 960px; }
    .page-header { margin-bottom: 3rem; }
    .page-tag { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
    .page-header h1 { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 700; color: var(--white); margin: .5rem 0 .3rem; }
    .page-header h1 em { color: var(--gold); font-style: italic; }
    .page-header p { font-size: .85rem; color: var(--text-muted); }

    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.2rem; margin-bottom: 3rem; }
    .dash-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.4rem; background: var(--dark-2);
      border: 1px solid rgba(201,151,58,.12); text-decoration: none;
      transition: all .2s; cursor: pointer;
    }
    .dash-card:hover { border-color: rgba(201,151,58,.4); background: var(--dark-3); transform: translateY(-2px); }
    .card-icon { font-size: 1.5rem; flex-shrink: 0; }
    .card-body { flex: 1; }
    .card-title { font-size: .95rem; color: var(--white); font-weight: 500; }
    .card-sub   { font-size: .78rem; color: var(--text-muted); margin-top: .15rem; }
    .card-arrow { color: var(--gold); font-size: 1.1rem; }

    .excellence-banner {
      display: flex; align-items: center; gap: 1.5rem;
      padding: 1.5rem 2rem; border: 1px solid rgba(201,151,58,.2);
      background: rgba(201,151,58,.04);
    }
    .trophy { font-size: 2rem; color: var(--gold); }
    .excellence-banner strong { color: var(--gold); font-family: 'Playfair Display', serif; }
    .excellence-banner p { font-size: .83rem; color: var(--text-muted); margin-top: .2rem; }
  `]
})
export class DashboardComponent {
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  constructor(public auth: AuthService) {}
}
