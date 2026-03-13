package com.clt.service;

import com.clt.entity.RevokedToken;
import com.clt.repository.RevokedTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;

    @Transactional
    public void revoke(String jti) {
        if (jti == null || jti.isBlank()) return;
        if (revokedTokenRepository.existsByJti(jti)) return;
        revokedTokenRepository.save(RevokedToken.builder()
                .jti(jti)
                .revokedAt(Instant.now())
                .build());
    }

    public boolean isRevoked(String jti) {
        if (jti == null || jti.isBlank()) return false;
        return revokedTokenRepository.existsByJti(jti);
    }
}
