package com.clt.controller;

import com.clt.dto.CltPermisoSistemaDto;
import com.clt.entity.CltPermisoSistema;
import com.clt.repository.CltPermisoSistemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controlador REST de permisos del sistema: CRUD de permisos (etiquetas que definen opciones del sidebar y acceso).
 * Solo accesible con rol ADMIN. Los permisos se devuelven ordenados por {@code ordenVisual}.
 */
@RestController
@RequestMapping("/api/permisos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Permisos del sistema", description = "Gestión de permisos (opciones del sidebar)")
public class CltPermisoSistemaController {

    private final CltPermisoSistemaRepository permisoRepository;

    /** Lista todos los permisos ordenados por ordenVisual (para menús y guards en frontend). */
    @GetMapping
    @Operation(summary = "Listar permisos", description = "Devuelve permisos ordenados por ordenVisual")
    public ResponseEntity<List<CltPermisoSistemaDto>> listarTodos() {
        List<CltPermisoSistemaDto> permisos = permisoRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(
                        a.getOrdenVisual() != null ? a.getOrdenVisual() : 0,
                        b.getOrdenVisual() != null ? b.getOrdenVisual() : 0
                ))
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(permisos);
    }

    /** Crea un permiso (etiqueta, descripción, ordenVisual). */
    @PostMapping
    @Operation(summary = "Crear permiso")
    public ResponseEntity<CltPermisoSistemaDto> crear(@RequestBody CltPermisoSistemaDto dto) {
        CltPermisoSistema entity = CltPermisoSistema.builder()
                .etiqueta(dto.getEtiqueta())
                .descripcion(dto.getDescripcion())
                .ordenVisual(dto.getOrdenVisual())
                .build();
        entity = permisoRepository.save(entity);
        return ResponseEntity.ok(toDto(entity));
    }

    /** Actualiza etiqueta, descripción y ordenVisual de un permiso. */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar permiso")
    public ResponseEntity<CltPermisoSistemaDto> actualizar(@PathVariable Long id, @RequestBody CltPermisoSistemaDto dto) {
        CltPermisoSistema entity = permisoRepository.findById(id)
                .orElseThrow();
        entity.setEtiqueta(dto.getEtiqueta());
        entity.setDescripcion(dto.getDescripcion());
        entity.setOrdenVisual(dto.getOrdenVisual());
        entity = permisoRepository.save(entity);
        return ResponseEntity.ok(toDto(entity));
    }

    /** Elimina un permiso por ID. Quitar un permiso de un rol puede afectar el acceso de usuarios con ese rol. */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar permiso")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        permisoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** Convierte entidad a DTO (id, etiqueta, descripción, ordenVisual). */
    private CltPermisoSistemaDto toDto(CltPermisoSistema entity) {
        return CltPermisoSistemaDto.builder()
                .id(entity.getId())
                .etiqueta(entity.getEtiqueta())
                .descripcion(entity.getDescripcion())
                .ordenVisual(entity.getOrdenVisual())
                .build();
    }
}
