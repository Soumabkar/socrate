// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * authGuard – Garde de navigation fonctionnelle (Angular 17)
 *
 * Responsabilité : bloquer l'accès aux routes protégées si l'utilisateur
 * n'est pas authentifié. Redirige vers /auth/login.
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/auth/login']);
};

/**
 * roleGuard – Garde basée sur le rôle
 *
 * Usage dans les routes :
 *   canActivate: [roleGuard('ADMIN')]
 */
export const roleGuard = (requiredRole: string): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.role() === requiredRole) return true;
  return router.createUrlTree(['/dashboard']);
};

/**
 * publicGuard – Empêche un utilisateur connecté d'accéder à /auth/login
 */
export const publicGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  return router.createUrlTree(['/dashboard']);
};
