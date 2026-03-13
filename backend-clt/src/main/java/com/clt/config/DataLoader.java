package com.clt.config;

import com.clt.entity.CltPermisoSistema;
import com.clt.entity.CltRol;
import com.clt.entity.CltUsuario;
import com.clt.repository.CltPermisoSistemaRepository;
import com.clt.repository.CltRolRepository;
import com.clt.repository.CltUsuarioRepository;
import com.clt.security.RoleNames;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final CltUsuarioRepository usuarioRepository;
    private final CltRolRepository rolRepository;
    private final CltPermisoSistemaRepository permisoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (permisoRepository.count() == 0) {
            cargarDatosInicialesCompletos();
        } else {
            asegurarUsuariosAdminYOperador();
        }
    }

    /** Crea permisos, roles y usuarios admin + operador (solo si la BD está vacía). */
    private void cargarDatosInicialesCompletos() {
        // Crear permisos del sistema (opciones del sidebar)
        List<CltPermisoSistema> permisos = List.of(
                crearPermiso("dashboard", "Panel principal", 1),
                crearPermiso("usuarios", "Gestión de usuarios", 2),
                crearPermiso("roles", "Gestión de roles", 3),
                crearPermiso("permisos", "Gestión de permisos del sistema", 4),
                crearPermiso("reportes", "Reportes", 5),
                crearPermiso("configuracion", "Configuración", 6)
        );
        permisos = permisoRepository.saveAll(permisos);

        // Crear roles OMS: ADMIN y OPERADOR
        CltRol rolAdmin = rolRepository.save(CltRol.builder()
                .nombre(RoleNames.ADMIN)
                .permisos(Set.copyOf(permisos))
                .build());
        CltRol rolOperador = rolRepository.save(CltRol.builder()
                .nombre(RoleNames.OPERADOR)
                .permisos(Set.copyOf(permisos))
                .build());

        crearUsuarioAdmin(rolAdmin);
        crearUsuarioOperador(rolOperador);
        System.out.println(">>> CLT: Datos iniciales - admin/admin123 (ADMIN), operador/operador123 (OPERADOR)");
    }

    /** Si ya existen permisos pero falta el rol admin/operador o el usuario admin/operador, los crea. */
    private void asegurarUsuariosAdminYOperador() {
        List<CltPermisoSistema> permisos = permisoRepository.findAll();
        if (permisos.isEmpty()) return;

        Set<CltPermisoSistema> setPermisos = Set.copyOf(permisos);

        CltRol rolAdmin = rolRepository.findByNombreIgnoreCase(RoleNames.ADMIN)
                .orElseGet(() -> rolRepository.save(CltRol.builder()
                        .nombre(RoleNames.ADMIN)
                        .permisos(setPermisos)
                        .build()));
        CltRol rolOperador = rolRepository.findByNombreIgnoreCase(RoleNames.OPERADOR)
                .orElseGet(() -> rolRepository.save(CltRol.builder()
                        .nombre(RoleNames.OPERADOR)
                        .permisos(setPermisos)
                        .build()));

        if (!usuarioRepository.existsByUsername("admin")) {
            crearUsuarioAdmin(rolAdmin);
            System.out.println(">>> CLT: Usuario admin/admin123 (ADMIN) creado.");
        }
        if (!usuarioRepository.existsByUsername("operador")) {
            crearUsuarioOperador(rolOperador);
            System.out.println(">>> CLT: Usuario operador/operador123 (OPERADOR) creado.");
        }
    }

    private void crearUsuarioAdmin(CltRol rolAdmin) {
        usuarioRepository.save(CltUsuario.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .nombreCompleto("Administrador CLT")
                .email("admin@clt.com")
                .activo(true)
                .roles(Set.of(rolAdmin))
                .build());
    }

    private void crearUsuarioOperador(CltRol rolOperador) {
        usuarioRepository.save(CltUsuario.builder()
                .username("operador")
                .password(passwordEncoder.encode("operador123"))
                .nombreCompleto("Operador CLT")
                .email("operador@clt.com")
                .activo(true)
                .roles(Set.of(rolOperador))
                .build());
    }

    private CltPermisoSistema crearPermiso(String etiqueta, String descripcion, int orden) {
        return CltPermisoSistema.builder()
                .etiqueta(etiqueta)
                .descripcion(descripcion)
                .ordenVisual(orden)
                .build();
    }
}
