package com.clt.exception;

/**
 * Recurso no encontrado (respuesta 404).
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
