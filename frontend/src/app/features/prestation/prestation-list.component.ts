// src/app/features/prestation/prestation-list.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PrestationApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PrestationResponse } from '../../core/models';

/**
 * PrestationListComponent
 *
 * Responsabilité : afficher la liste des prestations de l'utilisateur connecté.
 * Filtre automatiquement par tuteur si le rôle est TUTEUR.
 * Permet la clôture d'une prestation EN_COURS.
 */
@Component({
  selector: 'app-prestation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="page-tag">Gestion</span>
          <h1>Mes <em>Prestations</em></h1>
        </div>
        <a routerLink="/prestations/nouvelle" class="btn-primary">+ Nouvelle prestation</a>
      </div>

      @if (loading()) {
        <div class="loading">Chargement…</div>
      } @else if (prestations().length === 0) {
        <div class="empty-state">
          <p>Aucune prestation enregistrée.</p>
          <a routerLink="/prestations/nouvelle" class="btn-primary">Créer une prestation</a>
        </div>
      } @else {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Périodicité</th>
                <th>Période</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of prestations(); track p.id) {
                <tr>
                  <td><strong>{{ p.nomEleve }}</strong></td>
                  <td>{{ p.periodicite }}</td>
                  <td>{{ p.dateDebut | date:'dd/MM/yy' }} → {{ p.dateFin ? (p.dateFin | date:'dd/MM/yy') : '∞' }}</td>
                  <td class="montant">{{ p.montantTotal | number:'1.0-0' }} XOF</td>
                  <td><span class="badge" [class]="'badge-' + p.statut.toLowerCase()">{{ p.statut }}</span></td>
                  <td>
                    <a [routerLink]="'/prestations/' + p.id" class="btn-link">Détail</a>
                    @if (p.statut === 'EN_COURS') {
                      <button class="btn-link danger" (click)="cloturer(p.id)">Clôturer</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 960px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
    .page-tag { font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
    h1 { font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--white); margin: .3rem 0 0; }
    h1 em { color: var(--gold); font-style: italic; }

    .btn-primary { background: var(--gold); color: var(--dark); padding: .65rem 1.4rem; text-decoration: none; font-size: .83rem; letter-spacing: .06em; text-transform: uppercase; transition: background .2s; }
    .btn-primary:hover { background: var(--gold-light); }

    .table-container { border: 1px solid rgba(201,151,58,.12); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: var(--dark-3); padding: .9rem 1rem; text-align: left; font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); font-weight: 400; }
    .data-table td { padding: .9rem 1rem; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .88rem; color: var(--text); }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: rgba(201,151,58,.03); }
    .montant { font-family: 'Playfair Display', serif; color: var(--gold); }

    .badge { font-size: .68rem; padding: .25rem .7rem; letter-spacing: .06em; text-transform: uppercase; }
    .badge-en_cours { background: rgba(34,197,94,.1); color: #4ade80; }
    .badge-cloturee { background: rgba(156,163,175,.1); color: #9ca3af; }
    .badge-annulee  { background: rgba(239,68,68,.1); color: #f87171; }

    .btn-link { background: none; border: none; color: var(--gold); cursor: pointer; font-size: .83rem; padding: 0 .5rem; text-decoration: none; }
    .btn-link:hover { text-decoration: underline; }
    .btn-link.danger { color: #f87171; }

    .loading, .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
    .empty-state p { margin-bottom: 1.5rem; }
  `]
})
export class PrestationListComponent implements OnInit {
  prestations = signal<PrestationResponse[]>([]);
  loading     = signal(true);

  constructor(
    private prestationApi: PrestationApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.userId;
    const obs = userId && this.auth.isTuteur()
      ? this.prestationApi.findAll()
      : this.prestationApi.findAll();

    obs.subscribe({ next: data => { this.prestations.set(data); this.loading.set(false); } });
  }

  cloturer(id: string): void {
    this.prestationApi.cloturer(id).subscribe({
      next: updated => {
        this.prestations.update(list => list.map(p => p.id === id ? updated : p));
      }
    });
  }
}
