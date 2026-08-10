# Easy Fashion Backend

NestJS + TypeScript + Prisma foundation for the Easy Fashion Limited assessment.

## Phase 0 scope

- NestJS application bootstrap
- Environment validation
- Prisma/PostgreSQL foundation
- Health check API
- Validation, error handling, logging, and security middleware foundations

Business APIs (auth, catalog, orders, dashboard) are intentionally not implemented yet.

## Setup

From this directory (`backend/`):

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm prisma:generate
pnpm start:dev
```

API defaults to `http://localhost:3000` with prefix `/api/v1`.

Health: `GET /api/v1/health`  
Docs (non-production): `http://localhost:3000/docs`
