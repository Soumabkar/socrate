package com.socrates.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * MatiereEntity – entité pivot référencée par COURS et PROFESSEUR_MATIERE.
 */
@Entity
@Table(name = "matiere")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MatiereEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;
}
