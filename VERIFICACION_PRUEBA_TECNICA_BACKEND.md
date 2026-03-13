# Verificación Backend vs Prueba Técnica (prueba_tecnica_java_angular.docx)

Verificación realizada frente al documento de la prueba técnica. **Solo se evalúa lo relativo al backend.**

---

## 1. Descripción general (punto 1 del doc)

| Requisito | Cumple | Evidencia |
|-----------|--------|-----------|
| Aplicación de gestión de pedidos (Order Management System) | ✅ | Módulo Orders con CRUD, estados e historial |
| Backend en Spring Boot | ✅ | Spring Boot 3.3.5, Java 17 |
| APIs REST, persistencia JPA, seguridad Spring Security, patrón Command | ✅ | Implementado en capas y paquetes correspondientes |
| Roles ADMIN y OPERADOR | ✅ | `RoleNames.ADMIN` / `RoleNames.OPERADOR`, usuarios y permisos por rol |
| Crear, actualizar y cancelar pedidos; historial de comandos | ✅ | OrderController, CommandLog, GET /api/orders/{id}/history |

---

## 2. Requisitos funcionales (punto 2 del doc)

### 2.1 Módulo de autenticación

| Requisito | Cumple | Evidencia |
|-----------|--------|-----------|
| Registro con nombre, email, contraseña y rol | ✅ | POST /api/auth/register, `RegisterRequest`, `AuthService.register()` |
| Login que retorne JWT con expiración configurable | ✅ | POST /api/auth/login, `jwt.expiration-ms` en application.yml |
| Logout que invalide el token (blacklist o revocación en BD) | ✅ | POST /api/auth/logout, tabla `revoked_tokens`, `TokenRevocationService` |
| Protección de endpoints según rol | ✅ | `@PreAuthorize` en OrderController y CltUsuarioController, JWT con claim `roles` |

### 2.2 Módulo de pedidos (Orders)

| Requisito | Cumple | Evidencia |
|-----------|--------|-----------|
| CRUD completo con id, código (auto ORD-20240001), estado, clienteNombre, items[], total, fechaCreacion, fechaActualizacion | ✅ | Entidades `Order`, `OrderItem`; OrderController CRUD; código en `OrderService.generateNextCodigo()` |
| Estados: PENDIENTE → EN_PROCESO → COMPLETADO / CANCELADO | ✅ | Enum `OrderStatus` |
| Solo ADMIN puede cancelar pedidos ajenos; OPERADOR solo los propios | ✅ | `OrderService.cancel()` y `checkOperadorCanAccess()` |
| Paginación y filtrado por estado, rango de fechas y nombre de cliente | ✅ | GET /api/orders con `Pageable`, parámetros estado, fechaDesde, fechaHasta, clienteNombre |
| Consultas con CRITERIA, JPQL y METHOD QUERY | ✅ | Specification (Criteria) en `OrderService.buildSpecification()`, `findByEstadoJpql` (JPQL), `findFirstByCodigoStartingWithOrderByCodigoDesc` (method query) en OrderRepository |

### 2.3 Patrón Command – historial de acciones

| Requisito | Cumple | Evidencia |
|-----------|--------|-----------|
| Cada acción modelada como Command | ✅ | Interfaz `OrderCommand`, implementaciones CreateOrderCommand, UpdateOrderStatusCommand, CancelOrderCommand |
| Interfaz con execute(), undo() opcional, getDescription() | ✅ | `OrderCommand`: execute, getOrderIdForLog, undo (default no soportado), getDescription |
| Delegación en un command executor service | ✅ | `CommandExecutorService.execute()` |
| Tabla command_log: id, orderId, commandType, executedBy, executedAt, payload (JSON), status (SUCCESS/FAILED) | ✅ | Entidad `CommandLog`, tabla `command_log`, payload como jsonb |
| GET /api/orders/{id}/history | ✅ | OrderController.getHistory(), CommandLogRepository.findByOrderIdOrderByExecutedAtDesc |

---

## 3. Requisitos técnicos – backend (punto 3 del doc)

### 3.1 Estructura del proyecto

| Requerido (doc: com/empresa/orders/) | Cumple | Actual en CLT (com.clt) |
|--------------------------------------|--------|--------------------------|
| config/ | ✅ | SecurityConfig, JwtProperties, OpenApiConfig, WebConfig, DataLoader |
| command/ | ✅ | OrderCommand, impl (CreateOrderCommand, UpdateOrderStatusCommand, CancelOrderCommand) |
| controller/ | ✅ | AuthController, OrderController, CltUsuarioController, CltRolController, CltPermisoSistemaController |
| dto/ | ✅ | LoginRequest, LoginResponse, RegisterRequest, OrderDto, OrderItemDto, CreateOrderRequest, UpdateOrderStatusRequest, CommandLogDto, ErrorResponse, etc. |
| entity/ | ✅ | Order, OrderItem, OrderStatus, CommandLog, RevokedToken, CltUsuario, CltRol, CltPermisoSistema |
| exception/ | ✅ | GlobalExceptionHandler, ResourceNotFoundException |
| repository/ | ✅ | OrderRepository, CommandLogRepository, RevokedTokenRepository, CltUsuarioRepository, CltRolRepository, CltPermisoSistemaRepository |
| security/ | ✅ | JwtAuthFilter, JwtService, JwtProperties, CltUserDetailsService, RoleNames |
| service/ | ✅ | AuthService, OrderService, CommandExecutorService, TokenRevocationService |
| resources/application.yml | ✅ | application.yml con datasource, JPA, JWT, Hikari |
| db/migration (opcional) | ⚠️ | No hay Flyway/Liquibase; se usa ddl-auto: update (aceptable según doc) |

### 3.2 Configuración de Spring Security

| Requisito | Cumple | Evidencia |
|-----------|--------|-----------|
| SecurityFilterChain (no WebSecurityConfigurerAdapter) | ✅ | SecurityConfig.securityFilterChain() con SecurityFilterChain |
| JwtAuthenticationFilter que valide el token en cada petición | ✅ | JwtAuthFilter (OncePerRequestFilter), validación + revocación por jti |
| CORS para frontend Angular (localhost:4200) | ✅ | WebConfig: allowedOrigins("http://localhost:4200"), métodos GET, POST, PUT, PATCH, DELETE, OPTIONS |
| @PreAuthorize o @Secured para control granular | ✅ | @PreAuthorize en OrderController (ADMIN/OPERADOR) y CltUsuarioController (ADMIN) |

### 3.3 Persistencia con JPA

| Requisito | Cumple | Evidencia |
|-----------|--------|-----------|
| Entidades con @Entity, @Table, @ManyToOne, @OneToMany | ✅ | Order, OrderItem, CommandLog, CltUsuario, CltRol, etc. |
| JpaRepository con JPQL o Criteria para filtros | ✅ | OrderRepository con JpaSpecificationExecutor; Specification en OrderService; @Query JPQL en findByEstadoJpql |
| Auditoría con @CreatedDate, @LastModifiedDate y @EnableJpaAuditing | ✅ | CltBackendApplication con @EnableJpaAuditing; Order con @CreatedDate y @LastModifiedDate |
| Pool HikariCP en application.yml | ✅ | spring.datasource.hikari (connection-timeout, maximum-pool-size) |
| Esquema SQL o migraciones | ⚠️ | Opcional en el doc; no hay Flyway/Liquibase; tablas creadas por Hibernate (ddl-auto: update) |

### 3.4 API REST (tabla del doc)

| Método | Endpoint | Rol requerido (doc) | Cumple | Nota |
|--------|----------|----------------------|--------|------|
| POST | /api/auth/register | Público | ✅ | AuthController.register() |
| POST | /api/auth/login | Público | ✅ | AuthController.login() |
| POST | /api/auth/logout | Autenticado | ✅ | AuthController.logout() |
| GET | /api/orders | ADMIN / OPERADOR | ✅ | OrderController.list() paginado y filtros |
| POST | /api/orders | ADMIN / OPERADOR | ✅ | OrderController.create() |
| GET | /api/orders/{id} | ADMIN / OPERADOR | ✅ | OrderController.getById() |
| PUT | /api/orders/{id} | ADMIN / OPERADOR | ✅ | OrderController.update() |
| PATCH | /api/orders/{id}/status | ADMIN / OPERADOR | ✅ | OrderController.updateStatus() |
| DELETE | /api/orders/{id} | ADMIN | ✅ | OrderController.cancel(); lógica: ADMIN cualquier pedido, OPERADOR solo propios (doc 2.2) |
| GET | /api/orders/{id}/history | ADMIN / OPERADOR | ✅ | OrderController.getHistory() |
| GET | /api/users | ADMIN | ⚠️ | Implementado como GET /api/usuarios (mismo recurso, solo ADMIN con @PreAuthorize) |

### 3.5 Manejo de errores

| Requisito | Cumple | Evidencia |
|-----------|--------|-----------|
| @RestControllerAdvice con GlobalExceptionHandler | ✅ | GlobalExceptionHandler con @RestControllerAdvice |
| Estructura uniforme: timestamp, status, error, message, path | ✅ | ErrorResponse (timestamp, status, error, message, path, errores); todos los handlers devuelven ErrorResponse |

---

## 4. Entregables (punto 6 del doc) – backend

| Entregable | Cumple | Nota |
|------------|--------|------|
| Swagger UI accesible en /swagger-ui.html | ✅ | SpringDoc OpenAPI, OpenApiConfig |
| Script SQL o migraciones con datos de prueba (1 admin, 1 operador) | ✅ | DataLoader crea usuario admin (ADMIN) y operador (OPERADOR) con contraseñas documentadas |

---

## 5. Puntos extra (punto 7) – backend

| Punto extra | Cumple | Nota |
|-------------|--------|------|
| Implementar undo() en el patrón Command | ⚠️ | OrderCommand tiene undo() por defecto que lanza UnsupportedOperationException; no implementado en comandos concretos |
| Pruebas de integración con @SpringBootTest y TestContainers | ❌ | No implementado |

---

## 6. Resumen

| Área | Estado |
|------|--------|
| Autenticación (register, login, logout, roles) | ✅ Cumple |
| Módulo Orders (CRUD, estados, paginación, filtros) | ✅ Cumple |
| Patrón Command y command_log | ✅ Cumple |
| Estructura de proyecto | ✅ Cumple (paquete com.clt en lugar de com.empresa.orders) |
| Spring Security (FilterChain, JWT, CORS, @PreAuthorize) | ✅ Cumple |
| JPA (entidades, Criteria, JPQL, method query, auditoría, Hikari) | ✅ Cumple |
| Endpoints API REST de la tabla | ✅ Todos; GET /api/users como GET /api/usuarios |
| Manejo de errores (estructura uniforme) | ✅ Cumple |
| Swagger y datos de prueba | ✅ Cumple |
| undo() en Command / Tests integración | ⚠️/❌ Opcional o no realizado |

**Conclusión:** El backend cumple con lo que detalla la prueba técnica en el documento en todo lo relativo a backend, salvo: (1) endpoint listado como GET /api/users, implementado como GET /api/usuarios; (2) undo() en Command y pruebas de integración, que son opcionales o extra.

---

*Verificación basada en prueba_tecnica_java_angular.docx y código actual del backend CLT.*
