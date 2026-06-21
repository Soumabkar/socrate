package com.socrates.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

/* ═══════════════════════════════════════════════════
   CoursEntity – table cours
   Responsabilité : mapping cours/matière
═══════════════════════════════════════════════════ */
@Entity
@Table(name = "cours")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class CoursEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matiere_id", nullable = false)
    MatiereEntity matiere;

    @Column(nullable = false, length = 50)
    String niveau;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "tarif_horaire", precision = 8, scale = 2)
    BigDecimal tarifHoraire;
}

/* ═══════════════════════════════════════════════════
   PrestationEntity – agrégat de séances
═══════════════════════════════════════════════════ */
@Entity
@Table(name = "prestation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class PrestationEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "eleve_id", nullable = false)
    EleveEntity eleve;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tuteur_id", nullable = false)
    TuteurLegalEntity tuteur;

    @Column(nullable = false, length = 30)
    String periodicite;   // HEBDOMADAIRE, MENSUELLE, TRIMESTRIELLE, LIBRE

    @Column(name = "date_debut", nullable = false)
    LocalDate dateDebut;

    @Column(name = "date_fin")
    LocalDate dateFin;

    @Column(name = "montant_total", precision = 10, scale = 2)
    @Builder.Default
    BigDecimal montantTotal = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    @Builder.Default
    String statut = "EN_COURS";   // EN_COURS, CLOTUREE, ANNULEE

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    Instant createdAt;

    @OneToMany(mappedBy = "prestation", fetch = FetchType.LAZY)
    @Builder.Default
    List<SeanceEntity> seances = new ArrayList<>();
}

/* ═══════════════════════════════════════════════════
   SeanceEntity – séance individuelle
═══════════════════════════════════════════════════ */
@Entity
@Table(name = "seance")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class SeanceEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prestation_id", nullable = false)
    PrestationEntity prestation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "eleve_id", nullable = false)
    EleveEntity eleve;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professeur_id", nullable = false)
    ProfesseurEntity professeur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cours_id", nullable = false)
    CoursEntity cours;

    @Column(name = "date_heure_debut", nullable = false)
    LocalDateTime dateHeureDebut;

    @Column(name = "duree_minutes", nullable = false)
    int dureeMinutes;

    @Column(nullable = false, length = 30)
    @Builder.Default
    String statut = "PLANIFIEE";

    @Column(name = "adresse_domicile", columnDefinition = "TEXT")
    String adresseDomicile;

    @Column(columnDefinition = "TEXT")
    String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    Instant createdAt;
}

/* ═══════════════════════════════════════════════════
   PaiementEntity – paiement d'une prestation
═══════════════════════════════════════════════════ */
@Entity
@Table(name = "paiement")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class PaiementEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prestation_id", nullable = false)
    PrestationEntity prestation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tuteur_id", nullable = false)
    TuteurLegalEntity tuteur;

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal montant;

    @Column(name = "mode_paiement", length = 50)
    String modePaiement;

    @Column(nullable = false, length = 30)
    @Builder.Default
    String statut = "EN_ATTENTE";

    @Column(name = "date_paiement")
    Instant datePaiement;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    Instant createdAt;
}

/* ═══════════════════════════════════════════════════
   EvaluationEntity – évaluation d'une séance
═══════════════════════════════════════════════════ */
@Entity
@Table(name = "evaluation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class EvaluationEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seance_id", nullable = false, unique = true)
    SeanceEntity seance;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professeur_id", nullable = false)
    ProfesseurEntity professeur;

    @Column(name = "note_eleve")
    Integer noteEleve;

    @Column(columnDefinition = "TEXT")
    String commentaire;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    Instant createdAt;
}
