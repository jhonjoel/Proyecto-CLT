package com.clt.command.impl;

import com.clt.command.OrderCommand;
import com.clt.entity.Order;
import com.clt.repository.OrderRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CreateOrderCommand implements OrderCommand {

    private final Order order;
    private final OrderRepository orderRepository;

    private Long createdOrderId;

    @Override
    public void execute() {
        Order saved = orderRepository.save(order);
        this.createdOrderId = saved.getId();
    }

    @Override
    public Long getOrderIdForLog() {
        return createdOrderId;
    }

    @Override
    public String getDescription() {
        return "Crear pedido " + order.getCodigo() + " - " + order.getClienteNombre();
    }
}
