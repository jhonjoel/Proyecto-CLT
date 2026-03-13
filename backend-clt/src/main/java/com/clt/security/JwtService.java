package com.clt.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.secretKey = Keys.hmacShaKeyFor(
                jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    public static final String CLAIM_TOKEN_TYPE = "token_type";
    public static final String TOKEN_TYPE_ACCESS = "access";
    public static final String TOKEN_TYPE_REFRESH = "refresh";
    public static final String TOKEN_TYPE_RESET = "reset";

    public String generateAccessToken(String username, List<String> roles, List<String> permisos) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getExpirationMs());
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .id(jti)
                .subject(username)
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS)
                .claim("roles", roles != null ? roles : List.of())
                .claim("permisos", permisos != null ? permisos : List.of())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    /** Genera un refresh token (solo subject; vida larga). Se usa para obtener nuevo access token sin volver a hacer login. */
    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getRefreshExpirationMs());
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .id(jti)
                .subject(username)
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    /** Genera access token con roles y permisos vacíos (para compatibilidad). */
    public String generateToken(String username, List<String> roles, List<String> permisos) {
        return generateAccessToken(username, roles, permisos);
    }

    /** Genera token con roles y permisos vacíos (para compatibilidad). */
    public String generateToken(String username, List<String> permisos) {
        return generateAccessToken(username, List.of(), permisos);
    }

    /** Genera token para restablecer contraseña (vida corta: 1h por defecto). */
    public String generateResetToken(String username) {
        Date now = new Date();
        long expMs = jwtProperties.getResetExpirationMs() > 0
                ? jwtProperties.getResetExpirationMs()
                : 3_600_000;
        Date expiryDate = new Date(now.getTime() + expMs);
        return Jwts.builder()
                .subject(username)
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_RESET)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    /** Indica si el token es de tipo reset (para restablecer contraseña). */
    public boolean isResetToken(String token) {
        try {
            String type = getClaims(token).get(CLAIM_TOKEN_TYPE, String.class);
            return TOKEN_TYPE_RESET.equals(type);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /** Valida que el token sea de tipo reset y no esté expirado. */
    public boolean validateResetToken(String token) {
        try {
            return validateToken(token) && isResetToken(token);
        } catch (Exception e) {
            return false;
        }
    }

    /** Indica si el token es de tipo refresh (para usarlo solo en el endpoint de refresh). */
    public boolean isRefreshToken(String token) {
        try {
            String type = getClaims(token).get(CLAIM_TOKEN_TYPE, String.class);
            return TOKEN_TYPE_REFRESH.equals(type);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getJtiFromToken(String token) {
        return getClaims(token).getId();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = getClaims(token);
        List<?> roles = claims.get("roles", List.class);
        if (roles == null) return List.of();
        return roles.stream().map(Object::toString).collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    public List<String> getPermisosFromToken(String token) {
        Claims claims = getClaims(token);
        List<?> permisos = claims.get("permisos", List.class);
        if (permisos == null) {
            return List.of();
        }
        return permisos.stream()
                .map(Object::toString)
                .collect(Collectors.toList());
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
