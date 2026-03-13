package com.clt.dto;

import com.clt.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {

    private Long id;
    private String codigo;
    private OrderStatus estado;
    private String clienteNombre;
    private List<OrderItemDto> items;
    private BigDecimal total;
    private Instant fechaCreacion;
    private Instant fechaActualizacion;
    private Long createdByUsuarioId;
}
