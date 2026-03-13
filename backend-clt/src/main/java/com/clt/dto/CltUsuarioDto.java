package com.clt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CltUsuarioDto {

    private Long id;
    private String username;
    private String nombreCompleto;
    private String email;
    private Boolean activo;
    private Set<String> roles;
    private String password; // Solo para crear/actualizar, no se expone en respuesta
}
