package com.socrates.config;

import com.socrates.infrastructure.persistence.repository.*;
import com.socrates.infrastructure.security.filter.JwtAuthenticationFilter;
import com.socrates.infrastructure.security.jwt.JwtService;
import com.socrates.application.dto.request.LoginRequest;
import com.socrates.application.dto.response.AuthResponse;
import com.socrates.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Service;
import org.springframework.web.cors.*;

import java.util.List;

/**
 * SecurityConfig – Pattern : Configuration centralisée
 *
 * Responsabilité :
 * - Configurer la chaîne de filtres Spring Security
 * - Définir les règles d'accès par rôle et par endpoint
 * - Configurer CORS pour autoriser Angular (localhost:4200)
 * - Déclarer les beans de sécurité (PasswordEncoder)
 *
 * Stratégie STATELESS : pas de session HTTP — le JWT porte tout le contexte.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Value("${socrates.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints publics (inscription, login, swagger, matières)
                .requestMatchers(HttpMethod.POST,  "/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST,  "/tuteurs").permitAll()
                .requestMatchers(HttpMethod.POST,  "/professeurs").permitAll()
                .requestMatchers(HttpMethod.GET,   "/matieres/**").permitAll()
                .requestMatchers(HttpMethod.GET,   "/cours/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // Admin Socrates (validation professeurs, gestion globale)
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/professeurs/*/valider").hasRole("ADMIN")

                // Professeurs
                .requestMatchers("/seances/**").hasAnyRole("PROFESSEUR","ADMIN","TUTEUR")
                .requestMatchers("/evaluations/**").hasAnyRole("PROFESSEUR","ADMIN")

                // Tuteurs
                .requestMatchers("/prestations/**").hasAnyRole("TUTEUR","ADMIN")
                .requestMatchers("/paiements/**").hasAnyRole("TUTEUR","ADMIN")
                .requestMatchers("/eleves/**").hasAnyRole("TUTEUR","ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

/**
 * AuthService – Pattern : Facade (simplifie l'authentification multi-rôles)
 *
 * Responsabilité : authentifier un utilisateur (tuteur OU professeur)
 * et retourner un JWT. Cherche d'abord dans tuteurs, puis dans professeurs.
 *
 * Ce service centralise la logique de login sans que les contrôleurs
 * aient à gérer les deux tables séparément.
 */
@Service
@RequiredArgsConstructor
class AuthService {

    private final TuteurLegalJpaRepository tuteurRepo;
    private final ProfesseurJpaRepository professeurRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest req) {
        // Recherche tuteur
        var tuteurOpt = tuteurRepo.findByEmail(req.email());
        if (tuteurOpt.isPresent()) {
            var t = tuteurOpt.get();
            if (!passwordEncoder.matches(req.password(), t.getPasswordHash())) {
                throw new BadCredentialsException("Mot de passe incorrect");
            }
            String token = jwtService.genererToken(t.getEmail(), t.getRole(), t.getId());
            return new AuthResponse(token, t.getRole(), t.getId(), t.getPrenom() + " " + t.getNom());
        }

        // Recherche professeur
        var profOpt = professeurRepo.findByEmail(req.email());
        if (profOpt.isPresent()) {
            var p = profOpt.get();
            if (!passwordEncoder.matches(req.password(), p.getPasswordHash())) {
                throw new BadCredentialsException("Mot de passe incorrect");
            }
            String token = jwtService.genererToken(p.getEmail(), p.getRole(), p.getId());
            return new AuthResponse(token, p.getRole(), p.getId(), p.getPrenom() + " " + p.getNom());
        }

        throw new BadCredentialsException("Aucun compte trouvé avec cet email");
    }
}
