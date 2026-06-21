// src/app/core/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * jwtInterceptor – Intercepteur fonctionnel (Angular 17)
 *
 * Responsabilité : injecter automatiquement le token JWT
 * dans le header Authorization de chaque requête HTTP sortante.
 *
 * Pattern : Interceptor (Chain of Responsibility côté client)
 * Avantage : les services API n'ont jamais à gérer le token manuellement.
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};
