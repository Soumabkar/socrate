package com.socrates.infrastructure.persistence.repository;

import com.socrates.infrastructure.persistence.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositories Spring Data JPA
 *
 * Responsabilité : abstraction de l'accès aux données.
 * Pattern Repository : isole la logique de persistance.
 * Spring Data génère automatiquement les implémentations
 * à partir des signatures de méthodes (convention de nommage).
 *
 * Clean Architecture : ces interfaces sont dans la couche Infrastructure.
 * Les services du domaine dépendent de ports (interfaces) en couche Domain,
 * pas directement de ces repositories JPA.
 */

@Repository
public interface TuteurLegalJpaRepository extends JpaRepository<TuteurLegalEntity, UUID> {
    Optional<TuteurLegalEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}

@Repository
public interface EleveJpaRepository extends JpaRepository<EleveEntity, UUID> {
    /** Tous les élèves d'un tuteur */
    List<EleveEntity> findByTuteurId(UUID tuteurId);
}

@Repository
public interface ProfesseurJpaRepository extends JpaRepository<ProfesseurEntity, UUID> {
    Optional<ProfesseurEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    List<ProfesseurEntity> findByValide(Boolean valide);
}

@Repository
public interface MatiereJpaRepository extends JpaRepository<MatiereEntity, UUID> {
    Optional<MatiereEntity> findByNom(String nom);
}

@Repository
public interface ProfesseurMatiereJpaRepository extends JpaRepository<ProfesseurMatiereEntity, UUID> {
    List<ProfesseurMatiereEntity> findByProfesseurId(UUID professeurId);

    /**
     * Vérifie l'habilitation : un professeur est-il autorisé sur cette matière ?
     * Utilisé par la règle métier de création de séance.
     */
    boolean existsByProfesseurIdAndMatiereId(UUID professeurId, UUID matiereId);
}

@Repository
public interface CoursJpaRepository extends JpaRepository<CoursEntity, UUID> {
    List<CoursEntity> findByMatiereId(UUID matiereId);
    List<CoursEntity> findByNiveau(String niveau);
}

@Repository
public interface PrestationJpaRepository extends JpaRepository<PrestationEntity, UUID> {
    List<PrestationEntity> findByEleveId(UUID eleveId);
    List<PrestationEntity> findByTuteurId(UUID tuteurId);
    List<PrestationEntity> findByStatut(String statut);
}

@Repository
public interface SeanceJpaRepository extends JpaRepository<SeanceEntity, UUID> {
    List<SeanceEntity> findByPrestationId(UUID prestationId);
    List<SeanceEntity> findByProfesseurId(UUID professeurId);
    List<SeanceEntity> findByEleveId(UUID eleveId);

    /**
     * Calcul du montant total d'une prestation :
     * somme des (duree_minutes / 60.0 * tarif_horaire) pour séances REALISEES.
     */
    @Query("""
        SELECT COALESCE(SUM(s.dureeMinutes / 60.0 * c.tarifHoraire), 0)
        FROM SeanceEntity s JOIN s.cours c
        WHERE s.prestation.id = :prestationId AND s.statut = 'REALISEE'
        """)
    java.math.BigDecimal calculerMontantTotal(@Param("prestationId") UUID prestationId);
}

@Repository
public interface PaiementJpaRepository extends JpaRepository<PaiementEntity, UUID> {
    List<PaiementEntity> findByPrestationId(UUID prestationId);
    List<PaiementEntity> findByTuteurId(UUID tuteurId);

    /** Somme des paiements payés pour une prestation (contrôle surfacturation) */
    @Query("""
        SELECT COALESCE(SUM(p.montant), 0)
        FROM PaiementEntity p
        WHERE p.prestation.id = :prestationId AND p.statut = 'PAYE'
        """)
    java.math.BigDecimal totalPaiementsPaye(@Param("prestationId") UUID prestationId);
}

@Repository
public interface EvaluationJpaRepository extends JpaRepository<EvaluationEntity, UUID> {
    Optional<EvaluationEntity> findBySeanceId(UUID seanceId);
    List<EvaluationEntity> findByProfesseurId(UUID professeurId);
}
