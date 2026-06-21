// src/app/layout/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

/**
 * NavbarComponent – Barre de navigation supérieure
 *
 * Responsabilité : afficher le nom de l'utilisateur, son rôle,
 * et le bouton de déconnexion. Adapte le contenu selon le rôle.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-logo">Socrates</span>
        <span class="brand-tag">/ Espace de gestion</span>
      </div>
      <div class="navbar-user">
        <span class="user-badge" [class]="'badge-' + (auth.role()?.toLowerCase() ?? '')">
          {{ auth.role() }}
        </span>
        <span class="user-name">{{ auth.currentUser()?.nomComplet }}</span>
        <button class="btn-logout" (click)="auth.logout()">Déconnexion</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      height: 64px; display: flex; align-items: center;
      justify-content: space-between; padding: 0 2rem;
      background: var(--dark); border-bottom: 1px solid rgba(201,151,58,.15);
    }
    .navbar-brand { display: flex; align-items: baseline; gap: .5rem; }
    .brand-logo { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 900; color: var(--gold); }
    .brand-tag  { font-size: .78rem; color: var(--text-muted); letter-spacing: .06em; }
    .navbar-user { display: flex; align-items: center; gap: 1rem; }
    .user-badge { font-size: .7rem; padding: .25rem .7rem; letter-spacing: .08em; text-transform: uppercase; }
    .badge-tuteur { background: rgba(201,151,58,.15); color: var(--gold); }
    .badge-professeur { background: rgba(59,130,246,.15); color: #60a5fa; }
    .badge-admin { background: rgba(239,68,68,.15); color: #f87171; }
    .user-name  { font-size: .9rem; color: var(--text); }
    .btn-logout {
      background: none; border: 1px solid rgba(201,151,58,.3);
      color: var(--gold); padding: .4rem 1rem; cursor: pointer;
      font-size: .8rem; letter-spacing: .06em; text-transform: uppercase;
      transition: all .2s;
    }
    .btn-logout:hover { background: rgba(201,151,58,.1); }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
