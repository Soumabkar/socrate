package com.socrates.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * ProfesseurEntity – Entité JPA table professeur.
 */
@Entity
@Table(name = "professeur")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfesseurEntity {

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

    @Column(name = "tarif_horaire", precision = 8, scale = 2)
    private BigDecimal tarifHoraire;

    @Column(columnDefinition = "TEXT")
    private String disponibilites;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 30)
    private String role;

    @Column(nullable = false)
    @Builder.Default
    private Boolean valide = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "professeur", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProfesseurMatiereEntity> matieres = new ArrayList<>();
}
