package com.socrates.domain.service.impl;

import com.socrates.application.dto.request.*;
import com.socrates.application.dto.response.*;
import com.socrates.common.exception.*;
import com.socrates.infrastructure.persistence.entity.*;
import com.socrates.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

// ═══════════════════════════════════════════════════════════
// TuteurService
//
// Responsabilité : orchestrer la logique métier liée aux tuteurs légaux.
// - Création de compte tuteur (inscription du site)
// - Consultation / mise à jour du profil
// - NE gère PAS la logique de persistance (déléguée au repository)
// - NE gère PAS la sérialisation HTTP (déléguée au contrôleur)
//
// Pattern : Service Layer (fowler) – un service par agrégat métier.
// @Transactional : garantit l'atomicité des opérations multi-étapes.
// ═══════════════════════════════════════════════════════════
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TuteurService {

    private final TuteurLegalJpaRepository tuteurRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public TuteurResponse creer(CreateTuteurRequest req) {
        if (tuteurRepo.existsByEmail(req.email())) {
            throw new BusinessRuleException("Un compte existe déjà avec l'email : " + req.email());
        }
        TuteurLegalEntity entity = TuteurLegalEntity.builder()
            .nom(req.nom())
            .prenom(req.prenom())
            .email(req.email())
            .telephone(req.telephone())
            .adresse(req.adresse())
            .typeLien(req.typeLien())
            .contactUrgenceNom(req.contactUrgenceNom())
            .contactUrgenceTelephone(req.contactUrgenceTelephone())
            .passwordHash(passwordEncoder.encode(req.password()))
            .role("TUTEUR")
            .build();
        entity = tuteurRepo.save(entity);
        log.info("Tuteur créé : {}", entity.getId());
        return toResponse(entity);
    }

    public TuteurResponse findById(UUID id) {
        return toResponse(tuteurRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tuteur", id.toString())));
    }

    public List<TuteurResponse> findAll() {
        return tuteurRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TuteurResponse mettreAJour(UUID id, UpdateTuteurRequest req) {
        TuteurLegalEntity entity = tuteurRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tuteur", id.toString()));
        if (req.nom() != null) entity.setNom(req.nom());
        if (req.prenom() != null) entity.setPrenom(req.prenom());
        if (req.telephone() != null) entity.setTelephone(req.telephone());
        if (req.adresse() != null) entity.setAdresse(req.adresse());
        if (req.typeLien() != null) entity.setTypeLien(req.typeLien());
        if (req.contactUrgenceNom() != null) entity.setContactUrgenceNom(req.contactUrgenceNom());
        if (req.contactUrgenceTelephone() != null) entity.setContactUrgenceTelephone(req.contactUrgenceTelephone());
        return toResponse(tuteurRepo.save(entity));
    }

    private TuteurResponse toResponse(TuteurLegalEntity e) {
        return new TuteurResponse(e.getId(), e.getNom(), e.getPrenom(), e.getEmail(),
            e.getTelephone(), e.getAdresse(), e.getTypeLien(),
            e.getContactUrgenceNom(), e.getContactUrgenceTelephone(), e.getCreatedAt());
    }
}

// ═══════════════════════════════════════════════════════════
// EleveService
// Responsabilité : gestion du cycle de vie des élèves.
// Vérifie l'existence du tuteur avant toute création.
// ═══════════════════════════════════════════════════════════
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
class EleveService {

    private final EleveJpaRepository eleveRepo;
    private final TuteurLegalJpaRepository tuteurRepo;

    @Transactional
    public EleveResponse creer(CreateEleveRequest req) {
        TuteurLegalEntity tuteur = tuteurRepo.findById(req.tuteurId())
            .orElseThrow(() -> new ResourceNotFoundException("Tuteur", req.tuteurId().toString()));
        EleveEntity entity = EleveEntity.builder()
            .tuteur(tuteur)
            .nom(req.nom())
            .prenom(req.prenom())
            .dateNaissance(req.dateNaissance())
            .niveauScolaire(req.niveauScolaire())
            .adresse(req.adresse())
            .telephone(req.telephone())
            .build();
        entity = eleveRepo.save(entity);
        log.info("Élève créé : {} pour tuteur {}", entity.getId(), tuteur.getId());
        return toResponse(entity);
    }

    public EleveResponse findById(UUID id) {
        return toResponse(eleveRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Élève", id.toString())));
    }

    public List<EleveResponse> findByTuteur(UUID tuteurId) {
        return eleveRepo.findByTuteurId(tuteurId).stream().map(this::toResponse).toList();
    }

    public List<EleveResponse> findAll() {
        return eleveRepo.findAll().stream().map(this::toResponse).toList();
    }

    private EleveResponse toResponse(EleveEntity e) {
        return new EleveResponse(e.getId(), e.getTuteur().getId(),
            e.getTuteur().getNom() + " " + e.getTuteur().getPrenom(),
            e.getNom(), e.getPrenom(), e.getDateNaissance(),
            e.getNiveauScolaire(), e.getAdresse(), e.getTelephone());
    }
}

// ═══════════════════════════════════════════════════════════
// ProfesseurService
// Responsabilité : inscription, validation et gestion des professeurs.
// Un professeur est d'abord non-validé (valide=false) jusqu'à
// validation par un agent Socrates.
// ═══════════════════════════════════════════════════════════
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
class ProfesseurService {

    private final ProfesseurJpaRepository professeurRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ProfesseurResponse inscrire(CreateProfesseurRequest req) {
        if (professeurRepo.existsByEmail(req.email())) {
            throw new BusinessRuleException("Un professeur existe déjà avec l'email : " + req.email());
        }
        ProfesseurEntity entity = ProfesseurEntity.builder()
            .nom(req.nom())
            .prenom(req.prenom())
            .email(req.email())
            .telephone(req.telephone())
            .tarifHoraire(req.tarifHoraire())
            .disponibilites(req.disponibilites())
            .passwordHash(passwordEncoder.encode(req.password()))
            .role("PROFESSEUR")
            .valide(false)
            .build();
        entity = professeurRepo.save(entity);
        log.info("Professeur inscrit (en attente validation) : {}", entity.getId());
        return toResponse(entity);
    }

    @Transactional
    public ProfesseurResponse valider(UUID id) {
        ProfesseurEntity entity = professeurRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Professeur", id.toString()));
        entity.setValide(true);
        log.info("Professeur validé : {}", id);
        return toResponse(professeurRepo.save(entity));
    }

    public ProfesseurResponse findById(UUID id) {
        return toResponse(professeurRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Professeur", id.toString())));
    }

    public List<ProfesseurResponse> findAll() {
        return professeurRepo.findAll().stream().map(this::toResponse).toList();
    }

    public List<ProfesseurResponse> findNonValides() {
        return professeurRepo.findByValide(false).stream().map(this::toResponse).toList();
    }

    private ProfesseurResponse toResponse(ProfesseurEntity e) {
        return new ProfesseurResponse(e.getId(), e.getNom(), e.getPrenom(), e.getEmail(),
            e.getTelephone(), e.getTarifHoraire(), e.getDisponibilites(), e.getValide(), e.getCreatedAt());
    }
}

// ═══════════════════════════════════════════════════════════
// MatiereService
// Responsabilité : CRUD simple des matières enseignées.
// ═══════════════════════════════════════════════════════════
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
class MatiereService {

    private final MatiereJpaRepository matiereRepo;

    public List<MatiereResponse> findAll() {
        return matiereRepo.findAll().stream()
            .map(m -> new MatiereResponse(m.getId(), m.getNom(), m.getDescription()))
            .toList();
    }

    public MatiereResponse findById(UUID id) {
        MatiereEntity m = matiereRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Matière", id.toString()));
        return new MatiereResponse(m.getId(), m.getNom(), m.getDescription());
    }
}
