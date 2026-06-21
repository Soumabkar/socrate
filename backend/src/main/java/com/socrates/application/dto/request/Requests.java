package com.socrates.application.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTOs de requête (entrée API)
 *
 * Responsabilité : transporter et valider les données entrantes.
 * Ils font office de contrat d'API côté client Angular.
 * La validation est déclarative via annotations Bean Validation.
 * Ils sont DISTINCTS des entités JPA et des objets domaine —
 * ce qui permet de faire évoluer l'API sans impacter la persistance.
 */

// ─── AUTH ─────────────────────────────────────────────────
public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6) String password
) {}

// ─── TUTEUR LÉGAL ─────────────────────────────────────────
public record CreateTuteurRequest(
    @NotBlank @Size(max = 100) String nom,
    @NotBlank @Size(max = 100) String prenom,
    @NotBlank @Email String email,
    @Size(max = 20) String telephone,
    String adresse,
    @NotBlank @Size(max = 50) String typeLien,
    String contactUrgenceNom,
    String contactUrgenceTelephone,
    @NotBlank @Size(min = 8) String password
) {}

public record UpdateTuteurRequest(
    @Size(max = 100) String nom,
    @Size(max = 100) String prenom,
    @Size(max = 20) String telephone,
    String adresse,
    String typeLien,
    String contactUrgenceNom,
    String contactUrgenceTelephone
) {}

// ─── ÉLÈVE ────────────────────────────────────────────────
public record CreateEleveRequest(
    @NotNull UUID tuteurId,
    @NotBlank @Size(max = 100) String nom,
    @NotBlank @Size(max = 100) String prenom,
    LocalDate dateNaissance,
    @NotBlank String niveauScolaire,
    String adresse,
    String telephone
) {}

// ─── PROFESSEUR ───────────────────────────────────────────
public record CreateProfesseurRequest(
    @NotBlank @Size(max = 100) String nom,
    @NotBlank @Size(max = 100) String prenom,
    @NotBlank @Email String email,
    @Size(max = 20) String telephone,
    @DecimalMin("0") BigDecimal tarifHoraire,
    String disponibilites,
    @NotBlank @Size(min = 8) String password
) {}

// ─── HABILITATION ─────────────────────────────────────────
public record AddHabilitationRequest(
    @NotNull UUID professeurId,
    @NotNull UUID matiereId,
    String niveauMax
) {}

// ─── COURS ────────────────────────────────────────────────
public record CreateCoursRequest(
    @NotNull UUID matiereId,
    @NotBlank String niveau,
    String description,
    @DecimalMin("0") BigDecimal tarifHoraire
) {}

// ─── PRESTATION ───────────────────────────────────────────
public record CreatePrestationRequest(
    @NotNull UUID eleveId,
    @NotNull UUID tuteurId,
    @NotBlank String periodicite,
    @NotNull LocalDate dateDebut,
    LocalDate dateFin
) {}

// ─── SÉANCE ───────────────────────────────────────────────
public record CreateSeanceRequest(
    @NotNull UUID prestationId,
    @NotNull UUID eleveId,
    @NotNull UUID professeurId,
    @NotNull UUID coursId,
    @NotNull java.time.LocalDateTime dateHeureDebut,
    @Min(15) int dureeMinutes,
    String adresseDomicile,
    String notes
) {}

public record UpdateSeanceStatutRequest(
    @NotBlank String statut
) {}

// ─── PAIEMENT ─────────────────────────────────────────────
public record CreatePaiementRequest(
    @NotNull UUID prestationId,
    @NotNull UUID tuteurId,
    @NotNull @DecimalMin("0.01") BigDecimal montant,
    @NotBlank String modePaiement
) {}

// ─── ÉVALUATION ───────────────────────────────────────────
public record CreateEvaluationRequest(
    @NotNull UUID seanceId,
    @NotNull UUID professeurId,
    @Min(1) @Max(20) Integer noteEleve,
    String commentaire
) {}
