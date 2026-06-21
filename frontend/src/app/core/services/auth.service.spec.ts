// src/app/core/services/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models';

/**
 * AuthService Spec
 *
 * Responsabilités testées :
 * - login() → appel HTTP POST correct + mise à jour du signal
 * - logout() → nettoyage localStorage + signal null
 * - isLoggedIn() → computed à partir du signal
 */
describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const mockAuth: AuthResponse = {
    token: 'eyJhbGciOiJIUzI1NiJ9.test',
    role: 'TUTEUR',
    userId: 'abc-123',
    nomComplet: 'Marie Dupont'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    http    = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => http.verify());

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('login() → doit appeler POST /api/auth/login et mettre à jour les signaux', () => {
    // WHEN
    service.login({ email: 'test@test.com', password: '12345678' }).subscribe(res => {
      // THEN – signal mis à jour
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.role()).toBe('TUTEUR');
      expect(service.currentUser()?.nomComplet).toBe('Marie Dupont');
    });

    // Simuler la réponse HTTP
    const req = http.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockAuth);
  });

  it('login() → doit stocker le token dans localStorage', () => {
    service.login({ email: 'test@test.com', password: '12345678' }).subscribe();
    http.expectOne('/api/auth/login').flush(mockAuth);
    expect(localStorage.getItem('socrates_token')).toBe(mockAuth.token);
  });

  it('logout() → doit nettoyer le state et localStorage', () => {
    // Setup : simuler un utilisateur connecté
    localStorage.setItem('socrates_token', mockAuth.token);
    localStorage.setItem('socrates_user', JSON.stringify(mockAuth));

    // WHEN
    service.logout();

    // THEN
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('socrates_token')).toBeNull();
  });

  it('isTuteur() → doit retourner true si role TUTEUR', () => {
    service.login({ email: 't@t.com', password: 'pass' }).subscribe();
    http.expectOne('/api/auth/login').flush(mockAuth);
    expect(service.isTuteur()).toBeTrue();
    expect(service.isProfesseur()).toBeFalse();
    expect(service.isAdmin()).toBeFalse();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// src/app/features/auth/login/login.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from '../../features/auth/login/login.component';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

/**
 * LoginComponent Spec
 *
 * Responsabilités testées :
 * - Rendu initial du formulaire
 * - Validation des champs (email invalide, password trop court)
 * - Appel AuthService.login() au submit
 * - Affichage d'erreur en cas d'échec
 */
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }]
    }).compileComponents();

    fixture     = TestBed.createComponent(LoginComponent);
    component   = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('le formulaire doit être invalide initialement', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('email invalide → isInvalid() retourne true après touch', () => {
    const emailCtrl = component.form.get('email')!;
    emailCtrl.setValue('pas-un-email');
    emailCtrl.markAsTouched();
    expect(component.isInvalid('email')).toBeTrue();
  });

  it('onSubmit() → ne doit pas appeler login si formulaire invalide', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('onSubmit() → doit appeler AuthService.login avec les bonnes valeurs', () => {
    authService.login.and.returnValue(of({
      token: 'tok', role: 'TUTEUR', userId: 'id', nomComplet: 'Test'
    } as any));

    component.form.setValue({ email: 'test@test.com', password: 'password123' });
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@test.com', password: 'password123'
    });
  });

  it('onSubmit() → doit afficher un message d\'erreur en cas d\'échec API', () => {
    authService.login.and.returnValue(throwError(() => ({
      error: { detail: 'Email ou mot de passe incorrect' }
    })));

    component.form.setValue({ email: 'test@test.com', password: 'wrongpass' });
    component.onSubmit();

    expect(component.errorMessage()).toBe('Email ou mot de passe incorrect');
    expect(component.loading()).toBeFalse();
  });
});
