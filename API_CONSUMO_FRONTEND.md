# API CLT Backend – Guía para consumo desde el frontend

Documentación para integrar el frontend (Angular u otro) con el backend CLT. Usar esta guía para crear un **skill** o servicio de API en el proyecto frontend.

---

## 1. Configuración base

| Concepto | Valor |
|----------|--------|
| **Base URL** | `http://localhost:8080` (desarrollo) |
| **Prefijo API** | `/api` |
| **CORS** | Origen permitido: `http://localhost:4200`. Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS. Headers: `*`. |
| **Content-Type** | `application/json` para bodies |
| **Accept** | `application/json` (recomendado) |

---

## 2. Autenticación (JWT)

### 2.1 Flujo

1. **Login** → `POST /api/auth/login` con `username` y `password` → respuesta con `accessToken` y `refreshToken`.
2. **Peticiones protegidas** → Header: `Authorization: Bearer <accessToken>`.
3. **Renovar sesión** → Cuando el access token expire (p. ej. 401), llamar a `POST /api/auth/refresh` con `refreshToken` → nueva respuesta con `accessToken` y `refreshToken`; reemplazar ambos en memoria/localStorage.
4. **Logout** → `POST /api/auth/logout` con el `accessToken` en `Authorization` (el backend revoca ese token).

### 2.2 Endpoints públicos (sin token)

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`

El resto de `/api/**` **requiere** `Authorization: Bearer <accessToken>`.

### 2.3 Respuesta de login / refresh

```json
{
  "accessToken": "eyJhbGciOiJIUz...",
  "refreshToken": "eyJhbGciOiJIUz...",
  "tipoToken": "Bearer",
  "username": "admin",
  "nombreCompleto": "Administrador CLT",
  "permisos": ["dashboard", "usuarios", "roles", "permisos", "reportes", "configuracion"],
  "expiracionMs": 600000
}
```

- **accessToken**: JWT de corta duración (p. ej. 10 min). Enviarlo en todas las peticiones protegidas.
- **refreshToken**: JWT de larga duración (p. ej. 7 días). Solo para renovar tokens; no enviarlo en peticiones normales.
- **permisos**: Lista de etiquetas para mostrar/ocultar opciones en el frontend (sidebar, guards).

### 2.4 Roles y permisos

- **Roles** (en el token y para `@PreAuthorize`): `ADMIN`, `OPERADOR`.
- **Permisos** (claim del token): lista de strings, p. ej. `dashboard`, `usuarios`, `roles`, `permisos`, `reportes`, `configuracion`.
- El frontend puede usar `permisos` para control de UI y guards; el backend ya restringe por rol en cada endpoint.

---

## 3. Formato de errores

Todas las respuestas de error son **JSON** con `Content-Type: application/json` y siguen este DTO:

```ts
interface ErrorResponse {
  timestamp: string;  // ISO-8601 (UTC)
  status: number;     // 400, 401, 403, 404, 409, 500
  error: string;      // "Bad Request", "Unauthorized", etc.
  message: string;    // Mensaje legible para el usuario
  path: string;       // Ruta del request
  errores?: Record<string, string> | null;  // Solo en 400 validación: campo → mensaje
}
```

Ejemplo **400 validación** (campos inválidos):

```json
{
  "timestamp": "2024-03-11T14:30:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Error de validación",
  "path": "/api/auth/login",
  "errores": {
    "username": "El usuario es requerido",
    "password": "La contraseña es requerida"
  }
}
```

Ejemplo **401** (credenciales o token):

```json
{
  "timestamp": "2024-03-11T14:30:00.123Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Usuario o contraseña incorrectos",
  "path": "/api/auth/login",
  "errores": null
}
```

- **400**: Validación → revisar `errores` (objeto campo → mensaje).
- **401**: Token ausente, inválido o expirado → login o refresh.
- **403**: Sin permiso (rol insuficiente).
- **404**: Recurso no encontrado.
- **409**: Conflicto (p. ej. estado inválido).
- **500**: Error interno del servidor.

---

## 4. Catálogo de endpoints

### 4.1 Auth

| Método | Ruta | Auth | Body | Respuesta | Notas |
|--------|------|------|------|-----------|--------|
| POST | `/api/auth/login` | No | `LoginRequest` | `LoginResponse` | Credenciales incorrectas → 401 |
| POST | `/api/auth/register` | No | `RegisterRequest` | `LoginResponse` (201) | Rol por defecto OPERADOR |
| POST | `/api/auth/logout` | Sí (Bearer) | — | 204 No Content | Revoca el access token |
| POST | `/api/auth/refresh` | No | `RefreshTokenRequest` | `LoginResponse` | El refresh usado queda invalidado (rotación) |

**LoginRequest**

```json
{ "username": "admin", "password": "admin123" }
```

**RegisterRequest**

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "minimo6",
  "rol": "OPERADOR"
}
```

- `rol`: opcional; `"ADMIN"` o `"OPERADOR"`. Si se omite, `OPERADOR`.

**RefreshTokenRequest**

```json
{ "refreshToken": "eyJhbGciOiJIUz..." }
```

- Se puede enviar el token con o sin prefijo `Bearer `.

---

### 4.2 Pedidos (Orders)

Base: `/api/orders`. **Rol:** ADMIN u OPERADOR. OPERADOR solo ve/edita/cancela pedidos creados por él (salvo listado filtrado).

| Método | Ruta | Body | Respuesta | Notas |
|--------|------|------|-----------|--------|
| GET | `/api/orders` | — | `Page<OrderDto>` | Paginado + filtros (query params) |
| GET | `/api/orders/{id}` | — | `OrderDto` | 404 si no existe o sin permiso |
| POST | `/api/orders` | `CreateOrderRequest` | `OrderDto` (201) | Usuario actual = creador |
| PUT | `/api/orders/{id}` | `CreateOrderRequest` | `OrderDto` | Actualiza cliente e items |
| PATCH | `/api/orders/{id}/status` | `UpdateOrderStatusRequest` | `OrderDto` | Cambia estado |
| DELETE | `/api/orders/{id}` | — | 204 | Cancelar pedido (estado → CANCELADO) |
| GET | `/api/orders/{id}/history` | — | `CommandLogDto[]` | Historial de comandos del pedido |

**Query params para GET /api/orders**

- `page`, `size`, `sort`: paginación estándar Spring (p. ej. `?page=0&size=10&sort=fechaCreacion,desc`).
- `estado`: `PENDIENTE` | `EN_PROCESO` | `COMPLETADO` | `CANCELADO`.
- `fechaDesde`, `fechaHasta`: ISO-8601 (p. ej. `2024-01-01T00:00:00Z`).
- `clienteNombre`: fragmento de nombre (filtro).

**CreateOrderRequest**

```json
{
  "clienteNombre": "Cliente SA",
  "items": [
    {
      "descripcion": "Producto A",
      "cantidad": 2,
      "precioUnitario": 100.50
    }
  ]
}
```

- `items`: al menos 1. No hace falta enviar `id` ni `subtotal` (el backend puede calcularlo).

**UpdateOrderStatusRequest**

```json
{ "estado": "EN_PROCESO" }
```

Valores: `PENDIENTE`, `EN_PROCESO`, `COMPLETADO`, `CANCELADO`.

**OrderDto**

```ts
interface OrderDto {
  id: number;
  codigo: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  clienteNombre: string;
  items: OrderItemDto[];
  total: number;
  fechaCreacion: string;   // ISO-8601
  fechaActualizacion: string;
  createdByUsuarioId?: number;
}
```

**OrderItemDto**

```ts
interface OrderItemDto {
  id?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
}
```

**CommandLogDto**

```ts
interface CommandLogDto {
  id: number;
  orderId: number;
  commandType: string;
  executedBy: number;
  executedAt: string;
  payload: Record<string, unknown>;
  status: 'SUCCESS' | 'FAILED';
}
```

**Paginación (GET /api/orders)**

Respuesta típica:

```json
{
  "content": [ /* OrderDto[] */ ],
  "totalElements": 50,
  "totalPages": 5,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false
}
```

---

### 4.3 Usuarios

Base: `/api/users`. **Rol:** solo ADMIN.

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| GET | `/api/users` | — | `CltUsuarioDto[]` |
| GET | `/api/users/{id}` | — | `CltUsuarioDto` o 404 |
| POST | `/api/users` | `CltUsuarioDto` | `CltUsuarioDto` (201) |
| PUT | `/api/users/{id}` | `CltUsuarioDto` | `CltUsuarioDto` |
| DELETE | `/api/users/{id}` | — | 204 |

**CltUsuarioDto** (crear/actualizar y respuesta)

```ts
interface CltUsuarioDto {
  id?: number;
  username: string;
  nombreCompleto?: string;
  email?: string;
  activo?: boolean;
  roles: Set<string> | string[];  // ej. ["admin", "operador"]; acepta "ADMIN"/"admin"
  password?: string;              // solo crear/actualizar; no viene en respuesta
}
```

- Los nombres de rol se aceptan en mayúsculas o minúsculas; en BD suelen estar en minúsculas.

---

### 4.4 Roles

Base: `/api/roles`. **Rol:** solo ADMIN.

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| GET | `/api/roles` | — | `CltRolDto[]` |
| GET | `/api/roles/{id}` | — | `CltRolDto` o 404 |
| POST | `/api/roles` | `CltRolDto` | `CltRolDto` |
| PUT | `/api/roles/{id}` | `CltRolDto` | `CltRolDto` |
| DELETE | `/api/roles/{id}` | — | 204 |

**CltRolDto**

```ts
interface CltRolDto {
  id?: number;
  nombre: string;
  permisos: Set<string> | string[];  // etiquetas de permisos
}
```

---

### 4.5 Permisos del sistema

Base: `/api/permisos`. **Rol:** solo ADMIN.

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| GET | `/api/permisos` | — | `CltPermisoSistemaDto[]` (ordenado por ordenVisual) |
| POST | `/api/permisos` | `CltPermisoSistemaDto` | `CltPermisoSistemaDto` |
| PUT | `/api/permisos/{id}` | `CltPermisoSistemaDto` | `CltPermisoSistemaDto` |
| DELETE | `/api/permisos/{id}` | — | 204 |

**CltPermisoSistemaDto**

```ts
interface CltPermisoSistemaDto {
  id?: number;
  etiqueta: string;
  descripcion?: string;
  ordenVisual?: number;
}
```

---

## 5. Resumen por rol

| Recurso | ADMIN | OPERADOR |
|---------|--------|-----------|
| Auth (login, register, refresh, logout) | Sí | Sí |
| GET/POST/PUT/PATCH/DELETE /api/orders, GET history | Sí (todos los pedidos) | Sí (solo propios para editar/cancelar; listado filtrado) |
| /api/users, /api/roles, /api/permisos | Sí | No (403) |

---

## 6. Ejemplo de interceptor HTTP (Angular)

- Añadir header en cada petición a `/api/**` (excepto login, register, refresh):

```ts
// Ejemplo conceptual
const token = this.authService.getAccessToken();
if (token) {
  req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
```

- En respuestas **401**: intentar renovar con `refreshToken`; si la renovación devuelve 200, reenviar la petición original con el nuevo `accessToken`; si falla, redirigir a login.

---

## 7. Swagger / OpenAPI

- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

Útil para probar endpoints y generar clientes. En "Authorize" usar solo el **accessToken** (sin la palabra "Bearer").

---

## 8. Checklist para el skill o servicio frontend

- [ ] Variable de entorno o constante `API_BASE_URL` (p. ej. `http://localhost:8080`).
- [ ] Servicio de auth: login, logout, refresh, guardar accessToken y refreshToken (memoria o almacenamiento seguro).
- [ ] Interceptor que añada `Authorization: Bearer <accessToken>` a las peticiones a `/api/**` excluyendo login, register, refresh.
- [ ] Manejo de 401: intentar refresh y reenviar request; si falla, limpiar tokens y redirigir a login.
- [ ] Tipos/interfaces para todos los DTOs (LoginResponse, OrderDto, ErrorResponse, etc.).
- [ ] Uso de `permisos` del login para guards y visibilidad en el menú.
- [ ] Paginación para GET `/api/orders` (page, size, sort y filtros).
- [ ] Tratamiento de errores según `ErrorResponse` (message y, si existe, `errores` por campo).

---

## 9. Ejemplos cURL y respuestas posibles

**Importante para el frontend:** Enviar siempre `Content-Type: application/json` y `Accept: application/json` en las peticiones con body o que esperen JSON. En las protegidas, enviar `Authorization: Bearer <accessToken>`. El body debe ser JSON válido (objeto o array).

Base URL usada en los ejemplos: `http://localhost:8080`.

---

### 9.1 Auth

#### POST /api/auth/login

**cURL (PowerShell / CMD):**

```bash
curl -X POST "http://localhost:8080/api/auth/login" -H "Content-Type: application/json" -H "Accept: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**cURL (Bash / Linux / Git Bash):**

```bash
curl -X POST 'http://localhost:8080/api/auth/login' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

**Respuestas posibles:**

| Código | Situación | Body (ejemplo) |
|--------|-----------|-----------------|
| **200** | OK | `{ "accessToken": "eyJ...", "refreshToken": "eyJ...", "tipoToken": "Bearer", "username": "admin", "nombreCompleto": "Administrador CLT", "permisos": ["dashboard","usuarios",...], "expiracionMs": 600000 }` |
| **400** | Validación (falta username o password) | `{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "Error de validación", "path": "/api/auth/login", "errores": { "username": "El usuario es requerido" } }` |
| **401** | Credenciales incorrectas | `{ "timestamp": "...", "status": 401, "error": "Unauthorized", "message": "Usuario o contraseña incorrectos", "path": "/api/auth/login", "errores": null }` |

---

#### POST /api/auth/register

**cURL (PowerShell / CMD):**

```bash
curl -X POST "http://localhost:8080/api/auth/register" -H "Content-Type: application/json" -H "Accept: application/json" -d "{\"nombre\":\"Juan Perez\",\"email\":\"juan@ejemplo.com\",\"password\":\"minimo6\",\"rol\":\"OPERADOR\"}"
```

**cURL (Bash):**

```bash
curl -X POST 'http://localhost:8080/api/auth/register' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"nombre":"Juan Perez","email":"juan@ejemplo.com","password":"minimo6","rol":"OPERADOR"}'
```

**Respuestas posibles:**

| Código | Situación | Body |
|--------|-----------|------|
| **201** | Creado | Mismo que login: `{ "accessToken": "...", "refreshToken": "...", "tipoToken": "Bearer", "username": "juan@ejemplo.com", "nombreCompleto": "Juan Perez", "permisos": [...], "expiracionMs": 600000 }` |
| **400** | Validación (nombre, email, password inválidos) o email ya existe | ErrorResponse con `errores` por campo o `message` tipo "Ya existe un usuario con ese email" |

---

#### POST /api/auth/refresh

**cURL (PowerShell / CMD):**

```bash
curl -X POST "http://localhost:8080/api/auth/refresh" -H "Content-Type: application/json" -H "Accept: application/json" -d "{\"refreshToken\":\"EY_JWT_REFRESH_TOKEN_AQUI\"}"
```

**cURL (Bash):**

```bash
curl -X POST 'http://localhost:8080/api/auth/refresh' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"refreshToken":"EY_JWT_REFRESH_TOKEN_AQUI"}'
```

**Respuestas posibles:**

| Código | Situación | Body |
|--------|-----------|------|
| **200** | OK | Mismo que login: accessToken, refreshToken, username, nombreCompleto, permisos, expiracionMs |
| **400** | refreshToken vacío, inválido, expirado o ya usado | ErrorResponse, message p. ej. "Refresh token inválido o expirado" o "El token proporcionado no es un refresh token" |

---

#### POST /api/auth/logout

**cURL (PowerShell / CMD)** — reemplazar `ACCESS_TOKEN` por el JWT:

```bash
curl -X POST "http://localhost:8080/api/auth/logout" -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**cURL (Bash):**

```bash
curl -X POST 'http://localhost:8080/api/auth/logout' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer ACCESS_TOKEN'
```

**Respuestas posibles:**

| Código | Situación | Body |
|--------|-----------|------|
| **204** | No Content (éxito) | Sin cuerpo |
| **401** | Token ausente o inválido | ErrorResponse |

---

### 9.2 Pedidos (Orders)

Reemplazar `ACCESS_TOKEN` por el accessToken obtenido en login. Todas las peticiones deben llevar `Authorization: Bearer ACCESS_TOKEN`, `Content-Type: application/json` y `Accept: application/json` (salvo GET sin body, donde Content-Type no es obligatorio).

#### GET /api/orders (listado paginado)

**cURL (PowerShell / CMD):**

```bash
curl -X GET "http://localhost:8080/api/orders?page=0&size=10&sort=fechaCreacion,desc" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

Con filtros (estado, fechas, cliente):

```bash
curl -X GET "http://localhost:8080/api/orders?page=0&size=10&estado=PENDIENTE&clienteNombre=Cliente" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas posibles:**

| Código | Situación | Body |
|--------|-----------|------|
| **200** | OK | `{ "content": [ { "id": 1, "codigo": "ORD-20240001", "estado": "PENDIENTE", "clienteNombre": "...", "items": [...], "total": 150.00, "fechaCreacion": "...", "fechaActualizacion": "...", "createdByUsuarioId": 1 } ], "totalElements": 1, "totalPages": 1, "size": 10, "number": 0, "first": true, "last": true }` |
| **401** | Sin token o token inválido | ErrorResponse |
| **403** | Rol no permitido | ErrorResponse |

---

#### GET /api/orders/{id}

**cURL (PowerShell / CMD):**

```bash
curl -X GET "http://localhost:8080/api/orders/1" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas posibles:**

| Código | Situación | Body |
|--------|-----------|------|
| **200** | OK | Un objeto OrderDto (id, codigo, estado, clienteNombre, items, total, fechaCreacion, fechaActualizacion, createdByUsuarioId) |
| **401** | Sin token o token inválido | ErrorResponse |
| **403** | Rol no permitido o OPERADOR intentando ver pedido ajeno | ErrorResponse |
| **404** | Pedido no existe | ErrorResponse, message "Recurso no encontrado" o similar |

---

#### POST /api/orders (crear)

**cURL (PowerShell / CMD):**

```bash
curl -X POST "http://localhost:8080/api/orders" -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN" -d "{\"clienteNombre\":\"Cliente SA\",\"items\":[{\"descripcion\":\"Producto A\",\"cantidad\":2,\"precioUnitario\":100.50}]}"
```

**cURL (Bash):**

```bash
curl -X POST 'http://localhost:8080/api/orders' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer ACCESS_TOKEN' \
  -d '{"clienteNombre":"Cliente SA","items":[{"descripcion":"Producto A","cantidad":2,"precioUnitario":100.50}]}'
```

**Respuestas posibles:**

| Código | Situación | Body |
|--------|-----------|------|
| **201** | Creado | OrderDto completo (id, codigo, estado PENDIENTE, clienteNombre, items con subtotal, total, fechas, createdByUsuarioId) |
| **400** | Validación (clienteNombre vacío, items vacío o inválido) | ErrorResponse con `errores` |
| **401** | Sin token o token inválido | ErrorResponse |
| **403** | Rol no permitido | ErrorResponse |

---

#### PUT /api/orders/{id}

**cURL (PowerShell / CMD):**

```bash
curl -X PUT "http://localhost:8080/api/orders/1" -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN" -d "{\"clienteNombre\":\"Cliente SA Actualizado\",\"items\":[{\"descripcion\":\"Producto B\",\"cantidad\":1,\"precioUnitario\":50.00}]}"
```

**Respuestas posibles:**

| Código | Situación | Body |
|--------|-----------|------|
| **200** | OK | OrderDto actualizado |
| **400** | Validación | ErrorResponse con `errores` |
| **401** | Sin token o token inválido | ErrorResponse |
| **403** | OPERADOR intentando editar pedido ajeno | ErrorResponse |
| **404** | Pedido no existe | ErrorResponse |

---

#### PATCH /api/orders/{id}/status

**cURL (PowerShell / CMD):**

```bash
curl -X PATCH "http://localhost:8080/api/orders/1/status" -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN" -d "{\"estado\":\"EN_PROCESO\"}"
```

Valores válidos de `estado`: `PENDIENTE`, `EN_PROCESO`, `COMPLETADO`, `CANCELADO`.

**Respuestas posibles:**

| Código | Situación | Body |
|--------|-----------|------|
| **200** | OK | OrderDto con el nuevo estado |
| **400** | estado nulo o no válido | ErrorResponse |
| **401** | Sin token o token inválido | ErrorResponse |
| **403** | OPERADOR y pedido ajeno | ErrorResponse |
| **404** | Pedido no existe | ErrorResponse |

---

#### DELETE /api/orders/{id} (cancelar)

**cURL (PowerShell / CMD):**

```bash
curl -X DELETE "http://localhost:8080/api/orders/1" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas posibles:**

| Código | Situación | Body |
|--------|-----------|------|
| **204** | No Content (cancelado) | Sin cuerpo |
| **401** | Sin token o token inválido | ErrorResponse |
| **403** | OPERADOR intentando cancelar pedido ajeno | ErrorResponse |
| **404** | Pedido no existe | ErrorResponse |

---

#### GET /api/orders/{id}/history

**cURL (PowerShell / CMD):**

```bash
curl -X GET "http://localhost:8080/api/orders/1/history" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas posibles:**

| Código | Situación | Body |
|--------|-----------|------|
| **200** | OK | Array de CommandLogDto: `[ { "id": 1, "orderId": 1, "commandType": "CREATE_ORDER", "executedBy": 1, "executedAt": "...", "payload": {...}, "status": "SUCCESS" } ]` |
| **401** | Sin token o token inválido | ErrorResponse |
| **403** | OPERADOR y pedido ajeno | ErrorResponse |
| **404** | Pedido no existe | ErrorResponse |

---

### 9.3 Usuarios (solo ADMIN)

Todas con `Authorization: Bearer ACCESS_TOKEN`, `Content-Type: application/json`, `Accept: application/json` cuando haya body.

#### GET /api/users

```bash
curl -X GET "http://localhost:8080/api/users" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas:** **200** array de CltUsuarioDto; **401** / **403** ErrorResponse.

---

#### GET /api/users/{id}

```bash
curl -X GET "http://localhost:8080/api/users/1" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas:** **200** un CltUsuarioDto; **401** / **403** / **404** ErrorResponse.

---

#### POST /api/users

**cURL (PowerShell / CMD):**

```bash
curl -X POST "http://localhost:8080/api/users" -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN" -d "{\"username\":\"nuevo\",\"nombreCompleto\":\"Nuevo Usuario\",\"email\":\"nuevo@clt.com\",\"activo\":true,\"roles\":[\"admin\"],\"password\":\"clave123\"}"
```

**Respuestas:** **200** o **201** CltUsuarioDto (sin password); **400** validación o username/email duplicado; **401** / **403** ErrorResponse.

---

#### PUT /api/users/{id}

**cURL (PowerShell / CMD):**

```bash
curl -X PUT "http://localhost:8080/api/users/1" -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN" -d "{\"nombreCompleto\":\"Administrador CLT\",\"email\":\"admin@clt.com.py\",\"activo\":true,\"roles\":[\"admin\"],\"password\":\"Temporal2026\"}"
```

Nota: `username` no suele enviarse en PUT; se actualizan nombreCompleto, email, activo, roles y opcionalmente password.

**Respuestas:** **200** CltUsuarioDto; **400** validación; **401** / **403** / **404** ErrorResponse.

---

#### DELETE /api/users/{id}

```bash
curl -X DELETE "http://localhost:8080/api/users/2" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas:** **204** sin cuerpo; **401** / **403** / **404** ErrorResponse.

---

### 9.4 Roles (solo ADMIN)

#### GET /api/roles

```bash
curl -X GET "http://localhost:8080/api/roles" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas:** **200** array de CltRolDto (id, nombre, permisos); **401** / **403** ErrorResponse.

---

#### GET /api/roles/{id}

```bash
curl -X GET "http://localhost:8080/api/roles/1" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas:** **200** un CltRolDto; **401** / **403** / **404** ErrorResponse.

---

#### POST /api/roles

**cURL (PowerShell / CMD):**

```bash
curl -X POST "http://localhost:8080/api/roles" -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN" -d "{\"nombre\":\"operador\",\"permisos\":[\"dashboard\",\"reportes\"]}"
```

**Respuestas:** **200** CltRolDto creado; **400** validación; **401** / **403** ErrorResponse.

---

#### PUT /api/roles/{id}

**cURL (PowerShell / CMD):**

```bash
curl -X PUT "http://localhost:8080/api/roles/1" -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN" -d "{\"nombre\":\"admin\",\"permisos\":[\"dashboard\",\"usuarios\",\"roles\",\"permisos\",\"reportes\",\"configuracion\"]}"
```

**Respuestas:** **200** CltRolDto; **400** validación; **401** / **403** / **404** ErrorResponse.

---

#### DELETE /api/roles/{id}

```bash
curl -X DELETE "http://localhost:8080/api/roles/2" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas:** **204** sin cuerpo; **401** / **403** / **404** ErrorResponse.

---

### 9.5 Permisos (solo ADMIN)

#### GET /api/permisos

```bash
curl -X GET "http://localhost:8080/api/permisos" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas:** **200** array de CltPermisoSistemaDto (id, etiqueta, descripcion, ordenVisual) ordenado por ordenVisual; **401** / **403** ErrorResponse.

---

#### POST /api/permisos

**cURL (PowerShell / CMD):**

```bash
curl -X POST "http://localhost:8080/api/permisos" -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN" -d "{\"etiqueta\":\"nuevo_permiso\",\"descripcion\":\"Descripcion\",\"ordenVisual\":10}"
```

**Respuestas:** **200** CltPermisoSistemaDto; **400** validación; **401** / **403** ErrorResponse.

---

#### PUT /api/permisos/{id}

**cURL (PowerShell / CMD):**

```bash
curl -X PUT "http://localhost:8080/api/permisos/1" -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN" -d "{\"etiqueta\":\"dashboard\",\"descripcion\":\"Panel principal\",\"ordenVisual\":1}"
```

**Respuestas:** **200** CltPermisoSistemaDto; **400** validación; **401** / **403** / **404** ErrorResponse.

---

#### DELETE /api/permisos/{id}

```bash
curl -X DELETE "http://localhost:8080/api/permisos/1" -H "Accept: application/json" -H "Authorization: Bearer ACCESS_TOKEN"
```

**Respuestas:** **204** sin cuerpo; **401** / **403** / **404** ErrorResponse.

---

### 9.6 Resumen: headers que debe enviar el frontend

| Tipo de petición | Headers obligatorios |
|------------------|----------------------|
| Login, register, refresh | `Content-Type: application/json`, `Accept: application/json` |
| Cualquier otra a `/api/**` | `Content-Type: application/json` (si hay body), `Accept: application/json`, `Authorization: Bearer <accessToken>` |
| GET sin body (listados, por id) | `Accept: application/json`, `Authorization: Bearer <accessToken>` |

El body siempre debe ser un **objeto JSON válido** (o array cuando corresponda). No enviar campos como `undefined`; omitir el campo o enviar `null` si el backend lo acepta.
