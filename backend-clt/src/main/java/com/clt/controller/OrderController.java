package com.clt.controller;

import com.clt.dto.*;
import com.clt.entity.CltUsuario;
import com.clt.entity.OrderStatus;
import com.clt.repository.CltUsuarioRepository;
import com.clt.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * Controlador REST del módulo de pedidos (Orders): CRUD, cambio de estado, cancelación e historial de comandos.
 * Requiere rol ADMIN u OPERADOR; OPERADOR solo gestiona pedidos creados por él (salvo listado filtrado).
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "CRUD de pedidos, estados e historial de comandos")
@PreAuthorize("hasRole('ADMIN') or hasRole('OPERADOR')")
public class OrderController {

    private final OrderService orderService;
    private final CltUsuarioRepository usuarioRepository;

    /** Lista pedidos con paginación y filtros por estado, rango de fechas y nombre de cliente. */
    @GetMapping
    @Operation(summary = "Listar pedidos (paginado y filtros)")
    public Page<OrderDto> list(
            @RequestParam(defaultValue = "0") @Parameter(example = "0", description = "Número de página (0-based)") int page,
            @RequestParam(defaultValue = "10") @Parameter(example = "10", description = "Tamaño de página") int size,
            @RequestParam(required = false) @Parameter(example = "fechaCreacion,desc", description = "Orden: una sola cadena 'campo,dirección' (ej. fechaCreacion,desc). No enviar como array JSON.") String sort,
            @RequestParam(required = false) OrderStatus estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fechaHasta,
            @RequestParam(required = false) String clienteNombre
    ) {
        Pageable pageable = toPageable(page, size, sort);
        return orderService.findAll(pageable, estado, fechaDesde, fechaHasta, clienteNombre, currentUser());
    }

    private static Pageable toPageable(int page, int size, String sort) {
        if (sort != null && !sort.isBlank() && sort.contains(",")) {
            String[] parts = sort.split(",", 2);
            String property = parts[0].trim();
            Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()) ? Sort.Direction.ASC : Sort.Direction.DESC;
            return PageRequest.of(page, size, Sort.by(direction, property));
        }
        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaCreacion"));
    }

    /** Obtiene un pedido por ID; OPERADOR solo si es el creador. */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener pedido por ID")
    public ResponseEntity<OrderDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getById(id, currentUser()));
    }

    /** Crea un pedido; el usuario actual queda como creador. */
    @PostMapping
    @Operation(summary = "Crear pedido")
    public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(201).body(orderService.create(request, currentUser()));
    }

    /** Actualiza datos del pedido (cliente, items, total). */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar pedido")
    public ResponseEntity<OrderDto> update(@PathVariable Long id, @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.update(id, request, currentUser()));
    }

    /** Cambia el estado del pedido (PENDIENTE → EN_PROCESO → COMPLETADO). */
    @PatchMapping("/{id}/status")
    @Operation(summary = "Cambiar estado del pedido")
    public ResponseEntity<OrderDto> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request.getEstado(), currentUser()));
    }

    /** Cancela el pedido; ADMIN puede cualquiera, OPERADOR solo los propios. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERADOR')")
    @Operation(summary = "Cancelar pedido (ADMIN: cualquiera; OPERADOR: solo los propios)")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        orderService.cancel(id, currentUser());
        return ResponseEntity.noContent().build();
    }

    /** Devuelve el historial de comandos ejecutados sobre el pedido (command_log). */
    @GetMapping("/{id}/history")
    @Operation(summary = "Historial de comandos del pedido")
    public List<CommandLogDto> getHistory(@PathVariable Long id) {
        return orderService.getHistory(id, currentUser());
    }

    private CltUsuario currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByUsername(username).orElseThrow();
    }
}
