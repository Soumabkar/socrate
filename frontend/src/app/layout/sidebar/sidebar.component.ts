// src/app/layout/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="sidebar">
      <nav class="nav-menu">
        <div class="nav-section">
          <div class="nav-label">Principal</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">◈</span>
            <span>Tableau de bord</span>
          </a>
        </div>

        @if (auth.isTuteur() || auth.isAdmin()) {
          <div class="nav-section">
            <div class="nav-label">Gestion</div>
            <a routerLink="/eleves" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>Élèves</span>
            </a>
            <a routerLink="/prestations" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📋</span>
              <span>Prestations</span>
            </a>
            <a routerLink="/paiements" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">💳</span>
              <span>Paiements</span>
            </a>
          </div>
        }

        @if (auth.isTuteur() || auth.isProfesseur() || auth.isAdmin()) {
          <div class="nav-section">
            <div class="nav-label">Planning</div>
            <a routerLink="/seances" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📅</span>
              <span>Séances</span>
            </a>
          </div>
        }

        @if (auth.isAdmin()) {
          <div class="nav-section">
            <div class="nav-label">Administration</div>
            <a routerLink="/admin/professeurs" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">✅</span>
              <span>Valider professeurs</span>
            </a>
          </div>
        }

        @if (auth.isProfesseur()) {
          <div class="nav-section">
            <div class="nav-label">Mon espace</div>
            <a routerLink="/professeur/profil" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🎓</span>
              <span>Mon profil</span>
            </a>
          </div>
        }
      </nav>

      <div class="sidebar-footer">
        <div class="footer-version">Socrates v1.0</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 220px; flex-shrink: 0;
      background: var(--dark-2); border-right: 1px solid rgba(201,151,58,.12);
      display: flex; flex-direction: column;
      position: fixed; left: 0; top: 64px; bottom: 0;
      overflow-y: auto;
    }
    .nav-menu { padding: 1.5rem 0; flex: 1; }
    .nav-section { margin-bottom: 1.5rem; }
    .nav-label { font-size: .65rem; letter-spacing: .16em; text-transform: uppercase;
                 color: var(--text-muted); padding: 0 1.2rem; margin-bottom: .4rem; }
    .nav-item {
      display: flex; align-items: center; gap: .75rem;
      padding: .6rem 1.2rem; text-decoration: none;
      color: var(--text-muted); font-size: .87rem;
      transition: all .15s; border-left: 2px solid transparent;
    }
    .nav-item:hover { color: var(--text); background: rgba(201,151,58,.06); }
    .nav-item.active { color: var(--gold); border-left-color: var(--gold); background: rgba(201,151,58,.08); }
    .nav-icon { font-size: 1rem; width: 20px; text-align: center; }
    .sidebar-footer { padding: 1rem 1.2rem; border-top: 1px solid rgba(201,151,58,.08); }
    .footer-version { font-size: .72rem; color: var(--text-muted); }
  `]
})
export class SidebarComponent {
  constructor(public auth: AuthService) {}
}
