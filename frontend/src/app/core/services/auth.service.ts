// src/app/core/services/auth.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuthResponse, LoginRequest, CreateTuteurRequest,
         CreateProfesseurRequest, TuteurResponse, ProfesseurResponse } from '../models';

/**
 * AuthService
 *
 * Responsabilité : gérer l'état d'authentification de l'application.
 * - Connexion / déconnexion
 * - Stockage et lecture du JWT (localStorage)
 * - Exposition de signaux réactifs (Angular 17 Signals)
 *   pour que les composants réagissent aux changements d'état
 *
 * Pattern : Singleton injectable (providedIn: 'root')
 * Pattern : Signal Store (état réactif sans NgRx)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'socrates_token';
  private readonly USER_KEY  = 'socrates_user';

  // ── Signaux réactifs (Angular 17) ─────────────────────────────────────
  private _currentUser = signal<AuthResponse | null>(this.loadUser());
  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._currentUser());
  readonly role         = computed(() => this._currentUser()?.role ?? null);
  readonly isTuteur     = computed(() => this.role() === 'TUTEUR');
  readonly isProfesseur = computed(() => this.role() === 'PROFESSEUR');
  readonly isAdmin      = computed(() => this.role() === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, req).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res));
        this._currentUser.set(res);
      })
    );
  }

  inscrireTuteur(req: CreateTuteurRequest): Observable<TuteurResponse> {
    return this.http.post<TuteurResponse>(`${environment.apiUrl}/tuteurs`, req);
  }

  inscrireProfesseur(req: CreateProfesseurRequest): Observable<ProfesseurResponse> {
    return this.http.post<ProfesseurResponse>(`${environment.apiUrl}/professeurs`, req);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
