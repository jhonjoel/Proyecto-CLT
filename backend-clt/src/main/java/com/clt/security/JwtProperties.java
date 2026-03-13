package com.clt.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    private String secret = "CltSecretKeyParaJWT256BitsMinimoParaSeguridadHS256MuyLarga";
    private long expirationMs = 600000; // 10 minutos
    private long refreshExpirationMs = 604_800_000; // 7 días
    private long resetExpirationMs = 3_600_000; // 1 hora para token de restablecer contraseña

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    public void setRefreshExpirationMs(long refreshExpirationMs) {
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public long getResetExpirationMs() {
        return resetExpirationMs;
    }

    public void setResetExpirationMs(long resetExpirationMs) {
        this.resetExpirationMs = resetExpirationMs;
    }
}
