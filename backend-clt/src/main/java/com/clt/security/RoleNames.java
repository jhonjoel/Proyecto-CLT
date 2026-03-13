package com.clt.security;

/**
 * Nombres de roles del sistema para control de acceso (Order Management System).
 * Spring Security espera autoridades con prefijo ROLE_ para hasRole('ADMIN').
 */
public final class RoleNames {

    public static final String ADMIN = "ADMIN";
    public static final String OPERADOR = "OPERADOR";

    private RoleNames() {
    }
}
