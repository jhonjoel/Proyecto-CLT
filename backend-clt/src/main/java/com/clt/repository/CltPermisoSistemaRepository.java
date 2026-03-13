package com.clt.repository;

import com.clt.entity.CltPermisoSistema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CltPermisoSistemaRepository extends JpaRepository<CltPermisoSistema, Long> {

    Optional<CltPermisoSistema> findByEtiqueta(String etiqueta);

    boolean existsByEtiqueta(String etiqueta);

    List<CltPermisoSistema> findAllByEtiquetaIn(Iterable<String> etiquetas);
}
