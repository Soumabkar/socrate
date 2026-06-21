# Socrates Frontend – Angular 17

## Stack technique
- **Angular 17** – Architecture Standalone (pas de NgModules)
- **Reactive Forms** – Validation des formulaires
- **Angular Signals** – Gestion d'état réactive (sans NgRx)
- **Lazy Loading** – Routes chargées à la demande
- **JWT Interceptor** – Injection automatique du token
- **SCSS** – Variables CSS design system Socrates

---

## Architecture des fichiers

```
src/app/
│
├── core/
│   ├── models/index.ts          Interfaces TypeScript (miroir des DTOs Spring Boot)
│   ├── services/
│   │   ├── auth.service.ts      Authentification + Signaux réactifs
│   │   └── api.service.ts       Services HTTP par entité (TuteurApi, SeanceApi…)
│   ├── interceptors/
│   │   └── jwt.interceptor.ts   Injection automatique Bearer token
│   └── guards/
│       └── auth.guard.ts        authGuard, roleGuard, publicGuard
│
├── shared/                      Composants réutilisables (badges, spinners…)
│
├── features/                    Pages organisées par domaine métier
│   ├── auth/
│   │   ├── login/               Formulaire de connexion
│   │   └── register/            Inscription tuteur / professeur (onglets)
│   ├── dashboard/               Tableau de bord adaptatif par rôle
│   ├── tuteur/                  Profil tuteur
│   ├── professeur/              Profil professeur + Admin validation
│   ├── eleve/                   Liste et création d'élèves
│   ├── seance/                  Liste + changement de statut séances
│   ├── prestation/              Liste + clôture prestations
│   └── paiement/                Liste paiements
│
├── layout/
│   ├── navbar/                  Barre de navigation (rôle, déconnexion)
│   └── sidebar/                 Menu latéral filtré par rôle (computed Signal)
│
├── app.component.ts             Composant racine (layout conditionnel)
├── app.config.ts                Bootstrap Angular 17 (providers globaux)
└── app.routes.ts                Routage principal (lazy loading)
```

---

## Patterns Angular 17 utilisés

| Pattern | Implémentation | Avantage |
|---|---|---|
| **Standalone Components** | Tous les composants | Pas de NgModule, tree-shaking optimal |
| **Signals** | `signal()`, `computed()` | État réactif sans RxJS complexe |
| **Functional Guards** | `authGuard`, `roleGuard` | Plus lisibles que les classes |
| **Functional Interceptors** | `jwtInterceptor` | Injection de dépendances via `inject()` |
| **Lazy Loading** | `loadComponent()`, `loadChildren()` | Chargement à la demande |
| **Reactive Forms** | `FormBuilder`, `FormGroup` | Validation déclarative et testable |
| **Control Flow** | `@if`, `@for` (Angular 17) | Syntaxe native, plus performante que `*ngIf` |

---

## Rôles et accès

| Page | TUTEUR | PROFESSEUR | ADMIN |
|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ |
| Élèves | ✓ | — | ✓ |
| Prestations | ✓ | — | ✓ |
| Séances | ✓ | ✓ | ✓ |
| Paiements | ✓ | — | ✓ |
| Évaluations | — | ✓ | ✓ |
| Validation profs | — | — | ✓ |
| Mon profil tuteur | ✓ | — | — |
| Mon profil prof | — | ✓ | — |

---

## Intégration avec le site de présentation

Le site statique `socrates.html` est le point d'entrée public.
Les boutons "S'inscrire" et "Se connecter" redirigent vers :
- `/auth/register` → Formulaire d'inscription Angular
- `/auth/login`    → Connexion Angular + JWT

L'Angular app tourne sur `http://localhost:4200`.
Le Spring Boot backend tourne sur `http://localhost:8080/api`.
Le proxy Angular (`proxy.conf.json`) redirige `/api/*` → backend.

---

## Lancer le projet

```bash
# Installer les dépendances
npm install

# Lancer en développement (avec proxy vers Spring Boot)
npm start

# Build production
npm run build

# Tests unitaires (Karma + Jasmine)
npm test
```

---

## Connexion au site de présentation

Dans `socrates.html`, modifier les liens d'action :
```html
<!-- Bouton "S'inscrire" -->
<button onclick="window.location.href='http://localhost:4200/auth/register'">
  S'inscrire
</button>

<!-- Bouton "Se connecter" -->
<button onclick="window.location.href='http://localhost:4200/auth/login'">
  Se connecter
</button>
```
