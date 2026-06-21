package com.socrates.common.exception;

/**
 * ResourceNotFoundException – Pattern : Exception métier typée.
 *
 * Responsabilité : signaler qu'une entité demandée est introuvable en base.
 * Avantage : le GlobalExceptionHandler peut la capturer et retourner HTTP 404
 * sans polluer les services avec des codes de statut HTTP.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, String id) {
        super(resource + " introuvable avec l'identifiant : " + id);
    }
}
