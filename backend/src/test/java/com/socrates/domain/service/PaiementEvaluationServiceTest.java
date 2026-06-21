package com.socrates.domain.service;

import com.socrates.application.dto.request.*;
import com.socrates.common.exception.*;
import com.socrates.domain.service.impl.*;
import com.socrates.infrastructure.persistence.entity.*;
import com.socrates.infrastructure.persistence.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

/**
 * PaiementServiceTest – Teste les contraintes métier de paiement.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PaiementService – Tests unitaires")
class PaiementServiceTest {

    @Mock private PaiementJpaRepository paiementRepo;
    @Mock private PrestationJpaRepository prestationRepo;
    @Mock private TuteurLegalJpaRepository tuteurRepo;

    @InjectMocks
    private PaiementService paiementService;

    private UUID prestationId, tuteurId;
    private PrestationEntity prestation;
    private TuteurLegalEntity tuteur;

    @BeforeEach
    void setUp() {
        prestationId = UUID.randomUUID();
        tuteurId     = UUID.randomUUID();
        tuteur       = TuteurLegalEntity.builder().id(tuteurId).nom("Dupont").prenom("Marie").build();
        prestation   = PrestationEntity.builder()
            .id(prestationId).tuteur(tuteur)
            .montantTotal(new BigDecimal("10000")) // 10 000 XOF
            .statut("EN_COURS").build();
    }

    @Test
    @DisplayName("creer() – doit accepter un paiement dans les limites du montant total")
    void creer_paiementValide() {
        // GIVEN – déjà payé : 3000, on veut payer 5000 → total 8000 < 10000 OK
        CreatePaiementRequest req = new CreatePaiementRequest(
            prestationId, tuteurId, new BigDecimal("5000"), "VIREMENT"
        );
        PaiementEntity saved = PaiementEntity.builder()
            .id(UUID.randomUUID()).prestation(prestation).tuteur(tuteur)
            .montant(req.montant()).modePaiement("VIREMENT").statut("EN_ATTENTE").build();

        given(prestationRepo.findById(prestationId)).willReturn(Optional.of(prestation));
        given(tuteurRepo.findById(tuteurId)).willReturn(Optional.of(tuteur));
        given(paiementRepo.totalPaiementsPaye(prestationId)).willReturn(new BigDecimal("3000"));
        given(paiementRepo.save(any())).willReturn(saved);

        // WHEN
        var result = paiementService.creer(req);

        // THEN
        assertThat(result.montant()).isEqualByComparingTo("5000");
        assertThat(result.statut()).isEqualTo("EN_ATTENTE");
    }

    @Test
    @DisplayName("creer() – doit rejeter un paiement qui dépasse le montant restant")
    void creer_montantDepasse_leveException() {
        // GIVEN – déjà payé 8000, on veut payer 5000 → total 13000 > 10000 KO
        CreatePaiementRequest req = new CreatePaiementRequest(
            prestationId, tuteurId, new BigDecimal("5000"), "CHEQUE"
        );
        given(prestationRepo.findById(prestationId)).willReturn(Optional.of(prestation));
        given(tuteurRepo.findById(tuteurId)).willReturn(Optional.of(tuteur));
        given(paiementRepo.totalPaiementsPaye(prestationId)).willReturn(new BigDecimal("8000"));

        // WHEN / THEN
        assertThatThrownBy(() -> paiementService.creer(req))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("dépasse");

        then(paiementRepo).should(never()).save(any());
    }

    @Test
    @DisplayName("confirmer() – doit passer le statut à PAYE et dater le paiement")
    void confirmer_setStatutPaye() {
        // GIVEN
        UUID paiementId = UUID.randomUUID();
        PaiementEntity entity = PaiementEntity.builder()
            .id(paiementId).prestation(prestation).tuteur(tuteur)
            .montant(new BigDecimal("5000")).statut("EN_ATTENTE").build();

        given(paiementRepo.findById(paiementId)).willReturn(Optional.of(entity));
        given(paiementRepo.save(any())).willAnswer(inv -> inv.getArgument(0));

        // WHEN
        var result = paiementService.confirmer(paiementId);

        // THEN
        assertThat(result.statut()).isEqualTo("PAYE");
        assertThat(result.datePaiement()).isNotNull();
    }
}

/**
 * EvaluationServiceTest – Teste les règles d'évaluation.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EvaluationService – Tests unitaires")
class EvaluationServiceTest {

    @Mock private EvaluationJpaRepository evaluationRepo;
    @Mock private SeanceJpaRepository seanceRepo;
    @Mock private ProfesseurJpaRepository professeurRepo;

    @InjectMocks
    private EvaluationService evaluationService;

    @Test
    @DisplayName("creer() – doit rejeter si évaluation déjà existante pour la séance")
    void creer_doublonEvaluation_leveException() {
        UUID seanceId = UUID.randomUUID();
        CreateEvaluationRequest req = new CreateEvaluationRequest(
            seanceId, UUID.randomUUID(), 15, "Bon travail"
        );
        given(evaluationRepo.findBySeanceId(seanceId))
            .willReturn(Optional.of(EvaluationEntity.builder().build()));

        assertThatThrownBy(() -> evaluationService.creer(req))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("existe déjà");
    }

    @Test
    @DisplayName("creer() – doit rejeter si séance non REALISEE")
    void creer_seanceNonRealisee_leveException() {
        UUID seanceId = UUID.randomUUID(), profId = UUID.randomUUID();
        SeanceEntity seance = SeanceEntity.builder()
            .id(seanceId).statut("PLANIFIEE").build(); // pas encore réalisée

        CreateEvaluationRequest req = new CreateEvaluationRequest(seanceId, profId, 14, null);

        given(evaluationRepo.findBySeanceId(seanceId)).willReturn(Optional.empty());
        given(seanceRepo.findById(seanceId)).willReturn(Optional.of(seance));

        assertThatThrownBy(() -> evaluationService.creer(req))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("REALISEE");
    }
}
