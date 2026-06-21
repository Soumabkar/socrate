package com.socrates.infrastructure.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.socrates.application.dto.request.CreateTuteurRequest;
import com.socrates.application.dto.response.TuteurResponse;
import com.socrates.domain.service.impl.TuteurService;
import com.socrates.common.exception.*;
import com.socrates.infrastructure.web.advice.GlobalExceptionHandler;
import com.socrates.infrastructure.web.controller.SocratesControllers;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * TuteurControllerTest – Tests de la couche Web avec MockMvc.
 *
 * @WebMvcTest : charge UNIQUEMENT la couche web (contrôleurs, filtres, advice).
 * Les services sont mockés → on teste le comportement HTTP, pas la logique métier.
 *
 * Responsabilités testées :
 * - Codes HTTP retournés (201, 200, 404, 422, 400)
 * - Sérialisation JSON correcte
 * - Validation Bean Validation (@Valid)
 * - Gestion des exceptions par GlobalExceptionHandler
 */
@WebMvcTest
@Import(GlobalExceptionHandler.class)
@DisplayName("TuteurController – Tests HTTP")
class TuteurControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean TuteurService tuteurService;

    private final UUID tuteurId = UUID.randomUUID();

    private TuteurResponse tuteurResponse() {
        return new TuteurResponse(tuteurId, "Dupont", "Marie",
            "marie@test.com", "0600000000", "Paris",
            "mere", null, null, Instant.now());
    }

    // ── POST /tuteurs → 201 ───────────────────────────────────────────────
    @Test
    @DisplayName("POST /tuteurs – doit retourner 201 et le tuteur créé")
    @WithMockUser
    void creer_tuteur_retourne201() throws Exception {
        CreateTuteurRequest req = new CreateTuteurRequest(
            "Dupont","Marie","marie@test.com","0600000000",
            "Paris","mere",null,null,"motdepasse123"
        );
        given(tuteurService.creer(any())).willReturn(tuteurResponse());

        mockMvc.perform(post("/tuteurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(tuteurId.toString()))
            .andExpect(jsonPath("$.nom").value("Dupont"))
            .andExpect(jsonPath("$.email").value("marie@test.com"));
    }

    // ── POST /tuteurs email existant → 422 ────────────────────────────────
    @Test
    @DisplayName("POST /tuteurs – doit retourner 422 si email déjà utilisé")
    @WithMockUser
    void creer_tuteur_emailExistant_retourne422() throws Exception {
        CreateTuteurRequest req = new CreateTuteurRequest(
            "Dupont","Marie","marie@test.com","0600000000",
            "Paris","mere",null,null,"motdepasse123"
        );
        given(tuteurService.creer(any()))
            .willThrow(new BusinessRuleException("Un compte existe déjà avec l'email : marie@test.com"));

        mockMvc.perform(post("/tuteurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.title").value("Règle métier violée"));
    }

    // ── POST /tuteurs body invalide → 400 ─────────────────────────────────
    @Test
    @DisplayName("POST /tuteurs – doit retourner 400 si email invalide")
    @WithMockUser
    void creer_tuteur_emailInvalide_retourne400() throws Exception {
        CreateTuteurRequest req = new CreateTuteurRequest(
            "Dupont","Marie","pas-un-email","0600000000",
            "Paris","mere",null,null,"motdepasse123"
        );

        mockMvc.perform(post("/tuteurs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("Erreur de validation"))
            .andExpect(jsonPath("$.errors.email").exists());
    }

    // ── GET /tuteurs/{id} → 200 ───────────────────────────────────────────
    @Test
    @DisplayName("GET /tuteurs/{id} – doit retourner le tuteur")
    @WithMockUser(roles = "ADMIN")
    void findById_retourne200() throws Exception {
        given(tuteurService.findById(tuteurId)).willReturn(tuteurResponse());

        mockMvc.perform(get("/tuteurs/{id}", tuteurId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(tuteurId.toString()));
    }

    // ── GET /tuteurs/{id} inexistant → 404 ───────────────────────────────
    @Test
    @DisplayName("GET /tuteurs/{id} – doit retourner 404 si introuvable")
    @WithMockUser(roles = "ADMIN")
    void findById_inexistant_retourne404() throws Exception {
        given(tuteurService.findById(tuteurId))
            .willThrow(new ResourceNotFoundException("Tuteur", tuteurId.toString()));

        mockMvc.perform(get("/tuteurs/{id}", tuteurId))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title").value("Ressource introuvable"));
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Tests Repository avec Testcontainers
// ═══════════════════════════════════════════════════════════════════════════
package com.socrates.infrastructure.persistence;

import com.socrates.infrastructure.persistence.entity.TuteurLegalEntity;
import com.socrates.infrastructure.persistence.repository.TuteurLegalJpaRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

/**
 * TuteurRepositoryTest – Tests d'intégration avec vraie base PostgreSQL.
 *
 * @Testcontainers : démarre un conteneur Docker PostgreSQL pour les tests.
 * @DataJpaTest    : charge uniquement la couche JPA (pas tout le contexte Spring).
 *
 * Avantages :
 * - Tests sur vraie base PostgreSQL (pas H2 avec comportements différents)
 * - Isolation complète : chaque test a sa propre transaction (rollback auto)
 * - Reproducible CI/CD : pas de dépendance à une base externe
 */
@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@DisplayName("TuteurRepository – Tests d'intégration Testcontainers")
class TuteurRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("socrates_test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TuteurLegalJpaRepository repository;

    private TuteurLegalEntity buildTuteur(String email) {
        return TuteurLegalEntity.builder()
            .nom("Dupont").prenom("Marie")
            .email(email).telephone("0600000000")
            .adresse("Paris").typeLien("mere")
            .passwordHash("$2a$10$hash")
            .role("TUTEUR")
            .build();
    }

    @Test
    @DisplayName("save() – doit persister et retrouver un tuteur par email")
    void save_et_findByEmail() {
        // GIVEN
        TuteurLegalEntity tuteur = buildTuteur("marie@test.com");

        // WHEN
        repository.save(tuteur);
        Optional<TuteurLegalEntity> result = repository.findByEmail("marie@test.com");

        // THEN
        assertThat(result).isPresent();
        assertThat(result.get().getNom()).isEqualTo("Dupont");
        assertThat(result.get().getId()).isNotNull();
    }

    @Test
    @DisplayName("existsByEmail() – doit retourner true si email déjà enregistré")
    void existsByEmail_retourneTrue() {
        repository.save(buildTuteur("existe@test.com"));
        assertThat(repository.existsByEmail("existe@test.com")).isTrue();
        assertThat(repository.existsByEmail("absent@test.com")).isFalse();
    }

    @Test
    @DisplayName("findByEmail() – doit retourner empty si email inconnu")
    void findByEmail_emailInconnu_retourneEmpty() {
        Optional<TuteurLegalEntity> result = repository.findByEmail("inconnu@test.com");
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("save() – doit générer un UUID automatiquement")
    void save_genereUUID() {
        TuteurLegalEntity saved = repository.save(buildTuteur("uuid@test.com"));
        assertThat(saved.getId()).isNotNull();
    }
}
