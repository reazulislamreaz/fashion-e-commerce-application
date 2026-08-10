# Easy Fashion Backend

NestJS API for the Easy Fashion Limited assessment.

## Phase status

- Phase 0: application foundation
- Phase 1: database schema, migrations, and seed
- Phase 2: authentication & JWT system
- Phase 3: RBAC foundation (`@Roles` + `RolesGuard`)
- Phase 4: Category, Size & Style management APIs

## Auth endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## Catalog endpoints (Phase 4)

Mutations require `SUPER_ADMIN` or `ADMIN`. Reads require a valid JWT (any authenticated role).

### Categories

- `POST /api/v1/categories`
- `GET /api/v1/categories`
- `GET /api/v1/categories/:id`
- `PATCH /api/v1/categories/:id`
- `DELETE /api/v1/categories/:id`

### Sizes

- `POST /api/v1/sizes`
- `GET /api/v1/sizes`
- `GET /api/v1/sizes/:id`
- `PATCH /api/v1/sizes/:id`
- `DELETE /api/v1/sizes/:id`

### Styles

- `POST /api/v1/styles`
- `GET /api/v1/styles`
- `GET /api/v1/styles/:id`
- `PATCH /api/v1/styles/:id`
- `DELETE /api/v1/styles/:id`

Query params (list endpoints): `page`, `limit` (max 100), `search`, `status` (`active`|`inactive`), `sortBy`, `sortOrder`.

## Commands

```bash
pnpm db:up
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm start:dev
pnpm test:e2e
```

See root [`README.md`](../README.md) and [`docs/DATABASE.md`](../docs/DATABASE.md).
