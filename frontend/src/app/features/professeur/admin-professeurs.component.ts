// src/app/features/professeur/admin-professeurs.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfesseurApiService } from '../../core/services/api.service';
import { ProfesseurResponse } from '../../core/models';

/**
 * AdminProfesseursComponent
 *
 * Responsabilité : liste des professeurs en attente de validation.
 * Action admin : valider un professeur (PATCH /professeurs/{id}/valider).
 */
@Component({
  selector: 'app-admin-professeurs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <span class="page-tag">Administration</span>
        <h1>Validation des <em>Professeurs</em></h1>
      </div>

      @if (loading()) {
        <div class="loading">Chargement…</div>
      } @else if (enAttente().length === 0) {
        <div class="empty-state">
          <span class="check">✓</span>
          <p>Aucune candidature en attente de validation.</p>
        </div>
      } @else {
        <div class="profs-grid">
          @for (prof of enAttente(); track prof.id) {
            <div class="prof-card">
              <div class="prof-avatar">{{ prof.prenom[0] }}{{ prof.nom[0] }}</div>
              <div class="prof-info">
                <div class="prof-name">{{ prof.prenom }} {{ prof.nom }}</div>
                <div class="prof-email">{{ prof.email }}</div>
                @if (prof.tarifHoraire) {
                  <div class="prof-tarif">{{ prof.tarifHoraire | number:'1.0-0' }} XOF/h</div>
                }
                @if (prof.disponibilites) {
                  <div class="prof-dispo">{{ prof.disponibilites }}</div>
                }
              </div>
              <button class="btn-valider" (click)="valider(prof.id)">
                ✓ Valider
              </button>
            </div>
          }
        </div>
      }

      @if (valides().length > 0) {
        <div class="section-separator">
          <span>Professeurs validés ({{ valides().length }})</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Tarif/h</th><th>Inscription</th></tr>
            </thead>
            <tbody>
              @for (p of valides(); track p.id) {
                <tr>
                  <td><strong>{{ p.prenom }} {{ p.nom }}</strong></td>
                  <td>{{ p.email }}</td>
                  <td>{{ p.tarifHoraire | number:'1.0-0' }} XOF</td>
                  <td>{{ p.createdAt | date:'dd/MM/yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 900px; }
    .page-header { margin-bottom: 2.5rem; }
    .page-tag { font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
    h1 { font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--white); margin: .3rem 0 0; }
    h1 em { color: var(--gold); font-style: italic; }

    .profs-grid { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 3rem; }
    .prof-card {
      display: flex; align-items: center; gap: 1.2rem;
      padding: 1.2rem 1.5rem; background: var(--dark-2);
      border: 1px solid rgba(201,151,58,.15);
    }
    .prof-avatar {
      width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
      background: rgba(201,151,58,.15); color: var(--gold);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700;
    }
    .prof-info { flex: 1; }
    .prof-name  { font-size: .95rem; color: var(--white); font-weight: 500; }
    .prof-email { font-size: .8rem; color: var(--text-muted); margin-top: .15rem; }
    .prof-tarif { font-size: .8rem; color: var(--gold); margin-top: .2rem; }
    .prof-dispo { font-size: .78rem; color: var(--text-muted); margin-top: .15rem; font-style: italic; }

    .btn-valider {
      background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3);
      color: #4ade80; padding: .55rem 1.2rem; cursor: pointer;
      font-size: .8rem; letter-spacing: .06em; text-transform: uppercase;
      transition: all .15s; font-family: 'DM Sans', sans-serif;
    }
    .btn-valider:hover { background: rgba(34,197,94,.2); }

    .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
    .check { display: block; font-size: 2.5rem; color: #4ade80; margin-bottom: 1rem; }

    .section-separator {
      display: flex; align-items: center; gap: 1rem; margin: 2rem 0 1.5rem;
      font-size: .78rem; color: var(--text-muted); letter-spacing: .08em; text-transform: uppercase;
    }
    .section-separator::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.06); }

    .table-container { border: 1px solid rgba(201,151,58,.08); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: var(--dark-3); padding: .8rem 1rem; text-align: left; font-size: .7rem; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); font-weight: 400; }
    .data-table td { padding: .8rem 1rem; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .86rem; color: var(--text); }
    .data-table tr:last-child td { border-bottom: none; }
    .loading { text-align: center; padding: 4rem; color: var(--text-muted); }
  `]
})
export class AdminProfesseursComponent implements OnInit {
  enAttente = signal<ProfesseurResponse[]>([]);
  valides   = signal<ProfesseurResponse[]>([]);
  loading   = signal(true);

  constructor(private profApi: ProfesseurApiService) {}

  ngOnInit(): void {
    this.profApi.findAll().subscribe({
      next: (profs) => {
        this.enAttente.set(profs.filter(p => !p.valide));
        this.valides.set(profs.filter(p => p.valide));
        this.loading.set(false);
      }
    });
  }

  valider(id: string): void {
    this.profApi.valider(id).subscribe({
      next: (updated) => {
        const prof = this.enAttente().find(p => p.id === id);
        this.enAttente.update(list => list.filter(p => p.id !== id));
        if (prof) this.valides.update(list => [updated, ...list]);
      }
    });
  }
}
