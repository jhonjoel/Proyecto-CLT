package com.clt.security;

import com.clt.entity.CltPermisoSistema;
import com.clt.entity.CltUsuario;
import com.clt.repository.CltUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CltUserDetailsService implements UserDetailsService {

    private final CltUsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        CltUsuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        if (!usuario.getActivo()) {
            throw new UsernameNotFoundException("Usuario inactivo: " + username);
        }

        Set<SimpleGrantedAuthority> authorities = usuario.getRoles().stream()
                .flatMap(rol -> Stream.concat(
                        Stream.of(new SimpleGrantedAuthority("ROLE_" + rol.getNombre().toUpperCase())),
                        rol.getPermisos().stream().map(CltPermisoSistema::getEtiqueta).map(etiqueta -> new SimpleGrantedAuthority("PERMISO_" + etiqueta))
                ))
                .collect(Collectors.toSet());

        return User.builder()
                .username(usuario.getUsername())
                .password(usuario.getPassword())
                .authorities(authorities)
                .build();
    }
}
