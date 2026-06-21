# Socrates Backend – Architecture & Responsabilités

## Stack technique
- **Java 21** + **Spring Boot 3.3**
- **PostgreSQL 16** + **Flyway** (migrations versionnées)
- **Spring Security** + **JWT (JJWT 0.12)**
- **MapStruct** (mapping DTO ↔ entité)
- **Lombok** (réduction boilerplate)
- **SpringDoc OpenAPI** (Swagger UI : http://localhost:8080/api/swagger-ui.html)
- **Testcontainers** (tests d'intégration PostgreSQL réels)

---

## Architecture – Clean Architecture en couches

```
com.socrates/
│
├── config/                         ← Configuration Spring (Security, CORS, Beans)
│   └── SecurityConfig              [Bean] Chaîne de filtres, règles d'accès par rôle, CORS
│   └── AuthService                 [Service] Façade login multi-rôles (tuteur ou professeur)
│
├── domain/service/impl/            ← LOGIQUE MÉTIER (cœur de l'application)
│   └── TuteurService               [Service] Inscription et gestion tuteurs légaux
│   └── EleveService                [Service] Gestion cycle de vie des élèves
│   └── ProfesseurService           [Service] Inscription + validation professeurs
│   └── MatiereService              [Service] Consultation des matières
│   └── PrestationService           [Service] Agrégat de séances, recalcul montant
│   └── SeanceService               ★ Service principal – vérifie habilitation prof
│   └── PaiementService             [Service] Contrôle surfacturation
│   └── EvaluationService           [Service] Unicité évaluation par séance
│
├── application/dto/
│   ├── request/                    ← Contrat d'entrée API (validation @Valid)
│   └── response/                   ← Contrat de sortie API (records Java 21)
│
├── infrastructure/
│   ├── persistence/
│   │   ├── entity/                 ← Entités JPA (mapping O/R uniquement, 0 logique)
│   │   └── repository/             ← Spring Data JPA repositories (accès données)
│   ├── security/
│   │   ├── jwt/JwtService          [Component] Génération/validation JWT (SRP)
│   │   └── filter/JwtAuthFilter    [Filter] Extraction JWT par requête (OncePerRequestFilter)
│   └── web/
│       ├── controller/             ← REST Controllers (HTTP → Service → HTTP)
│       └── advice/GlobalExHandler  [ControllerAdvice] Centralise les erreurs HTTP
│
└── common/exception/               ← Exceptions métier typées (ResourceNotFound, BusinessRule)
```

---

## Design Patterns utilisés

| Pattern | Où | Pourquoi |
|---|---|---|
| **Service Layer** | `*Service.java` | Isole la logique métier des contrôleurs et de la persistence |
| **Repository** | `*JpaRepository` | Abstraction de l'accès aux données, testabilité |
| **Facade** | `AuthService` | Simplifie le login multi-rôles (tuteur/professeur) derrière une interface unique |
| **Chain of Responsibility** | `JwtAuthenticationFilter` | Chaque filtre traite ou passe la requête au suivant |
| **DTO** | `*Request / *Response` | Découple le contrat API de la persistence |
| **Factory (Builder)** | `Entity.builder()` | Construction lisible et flexible des objets |
| **Strategy (implicite)** | `PasswordEncoder` | BCrypt injecté → facilement remplaçable |
| **Template Method** | `OncePerRequestFilter` | Spring définit le squelette, on implémente `doFilterInternal` |

---

## Règles métier implémentées dans les Services

### SeanceService
1. **Habilitation professeur** : le professeur doit être dans `PROFESSEUR_MATIERE` pour la matière du cours
2. **Cohérence élève/prestation** : l'élève de la séance = l'élève de la prestation
3. **Validation professeur** : un professeur non validé ne peut pas dispenser de séance
4. **Recalcul montant** : quand une séance passe en `REALISEE`, `montant_total` de la prestation est recalculé

### PrestationService
5. **Cohérence tuteur/élève** : le tuteur doit être responsable de l'élève de la prestation

### PaiementService
6. **Anti-surfacturation** : `Σ paiements PAYE ≤ montant_total prestation`

### EvaluationService
7. **Unicité** : une seule évaluation par séance
8. **Séance réalisée** : évaluation impossible si la séance n'est pas `REALISEE`

---

## API REST – Endpoints principaux

```
POST   /auth/login                    → AuthResponse (JWT)
POST   /tuteurs                       → TuteurResponse (public)
POST   /professeurs                   → ProfesseurResponse (public, en attente validation)
GET    /matieres                      → List<MatiereResponse> (public)

POST   /eleves                        → EleveResponse         [TUTEUR]
POST   /prestations                   → PrestationResponse    [TUTEUR]
PATCH  /prestations/{id}/cloturer     → PrestationResponse    [TUTEUR]
POST   /seances                       → SeanceResponse        [PROF/TUTEUR/ADMIN]
PATCH  /seances/{id}/statut           → SeanceResponse        [PROF/ADMIN]
POST   /paiements                     → PaiementResponse      [TUTEUR]
PATCH  /paiements/{id}/confirmer      → PaiementResponse      [TUTEUR]
POST   /evaluations                   → EvaluationResponse    [PROF/ADMIN]

PATCH  /professeurs/{id}/valider      → ProfesseurResponse    [ADMIN]
GET    /professeurs/non-valides       → List<ProfesseurResponse> [ADMIN]
```

---

## Lancer le projet

```bash
# Démarrer PostgreSQL
docker run -d \
  --name socrates-db \
  -e POSTGRES_DB=socrates_db \
  -e POSTGRES_USER=socrates_user \
  -e POSTGRES_PASSWORD=socrates_pass \
  -p 5432:5432 postgres:16-alpine

# Compiler et lancer
mvn spring-boot:run

# Lancer les tests (inclut Testcontainers → Docker requis)
mvn test
```

---

## Tests

| Type | Technologie | Ce qui est testé |
|---|---|---|
| **Unitaires Service** | Mockito BDD | Logique métier, règles, cas d'erreur |
| **Unitaires Controller** | MockMvc + @WebMvcTest | Codes HTTP, sérialisation JSON, validation |
| **Intégration Repository** | Testcontainers + PostgreSQL réel | Requêtes JPQL, contraintes DB |
