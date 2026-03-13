package com.clt.command.impl;

import com.clt.command.OrderCommand;
import com.clt.entity.Order;
import com.clt.entity.OrderStatus;
import com.clt.repository.OrderRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CancelOrderCommand implements OrderCommand {

    private final Order order;
    private final OrderRepository orderRepository;

    @Override
    public void execute() {
        order.setEstado(OrderStatus.CANCELADO);
        orderRepository.save(order);
    }

    @Override
    public Long getOrderIdForLog() {
        return order.getId();
    }

    @Override
    public String getDescription() {
        return "Cancelar pedido " + order.getCodigo();
    }
}
