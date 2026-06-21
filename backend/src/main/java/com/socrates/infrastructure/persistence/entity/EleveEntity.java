package com.socrates.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * EleveEntity – Entité JPA table eleve.
 * Responsabilité : mapping O/R uniquement.
 */
@Entity
@Table(name = "eleve")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EleveEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tuteur_id", nullable = false)
    private TuteurLegalEntity tuteur;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "niveau_scolaire", length = 50)
    private String niveauScolaire;

    @Column(columnDefinition = "TEXT")
    private String adresse;

    @Column(length = 20)
    private String telephone;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
