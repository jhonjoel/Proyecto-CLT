# Evaluación Backend – Criterios de la prueba

Evaluación del backend CLT frente a los **Criterios de Evaluación** (tabla 5), enfocada en los aspectos que aplican al backend.

---

## 1. Arquitectura Backend — **Peso 25%**

### Aspectos evaluados
- **Separación de capas**
- **Uso correcto del patrón Command**
- **Inyección de dependencias**
- **Diseño de DTOs**

### Cumplimiento

| Aspecto | Estado | Detalle |
|--------|--------|---------|
| **Separación de capas** | ✅ Cumple | Paquetes claros: `controller` → `service` → `repository`; `entity`, `dto`, `config`, `security`, `command`, `exception`. Los controladores delegan en servicios; los servicios usan repositorios y comandos. No hay lógica de negocio en controladores ni acceso a JPA en capa web. |
| **Patrón Command** | ✅ Cumple | Interfaz `OrderCommand` con `execute()`, `getOrderIdForLog()`, `undo()` (opcional), `getDescription()`. Tres implementaciones: `CreateOrderCommand`, `UpdateOrderStatusCommand`, `CancelOrderCommand`. `CommandExecutorService` ejecuta comandos y persiste en `CommandLog` (orderId, commandType, executedBy, executedAt, payload JSON, status). GET `/api/orders/{id}/history` expone el historial. |
| **Inyección de dependencias** | ✅ Cumple | Uso consistente de `@RequiredArgsConstructor` y `private final` en controllers, services, filters y config. Sin `@Autowired` en campos. `JwtService` con constructor explícito para `JwtProperties` y `SecretKey`. |
| **Diseño de DTOs** | ✅ Cumple | Request/Response diferenciados en auth: `LoginRequest`, `LoginResponse`, `RegisterRequest`, `RefreshTokenRequest`. En Orders: `CreateOrderRequest`, `UpdateOrderStatusRequest`, `OrderDto`, `OrderItemDto`, `CommandLogDto`. En usuarios/roles/permisos se reutiliza un DTO para entrada y salida (`CltUsuarioDto`, etc.), aceptable para CRUD simple. `ErrorResponse` unificado para excepciones. |

### Puntuación sugerida
**Alto** — La arquitectura está bien alineada con los criterios. Opcional: DTOs de solo lectura para respuestas (p. ej. `UsuarioResponse`) si se quiere máxima separación.

---

## 2. Spring Security & JWT — **Peso 20%**

### Aspectos evaluados
- **Configuración de SecurityFilterChain**
- **Validación del token**
- **Control de roles con @PreAuthorize**

### Cumplimiento

| Aspecto | Estado | Detalle |
|--------|--------|---------|
| **SecurityFilterChain** | ✅ Cumple | `SecurityConfig` define un único `SecurityFilterChain`: CSRF deshabilitado (API stateless), sesión `STATELESS`, `DaoAuthenticationProvider` + `BCryptPasswordEncoder`. Rutas públicas: `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`, Swagger y docs. Resto con `anyRequest().authenticated()`. `JwtAuthFilter` añadido antes de `UsernamePasswordAuthenticationFilter`. |
| **Validación del token** | ✅ Cumple | `JwtAuthFilter`: extrae Bearer, valida con `JwtService.validateToken()`, comprueba que no sea refresh (`isRefreshToken`), que no esté revocado (`TokenRevocationService.isRevoked(jti)`). Construye autoridades desde claims `roles` (ROLE_*) y `permisos` (PERMISO_*). Access y refresh token con claim `token_type`; solo el access se acepta en la API. |
| **Control de roles con @PreAuthorize** | ✅ Cumple | `OrderController`: `@PreAuthorize("hasRole('ADMIN') or hasRole('OPERADOR')")` a nivel de clase; método `cancel` con misma restricción. `CltUsuarioController`: `@PreAuthorize("hasRole('ADMIN')")`. **Actualización:** `CltRolController` y `CltPermisoSistemaController` con `@PreAuthorize("hasRole('ADMIN')")`. Lógica adicional en servicio: OPERADOR solo cancela sus propios pedidos. |

### Puntuación sugerida
**Alto** — SecurityFilterChain, validación JWT (incl. refresh y revocación) y uso de @PreAuthorize están cubiertos. Mejora opcional: @PreAuthorize en roles/permisos si solo deben verlos admins.

---

## 3. JPA & Persistencia — **Peso 15%**

### Aspectos evaluados
- **Mapeo correcto de entidades**
- **Consultas eficientes**
- **Auditoría**
- **Migraciones**

### Cumplimiento

| Aspecto | Estado | Detalle |
|--------|--------|---------|
| **Mapeo de entidades** | ✅ Cumple | Entidades con `@Entity`, `@Table` (prefijo `clt_`), relaciones `@OneToMany`/`@ManyToOne`/`@ManyToMany` bien definidas. `Order` ↔ `OrderItem`, `CltUsuario` ↔ `CltRol`, `CltRol` ↔ `CltPermisoSistema`. Enums (`OrderStatus`) y tipos adecuados (BigDecimal para montos, JSONB para payload en CommandLog). |
| **Consultas eficientes** | ✅ Cumple | `OrderRepository`: Criteria (Specification) para filtros combinados, JPQL (`findByEstadoJpql`), method query (`findFirstByCodigoStartingWithOrderByCodigoDesc`). Paginación en listado de pedidos. Repositorios de usuarios/roles con `findByUsername`, `findAllByNombreIn`, etc. |
| **Auditoría** | ✅ Cumple | `Order`, `CltUsuario` y `CltRol` con `@EntityListeners(AuditingEntityListener.class)`, `@CreatedDate` y `@LastModifiedDate`. `@EnableJpaAuditing` en la aplicación. CommandLog usa `executedAt` manual. |
| **Migraciones** | ✅ Cumple | Flyway añadido con migración inicial `V1__baseline.sql`; esquema sigue con ddl-auto=update; se pueden añadir más scripts (V2__, V3__) para datos o cambios. |

### Puntuación sugerida
**Medio-alto** — Mapeo y consultas muy bien; auditoría solo en Order; migraciones ausentes. Para subir nota: ampliar auditoría a más entidades y añadir Flyway/Liquibase.

**Actualización:** Se añadió auditoría (`@CreatedDate`, `@LastModifiedDate`) en `CltUsuario` y `CltRol`, y Flyway con migración inicial `V1__baseline.sql` (esquema sigue con ddl-auto=update; se pueden añadir más scripts versionados).

---

## 4. Calidad del Código — **Peso 10%**

### Aspectos evaluados
- **Legibilidad**
- **Nomenclatura**
- **SOLID**
- **Ausencia de código muerto**
- **Comentarios útiles**

### Cumplimiento

| Aspecto | Estado | Detalle |
|--------|--------|---------|
| **Legibilidad** | ✅ Cumple | Código estructurado, métodos acotados, uso de Lombok (`@Builder`, `@Data`, `@RequiredArgsConstructor`) para reducir boilerplate. Flujos de auth y comandos fáciles de seguir. |
| **Nomenclatura** | ✅ Cumple | Consistente: `*Controller`, `*Service`, `*Repository`, `*Dto`, `*Request`/`*Response`, prefijo `Clt` donde aplica, comandos con sufijo `Command`. |
| **SOLID** | ✅ Cumple | SRP: servicios con responsabilidades claras (AuthService, OrderService, CommandExecutorService). Command pattern como estrategia (interfaz + implementaciones). Inyección por interfaz/constructor. No se observan violaciones graves de OCP/LSP/ISP/DIP. |
| **Código muerto** | ✅ Cumple | No se detectan métodos o clases sin uso relevante. `OrderCommand.undo()` existe pero lanza por defecto (documentado como opcional). |
| **Comentarios** | ✅ Cumple | JavaDoc en puntos clave: `OrderCommand`, `CommandExecutorService`, `OrderService`, `OrderRepository`, `JwtService`, `CltUsuarioController` (normalizeRoleNames). **Actualización:** JavaDoc de clase y métodos principales en `AuthController`, `OrderController` y `CltUsuarioController`. |

### Puntuación sugerida
**Alto** — Buena legibilidad, nomenclatura y SOLID; comentarios suficientes en lógica crítica. Mejora opcional: más JavaDoc en APIs públicas.

---

## 5. Resumen por criterio

| Criterio | Peso | Valoración | Observación |
|----------|------|------------|-------------|
| Arquitectura Backend | 25% | ✅ Cumple | Capas, Command, DI y DTOs bien aplicados. |
| Spring Security & JWT | 20% | ✅ Cumple | FilterChain, validación JWT y @PreAuthorize correctos. |
| JPA & Persistencia | 15% | ✅ Cumple | Mapeo, consultas, auditoría en Order/CltUsuario/CltRol y Flyway con migración inicial. |
| Calidad del Código | 10% | ✅ Cumple | Legibilidad, nomenclatura, SOLID y poco código muerto; comentarios en puntos clave. |

*(Los criterios Frontend, Pruebas y Documentación tienen su propio peso en la tabla global; aquí solo se evalúa lo backend.)*

---

## 6. Mejoras opcionales para maximizar nota

1. **JPA:** Añadir `@CreatedDate`/`@LastModifiedDate` (y opcionalmente `createdBy`/`lastModifiedBy`) en entidades como `CltUsuario`, `CltRol`, o al menos documentar por qué solo Order tiene auditoría.
2. **Migraciones:** Introducir Flyway o Liquibase con scripts versionados para esquema e datos iniciales (roles, permisos, usuario admin).
3. **Roles/permisos:** Añadir `@PreAuthorize("hasRole('ADMIN')")` en `CltRolController` y `CltPermisoSistemaController` si solo administradores deben gestionarlos.
4. **Documentación:** Completar JavaDoc en controladores (resumen de cada endpoint) y en DTOs públicos si se quiere reforzar el criterio de documentación.

---

*Evaluación basada en el código del backend CLT y en la tabla de Criterios de Evaluación (punto 5).*
