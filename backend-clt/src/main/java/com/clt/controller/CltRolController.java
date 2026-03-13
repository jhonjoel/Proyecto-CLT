package com.clt.controller;

import com.clt.dto.CltRolDto;
import com.clt.entity.CltPermisoSistema;
import com.clt.entity.CltRol;
import com.clt.repository.CltPermisoSistemaRepository;
import com.clt.repository.CltRolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controlador REST de roles: CRUD de roles y asignación de permisos. Los roles (p. ej. admin, operador)
 * se asignan a usuarios y determinan el acceso vía JWT y @PreAuthorize. Solo accesible con rol ADMIN.
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Roles", description = "Gestión de roles y asignación de permisos")
public class CltRolController {

    private final CltRolRepository rolRepository;
    private final CltPermisoSistemaRepository permisoRepository;

    /** Lista todos los roles con sus permisos (etiquetas). */
    @GetMapping
    @Operation(summary = "Listar roles")
    public ResponseEntity<List<CltRolDto>> listarTodos() {
        List<CltRolDto> roles = rolRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }

    /** Obtiene un rol por ID con la lista de permisos asignados. */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener rol por ID")
    public ResponseEntity<CltRolDto> obtenerPorId(@PathVariable Long id) {
        return rolRepository.findById(id)
                .map(rol -> ResponseEntity.ok(toDto(rol)))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Crea un rol; el body incluye nombre y lista de etiquetas de permisos a asignar. */
    @PostMapping
    @Operation(summary = "Crear rol")
    public ResponseEntity<CltRolDto> crear(@RequestBody CltRolDto dto) {
        Set<CltPermisoSistema> permisos = dto.getPermisos() != null
                ? new HashSet<>(permisoRepository.findAllByEtiquetaIn(dto.getPermisos()))
                : new HashSet<>();

        CltRol rol = CltRol.builder()
                .nombre(dto.getNombre())
                .permisos(permisos)
                .build();
        rol = rolRepository.save(rol);
        return ResponseEntity.ok(toDto(rol));
    }

    /** Actualiza nombre y/o permisos del rol; los permisos se envían como lista de etiquetas. */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar rol")
    public ResponseEntity<CltRolDto> actualizar(@PathVariable Long id, @RequestBody CltRolDto dto) {
        CltRol rol = rolRepository.findById(id).orElseThrow();
        rol.setNombre(dto.getNombre());

        if (dto.getPermisos() != null) {
            rol.setPermisos(new HashSet<>(permisoRepository.findAllByEtiquetaIn(dto.getPermisos())));
        }
        rol = rolRepository.save(rol);
        return ResponseEntity.ok(toDto(rol));
    }

    /** Elimina un rol por ID. Los usuarios con ese rol quedarán sin él (revisar asignaciones). */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar rol")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        rolRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** Convierte entidad a DTO (id, nombre, set de etiquetas de permisos). */
    private CltRolDto toDto(CltRol entity) {
        Set<String> permisos = entity.getPermisos().stream()
                .map(CltPermisoSistema::getEtiqueta)
                .collect(Collectors.toSet());
        return CltRolDto.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .permisos(permisos)
                .build();
    }
}
