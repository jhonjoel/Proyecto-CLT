package com.clt.service;

import com.clt.dto.ForgotPasswordRequest;
import com.clt.dto.LoginRequest;
import com.clt.dto.LoginResponse;
import com.clt.dto.RegisterRequest;
import com.clt.dto.ResetPasswordRequest;
import com.clt.entity.CltPermisoSistema;
import com.clt.entity.CltRol;
import com.clt.entity.CltUsuario;
import com.clt.repository.CltRolRepository;
import com.clt.repository.CltUsuarioRepository;
import com.clt.security.JwtProperties;
import com.clt.security.JwtService;
import com.clt.security.RoleNames;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final CltUsuarioRepository usuarioRepository;
    private final CltRolRepository rolRepository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final PasswordEncoder passwordEncoder;
    private final TokenRevocationService tokenRevocationService;
    private final EmailService emailService;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String username = authentication.getName();
        CltUsuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow();

        List<String> permisos = usuario.getRoles().stream()
                .flatMap(rol -> rol.getPermisos().stream())
                .map(CltPermisoSistema::getEtiqueta)
                .distinct()
                .collect(Collectors.toList());
        List<String> roles = usuario.getRoles().stream()
                .map(rol -> rol.getNombre().toUpperCase())
                .collect(Collectors.toList());

        String accessToken = jwtService.generateAccessToken(username, roles, permisos);
        String refreshToken = jwtService.generateRefreshToken(username);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tipoToken("Bearer")
                .username(usuario.getUsername())
                .nombreCompleto(usuario.getNombreCompleto())
                .permisos(permisos)
                .expiracionMs(jwtProperties.getExpirationMs())
                .build();
    }

    /**
     * Registra un nuevo usuario (endpoint público).
     * Username se deriva del email. Rol por defecto OPERADOR si no se indica.
     */
    @Transactional
    public CltUsuario register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }
        String rolNombre = request.getRol() != null && !request.getRol().isBlank()
                ? request.getRol().toUpperCase()
                : RoleNames.OPERADOR;
        if (!RoleNames.ADMIN.equals(rolNombre) && !RoleNames.OPERADOR.equals(rolNombre)) {
            rolNombre = RoleNames.OPERADOR;
        }
        final String rolParaBuscar = rolNombre;
        CltRol rol = rolRepository.findByNombreIgnoreCase(rolNombre)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado: " + rolParaBuscar));

        CltUsuario usuario = CltUsuario.builder()
                .username(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nombreCompleto(request.getNombre())
                .email(request.getEmail())
                .activo(true)
                .roles(Set.of(rol))
                .build();
        return usuarioRepository.save(usuario);
    }

    /** Invalida el token actual (logout). */
    public void logout(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) return;
        String token = bearerToken.substring(7);
        if (!jwtService.validateToken(token)) return;
        tokenRevocationService.revoke(jwtService.getJtiFromToken(token));
    }

    /**
     * Renueva access y refresh token usando un refresh token válido (estilo Keycloak).
     * El refresh token usado se invalida (rotación); se devuelve uno nuevo.
     */
    public LoginResponse refreshTokens(String refreshTokenValue) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            throw new IllegalArgumentException("refreshToken es obligatorio");
        }
        String token = refreshTokenValue.startsWith("Bearer ") ? refreshTokenValue.substring(7) : refreshTokenValue;
        if (!jwtService.validateToken(token)) {
            throw new IllegalArgumentException("Refresh token inválido o expirado");
        }
        if (!jwtService.isRefreshToken(token)) {
            throw new IllegalArgumentException("El token proporcionado no es un refresh token");
        }
        if (tokenRevocationService.isRevoked(jwtService.getJtiFromToken(token))) {
            throw new IllegalArgumentException("Refresh token ya fue utilizado o revocado");
        }
        tokenRevocationService.revoke(jwtService.getJtiFromToken(token));

        String username = jwtService.getUsernameFromToken(token);
        CltUsuario usuario = usuarioRepository.findByUsername(username).orElseThrow(
                () -> new IllegalArgumentException("Usuario no encontrado"));

        List<String> permisos = usuario.getRoles().stream()
                .flatMap(rol -> rol.getPermisos().stream())
                .map(CltPermisoSistema::getEtiqueta)
                .distinct()
                .collect(Collectors.toList());
        List<String> roles = usuario.getRoles().stream()
                .map(rol -> rol.getNombre().toUpperCase())
                .collect(Collectors.toList());

        String newAccessToken = jwtService.generateAccessToken(username, roles, permisos);
        String newRefreshToken = jwtService.generateRefreshToken(username);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tipoToken("Bearer")
                .username(usuario.getUsername())
                .nombreCompleto(usuario.getNombreCompleto())
                .permisos(permisos)
                .expiracionMs(jwtProperties.getExpirationMs())
                .build();
    }

    /**
     * Solicitud de restablecer contraseña. Si el email existe, genera token y envía email.
     * Por seguridad, siempre devuelve éxito (no revela si el email existe).
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        usuarioRepository.findByEmail(request.getEmail().trim())
                .ifPresent(usuario -> {
                    String token = jwtService.generateResetToken(usuario.getUsername());
                    emailService.sendPasswordResetEmail(usuario.getEmail(), token);
                });
    }

    /**
     * Restablece la contraseña usando el token del email. El token debe ser de tipo reset y no expirado.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String token = request.getToken().trim();
        if (!jwtService.validateResetToken(token)) {
            throw new IllegalArgumentException("Token inválido o expirado. Solicita un nuevo enlace de restablecimiento.");
        }
        String username = jwtService.getUsernameFromToken(token);
        CltUsuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);
    }
}
