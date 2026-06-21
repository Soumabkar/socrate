package com.socrates.common.exception;

/**
 * BusinessRuleException – violation d'une règle métier.
 * Ex : professeur non habilité, montant paiement dépassé.
 * Retournera HTTP 422 Unprocessable Entity.
 */
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
