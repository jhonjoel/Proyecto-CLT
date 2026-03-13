package com.clt.repository;

import com.clt.entity.CltRol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CltRolRepository extends JpaRepository<CltRol, Long> {

    Optional<CltRol> findByNombre(String nombre);

    /** Busca por nombre ignorando mayúsculas/minúsculas (p. ej. "admin" o "ADMIN"). */
    Optional<CltRol> findByNombreIgnoreCase(String nombre);

    boolean existsByNombre(String nombre);

    List<CltRol> findAllByNombreIn(Iterable<String> nombres);
}
