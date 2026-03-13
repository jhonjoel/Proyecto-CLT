package com.clt.repository;

import com.clt.entity.CltUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CltUsuarioRepository extends JpaRepository<CltUsuario, Long> {

    Optional<CltUsuario> findByUsername(String username);

    Optional<CltUsuario> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
