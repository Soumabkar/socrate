package com.socrates.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * ProfesseurMatiereEntity – Table d'habilitation.
 * Matérialise le périmètre d'enseignement d'un professeur.
 */
@Entity
@Table(name = "professeur_matiere",
       uniqueConstraints = @UniqueConstraint(columnNames = {"professeur_id","matiere_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfesseurMatiereEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professeur_id", nullable = false)
    private ProfesseurEntity professeur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matiere_id", nullable = false)
    private MatiereEntity matiere;

    @Column(name = "niveau_max", length = 50)
    private String niveauMax;
}
