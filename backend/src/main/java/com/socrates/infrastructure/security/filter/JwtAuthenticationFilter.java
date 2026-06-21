package com.socrates.infrastructure.security.filter;

import com.socrates.infrastructure.security.jwt.JwtService;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtAuthenticationFilter – Pattern : Chain of Responsibility (Filtre Servlet)
 *
 * Responsabilité : intercepter chaque requête HTTP EXACTEMENT UNE FOIS
 * (OncePerRequestFilter), extraire le token JWT du header Authorization,
 * valider sa signature et injecter l'authentification dans le SecurityContext.
 *
 * Ce filtre ne fait PAS de logique métier — il délègue tout à JwtService.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
        throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtService.estValide(token)) {
                String email = jwtService.extraireEmail(token);
                String role  = jwtService.extraireRole(token);
                var auth = new UsernamePasswordAuthenticationToken(
                    email, null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("JWT valide pour {} avec rôle {}", email, role);
            }
        }

        chain.doFilter(request, response);
    }
}
