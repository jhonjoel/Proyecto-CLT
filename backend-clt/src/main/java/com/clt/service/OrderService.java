package com.clt.service;

import com.clt.command.OrderCommand;
import com.clt.command.impl.CancelOrderCommand;
import com.clt.command.impl.CreateOrderCommand;
import com.clt.command.impl.UpdateOrderStatusCommand;
import com.clt.dto.*;
import com.clt.entity.*;
import com.clt.exception.ResourceNotFoundException;
import com.clt.repository.CommandLogRepository;
import com.clt.repository.OrderRepository;
import com.clt.security.RoleNames;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CommandLogRepository commandLogRepository;
    private final CommandExecutorService commandExecutorService;

    /** Genera código tipo ORD-YYYYNNNN (method query para último del año). */
    public String generateNextCodigo() {
        String prefix = "ORD-" + Year.now().getValue();
        return orderRepository.findFirstByCodigoStartingWithOrderByCodigoDesc(prefix)
                .map(o -> {
                    String cod = o.getCodigo();
                    int num = Integer.parseInt(cod.substring(prefix.length()));
                    return prefix + String.format("%04d", num + 1);
                })
                .orElse(prefix + "0001");
    }

    @Transactional
    public OrderDto create(CreateOrderRequest request, CltUsuario currentUser) {
        String codigo = generateNextCodigo();
        Order order = Order.builder()
                .codigo(codigo)
                .estado(OrderStatus.PENDIENTE)
                .clienteNombre(request.getClienteNombre())
                .createdBy(currentUser)
                .build();
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemDto dto : request.getItems()) {
            OrderItem item = OrderItem.builder()
                    .descripcion(dto.getDescripcion())
                    .cantidad(dto.getCantidad() != null ? dto.getCantidad() : 0)
                    .precioUnitario(dto.getPrecioUnitario() != null ? dto.getPrecioUnitario() : BigDecimal.ZERO)
                    .build();
            item.calcularSubtotal();
            total = total.add(item.getSubtotal());
            order.addItem(item);
        }
        order.setTotal(total);

        OrderCommand command = new CreateOrderCommand(order, orderRepository);
        commandExecutorService.execute(command, null, currentUser.getId(), Map.of(
                "clienteNombre", request.getClienteNombre(),
                "codigo", codigo
        ));
        Long createdId = command.getOrderIdForLog();
        return toDto(orderRepository.findById(createdId).orElseThrow());
    }

    @Transactional(readOnly = true)
    public OrderDto getById(Long id, CltUsuario currentUser) {
        Order order = findOrderOrThrow(id);
        checkOperadorCanAccess(order, currentUser);
        return toDto(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> findAll(Pageable pageable, OrderStatus estado, Instant fechaDesde, Instant fechaHasta, String clienteNombre, CltUsuario currentUser) {
        Specification<Order> spec = buildSpecification(estado, fechaDesde, fechaHasta, clienteNombre, currentUser);
        return orderRepository.findAll(spec, pageable).map(this::toDto);
    }

    /** Filtros con Criteria (Specification). OPERADOR solo ve sus pedidos. */
    private Specification<Order> buildSpecification(OrderStatus estado, Instant fechaDesde, Instant fechaHasta, String clienteNombre, CltUsuario currentUser) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (!hasRole(currentUser, RoleNames.ADMIN)) {
                predicates.add(cb.equal(root.get("createdBy").get("id"), currentUser.getId()));
            }
            if (estado != null) {
                predicates.add(cb.equal(root.get("estado"), estado));
            }
            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fechaCreacion"), fechaDesde));
            }
            if (fechaHasta != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fechaCreacion"), fechaHasta));
            }
            if (clienteNombre != null && !clienteNombre.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("clienteNombre")), "%" + clienteNombre.toLowerCase() + "%"));
            }
            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    @Transactional
    public OrderDto update(Long id, CreateOrderRequest request, CltUsuario currentUser) {
        Order order = findOrderOrThrow(id);
        checkOperadorCanAccess(order, currentUser);
        if (order.getEstado() == OrderStatus.CANCELADO) {
            throw new IllegalStateException("No se puede actualizar un pedido cancelado");
        }
        order.setClienteNombre(request.getClienteNombre());
        order.getItems().clear();
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemDto dto : request.getItems()) {
            OrderItem item = OrderItem.builder()
                    .descripcion(dto.getDescripcion())
                    .cantidad(dto.getCantidad() != null ? dto.getCantidad() : 0)
                    .precioUnitario(dto.getPrecioUnitario() != null ? dto.getPrecioUnitario() : BigDecimal.ZERO)
                    .build();
            item.calcularSubtotal();
            total = total.add(item.getSubtotal());
            order.addItem(item);
        }
        order.setTotal(total);
        order = orderRepository.save(order);
        return toDto(order);
    }

    @Transactional
    public OrderDto updateStatus(Long id, OrderStatus newStatus, CltUsuario currentUser) {
        Order order = findOrderOrThrow(id);
        checkOperadorCanAccess(order, currentUser);
        if (order.getEstado() == OrderStatus.CANCELADO) {
            throw new IllegalStateException("No se puede cambiar el estado de un pedido cancelado");
        }
        OrderCommand command = new UpdateOrderStatusCommand(order, newStatus, orderRepository);
        commandExecutorService.execute(command, order.getId(), currentUser.getId(), Map.of("nuevoEstado", newStatus.name()));
        return toDto(orderRepository.findById(id).orElseThrow());
    }

    @Transactional
    public void cancel(Long id, CltUsuario currentUser) {
        Order order = findOrderOrThrow(id);
        if (order.getEstado() == OrderStatus.CANCELADO) {
            return;
        }
        if (!hasRole(currentUser, RoleNames.ADMIN) && !order.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Solo un ADMIN puede cancelar pedidos ajenos");
        }
        OrderCommand command = new CancelOrderCommand(order, orderRepository);
        commandExecutorService.execute(command, order.getId(), currentUser.getId(), Map.of());
    }

    public List<CommandLogDto> getHistory(Long orderId, CltUsuario currentUser) {
        Order order = findOrderOrThrow(orderId);
        checkOperadorCanAccess(order, currentUser);
        return commandLogRepository.findByOrderIdOrderByExecutedAtDesc(orderId).stream()
                .map(this::toLogDto)
                .collect(Collectors.toList());
    }

    private Order findOrderOrThrow(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado: " + id));
    }

    private void checkOperadorCanAccess(Order order, CltUsuario currentUser) {
        if (hasRole(currentUser, RoleNames.ADMIN)) return;
        if (order.getCreatedBy() == null || !order.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Solo puede acceder a sus propios pedidos");
        }
    }

    /** Comparación insensible a mayúsculas: en BD el rol puede estar como "admin" y RoleNames.ADMIN es "ADMIN". */
    private boolean hasRole(CltUsuario user, String role) {
        return user.getRoles().stream()
                .anyMatch(r -> r.getNombre() != null && role != null && role.equalsIgnoreCase(r.getNombre()));
    }

    private OrderDto toDto(Order o) {
        List<OrderItemDto> items = o.getItems().stream()
                .map(i -> OrderItemDto.builder()
                        .id(i.getId())
                        .descripcion(i.getDescripcion())
                        .cantidad(i.getCantidad())
                        .precioUnitario(i.getPrecioUnitario())
                        .subtotal(i.getSubtotal())
                        .build())
                .collect(Collectors.toList());
        return OrderDto.builder()
                .id(o.getId())
                .codigo(o.getCodigo())
                .estado(o.getEstado())
                .clienteNombre(o.getClienteNombre())
                .items(items)
                .total(o.getTotal())
                .fechaCreacion(o.getFechaCreacion())
                .fechaActualizacion(o.getFechaActualizacion())
                .createdByUsuarioId(o.getCreatedBy() != null ? o.getCreatedBy().getId() : null)
                .build();
    }

    private CommandLogDto toLogDto(CommandLog log) {
        return CommandLogDto.builder()
                .id(log.getId())
                .orderId(log.getOrderId())
                .commandType(log.getCommandType())
                .executedBy(log.getExecutedBy())
                .executedAt(log.getExecutedAt())
                .payload(log.getPayload())
                .status(log.getStatus())
                .build();
    }
}
