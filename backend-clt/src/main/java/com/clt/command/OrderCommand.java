package com.clt.command;

/**
 * Contrato del patrón Command para acciones sobre pedidos.
 * Cada ejecución se registra en command_log.
 */
public interface OrderCommand {

    void execute();

    /**
     * ID del pedido afectado (para el log). En CreateOrderCommand se obtiene tras execute().
     */
    default Long getOrderIdForLog() {
        return null;
    }

    default void undo() {
        throw new UnsupportedOperationException("undo no implementado para este comando");
    }

    String getDescription();
}
