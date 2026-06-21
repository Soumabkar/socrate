package com.socrates.infrastructure.web.advice;

import com.socrates.common.exception.BusinessRuleException;
import com.socrates.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GlobalExceptionHandler – Pattern : @RestControllerAdvice (centralization)
 *
 * Responsabilité : intercepter TOUTES les exceptions non gérées dans les
 * contrôleurs et les convertir en réponses HTTP structurées (RFC 7807 ProblemDetail).
 *
 * Avantages de cette approche :
 * - Les contrôleurs ne gèrent aucune logique d'erreur HTTP
 * - Format de réponse d'erreur uniforme pour le client Angular
 * - Ajout facile de nouveaux cas sans toucher aux contrôleurs
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 404 – Ressource introuvable */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Ressource introuvable");
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    /** 422 – Violation règle métier */
    @ExceptionHandler(BusinessRuleException.class)
    public ProblemDetail handleBusinessRule(BusinessRuleException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        pd.setTitle("Règle métier violée");
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    /** 400 – Validation Bean Validation (@Valid) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage, (a, b) -> a));
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Données invalides");
        pd.setTitle("Erreur de validation");
        pd.setProperty("errors", errors);
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    /** 401 – Mauvaises credentials JWT */
    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentials(BadCredentialsException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect");
        pd.setTitle("Authentification échouée");
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    /** 403 – Accès refusé */
    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Accès non autorisé");
        pd.setTitle("Accès refusé");
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    /** 500 – Erreur inattendue */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne du serveur");
        pd.setTitle("Erreur serveur");
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }
}
