# Easy Fashion Backend

NestJS API for the Easy Fashion Limited assessment.

## Phase status

- Phase 0: application foundation
- Phase 1: database schema, migrations, and seed
- Phase 2: authentication & JWT system

## Auth endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

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
