package com.socrates.domain.service;

import com.socrates.application.dto.request.*;
import com.socrates.application.dto.response.*;
import com.socrates.common.exception.*;
import com.socrates.domain.service.impl.*;
import com.socrates.infrastructure.persistence.entity.*;
import com.socrates.infrastructure.persistence.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

/**
 * SeanceServiceTest – Tests unitaires du service métier principal.
 *
 * Stratégie :
 * - @ExtendWith(MockitoExtension) : injection des mocks sans contexte Spring
 * - BDD style (given/when/then) pour la lisibilité
 * - Chaque test vérifie UNE responsabilité précise
 * - Les contraintes métier sont testées avec assertThatThrownBy
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SeanceService – Tests unitaires")
class SeanceServiceTest {

    @Mock private SeanceJpaRepository seanceRepo;
    @Mock private PrestationJpaRepository prestationRepo;
    @Mock private EleveJpaRepository eleveRepo;
    @Mock private ProfesseurJpaRepository professeurRepo;
    @Mock private CoursJpaRepository coursRepo;
    @Mock private ProfesseurMatiereJpaRepository habilitationRepo;
    @Mock private PrestationService prestationService;

    @InjectMocks
    private SeanceService seanceService;

    private UUID prestationId, eleveId, professeurId, coursId, matiereId;
    private PrestationEntity prestation;
    private EleveEntity eleve;
    private ProfesseurEntity professeur;
    private CoursEntity cours;
    private MatiereEntity matiere;

    @BeforeEach
    void setUp() {
        prestationId  = UUID.randomUUID();
        eleveId       = UUID.randomUUID();
        professeurId  = UUID.randomUUID();
        coursId       = UUID.randomUUID();
        matiereId     = UUID.randomUUID();

        matiere = MatiereEntity.builder().id(matiereId).nom("Mathématiques").build();
        eleve   = EleveEntity.builder().id(eleveId).nom("Dupont").prenom("Paul").build();
        professeur = ProfesseurEntity.builder()
            .id(professeurId).nom("Martin").prenom("Jean")
            .valide(true).build();
        cours = CoursEntity.builder()
            .id(coursId).matiere(matiere).niveau("3ème")
            .tarifHoraire(new BigDecimal("5000")).build();
        prestation = PrestationEntity.builder()
            .id(prestationId).eleve(eleve).build();
    }

    // ── Test 1 : création réussie ──────────────────────────────────────────
    @Test
    @DisplayName("creer() – doit créer une séance quand toutes les contraintes sont satisfaites")
    void creer_succes() {
        // GIVEN
        CreateSeanceRequest req = new CreateSeanceRequest(
            prestationId, eleveId, professeurId, coursId,
            LocalDateTime.now().plusDays(1), 60, "Rue de la Paix", null
        );
        SeanceEntity saved = SeanceEntity.builder()
            .id(UUID.randomUUID()).prestation(prestation).eleve(eleve)
            .professeur(professeur).cours(cours)
            .dateHeureDebut(req.dateHeureDebut()).dureeMinutes(60)
            .statut("PLANIFIEE").build();

        given(prestationRepo.findById(prestationId)).willReturn(Optional.of(prestation));
        given(eleveRepo.findById(eleveId)).willReturn(Optional.of(eleve));
        given(professeurRepo.findById(professeurId)).willReturn(Optional.of(professeur));
        given(coursRepo.findById(coursId)).willReturn(Optional.of(cours));
        given(habilitationRepo.existsByProfesseurIdAndMatiereId(professeurId, matiereId)).willReturn(true);
        given(seanceRepo.save(any())).willReturn(saved);

        // WHEN
        SeanceResponse result = seanceService.creer(req);

        // THEN
        assertThat(result).isNotNull();
        assertThat(result.statut()).isEqualTo("PLANIFIEE");
        then(seanceRepo).should(times(1)).save(any(SeanceEntity.class));
    }

    // ── Test 2 : contrainte habilitation ──────────────────────────────────
    @Test
    @DisplayName("creer() – doit lever BusinessRuleException si professeur non habilité")
    void creer_professeurNonHabilite_leveException() {
        // GIVEN
        CreateSeanceRequest req = new CreateSeanceRequest(
            prestationId, eleveId, professeurId, coursId,
            LocalDateTime.now().plusDays(1), 60, null, null
        );
        given(prestationRepo.findById(prestationId)).willReturn(Optional.of(prestation));
        given(eleveRepo.findById(eleveId)).willReturn(Optional.of(eleve));
        given(professeurRepo.findById(professeurId)).willReturn(Optional.of(professeur));
        given(coursRepo.findById(coursId)).willReturn(Optional.of(cours));
        given(habilitationRepo.existsByProfesseurIdAndMatiereId(professeurId, matiereId))
            .willReturn(false); // ← non habilité

        // WHEN / THEN
        assertThatThrownBy(() -> seanceService.creer(req))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("habilité");

        then(seanceRepo).should(never()).save(any());
    }

    // ── Test 3 : contrainte professeur non validé ─────────────────────────
    @Test
    @DisplayName("creer() – doit lever BusinessRuleException si professeur non validé")
    void creer_professeurNonValide_leveException() {
        // GIVEN
        professeur.setValide(false);
        CreateSeanceRequest req = new CreateSeanceRequest(
            prestationId, eleveId, professeurId, coursId,
            LocalDateTime.now().plusDays(1), 60, null, null
        );
        given(prestationRepo.findById(prestationId)).willReturn(Optional.of(prestation));
        given(eleveRepo.findById(eleveId)).willReturn(Optional.of(eleve));
        given(professeurRepo.findById(professeurId)).willReturn(Optional.of(professeur));
        given(coursRepo.findById(coursId)).willReturn(Optional.of(cours));
        given(habilitationRepo.existsByProfesseurIdAndMatiereId(professeurId, matiereId)).willReturn(true);

        // WHEN / THEN
        assertThatThrownBy(() -> seanceService.creer(req))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("validé");
    }

    // ── Test 4 : contrainte cohérence élève / prestation ──────────────────
    @Test
    @DisplayName("creer() – doit lever BusinessRuleException si élève ne correspond pas à la prestation")
    void creer_eleveIncoherent_leveException() {
        // GIVEN – prestation appartient à un autre élève
        EleveEntity autreEleve = EleveEntity.builder().id(UUID.randomUUID()).build();
        PrestationEntity prestationAutreEleve = PrestationEntity.builder()
            .id(prestationId).eleve(autreEleve).build();

        CreateSeanceRequest req = new CreateSeanceRequest(
            prestationId, eleveId, professeurId, coursId,
            LocalDateTime.now().plusDays(1), 60, null, null
        );
        given(prestationRepo.findById(prestationId)).willReturn(Optional.of(prestationAutreEleve));
        given(eleveRepo.findById(eleveId)).willReturn(Optional.of(eleve));
        given(professeurRepo.findById(professeurId)).willReturn(Optional.of(professeur));
        given(coursRepo.findById(coursId)).willReturn(Optional.of(cours));

        // WHEN / THEN
        assertThatThrownBy(() -> seanceService.creer(req))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("prestation");
    }

    // ── Test 5 : changerStatut → recalcul montant prestation ──────────────
    @Test
    @DisplayName("changerStatut(REALISEE) – doit déclencher le recalcul du montant prestation")
    void changerStatut_realisee_recalculeMontant() {
        // GIVEN
        SeanceEntity seance = SeanceEntity.builder()
            .id(UUID.randomUUID()).prestation(prestation).eleve(eleve)
            .professeur(professeur).cours(cours).statut("PLANIFIEE")
            .dateHeureDebut(LocalDateTime.now()).dureeMinutes(60).build();

        given(seanceRepo.findById(seance.getId())).willReturn(Optional.of(seance));
        given(seanceRepo.save(any())).willReturn(seance);

        // WHEN
        seanceService.changerStatut(seance.getId(), new UpdateSeanceStatutRequest("REALISEE"));

        // THEN – le service de prestation doit être appelé pour recalcul
        then(prestationService).should(times(1))
            .recalculerMontant(eq(prestationId), eq(seanceRepo));
    }

    // ── Test 6 : ressource introuvable ────────────────────────────────────
    @Test
    @DisplayName("findById() – doit lever ResourceNotFoundException si séance inexistante")
    void findById_inexistant_leveException() {
        UUID unknown = UUID.randomUUID();
        given(seanceRepo.findById(unknown)).willReturn(Optional.empty());

        assertThatThrownBy(() -> seanceService.findById(unknown))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining(unknown.toString());
    }
}
