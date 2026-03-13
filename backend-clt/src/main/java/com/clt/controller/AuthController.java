package com.clt.controller;

import com.clt.dto.ForgotPasswordRequest;
import com.clt.dto.LoginRequest;
import com.clt.dto.ResetPasswordRequest;
import com.clt.dto.LoginResponse;
import com.clt.dto.RefreshTokenRequest;
import com.clt.dto.RegisterRequest;
import com.clt.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;

/**
 * Controlador REST de autenticación: login JWT, registro, logout y renovación de tokens (refresh).
 * Los endpoints de login, register y refresh son públicos; logout requiere Bearer token.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Autenticación (login JWT)")
public class AuthController {

    private final AuthService authService;

    /** Autentica con usuario y contraseña; devuelve accessToken y refreshToken. */
    @PostMapping("/login")
    @Operation(summary = "Login", description = "Autentica con usuario y contraseña. Devuelve accessToken y refreshToken. Usar accessToken en Authorization: Bearer <accessToken>. Usar refreshToken en POST /api/auth/refresh para renovar ambos sin volver a hacer login.")
    @SecurityRequirements
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /** Registro público; tras crear el usuario devuelve la misma respuesta que login. */
    @PostMapping("/register")
    @Operation(summary = "Registro", description = "Registro público de nuevo usuario. Campos: nombre, email, contraseña, rol (ADMIN u OPERADOR; por defecto OPERADOR).")
    @SecurityRequirements
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        var usuario = authService.register(request);
        var loginResponse = authService.login(LoginRequest.builder()
                .username(usuario.getUsername())
                .password(request.getPassword())
                .build());
        return ResponseEntity.status(201).body(loginResponse);
    }

    /** Invalida el access token actual (revocación por jti). Requiere Authorization: Bearer &lt;accessToken&gt;. */
    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Invalida el access token JWT actual (requiere estar autenticado).")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        authService.logout(authHeader);
        return ResponseEntity.noContent().build();
    }

    /** Devuelve nuevo accessToken y refreshToken a partir de un refreshToken válido; el enviado queda invalidado (rotación). */
    @PostMapping("/refresh")
    @Operation(summary = "Renovar tokens", description = "Devuelve un nuevo accessToken y refreshToken a partir de un refreshToken válido (estilo Keycloak). El refreshToken enviado queda invalidado; usar el nuevo refreshToken en la próxima renovación.")
    @SecurityRequirements
    public ResponseEntity<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshTokens(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    /** Solicitud de restablecer contraseña. Envía email con enlace si existe el usuario. Siempre devuelve 200 (seguridad). */
    @PostMapping("/forgot-password")
    @Operation(summary = "Olvidé contraseña", description = "Envía email con enlace para restablecer contraseña. Si el email no existe, no hace nada (por seguridad).")
    @SecurityRequirements
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "Si el email existe en el sistema, recibirás instrucciones para restablecer tu contraseña."));
    }

    /** Restablece la contraseña usando el token del email. */
    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña", description = "Restablece la contraseña usando el token recibido por email.")
    @SecurityRequirements
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente. Ya puedes iniciar sesión."));
    }
}
