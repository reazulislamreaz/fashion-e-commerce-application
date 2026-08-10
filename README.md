# Easy Fashion Limited — E-Commerce Assessment

Technical assessment project for **Easy Fashion Limited**, developed incrementally by phase.

## Current phase

**Phase 1 — Database Schema, Relationships, Constraints & Seed System**

Phase 0 foundation is in place. Phase 1 adds the normalized PostgreSQL schema, migrations, and seed system. Authentication APIs, RBAC guards, catalog/order APIs, and UI features are intentionally not implemented yet.

## Technology stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, TypeScript, NestJS |
| Database | PostgreSQL 17, Prisma |
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Tooling | ESLint, Prettier, pnpm, Docker Compose |

## Project structure

```text
.
├── backend/                # NestJS API (independently runnable)
│   ├── src/
│   │   ├── common/         # Errors, filters, interceptors, pipes, DTOs
│   │   ├── config/         # Environment validation & Swagger
│   │   ├── database/       # Prisma module/service
│   │   ├── modules/        # Feature modules (health in Phase 0)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/             # Prisma schema & seed foundation
│   ├── docker-compose.yml  # Local PostgreSQL
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/               # Next.js app (independently runnable)
│   ├── src/
│   ├── public/
│   ├── .env.example
│   └── package.json
├── docs/
│   └── DATABASE.md         # Schema design notes
├── AGENTS.md
├── CLAUDE.md
├── .gitignore
└── README.md
```


`frontend/` and `backend/` are fully separated packages. Install and run each from its own directory.

## Prerequisites

- Node.js `>= 20.19.6`
- pnpm `>= 9`
- Docker (recommended for PostgreSQL)

## Installation

### Backend

```bash
cd backend
cp .env.example .env
pnpm install
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
pnpm install
```

## Environment setup

Backend variables are documented in `backend/.env.example`.

Important variables:

- `DATABASE_URL` — PostgreSQL connection string (required)
- `CORS_ORIGIN` — allowed frontend origin(s), comma-separated
- `PORT` / `API_PREFIX` — API listen port and versioned prefix (`/api/v1`)
- `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` — required for database seeding
- `SUPER_ADMIN_FULL_NAME` — optional display name for the seeded Super Admin

Frontend variables are documented in `frontend/.env.example`.

Never commit real `.env` files or secrets.

## Database setup

```bash
cd backend

# Start PostgreSQL
pnpm db:up

# Generate Prisma client
pnpm prisma:generate

# Apply migrations
pnpm prisma:migrate

# Seed roles + default Super Admin
pnpm prisma:seed
```

Schema design notes: [`docs/DATABASE.md`](docs/DATABASE.md)

### Schema overview

Core models: `Role`, `User`, `Category`, `Style`, `Size`, `Product`, `ProductSize`, `ProductImage`, `Order`, `OrderItem`.

Key decisions:

- Normalized many-to-many product ↔ size via `ProductSize`
- Multiple product images via `ProductImage`
- Order line `unitPrice` / `subtotal` snapshots for historical pricing integrity
- Product hard-delete is restricted when order items reference the product
- Roles are stored in a `roles` table (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `CUSTOMER`)

### Seed

Mandatory seed data:

1. Roles: Super Admin, Admin, Manager, Customer
2. One default Super Admin user (password hashed with bcrypt)

Seed is idempotent. Configure credentials through `backend/.env` using the placeholders in `backend/.env.example`.

## Development commands

### Backend (`cd backend`)

```bash
pnpm start:dev      # NestJS watch mode
pnpm build          # Compile backend
pnpm start:prod     # Run compiled backend
pnpm typecheck      # TypeScript check
pnpm lint           # ESLint
pnpm format         # Prettier
pnpm test           # Jest (placeholder-ready)
```

### Frontend (`cd frontend`)

```bash
pnpm dev            # http://localhost:3001
pnpm build
pnpm start
pnpm lint
pnpm typecheck
```

### Optional root convenience scripts

From the repository root (after installing each package independently):

```bash
pnpm backend:dev
pnpm frontend:dev
pnpm db:up
pnpm prisma:generate
```

These scripts only delegate into `backend/` and `frontend/`. Dependencies are not shared at the root.

## Health check

With the backend running:

```bash
curl http://localhost:3000/api/v1/health
```

Expected shape:

```json
{
  "success": true,
  "message": "Application is healthy",
  "data": {
    "status": "ok",
    "uptime": 1.23,
    "timestamp": "2026-08-10T00:00:00.000Z",
    "database": "up"
  }
}
```

API docs (non-production): `http://localhost:3000/docs`

## Future implementation phases

Completed:

1. Phase 0 — project foundation
2. Phase 1 — database schema & seed

Planned next:

1. Authentication & authorization (JWT, refresh tokens, OAuth)
2. RBAC guards and user management APIs
3. Products, categories, sizes, styles APIs
4. Orders and checkout
5. Customer storefront
6. Management dashboard
7. Testing and hardening

## Assumptions

- Local development uses Docker Compose PostgreSQL credentials from `backend/.env.example`.
- Frontend defaults to `http://localhost:3001`.
- Backend defaults to `http://localhost:3000` with prefix `/api/v1`.
- Super Admin credentials for seeding are provided via local environment variables only.

## Known limitations (Phase 1)

- No authentication or business APIs yet
- No catalog/order business logic yet
- No customer or dashboard feature pages yet
- Seed creates system roles + Super Admin only (no fake catalog data)
