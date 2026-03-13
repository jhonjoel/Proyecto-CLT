package com.clt.entity;

/**
 * Estados posibles de un pedido (Order Management System).
 * Flujo: PENDIENTE → EN_PROCESO → COMPLETADO o CANCELADO.
 */
public enum OrderStatus {
    PENDIENTE,
    EN_PROCESO,
    COMPLETADO,
    CANCELADO
}
