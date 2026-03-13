package com.clt.controller;

import com.clt.dto.CltUsuarioDto;
import com.clt.entity.CltRol;
import com.clt.entity.CltUsuario;
import com.clt.repository.CltRolRepository;
import com.clt.repository.CltUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controlador REST de gestión de usuarios del sistema: CRUD de usuarios y asignación de roles.
 * Solo accesible con rol ADMIN. Los nombres de rol en el body se aceptan en cualquier mayúscula/minúscula.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de usuarios del sistema (solo ADMIN)")
@PreAuthorize("hasRole('ADMIN')")
public class CltUsuarioController {

    private final CltUsuarioRepository usuarioRepository;
    private final CltRolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    /** Devuelve todos los usuarios (sin paginación). */
    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Devuelve todos los usuarios (requiere JWT)")
    public List<CltUsuarioDto> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /** Obtiene un usuario por ID. */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<CltUsuarioDto> obtenerPorId(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> ResponseEntity.ok(toDto(usuario)))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Crea un usuario; contraseña por defecto "clt123" si no se envía. */
    @PostMapping
    @Operation(summary = "Crear usuario")
    public ResponseEntity<CltUsuarioDto> crear(@RequestBody CltUsuarioDto dto) {
        Set<CltRol> roles = dto.getRoles() != null
                ? new HashSet<>(rolRepository.findAllByNombreIn(normalizeRoleNames(dto.getRoles())))
                : new HashSet<>();

        CltUsuario usuario = CltUsuario.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "clt123"))
                .nombreCompleto(dto.getNombreCompleto())
                .email(dto.getEmail())
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .roles(roles)
                .build();
        usuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(toDto(usuario));
    }

    /** Actualiza nombre, email, activo, contraseña y/o roles. */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario")
    public ResponseEntity<CltUsuarioDto> actualizar(@PathVariable Long id, @RequestBody CltUsuarioDto dto) {
        CltUsuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setEmail(dto.getEmail());
        if (dto.getActivo() != null) usuario.setActivo(dto.getActivo());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getRoles() != null) {
            usuario.setRoles(new HashSet<>(rolRepository.findAllByNombreIn(normalizeRoleNames(dto.getRoles()))));
        }
        usuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(toDto(usuario));
    }

    /** Elimina un usuario por ID. */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private CltUsuarioDto toDto(CltUsuario entity) {
        Set<String> roles = entity.getRoles().stream()
                .map(CltRol::getNombre)
                .collect(Collectors.toSet());
        return CltUsuarioDto.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .nombreCompleto(entity.getNombreCompleto())
                .email(entity.getEmail())
                .activo(entity.getActivo())
                .roles(roles)
                .build();
    }

    /** Normaliza nombres de rol a minúsculas para que la búsqueda coincida con la BD (p. ej. "ADMIN" → "admin"). */
    private List<String> normalizeRoleNames(Set<String> roleNames) {
        if (roleNames == null) return List.of();
        return roleNames.stream()
                .filter(name -> name != null && !name.isBlank())
                .map(String::toLowerCase)
                .collect(Collectors.toList());
    }
}
