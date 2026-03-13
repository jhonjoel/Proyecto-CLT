package com.clt.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clt_permisos_sistema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CltPermisoSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String etiqueta;

    @Column(length = 255)
    private String descripcion;

    @Column(name = "orden_visual")
    private Integer ordenVisual;
}
