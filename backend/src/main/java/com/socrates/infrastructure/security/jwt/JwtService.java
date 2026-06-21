package com.socrates.infrastructure.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * JwtService – Pattern : Utility / Component
 *
 * Responsabilité UNIQUE (SRP) : toute la logique JWT est isolée ici.
 * - Génération du token signé HS256
 * - Extraction des claims (subject = email, role, userId)
 * - Validation de la signature et de l'expiration
 *
 * Le reste de l'application n'a JAMAIS besoin de connaître la lib JJWT.
 */
@Slf4j
@Component
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
        @Value("${socrates.jwt.secret}") String secret,
        @Value("${socrates.jwt.expiration-ms}") long expirationMs
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String genererToken(String email, String role, UUID userId) {
        return Jwts.builder()
            .subject(email)
            .claim("role", role)
            .claim("userId", userId.toString())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(secretKey)
            .compact();
    }

    public String extraireEmail(String token) {
        return parserClaims(token).getSubject();
    }

    public String extraireRole(String token) {
        return parserClaims(token).get("role", String.class);
    }

    public UUID extraireUserId(String token) {
        return UUID.fromString(parserClaims(token).get("userId", String.class));
    }

    public boolean estValide(String token) {
        try {
            parserClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Token JWT invalide : {}", e.getMessage());
            return false;
        }
    }

    private Claims parserClaims(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
