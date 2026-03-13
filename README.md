# Proyecto CLT

Aplicación web completa con backend Spring Boot, frontend Angular y PostgreSQL.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Levantar con Docker Compose

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Esto levantará:

| Servicio   | Puerto | URL |
|---------|--------|-----|
| Frontend  | 4200  | http://localhost:4200 |
| Backend   | 8080  | http://localhost:8080 |
| PostgreSQL| 5432  | localhost:5432 |

### Credenciales por defecto

- **Usuario:** `admin`
- **Contraseña:** `admin123`

### API y documentación

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

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
# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Reconstruir imágenes
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
