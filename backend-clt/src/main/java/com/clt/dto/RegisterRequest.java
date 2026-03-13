package com.clt.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class RegisterRequest {

    /** Constructor sin argumentos para deserialización JSON (Swagger/Spring). */
    public RegisterRequest() {}

    @NotBlank(message = "El nombre es requerido")
    @Size(max = 150)
    private String nombre;

    @NotBlank(message = "El email es requerido")
    @Email(message = "Email no válido")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    /** Nombre del rol: ADMIN o OPERADOR. Por defecto OPERADOR si no se envía. */
    private String rol;
}
