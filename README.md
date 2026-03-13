# Proyecto CLT

Aplicación web completa con backend Spring Boot 3, frontend Angular 17 y PostgreSQL 16.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Levantar con Docker Compose

Desde la raíz del proyecto:

```bash
docker compose up -d
```

La primera vez o tras cambios en el código, reconstruye las imágenes:

```bash
docker compose up -d --build
```

### Servicios y puertos

| Servicio   | Puerto (host) | URL |
|------------|---------------|-----|
| Frontend   | 4200          | http://localhost:4200 |
| Backend    | 8080          | http://localhost:8080 |
| PostgreSQL | 5433          | localhost:5433 |

> **Nota:** PostgreSQL se expone en el puerto **5433** para evitar conflicto con otra instancia en 5432. Para conectar con pgAdmin u otro cliente: host `localhost`, puerto `5433`, base de datos `clt`.

### Credenciales por defecto

- **Usuario:** `admin`
- **Contraseña:** `admin123`

### API y documentación

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

El login desde la app (http://localhost:4200) usa el proxy interno al backend; no hace falta acceder por 8080 en el navegador para usar la aplicación.

## Variables de entorno (opcional)

Crea un archivo `.env` en la raíz para personalizar:

```env
# Base de datos
DB_NAME=clt
DB_USERNAME=postgres
DB_PASSWORD=Paraguay2026

# JWT
JWT_SECRET=CltSecretKeyParaJWT256BitsMinimoParaSeguridadHS256MuyLarga

# URL del frontend (para enlaces de restablecer contraseña)
FRONTEND_URL=http://localhost:4200

# Email (opcional - para forgot-password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu@email.com
MAIL_PASSWORD=tu_contraseña_de_aplicacion
```

## Comandos útiles

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Detener y eliminar contenedores
docker compose down

# Detener y eliminar contenedores huérfanos (si renombraste servicios)
docker compose down --remove-orphans

# Reconstruir imágenes y levantar (tras cambios en frontend/backend)
docker compose up -d --build
```

## Estructura del proyecto

```
Proyecto-CLT/
├── backend-clt/    # Spring Boot 3, JWT, PostgreSQL
├── frontend-clt/   # Angular 17
├── docker-compose.yml
└── README.md
```
