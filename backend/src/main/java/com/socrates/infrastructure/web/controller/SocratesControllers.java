package com.socrates.infrastructure.web.controller;

import com.socrates.application.dto.request.*;
import com.socrates.application.dto.response.*;
import com.socrates.config.AuthService;
import com.socrates.domain.service.impl.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controllers – Pattern : Controller (MVC) + Facade
 *
 * Responsabilité des contrôleurs :
 * 1. Recevoir la requête HTTP et désérialiser le body
 * 2. Déléguer IMMÉDIATEMENT au service métier
 * 3. Retourner la réponse HTTP avec le bon code de statut
 *
 * Les contrôleurs NE contiennent PAS de logique métier.
 * Toute la logique est dans les Services (couche Domain).
 *
 * @RestController = @Controller + @ResponseBody (sérialisation JSON auto)
 * @RequestMapping définit le chemin de base de l'API.
 */

// ─────────────────────────────────────────────────────────────
// AuthController – /auth
// ─────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification")
class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Connexion (tuteur ou professeur)")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }
}

// ─────────────────────────────────────────────────────────────
// TuteurController – /tuteurs
// ─────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/tuteurs")
@RequiredArgsConstructor
@Tag(name = "Tuteurs légaux")
class TuteurController {

    private final TuteurService tuteurService;

    @PostMapping
    @Operation(summary = "Inscription d'un tuteur légal")
    public ResponseEntity<TuteurResponse> creer(@Valid @RequestBody CreateTuteurRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tuteurService.creer(req));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un tuteur par ID")
    public ResponseEntity<TuteurResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(tuteurService.findById(id));
    }

    @GetMapping
    @Operation(summary = "Lister tous les tuteurs")
    public ResponseEntity<List<TuteurResponse>> findAll() {
        return ResponseEntity.ok(tuteurService.findAll());
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Mettre à jour le profil tuteur")
    public ResponseEntity<TuteurResponse> mettreAJour(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateTuteurRequest req
    ) {
        return ResponseEntity.ok(tuteurService.mettreAJour(id, req));
    }
}

// ─────────────────────────────────────────────────────────────
// EleveController – /eleves
// ─────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/eleves")
@RequiredArgsConstructor
@Tag(name = "Élèves")
class EleveController {

    private final EleveService eleveService;

    @PostMapping
    @Operation(summary = "Inscrire un élève")
    public ResponseEntity<EleveResponse> creer(@Valid @RequestBody CreateEleveRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eleveService.creer(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EleveResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(eleveService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<EleveResponse>> findAll() {
        return ResponseEntity.ok(eleveService.findAll());
    }

    @GetMapping("/tuteur/{tuteurId}")
    @Operation(summary = "Élèves d'un tuteur")
    public ResponseEntity<List<EleveResponse>> findByTuteur(@PathVariable UUID tuteurId) {
        return ResponseEntity.ok(eleveService.findByTuteur(tuteurId));
    }
}

// ─────────────────────────────────────────────────────────────
// ProfesseurController – /professeurs
// ─────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/professeurs")
@RequiredArgsConstructor
@Tag(name = "Professeurs")
class ProfesseurController {

    private final ProfesseurService professeurService;

    @PostMapping
    @Operation(summary = "Inscription d'un professeur (en attente validation)")
    public ResponseEntity<ProfesseurResponse> inscrire(@Valid @RequestBody CreateProfesseurRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(professeurService.inscrire(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfesseurResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(professeurService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<ProfesseurResponse>> findAll() {
        return ResponseEntity.ok(professeurService.findAll());
    }

    @GetMapping("/non-valides")
    @Operation(summary = "Professeurs en attente de validation (ADMIN)")
    public ResponseEntity<List<ProfesseurResponse>> findNonValides() {
        return ResponseEntity.ok(professeurService.findNonValides());
    }

    @PatchMapping("/{id}/valider")
    @Operation(summary = "Valider un professeur (ADMIN)")
    public ResponseEntity<ProfesseurResponse> valider(@PathVariable UUID id) {
        return ResponseEntity.ok(professeurService.valider(id));
    }
}

// ─────────────────────────────────────────────────────────────
// MatiereController – /matieres
// ─────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/matieres")
@RequiredArgsConstructor
@Tag(name = "Matières")
class MatiereController {

    private final MatiereService matiereService;

    @GetMapping
    public ResponseEntity<List<MatiereResponse>> findAll() {
        return ResponseEntity.ok(matiereService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatiereResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(matiereService.findById(id));
    }
}

// ─────────────────────────────────────────────────────────────
// PrestationController – /prestations
// ─────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/prestations")
@RequiredArgsConstructor
@Tag(name = "Prestations")
class PrestationController {

    private final PrestationService prestationService;

    @PostMapping
    @Operation(summary = "Créer une prestation")
    public ResponseEntity<PrestationResponse> creer(@Valid @RequestBody CreatePrestationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(prestationService.creer(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrestationResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(prestationService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<PrestationResponse>> findAll() {
        return ResponseEntity.ok(prestationService.findAll());
    }

    @GetMapping("/eleve/{eleveId}")
    public ResponseEntity<List<PrestationResponse>> findByEleve(@PathVariable UUID eleveId) {
        return ResponseEntity.ok(prestationService.findByEleve(eleveId));
    }

    @GetMapping("/tuteur/{tuteurId}")
    public ResponseEntity<List<PrestationResponse>> findByTuteur(@PathVariable UUID tuteurId) {
        return ResponseEntity.ok(prestationService.findByTuteur(tuteurId));
    }

    @PatchMapping("/{id}/cloturer")
    @Operation(summary = "Clôturer une prestation")
    public ResponseEntity<PrestationResponse> cloturer(@PathVariable UUID id) {
        return ResponseEntity.ok(prestationService.cloturer(id));
    }
}

// ─────────────────────────────────────────────────────────────
// SeanceController – /seances
// ─────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/seances")
@RequiredArgsConstructor
@Tag(name = "Séances")
class SeanceController {

    private final SeanceService seanceService;

    @PostMapping
    @Operation(summary = "Créer une séance (vérifie habilitation professeur)")
    public ResponseEntity<SeanceResponse> creer(@Valid @RequestBody CreateSeanceRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seanceService.creer(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeanceResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(seanceService.findById(id));
    }

    @GetMapping("/prestation/{prestationId}")
    public ResponseEntity<List<SeanceResponse>> findByPrestation(@PathVariable UUID prestationId) {
        return ResponseEntity.ok(seanceService.findByPrestation(prestationId));
    }

    @GetMapping("/professeur/{professeurId}")
    public ResponseEntity<List<SeanceResponse>> findByProfesseur(@PathVariable UUID professeurId) {
        return ResponseEntity.ok(seanceService.findByProfesseur(professeurId));
    }

    @GetMapping("/eleve/{eleveId}")
    public ResponseEntity<List<SeanceResponse>> findByEleve(@PathVariable UUID eleveId) {
        return ResponseEntity.ok(seanceService.findByEleve(eleveId));
    }

    @PatchMapping("/{id}/statut")
    @Operation(summary = "Changer le statut d'une séance (REALISEE → recalcul montant)")
    public ResponseEntity<SeanceResponse> changerStatut(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateSeanceStatutRequest req
    ) {
        return ResponseEntity.ok(seanceService.changerStatut(id, req));
    }
}

// ─────────────────────────────────────────────────────────────
// PaiementController – /paiements
// ─────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/paiements")
@RequiredArgsConstructor
@Tag(name = "Paiements")
class PaiementController {

    private final PaiementService paiementService;

    @PostMapping
    @Operation(summary = "Enregistrer un paiement")
    public ResponseEntity<PaiementResponse> creer(@Valid @RequestBody CreatePaiementRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paiementService.creer(req));
    }

    @PatchMapping("/{id}/confirmer")
    @Operation(summary = "Confirmer un paiement (statut → PAYE)")
    public ResponseEntity<PaiementResponse> confirmer(@PathVariable UUID id) {
        return ResponseEntity.ok(paiementService.confirmer(id));
    }

    @GetMapping("/prestation/{prestationId}")
    public ResponseEntity<List<PaiementResponse>> findByPrestation(@PathVariable UUID prestationId) {
        return ResponseEntity.ok(paiementService.findByPrestation(prestationId));
    }

    @GetMapping("/tuteur/{tuteurId}")
    public ResponseEntity<List<PaiementResponse>> findByTuteur(@PathVariable UUID tuteurId) {
        return ResponseEntity.ok(paiementService.findByTuteur(tuteurId));
    }
}

// ─────────────────────────────────────────────────────────────
// EvaluationController – /evaluations
// ─────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/evaluations")
@RequiredArgsConstructor
@Tag(name = "Évaluations")
class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    @Operation(summary = "Créer une évaluation (séance REALISEE uniquement)")
    public ResponseEntity<EvaluationResponse> creer(@Valid @RequestBody CreateEvaluationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluationService.creer(req));
    }

    @GetMapping("/seance/{seanceId}")
    public ResponseEntity<EvaluationResponse> findBySeance(@PathVariable UUID seanceId) {
        return ResponseEntity.ok(evaluationService.findBySeance(seanceId));
    }

    @GetMapping("/professeur/{professeurId}")
    public ResponseEntity<List<EvaluationResponse>> findByProfesseur(@PathVariable UUID professeurId) {
        return ResponseEntity.ok(evaluationService.findByProfesseur(professeurId));
    }
}
