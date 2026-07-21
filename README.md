# API de Gestión de Portafolio de Inversiones

API REST hecha con NestJS para llevar el registro de portafolios de inversión: activos, transacciones de compra/venta, y el cálculo de valorización y rendimiento de cada portafolio.

## Stack

- [NestJS](https://nestjs.com/) + TypeScript
- PostgreSQL + [Prisma](https://www.prisma.io/) como ORM
- Auth con JWT (access token + refresh token) usando Passport
- Swagger para documentación de la API
- Jest para tests unitarios y e2e

## Arquitectura

La API se organiza en módulos por dominio:

- **auth** — registro, login y renovación de tokens (JWT access + refresh). Incluye las estrategias y guards de Passport.
- **users** — gestión de usuarios (hash de password con bcrypt).
- **portfolios** — CRUD de portafolios. Cada portafolio pertenece a un usuario; todos los endpoints validan que el recurso sea del usuario autenticado.
- **assets** — activos dentro de un portafolio (ticker, precio actual). Anidado bajo `/portfolios/:portfolioId/assets`.
- **transactions** — compras/ventas de un activo. Anidado bajo `/portfolios/:portfolioId/assets/:assetId/transactions`.
- **valuation** (dentro de `portfolios`) — calcula, a partir del historial de transacciones, la cantidad neta retenida, el costo promedio, el valor de mercado (usando el precio actual del activo) y el rendimiento (ganancia/pérdida) por activo y a nivel de portafolio.

El cálculo de valorización usa el método de costo promedio ponderado: no se guarda la cantidad ni el costo en el activo, se derivan siempre de las transacciones registradas.

### Modelo de datos

```
User 1---N Portfolio 1---N Asset 1---N Transaction
```

### Autenticación

Todas las rutas salvo `/auth/*` requieren `Authorization: Bearer <accessToken>`. El access token dura poco (15 min por defecto) y el refresh token se usa contra `/auth/refresh` para obtener un par nuevo.

## Requisitos

- Node.js 20+
- Docker (para levantar Postgres local)

## Setup local

```bash
npm install
cp .env.example .env
docker compose up -d
npx prisma migrate deploy
npm run start:dev
```

La API queda disponible en `http://localhost:3000` y la documentación Swagger en `http://localhost:3000/docs`.

## Variables de entorno

Ver `.env.example`. Se necesita `DATABASE_URL` (Postgres) y los secretos/expiración de los JWT de access y refresh.

## Tests

```bash
npm run test        # unitarios
npm run test:e2e     # e2e (requiere Postgres corriendo)
npm run test:cov     # cobertura
```

## Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Renovar tokens |
| GET/POST | `/portfolios` | Listar/crear portafolios |
| GET/PATCH/DELETE | `/portfolios/:id` | Ver/editar/eliminar un portafolio |
| GET | `/portfolios/:id/valuation` | Valorización y rendimiento del portafolio |
| GET/POST | `/portfolios/:portfolioId/assets` | Listar/agregar activos |
| PATCH/DELETE | `/portfolios/:portfolioId/assets/:assetId` | Editar/quitar un activo |
| GET/POST | `/portfolios/:portfolioId/assets/:assetId/transactions` | Listar/registrar transacciones |
| DELETE | `/portfolios/:portfolioId/assets/:assetId/transactions/:id` | Eliminar una transacción |

Detalle completo de request/response en `/docs`.

## Roadmap

Quedan fuera del alcance de esta primera versión (ver notas del proyecto):

- Roles y permisos más allá de "dueño del recurso"
- Redis para caché de cálculos
- Colas (BullMQ) para recálculo en background y notificaciones
- WebSockets para actualizaciones en tiempo real
- Pipeline de CI/CD
