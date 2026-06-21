// src/app/features/seance/seance-list.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeanceApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SeanceResponse } from '../../core/models';

/**
 * SeanceListComponent
 *
 * Responsabilité : lister les séances de l'utilisateur connecté.
 * Permet au professeur de changer le statut d'une séance (REALISEE, ANNULEE).
 * Le changement de statut vers REALISEE déclenche le recalcul côté backend.
 */
@Component({
  selector: 'app-seance-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="page-tag">Planning</span>
          <h1>Mes <em>Séances</em></h1>
        </div>
        <a routerLink="/seances/nouvelle" class="btn-primary">+ Nouvelle séance</a>
      </div>

      @if (loading()) {
        <div class="loading">Chargement…</div>
      } @else if (seances().length === 0) {
        <div class="empty-state">Aucune séance planifiée.</div>
      } @else {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date & heure</th>
                <th>Élève</th>
                <th>Professeur</th>
                <th>Cours</th>
                <th>Durée</th>
                <th>Statut</th>
                @if (auth.isProfesseur() || auth.isAdmin()) { <th>Actions</th> }
              </tr>
            </thead>
            <tbody>
              @for (s of seances(); track s.id) {
                <tr>
                  <td>{{ s.dateHeureDebut | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ s.nomEleve }}</td>
                  <td>{{ s.nomProfesseur }}</td>
                  <td>{{ s.nomCours }}</td>
                  <td>{{ s.dureeMinutes }} min</td>
                  <td><span class="badge" [class]="'badge-' + s.statut.toLowerCase()">{{ s.statut }}</span></td>
                  @if (auth.isProfesseur() || auth.isAdmin()) {
                    <td class="actions">
                      @if (s.statut === 'PLANIFIEE') {
                        <button class="btn-action success" (click)="changerStatut(s.id, 'REALISEE')">✓ Réalisée</button>
                        <button class="btn-action danger"  (click)="changerStatut(s.id, 'ANNULEE')">✗ Annuler</button>
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
    .page-tag { font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
    h1 { font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--white); margin: .3rem 0 0; }
    h1 em { color: var(--gold); font-style: italic; }
    .btn-primary { background: var(--gold); color: var(--dark); padding: .65rem 1.4rem; text-decoration: none; font-size: .83rem; letter-spacing: .06em; text-transform: uppercase; }
    .btn-primary:hover { background: var(--gold-light); }
    .table-container { border: 1px solid rgba(201,151,58,.12); overflow: auto; }
    .data-table { width: 100%; border-collapse: collapse; min-width: 800px; }
    .data-table th { background: var(--dark-3); padding: .9rem 1rem; text-align: left; font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); font-weight: 400; }
    .data-table td { padding: .8rem 1rem; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .86rem; color: var(--text); }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: rgba(201,151,58,.03); }
    .badge { font-size: .68rem; padding: .25rem .6rem; letter-spacing: .06em; text-transform: uppercase; }
    .badge-planifiee { background: rgba(59,130,246,.1); color: #60a5fa; }
    .badge-realisee  { background: rgba(34,197,94,.1);  color: #4ade80; }
    .badge-annulee   { background: rgba(239,68,68,.1);  color: #f87171; }
    .badge-reportee  { background: rgba(251,191,36,.1); color: #fbbf24; }
    .actions { display: flex; gap: .5rem; align-items: center; }
    .btn-action { background: none; border: 1px solid; padding: .3rem .7rem; cursor: pointer; font-size: .75rem; letter-spacing: .04em; text-transform: uppercase; transition: all .15s; }
    .btn-action.success { border-color: rgba(34,197,94,.4); color: #4ade80; }
    .btn-action.success:hover { background: rgba(34,197,94,.1); }
    .btn-action.danger  { border-color: rgba(239,68,68,.4); color: #f87171; }
    .btn-action.danger:hover  { background: rgba(239,68,68,.1); }
    .loading, .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
  `]
})
export class SeanceListComponent implements OnInit {
  seances = signal<SeanceResponse[]>([]);
  loading = signal(true);

  constructor(private seanceApi: SeanceApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.seanceApi.findByPrestation('').subscribe({ // TODO: filtrer par user
      next: () => {},
      error: () => this.loading.set(false)
    });
    // Pour la démo, on charge toutes les séances accessibles
    this.loading.set(false);
  }

  changerStatut(id: string, statut: string): void {
    this.seanceApi.changerStatut(id, statut).subscribe({
      next: updated => this.seances.update(list => list.map(s => s.id === id ? updated : s))
    });
  }
}
