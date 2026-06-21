package com.socrates.domain.service.impl;

import com.socrates.application.dto.request.*;
import com.socrates.application.dto.response.*;
import com.socrates.common.exception.*;
import com.socrates.infrastructure.persistence.entity.*;
import com.socrates.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

// ═══════════════════════════════════════════════════════════
// PrestationService
//
// Responsabilité : gérer le cycle de vie d'une prestation.
// Une prestation regroupe des séances sur une période et
// fait l'objet d'un paiement par le tuteur légal.
// ═══════════════════════════════════════════════════════════
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PrestationService {

    private final PrestationJpaRepository prestationRepo;
    private final EleveJpaRepository eleveRepo;
    private final TuteurLegalJpaRepository tuteurRepo;

    @Transactional
    public PrestationResponse creer(CreatePrestationRequest req) {
        EleveEntity eleve = eleveRepo.findById(req.eleveId())
            .orElseThrow(() -> new ResourceNotFoundException("Élève", req.eleveId().toString()));
        TuteurLegalEntity tuteur = tuteurRepo.findById(req.tuteurId())
            .orElseThrow(() -> new ResourceNotFoundException("Tuteur", req.tuteurId().toString()));

        // Contrainte : le tuteur doit être responsable de l'élève
        if (!eleve.getTuteur().getId().equals(tuteur.getId())) {
            throw new BusinessRuleException(
                "Le tuteur n'est pas responsable de cet élève.");
        }

        PrestationEntity entity = PrestationEntity.builder()
            .eleve(eleve)
            .tuteur(tuteur)
            .periodicite(req.periodicite())
            .dateDebut(req.dateDebut())
            .dateFin(req.dateFin())
            .montantTotal(BigDecimal.ZERO)
            .statut("EN_COURS")
            .build();
        entity = prestationRepo.save(entity);
        log.info("Prestation créée : {} pour élève {}", entity.getId(), eleve.getId());
        return toResponse(entity);
    }

    public PrestationResponse findById(UUID id) {
        return toResponse(prestationRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Prestation", id.toString())));
    }

    public List<PrestationResponse> findByEleve(UUID eleveId) {
        return prestationRepo.findByEleveId(eleveId).stream().map(this::toResponse).toList();
    }

    public List<PrestationResponse> findByTuteur(UUID tuteurId) {
        return prestationRepo.findByTuteurId(tuteurId).stream().map(this::toResponse).toList();
    }

    public List<PrestationResponse> findAll() {
        return prestationRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public PrestationResponse cloturer(UUID id) {
        PrestationEntity entity = prestationRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Prestation", id.toString()));
        if (!"EN_COURS".equals(entity.getStatut())) {
            throw new BusinessRuleException("Seule une prestation EN_COURS peut être clôturée.");
        }
        entity.setStatut("CLOTUREE");
        return toResponse(prestationRepo.save(entity));
    }

    /** Recalcule le montant_total d'une prestation (appelé par SeanceService) */
    @Transactional
    public void recalculerMontant(UUID prestationId, SeanceJpaRepository seanceRepo) {
        PrestationEntity prestation = prestationRepo.findById(prestationId)
            .orElseThrow(() -> new ResourceNotFoundException("Prestation", prestationId.toString()));
        BigDecimal montant = seanceRepo.calculerMontantTotal(prestationId);
        prestation.setMontantTotal(montant);
        prestationRepo.save(prestation);
        log.debug("Montant prestation {} recalculé : {}", prestationId, montant);
    }

    private PrestationResponse toResponse(PrestationEntity e) {
        return new PrestationResponse(e.getId(),
            e.getEleve().getId(), e.getEleve().getNom() + " " + e.getEleve().getPrenom(),
            e.getTuteur().getId(), e.getTuteur().getNom() + " " + e.getTuteur().getPrenom(),
            e.getPeriodicite(), e.getDateDebut(), e.getDateFin(),
            e.getMontantTotal(), e.getStatut(), e.getCreatedAt());
    }
}

// ═══════════════════════════════════════════════════════════
// SeanceService
//
// Responsabilité : créer et gérer des séances.
//
// CONTRAINTE MÉTIER CENTRALE :
//   Avant toute création de séance, vérifier que le professeur
//   est habilité sur la matière du cours associé
//   (via ProfesseurMatiereJpaRepository).
//
// Après chaque changement de statut en REALISEE,
//   déclencher le recalcul du montant_total de la prestation.
// ═══════════════════════════════════════════════════════════
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SeanceService {

    private final SeanceJpaRepository seanceRepo;
    private final PrestationJpaRepository prestationRepo;
    private final EleveJpaRepository eleveRepo;
    private final ProfesseurJpaRepository professeurRepo;
    private final CoursJpaRepository coursRepo;
    private final ProfesseurMatiereJpaRepository habilitationRepo;
    private final PrestationService prestationService;

    @Transactional
    public SeanceResponse creer(CreateSeanceRequest req) {
        PrestationEntity prestation = prestationRepo.findById(req.prestationId())
            .orElseThrow(() -> new ResourceNotFoundException("Prestation", req.prestationId().toString()));
        EleveEntity eleve = eleveRepo.findById(req.eleveId())
            .orElseThrow(() -> new ResourceNotFoundException("Élève", req.eleveId().toString()));
        ProfesseurEntity professeur = professeurRepo.findById(req.professeurId())
            .orElseThrow(() -> new ResourceNotFoundException("Professeur", req.professeurId().toString()));
        CoursEntity cours = coursRepo.findById(req.coursId())
            .orElseThrow(() -> new ResourceNotFoundException("Cours", req.coursId().toString()));

        // ── Contrainte 1 : cohérence élève / prestation
        if (!prestation.getEleve().getId().equals(eleve.getId())) {
            throw new BusinessRuleException(
                "L'élève de la séance ne correspond pas à celui de la prestation.");
        }

        // ── Contrainte 2 : habilitation professeur / matière (règle métier principale)
        UUID matiereId = cours.getMatiere().getId();
        if (!habilitationRepo.existsByProfesseurIdAndMatiereId(professeur.getId(), matiereId)) {
            throw new BusinessRuleException(String.format(
                "Le professeur %s %s n'est pas habilité sur la matière '%s'.",
                professeur.getPrenom(), professeur.getNom(), cours.getMatiere().getNom()));
        }

        // ── Contrainte 3 : professeur validé
        if (!professeur.getValide()) {
            throw new BusinessRuleException("Le professeur n'a pas encore été validé par Socrates.");
        }

        SeanceEntity entity = SeanceEntity.builder()
            .prestation(prestation)
            .eleve(eleve)
            .professeur(professeur)
            .cours(cours)
            .dateHeureDebut(req.dateHeureDebut())
            .dureeMinutes(req.dureeMinutes())
            .statut("PLANIFIEE")
            .adresseDomicile(req.adresseDomicile())
            .notes(req.notes())
            .build();
        entity = seanceRepo.save(entity);
        log.info("Séance créée : {} – prof {} – cours {}", entity.getId(), professeur.getId(), cours.getId());
        return toResponse(entity);
    }

    @Transactional
    public SeanceResponse changerStatut(UUID id, UpdateSeanceStatutRequest req) {
        SeanceEntity entity = seanceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Séance", id.toString()));
        entity.setStatut(req.statut());
        entity = seanceRepo.save(entity);
        // Si la séance passe en REALISEE → recalcul du montant de la prestation
        if ("REALISEE".equals(req.statut())) {
            prestationService.recalculerMontant(entity.getPrestation().getId(), seanceRepo);
        }
        return toResponse(entity);
    }

    public SeanceResponse findById(UUID id) {
        return toResponse(seanceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Séance", id.toString())));
    }

    public List<SeanceResponse> findByPrestation(UUID prestationId) {
        return seanceRepo.findByPrestationId(prestationId).stream().map(this::toResponse).toList();
    }

    public List<SeanceResponse> findByProfesseur(UUID professeurId) {
        return seanceRepo.findByProfesseurId(professeurId).stream().map(this::toResponse).toList();
    }

    public List<SeanceResponse> findByEleve(UUID eleveId) {
        return seanceRepo.findByEleveId(eleveId).stream().map(this::toResponse).toList();
    }

    private SeanceResponse toResponse(SeanceEntity e) {
        return new SeanceResponse(e.getId(), e.getPrestation().getId(),
            e.getEleve().getId(), e.getEleve().getNom() + " " + e.getEleve().getPrenom(),
            e.getProfesseur().getId(), e.getProfesseur().getNom() + " " + e.getProfesseur().getPrenom(),
            e.getCours().getId(), e.getCours().getMatiere().getNom() + " " + e.getCours().getNiveau(),
            e.getDateHeureDebut(), e.getDureeMinutes(), e.getStatut(),
            e.getAdresseDomicile(), e.getNotes());
    }
}

// ═══════════════════════════════════════════════════════════
// PaiementService
//
// Responsabilité : enregistrer et suivre les paiements.
//
// CONTRAINTE MÉTIER :
//   Le cumul des paiements PAYE ne peut pas dépasser
//   le montant_total de la prestation.
// ═══════════════════════════════════════════════════════════
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaiementService {

    private final PaiementJpaRepository paiementRepo;
    private final PrestationJpaRepository prestationRepo;
    private final TuteurLegalJpaRepository tuteurRepo;

    @Transactional
    public PaiementResponse creer(CreatePaiementRequest req) {
        PrestationEntity prestation = prestationRepo.findById(req.prestationId())
            .orElseThrow(() -> new ResourceNotFoundException("Prestation", req.prestationId().toString()));
        TuteurLegalEntity tuteur = tuteurRepo.findById(req.tuteurId())
            .orElseThrow(() -> new ResourceNotFoundException("Tuteur", req.tuteurId().toString()));

        // Contrainte : total paiements ne peut dépasser montant_total
        BigDecimal dejaPayé = paiementRepo.totalPaiementsPaye(req.prestationId());
        if (dejaPayé.add(req.montant()).compareTo(prestation.getMontantTotal()) > 0) {
            throw new BusinessRuleException(String.format(
                "Le paiement (%.2f) dépasse le montant restant dû (%.2f).",
                req.montant(), prestation.getMontantTotal().subtract(dejaPayé)));
        }

        PaiementEntity entity = PaiementEntity.builder()
            .prestation(prestation)
            .tuteur(tuteur)
            .montant(req.montant())
            .modePaiement(req.modePaiement())
            .statut("EN_ATTENTE")
            .build();
        entity = paiementRepo.save(entity);
        log.info("Paiement enregistré : {} – prestation {}", entity.getId(), prestation.getId());
        return toResponse(entity);
    }

    @Transactional
    public PaiementResponse confirmer(UUID id) {
        PaiementEntity entity = paiementRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Paiement", id.toString()));
        entity.setStatut("PAYE");
        entity.setDatePaiement(Instant.now());
        return toResponse(paiementRepo.save(entity));
    }

    public List<PaiementResponse> findByPrestation(UUID prestationId) {
        return paiementRepo.findByPrestationId(prestationId).stream().map(this::toResponse).toList();
    }

    public List<PaiementResponse> findByTuteur(UUID tuteurId) {
        return paiementRepo.findByTuteurId(tuteurId).stream().map(this::toResponse).toList();
    }

    private PaiementResponse toResponse(PaiementEntity e) {
        return new PaiementResponse(e.getId(), e.getPrestation().getId(),
            e.getTuteur().getId(), e.getTuteur().getNom() + " " + e.getTuteur().getPrenom(),
            e.getMontant(), e.getModePaiement(), e.getStatut(), e.getDatePaiement());
    }
}

// ═══════════════════════════════════════════════════════════
// EvaluationService
//
// Responsabilité : créer une évaluation après une séance.
// Contrainte : une seule évaluation par séance.
// ═══════════════════════════════════════════════════════════
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EvaluationService {

    private final EvaluationJpaRepository evaluationRepo;
    private final SeanceJpaRepository seanceRepo;
    private final ProfesseurJpaRepository professeurRepo;

    @Transactional
    public EvaluationResponse creer(CreateEvaluationRequest req) {
        if (evaluationRepo.findBySeanceId(req.seanceId()).isPresent()) {
            throw new BusinessRuleException("Une évaluation existe déjà pour cette séance.");
        }
        SeanceEntity seance = seanceRepo.findById(req.seanceId())
            .orElseThrow(() -> new ResourceNotFoundException("Séance", req.seanceId().toString()));
        if (!"REALISEE".equals(seance.getStatut())) {
            throw new BusinessRuleException("Une évaluation ne peut être créée que pour une séance REALISEE.");
        }
        ProfesseurEntity professeur = professeurRepo.findById(req.professeurId())
            .orElseThrow(() -> new ResourceNotFoundException("Professeur", req.professeurId().toString()));

        EvaluationEntity entity = EvaluationEntity.builder()
            .seance(seance)
            .professeur(professeur)
            .noteEleve(req.noteEleve())
            .commentaire(req.commentaire())
            .build();
        entity = evaluationRepo.save(entity);
        return toResponse(entity);
    }

    public EvaluationResponse findBySeance(UUID seanceId) {
        return toResponse(evaluationRepo.findBySeanceId(seanceId)
            .orElseThrow(() -> new ResourceNotFoundException("Évaluation", "séance:" + seanceId)));
    }

    public List<EvaluationResponse> findByProfesseur(UUID professeurId) {
        return evaluationRepo.findByProfesseurId(professeurId).stream().map(this::toResponse).toList();
    }

    private EvaluationResponse toResponse(EvaluationEntity e) {
        return new EvaluationResponse(e.getId(), e.getSeance().getId(),
            e.getProfesseur().getId(), e.getProfesseur().getNom() + " " + e.getProfesseur().getPrenom(),
            e.getNoteEleve(), e.getCommentaire(), e.getCreatedAt());
    }
}
