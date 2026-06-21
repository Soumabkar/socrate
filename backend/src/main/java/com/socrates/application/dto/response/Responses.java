package com.socrates.application.dto.response;

import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

/**
 * DTOs de réponse (sortie API)
 *
 * Responsabilité : exposer uniquement les données nécessaires au client.
 * Pattern : on n'expose JAMAIS les entités JPA directement dans l'API
 * (risque de sérialisation cyclique, exposition de données sensibles,
 * couplage fort entre API et persistance).
 *
 * Les records Java 21 sont parfaits ici : immutables, concis, pas de boilerplate.
 */

// ─── AUTH ─────────────────────────────────────────────────
public record AuthResponse(String token, String role, UUID userId, String nomComplet) {}

// ─── TUTEUR ───────────────────────────────────────────────
public record TuteurResponse(
    UUID id, String nom, String prenom, String email,
    String telephone, String adresse, String typeLien,
    String contactUrgenceNom, String contactUrgenceTelephone,
    Instant createdAt
) {}

// ─── ÉLÈVE ────────────────────────────────────────────────
public record EleveResponse(
    UUID id, UUID tuteurId, String nomTuteur,
    String nom, String prenom, LocalDate dateNaissance,
    String niveauScolaire, String adresse, String telephone
) {}

// ─── PROFESSEUR ───────────────────────────────────────────
public record ProfesseurResponse(
    UUID id, String nom, String prenom, String email,
    String telephone, BigDecimal tarifHoraire,
    String disponibilites, Boolean valide, Instant createdAt
) {}

// ─── MATIÈRE ──────────────────────────────────────────────
public record MatiereResponse(UUID id, String nom, String description) {}

// ─── HABILITATION ─────────────────────────────────────────
public record HabilitationResponse(
    UUID id, UUID professeurId, String nomProfesseur,
    UUID matiereId, String nomMatiere, String niveauMax
) {}

// ─── COURS ────────────────────────────────────────────────
public record CoursResponse(
    UUID id, UUID matiereId, String nomMatiere,
    String niveau, String description, BigDecimal tarifHoraire
) {}

// ─── PRESTATION ───────────────────────────────────────────
public record PrestationResponse(
    UUID id, UUID eleveId, String nomEleve,
    UUID tuteurId, String nomTuteur,
    String periodicite, LocalDate dateDebut, LocalDate dateFin,
    BigDecimal montantTotal, String statut, Instant createdAt
) {}

// ─── SÉANCE ───────────────────────────────────────────────
public record SeanceResponse(
    UUID id, UUID prestationId,
    UUID eleveId, String nomEleve,
    UUID professeurId, String nomProfesseur,
    UUID coursId, String nomCours,
    LocalDateTime dateHeureDebut, int dureeMinutes,
    String statut, String adresseDomicile, String notes
) {}

// ─── PAIEMENT ─────────────────────────────────────────────
public record PaiementResponse(
    UUID id, UUID prestationId, UUID tuteurId,
    String nomTuteur, BigDecimal montant,
    String modePaiement, String statut, Instant datePaiement
) {}

// ─── ÉVALUATION ───────────────────────────────────────────
public record EvaluationResponse(
    UUID id, UUID seanceId, UUID professeurId,
    String nomProfesseur, Integer noteEleve,
    String commentaire, Instant createdAt
) {}

// ─── GENERIC PAGE ─────────────────────────────────────────
public record PageResponse<T>(
    java.util.List<T> content,
    int totalElements, int totalPages, int page, int size
) {}
