// src/app/features/paiement/paiement-list.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaiementApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PaiementResponse } from '../../core/models';

@Component({
  selector: 'app-paiement-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="page-tag">Finances</span>
          <h1>Mes paiements</h1>
        </div>
      </div>

      @if (loading()) { <div class="loading">Chargement…</div> }

      @if (!loading() && paiements().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">💳</div>
          <p>Aucun paiement enregistré.</p>
        </div>
      }

      @if (paiements().length > 0) {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Montant</th>
                <th>Mode</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (p of paiements(); track p.id) {
                <tr>
                  <td>{{ p.datePaiement ? (p.datePaiement | date:'dd/MM/yyyy HH:mm') : '—' }}</td>
                  <td><strong class="text-gold">{{ p.montant | currency:'EUR':'symbol':'1.2-2':'fr' }}</strong></td>
                  <td>{{ p.modePaiement }}</td>
                  <td>
                    <span class="badge" [class]="badgeClass(p.statut)">{{ p.statut }}</span>
                  </td>
                  <td>
                    @if (p.statut === 'EN_ATTENTE') {
                      <button class="btn-sm" (click)="confirmer(p.id)">Confirmer</button>
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
    .page-tag { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
    h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--white); margin-top: .3rem; margin-bottom: 2rem; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: .75rem 1rem; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid rgba(201,151,58,.15); }
    .data-table td { padding: .9rem 1rem; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .9rem; }
    .data-table tr:hover td { background: var(--dark-2); }
    .badge { padding: .2rem .7rem; font-size: .75rem; letter-spacing: .06em; }
    .badge-success { background: rgba(74,222,128,.15); color: var(--success); }
    .badge-warning { background: rgba(251,191,36,.15); color: #fbbf24; }
    .badge-danger  { background: rgba(248,113,113,.15); color: var(--danger); }
    .btn-sm { background: var(--gold); color: var(--dark); border: none; padding: .3rem .8rem; cursor: pointer; font-size: .78rem; font-weight: 500; }
    .text-gold { color: var(--gold); }
    .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .loading { color: var(--text-muted); padding: 2rem; text-align: center; }
  `]
})
export class PaiementListComponent implements OnInit {
  paiements = signal<PaiementResponse[]>([]);
  loading   = signal(true);

  constructor(private paiementApi: PaiementApiService, public auth: AuthService) {}

  ngOnInit() {
    const tuteurId = this.auth.currentUser()?.userId;
    if (tuteurId) {
      this.paiementApi.findByTuteur(tuteurId).subscribe({
        next: data => { this.paiements.set(data); this.loading.set(false); },
        error: ()  => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  badgeClass(statut: string) {
    return {
      'badge badge-success': statut === 'PAYE',
      'badge badge-warning': statut === 'EN_ATTENTE',
      'badge badge-danger':  statut === 'ECHEC' || statut === 'REMBOURSE'
    };
  }

  confirmer(id: string) {
    this.paiementApi.confirmer(id).subscribe({
      next: updated => {
        this.paiements.update(list => list.map(p => p.id === id ? updated : p));
      }
    });
  }
}
