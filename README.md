# Easy Fashion Limited — E-Commerce Assessment

Technical assessment project for **Easy Fashion Limited**, developed incrementally by phase.

## Current phase

**Phase 2 — Authentication & JWT System**

Phases 0–1 are complete. Phase 2 adds email/password authentication with bcrypt password hashing, JWT access/refresh tokens, secure refresh-token persistence with rotation, logout, and authenticated profile retrieval. RBAC authorization guards, OAuth, and business CRUD APIs are intentionally not implemented yet.

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
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — required JWT signing secrets
- `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` — token lifetimes (defaults `15m` / `7d`)
- `BCRYPT_SALT_ROUNDS` — bcrypt cost factor (default `12`)

Frontend variables are documented in `frontend/.env.example`.

Never commit real `.env` files or secrets.

## Authentication APIs (Phase 2)

Token transport: JSON response body + `Authorization: Bearer <accessToken>` header.
Refresh tokens are persisted as SHA-256 hashes and rotated on refresh.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Public | Register customer (role forced server-side) |
| `POST` | `/api/v1/auth/login` | Public | Email/password login |
| `POST` | `/api/v1/auth/refresh` | Public | Rotate refresh token + issue new pair |
| `POST` | `/api/v1/auth/logout` | Bearer | Revoke refresh token |
| `GET` | `/api/v1/auth/me` | Bearer | Current authenticated user profile |

### Register body

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+8801712345678",
  "password": "SecurePass1"
}
```

`phone` is optional. Clients cannot assign roles via registration.

### Login / token response shape

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": null,
      "status": "ACTIVE",
      "role": { "id": "...", "code": "CUSTOMER", "name": "Customer" },
      "createdAt": "..."
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

Passwords and password hashes are never returned.

### Auth tests

```bash
cd backend
pnpm test:e2e
```

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
3. Phase 2 — authentication & JWT system

Planned next:

1. RBAC authorization guards and user management APIs
2. OAuth (Google/Facebook)
3. Products, categories, sizes, styles APIs
4. Orders and checkout
5. Customer storefront
6. Management dashboard
7. Broader testing and hardening

## Assumptions

- Local development uses Docker Compose PostgreSQL credentials from `backend/.env.example`.
- Frontend defaults to `http://localhost:3001`.
- Backend defaults to `http://localhost:3000` with prefix `/api/v1`.
- Super Admin credentials for seeding are provided via local environment variables only.
- Access tokens are short-lived JWTs; logout revokes refresh tokens (access tokens remain valid until expiry).

## Known limitations (Phase 2)

- No RBAC/authorization guards yet
- No OAuth yet
- No catalog/order business APIs yet
- No customer or dashboard feature pages yet
- Seed creates system roles + Super Admin only (no fake catalog data)
