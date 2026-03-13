package com.clt.dto;

import com.clt.entity.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotBlank(message = "El nombre del cliente es requerido")
    @Size(max = 200)
    private String clienteNombre;

    @Valid
    @NotNull(message = "Los items son requeridos")
    @Size(min = 1, message = "Debe haber al menos un item")
    private List<OrderItemDto> items;
}
