# Verificación Backend vs Requisitos OMS (Order Management System)

Este documento compara el estado actual del backend CLT con los requisitos del enunciado.

---

## 1. Descripción General y Estructura del Proyecto

### 1.1 Estructura requerida (`src/main/java/com/empresa/orders/`)

| Requerido | Estado | Actual en CLT |
|-----------|--------|----------------|
| `config/` | ✅ | SecurityConfig, OpenApiConfig, WebConfig, DataLoader |
| `command/` | ❌ **Falta** | No existe; solo CommandLineRunner en DataLoader |
| `controller/` | ⚠️ Parcial | AuthController, CltUsuarioController, CltRolController, CltPermisoSistemaController — **falta OrderController** |
| `dto/` | ✅ | LoginRequest, LoginResponse, DTOs de usuario/rol/permiso — **faltan DTOs de Order** |
| `entity/` | ⚠️ Parcial | CltUsuario, CltRol, CltPermisoSistema — **faltan Order, OrderItem, CommandLog** |
| `exception/` | ✅ | GlobalExceptionHandler |
| `repository/` | ⚠️ Parcial | Repositorios de usuario, rol, permiso — **faltan OrderRepository, OrderItemRepository, CommandLogRepository** |
| `security/` | ✅ | JwtAuthFilter, JwtService, JwtProperties, CltUserDetailsService |
| `service/` | ⚠️ Parcial | AuthService — **falta OrderService, CommandExecutorService** |

**Nota:** El paquete base es `com.clt` en lugar de `com.empresa.orders`; es aceptable si se mantiene consistente.

---

## 2. Requisitos Funcionales

### 2.1 Módulo de Autenticación

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| Registro de usuarios (nombre, email, contraseña, rol) | ⚠️ Parcial | Existe CRUD de usuarios en `CltUsuarioController` (POST crear). **Falta endpoint explícito POST /api/auth/register** que sea público y reciba nombre, email, contraseña, rol. |
| Login que retorne JWT con expiración configurable | ✅ | AuthController POST /api/auth/login, JwtService, `jwt.expiration-ms` en application.yml. |
| Logout que invalide el token (blacklist o BD) | ❌ **Falta** | No hay POST /api/auth/logout ni tabla/blacklist para revocar tokens. |
| Protección de endpoints según rol | ⚠️ Parcial | SecurityFilterChain con `authenticated()`. **Falta** uso de roles **ADMIN** y **OPERADOR** y **@PreAuthorize** (o @Secured) por endpoint. Actualmente hay rol "admin" y permisos en token, pero no la distinción ADMIN vs OPERADOR del enunciado. |

### 2.2 Módulo de Pedidos (Orders)

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| CRUD completo de pedidos | ❌ **Falta** | No existen entidad Order, OrderItem, OrderController, OrderService ni OrderRepository. |
| Campos: id, código (auto ORD-20240001), estado, clienteNombre, items[], total, fechaCreacion, fechaActualizacion | ❌ **Falta** | Entidades no creadas. |
| Estados: PENDIENTE → EN_PROCESO → COMPLETADO / CANCELADO | ❌ **Falta** | No implementado. |
| Solo ADMIN puede CANCELAR pedidos ajenos; OPERADOR solo los propios | ❌ **Falta** | Sin módulo Orders ni reglas de negocio. |
| Paginación y filtrado (estado, rango fechas, nombre cliente) | ❌ **Falta** | Sin repositorio de pedidos. |
| Consultas con CRITERIA, JPQL y METHOD QUERY | ❌ **Falta** | No hay ejemplos en el contexto de Orders. |

### 2.3 Patrón Command — Historial de Acciones

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| Interfaz `OrderCommand` (execute, undo opcional, getDescription) | ❌ **Falta** | No existe. |
| CommandExecutorService que delegue la ejecución | ❌ **Falta** | No existe. |
| Implementaciones: CreateOrderCommand, UpdateOrderStatusCommand, CancelOrderCommand | ❌ **Falta** | No existen. |
| Tabla command_log: id, orderId, commandType, executedBy, executedAt, payload (JSON), status (SUCCESS/FAILED) | ❌ **Falta** | No existe entidad ni tabla. |
| GET /api/orders/{id}/history | ❌ **Falta** | Sin OrderController. |

---

## 3. Configuración Técnica

### 3.1 Spring Security

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| SecurityFilterChain (no WebSecurityConfigurerAdapter) | ✅ | SecurityConfig usa `SecurityFilterChain`. |
| JwtAuthenticationFilter que valide el token | ✅ | JwtAuthFilter (OncePerRequestFilter, Bearer). |
| CORS para frontend Angular (localhost:4200) | ⚠️ Parcial | WebConfig con `/api/**` y `allowedOrigins("*")`. Conviene restringir a `http://localhost:4200` en producción. **Falta PATCH** en allowedMethods. |
| @PreAuthorize o @Secured para control granular | ❌ **Falta** | EnableMethodSecurity está activo pero no hay @PreAuthorize en controladores/servicios (y faltan roles ADMIN/OPERADOR). |

### 3.2 Persistencia JPA

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| Entidades con @Entity, @Table, @ManyToOne, @OneToMany | ✅ (usuarios/roles) | CltUsuario, CltRol, CltPermisoSistema correctamente mapeados. **Faltan** Order, OrderItem, CommandLog. |
| Spring Data JPA (JpaRepository) con JPQL/Criteria para filtros | ⚠️ Parcial | Repositorios existen; **falta** implementación en Orders con Criteria, JPQL y method queries. |
| Auditoría @CreatedDate, @LastModifiedDate, @EnableJpaAuditing | ❌ **Falta** | No hay @EnableJpaAuditing en la aplicación ni campos de auditoría en entidades. |
| Pool HikariCP en application.yml | ✅ | Hikari con connection-timeout y maximum-pool-size. |
| Esquema SQL o migraciones (Flyway/Liquibase) | ⚠️ Opcional | Enunciado lo marca opcional; actualmente `ddl-auto: update` sin migraciones versionadas. |

### 3.3 API REST (endpoints requeridos)

| Método | Endpoint | Rol | Estado |
|--------|----------|-----|--------|
| POST | /api/auth/register | Público | ❌ **Falta** (existe crear usuario en /api/usuarios, no /api/auth/register público). |
| POST | /api/auth/login | Público | ✅ |
| POST | /api/auth/logout | Autenticado | ❌ **Falta** |
| GET | /api/orders | ADMIN/OPERADOR | ❌ **Falta** |
| POST | /api/orders | ADMIN/OPERADOR | ❌ **Falta** |
| GET | /api/orders/{id} | ADMIN/OPERADOR | ❌ **Falta** |
| PUT | /api/orders/{id} | ADMIN/OPERADOR | ❌ **Falta** |
| PATCH | /api/orders/{id}/status | ADMIN/OPERADOR | ❌ **Falta** |
| DELETE | /api/orders/{id} | ADMIN | ❌ **Falta** |
| GET | /api/orders/{id}/history | ADMIN/OPERADOR | ❌ **Falta** |
| GET | /api/users | ADMIN | ⚠️ Parcial | Existe GET /api/usuarios; verificar que esté restringido a ADMIN. |

### 3.4 Manejo de Errores

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| @RestControllerAdvice + GlobalExceptionHandler | ✅ | Clase existe. |
| Estructura uniforme de error (timestamp, status, error, message, path) | ❌ **Falta** | Actualmente se devuelve `mensaje` + `errores` (validación). Falta DTO estándar con timestamp, status, error, message, path como pide el enunciado. |
| Manejadores para excepciones genéricas y recurso no encontrado | ⚠️ Parcial | Solo BadCredentials y MethodArgumentNotValidException. Falta Exception genérico y p. ej. EntityNotFoundException/NoSuchElementException. |

---

## 4. Documentación y Entregables

| Requisito | Estado |
|-----------|--------|
| Swagger UI en /swagger-ui.html | ✅ |
| README con descripción, requisitos, instrucciones | ⚠️ Revisar si existe y si incluye variables de entorno y despliegue. |
| Script SQL o migraciones con datos de prueba (1 admin, 1 operador) | ⚠️ Parcial | DataLoader crea 1 admin; **falta** usuario con rol OPERADOR y script/migración documentado. |

---

## 5. Resumen Ejecutivo

| Área | Cumplido | Parcial | No cumplido |
|------|----------|---------|-------------|
| Autenticación | Login JWT, filtro, expiración | Registro (vía CRUD), roles ADMIN/OPERADOR | Logout, /api/auth/register público |
| Pedidos (Orders) | — | — | Todo el módulo (CRUD, estados, permisos, filtros) |
| Patrón Command | — | — | Interfaz, executor, comandos, command_log, history |
| Security | FilterChain, JWT, CORS base | CORS origen 4200, PATCH | @PreAuthorize por rol ADMIN/OPERADOR |
| JPA | Entidades usuario/rol, Hikari, repositorios base | — | Auditoría, Orders, Criteria/JPQL/method queries |
| API REST | /api/auth/login, Swagger | /api/usuarios como “users” | Resto de endpoints del enunciado |
| Errores | RestControllerAdvice, validación | — | Estructura estándar (timestamp, status, path), más excepciones |

---

## 6. Próximos pasos recomendados (orden sugerido)

1. **Roles ADMIN y OPERADOR**  
   Definir constantes (p. ej. `ROLE_ADMIN`, `ROLE_OPERADOR`), asegurar que los usuarios tengan estos roles en BD y usar `@PreAuthorize("hasRole('ADMIN')")` etc. en los endpoints que lo requieran.

2. **POST /api/auth/register**  
   Endpoint público que cree usuario con nombre, email, contraseña y rol (y opcionalmente asigne rol OPERADOR por defecto).

3. **POST /api/auth/logout**  
   Implementar invalidación del token (tabla de tokens revocados o blacklist en memoria/cache) y endpoint autenticado.

4. **Módulo Orders**  
   Entidades Order y OrderItem, código auto (ORD-YYYYNNNN), estados (PENDIENTE, EN_PROCESO, COMPLETADO, CANCELADO), fechas de creación/actualización (con auditoría JPA).

5. **Patrón Command**  
   Interfaz OrderCommand, CommandExecutorService, CreateOrderCommand, UpdateOrderStatusCommand, CancelOrderCommand, entidad CommandLog y persistencia en command_log.

6. **OrderController**  
   CRUD + PATCH status + DELETE (solo ADMIN para pedidos ajenos) + GET history; paginación y filtros (estado, fechas, cliente) con Criteria, JPQL y method queries.

7. **GlobalExceptionHandler**  
   DTO de error con timestamp, status, error, message, path; manejadores para Exception y para “recurso no encontrado”.

8. **Auditoría JPA**  
   @EnableJpaAuditing y @CreatedDate/@LastModifiedDate en entidades que lo requieran (Order, CommandLog, etc.).

9. **CORS**  
   Añadir PATCH a allowedMethods y, si aplica, restringir allowedOrigins a `http://localhost:4200` para desarrollo.

10. **Datos de prueba**  
    DataLoader o script SQL que cree al menos 1 usuario ADMIN y 1 OPERADOR y, si se desea, pedidos de ejemplo.

---

*Documento generado para alinear el backend CLT con los requisitos del Order Management System.*
