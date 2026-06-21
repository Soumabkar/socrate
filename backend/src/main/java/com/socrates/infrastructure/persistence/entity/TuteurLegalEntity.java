package com.socrates.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * TuteurLegalEntity – Entité JPA de la table tuteur_legal.
 *
 * Responsabilité : représenter la structure de persistance.
 * NE contient PAS de logique métier — c'est un rôle réservé au Domain Model.
 *
 * Pattern : Séparation entité JPA / objet domaine (Clean Architecture).
 * Cela évite de lier la logique métier aux annotations JPA (@Entity, @Column…).
 */
@Entity
@Table(name = "tuteur_legal")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TuteurLegalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 20)
    private String telephone;

    @Column(columnDefinition = "TEXT")
    private String adresse;

    @Column(name = "type_lien", length = 50)
    private String typeLien;

    @Column(name = "contact_urgence_nom", length = 200)
    private String contactUrgenceNom;

    @Column(name = "contact_urgence_telephone", length = 20)
    private String contactUrgenceTelephone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 30)
    private String role;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "tuteur", fetch = FetchType.LAZY)
    @Builder.Default
    private List<EleveEntity> eleves = new ArrayList<>();
}
