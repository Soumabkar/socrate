// src/app/features/eleve/eleve-list.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EleveApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { EleveResponse } from '../../core/models';

@Component({
  selector: 'app-eleve-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="page-tag">Gestion</span>
          <h1>Mes élèves</h1>
        </div>
        <a routerLink="/eleves/nouveau" class="btn-primary">+ Ajouter un élève</a>
      </div>

      @if (loading()) {
        <div class="loading">Chargement…</div>
      }

      @if (!loading() && eleves().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">👤</div>
          <p>Aucun élève enregistré.</p>
          <a routerLink="/eleves/nouveau" class="btn-primary">Inscrire un élève</a>
        </div>
      }

      <div class="table-container">
        @if (eleves().length > 0) {
          <table class="data-table">
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>Niveau scolaire</th>
                <th>Date de naissance</th>
                <th>Téléphone</th>
              </tr>
            </thead>
            <tbody>
              @for (eleve of eleves(); track eleve.id) {
                <tr>
                  <td><strong>{{ eleve.prenom }} {{ eleve.nom }}</strong></td>
                  <td><span class="badge badge-info">{{ eleve.niveauScolaire }}</span></td>
                  <td>{{ eleve.dateNaissance | date:'dd/MM/yyyy' }}</td>
                  <td>{{ eleve.telephone ?? '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .page-tag { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
    h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--white); margin-top: .3rem; }
    .btn-primary { background: var(--gold); color: var(--dark); padding: .6rem 1.4rem; text-decoration: none;
                   font-size: .85rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: .75rem 1rem; font-size: .72rem; letter-spacing: .1em;
                     text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid rgba(201,151,58,.15); }
    .data-table td { padding: .9rem 1rem; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .9rem; }
    .data-table tr:hover td { background: var(--dark-2); }
    .badge { padding: .2rem .7rem; font-size: .75rem; letter-spacing: .06em; }
    .badge-info { background: rgba(96,165,250,.15); color: #60a5fa; }
    .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .loading { color: var(--text-muted); padding: 2rem; text-align: center; }
  `]
})
export class EleveListComponent implements OnInit {
  eleves = signal<EleveResponse[]>([]);
  loading = signal(true);

  constructor(private eleveApi: EleveApiService, public auth: AuthService) {}

  ngOnInit() {
    const userId = this.auth.currentUser()?.userId;
    if (userId && this.auth.isTuteur()) {
      this.eleveApi.findAll().subscribe({
        next: data => { this.eleves.set(data); this.loading.set(false); },
        error: ()  => this.loading.set(false)
      });
    } else {
      this.eleveApi.findAll().subscribe({
        next: data => { this.eleves.set(data); this.loading.set(false); },
        error: ()  => this.loading.set(false)
      });
    }
  }
}
