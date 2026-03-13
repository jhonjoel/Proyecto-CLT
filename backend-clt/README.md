# CLT Backend

Backend del proyecto CLT construido con Spring Boot 3, Spring Security 6, JWT y PostgreSQL.

## Requisitos

- Java 17+
- Maven
- PostgreSQL (Docker o instalado localmente)

## Base de datos PostgreSQL

```bash
docker run --name postgres -e POSTGRES_PASSWORD=Paraguay2026 -p 5432:5432 -d postgres
```

Las tablas se crean automáticamente al iniciar la aplicación (`ddl-auto: update`).

## Tablas CLT

| Tabla | Descripción |
|-------|-------------|
| clt_usuarios | Usuarios del sistema |
| clt_roles | Roles (ej: admin, operador) |
| clt_permisos_sistema | Permisos/pantallas del sidebar (etiquetas) |
| clt_usuarios_roles | Relación usuario-rol |
| clt_roles_permisos | Relación rol-permiso |

## JWT

- **Duración por defecto:** 10 minutos (600.000 ms)
- **Configuración:** `application.yml` → `jwt.secret`, `jwt.expiration-ms`
- **Header:** `Authorization: Bearer <token>`

## Ejecutar

### Con Gradle (bootRun)

```powershell
.\gradlew.bat bootRun
```

**Nota:** Si es la primera vez y `gradlew.bat` falla, instala Gradle y genera el wrapper:

```powershell
choco install gradle
gradle wrapper
.\gradlew.bat bootRun
```

### Con Maven

```bash
mvn spring-boot:run
```

## Usuario por defecto

Tras el primer arranque se crea:
- **Usuario:** admin
- **Contraseña:** admin123

## API

### Login (público)

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tipoToken": "Bearer",
  "username": "admin",
  "nombreCompleto": "Administrador CLT",
  "permisos": ["dashboard", "usuarios", "roles", "permisos", "reportes", "configuracion"],
  "expiracionMs": 600000
}
```

- **accessToken:** JWT de corta duración; enviarlo en `Authorization: Bearer <accessToken>` en las peticiones a la API.
- **refreshToken:** JWT de larga duración; usarlo en `POST /api/auth/refresh` con body `{ "refreshToken": "..." }` para obtener un nuevo accessToken y refreshToken sin volver a hacer login (estilo Keycloak). El refresh token usado queda invalidado (rotación).

El access token incluye los permisos en el claim `permisos`. El frontend puede usar esta lista para mostrar/ocultar opciones del sidebar.

### Endpoints protegidos (requieren JWT)

- `GET/POST/PUT/DELETE /api/usuarios` - Gestión de usuarios
- `GET/POST/PUT/DELETE /api/roles` - Gestión de roles
- `GET/POST/PUT/DELETE /api/permisos` - Gestión de permisos del sistema

## Swagger / OpenAPI (v1.0)

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs
- Versión de la API documentada: **1.0**
- En Swagger UI puedes usar "Authorize" e ingresar el **accessToken** JWT (sin la palabra "Bearer") para probar los endpoints protegidos.

## Variables de entorno

- `JWT_SECRET`: Clave secreta para JWT (mínimo 256 bits para HS256)
