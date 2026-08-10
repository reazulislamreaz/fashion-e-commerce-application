# Easy Fashion Limited — E-Commerce Assessment

Technical assessment project for **Easy Fashion Limited**, developed incrementally by phase.

## Current phase

**Phase 12 — Final QA & Submission Readiness (COMPLETE)**

The application is fully developed, polished, tested, hardened, and ready for production/submission. All backend APIs, Customer Storefront UI, Management Dashboard UI, authentication, authorization, RBAC, database migrations, seeding, responsive design, and automated E2E tests are complete and verified.

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
│   │   ├── modules/        # Feature modules (auth, catalog, health)
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

## Catalog management APIs (Phase 4)

All catalog routes require a Bearer access token. Mutations are limited to `SUPER_ADMIN` and `ADMIN`. `MANAGER` and `CUSTOMER` may read but cannot create/update/delete.

| Method | Endpoint | Roles (mutations) | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/categories` | Super Admin, Admin | Create category |
| `GET` | `/api/v1/categories` | Authenticated | List categories |
| `GET` | `/api/v1/categories/:id` | Authenticated | Get category |
| `PATCH` | `/api/v1/categories/:id` | Super Admin, Admin | Update category |
| `DELETE` | `/api/v1/categories/:id` | Super Admin, Admin | Delete category |
| `POST` | `/api/v1/sizes` | Super Admin, Admin | Create size |
| `GET` | `/api/v1/sizes` | Authenticated | List sizes |
| `GET` | `/api/v1/sizes/:id` | Authenticated | Get size |
| `PATCH` | `/api/v1/sizes/:id` | Super Admin, Admin | Update size |
| `DELETE` | `/api/v1/sizes/:id` | Super Admin, Admin | Delete size |
| `POST` | `/api/v1/styles` | Super Admin, Admin | Create style |
| `GET` | `/api/v1/styles` | Authenticated | List styles |
| `GET` | `/api/v1/styles/:id` | Authenticated | Get style |
| `PATCH` | `/api/v1/styles/:id` | Super Admin, Admin | Update style |
| `DELETE` | `/api/v1/styles/:id` | Super Admin, Admin | Delete style |

### List query parameters

| Param | Description |
| --- | --- |
| `page` | Page number (≥ 1, default 1) |
| `limit` | Page size (1–100, default 20) |
| `search` | Case-insensitive name contains |
| `status` | `active` / `inactive` (or `true` / `false`) |
| `sortBy` | Allowlisted field (`name`, `createdAt`, `updatedAt`; sizes also `sortOrder`) |
| `sortOrder` | `asc` or `desc` |

### Create / update notes

- Names are trimmed; duplicates are rejected case-insensitively (`409 Conflict`).
- Categories/Styles support optional `description` and `isActive`.
- Sizes support `sortOrder` and `isActive`.
- Hard delete returns `409` when the record is referenced by products (FK `Restrict`). Prefer deactivating via `PATCH` `{ "isActive": false }`.

### Example create category

```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Summer Collection","description":"Seasonal apparel"}'
```

### Example list response shape

```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

## Product management APIs (Phase 5)

All product routes require a Bearer access token. Mutations are limited to `SUPER_ADMIN` and `ADMIN`. `MANAGER` and `CUSTOMER` may read but cannot create/update/delete.

| Method | Endpoint | Roles (mutations) | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/products` | Super Admin, Admin | Create product with relations and images |
| `GET` | `/api/v1/products` | Authenticated | List products with search, multi-filtering, sorting, pagination |
| `GET` | `/api/v1/products/:id` | Authenticated | Get detailed product by ID |
| `PATCH` | `/api/v1/products/:id` | Super Admin, Admin | Update product (partial update, replace sizes/images) |
| `DELETE` | `/api/v1/products/:id` | Super Admin, Admin | Delete product (restricted if referenced by orders) |

### Product Query Parameters

| Param | Description |
| --- | --- |
| `page` | Page number (≥ 1, default 1) |
| `limit` | Page size (1–100, default 20) |
| `search` | Case-insensitive name contains |
| `categoryId` | Filter by Category UUID |
| `styleId` | Filter by Style UUID |
| `sizeId` | Filter by Size UUID (via `ProductSize` join table) |
| `status` | `active` / `inactive` (or `true` / `false`) |
| `sortBy` | Allowlisted field (`name`, `price`, `createdAt`, `updatedAt`; default `createdAt`) |
| `sortOrder` | `asc` or `desc` (default `desc` for createdAt, `asc` for others) |

### Example Product Create Body

```json
{
  "name": "Classic Cotton T-Shirt",
  "description": "100% premium combed cotton crewneck shirt",
  "price": 29.99,
  "categoryId": "00000000-0000-4000-8000-000000000001",
  "styleId": "00000000-0000-4000-8000-000000000002",
  "sizeIds": [
    "00000000-0000-4000-8000-000000000003",
    "00000000-0000-4000-8000-000000000004"
  ],
  "images": [
    {
      "url": "https://images.example.com/products/shirt-front.jpg",
      "sortOrder": 1,
      "isPrimary": true
    },
    {
      "url": "https://images.example.com/products/shirt-back.jpg",
      "sortOrder": 2,
      "isPrimary": false
    }
  ]
}
```

## Order management APIs (Phase 6)

All order routes require a Bearer access token. Customer orders are automatically assigned to the authenticated user. Management users (`SUPER_ADMIN`, `ADMIN`, `MANAGER`) have system-wide order view and status update permissions.

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/orders` | Authenticated Customer | Place an order with server-calculated totals |
| `GET` | `/api/v1/orders` | Authenticated | List orders (Customer gets own orders; Management gets all with search/filter/pagination) |
| `GET` | `/api/v1/orders/:id` | Authenticated | Get order details (Customer isolated to own order) |
| `PATCH` | `/api/v1/orders/:id/status` | Super Admin, Admin, Manager | Update order status following state machine transition rules |

### Order Query Parameters

| Param | Description |
| --- | --- |
| `page` | Page number (≥ 1, default 1) |
| `limit` | Page size (1–100, default 20) |
| `status` | Filter by `OrderStatus` enum (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |
| `search` | Case-insensitive search on Order ID, customer name, phone, or customer email |
| `userId` | Filter by customer user ID (Management only) |
| `from` | Start ISO date range filter (inclusive) |
| `to` | End ISO date range filter (inclusive) |
| `sortBy` | Allowlisted field (`createdAt`, `updatedAt`, `totalAmount`, `status`; default `createdAt`) |
| `sortOrder` | `asc` or `desc` (default `desc`) |

### Example Order Placement Request

```json
{
  "customerName": "John Doe",
  "phoneNumber": "+8801700000000",
  "shippingAddress": "House 12, Road 5, Block B, Mirpur, Dhaka",
  "items": [
    {
      "productId": "00000000-0000-4000-8000-000000000001",
      "quantity": 2
    },
    {
      "productId": "00000000-0000-4000-8000-000000000002",
      "quantity": 1
    }
  ]
}
```

*Note: Prices (`unitPrice`, `subtotal`, `totalAmount`) are strictly calculated on the server from current active product records. Client attempts to pass custom price fields are rejected.*

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

## Phase progress

Completed phases:

1. **Phase 0** — Project foundation & environment validation
2. **Phase 1** — Database schema, relationships, constraints & seed system
3. **Phase 2** — Authentication, password hashing, and JWT refresh token system
4. **Phase 3** — Role-Based Access Control (RBAC) foundation & authorization guards
5. **Phase 4** — Category, Size & Style management APIs
6. **Phase 5** — Product management APIs (CRUD, image sorting, multi-size tagging)
7. **Phase 6** — Order management backend (order placement, price validation, snapshotting, status state machine)
8. **Phase 7** — Backend quality assurance, security hardening & E2E regression testing (58/58 passing tests)
9. **Phase 8** — Next.js Customer E-Commerce Storefront (Hero carousel, catalog metrics, product gallery, cart, checkout, auth, orders)
10. **Phase 9** — Customer Authentication & Profile Portal UI (Token refresh rotation, Google & Facebook OAuth buttons, password toggles, ProtectedRoute guard, `/profile` customer portal)
11. **Phase 10** — Management Dashboard UI (Next.js overview stats, products CRUD, categories/sizes/styles CRUD, orders status updates, user management)
12. **Phase 11** — UI/UX & Responsive Polish (Design system primitives, responsive 320px–1920px audit, focus rings, accessibility)
13. **Phase 12** — Final QA & Submission Readiness (End-to-end audit, security check, build verification, documentation, readiness pass)

## Assumptions

- Local development uses Docker Compose PostgreSQL credentials from `backend/.env.example`.
- Frontend defaults to `http://localhost:3001`.
- Backend defaults to `http://localhost:3000` with prefix `/api/v1`.
- Super Admin credentials for seeding are provided via local environment variables only.
- Access tokens are short-lived JWTs; logout revokes refresh tokens (access tokens remain valid until expiry).
- Catalog name uniqueness is case-insensitive (app checks + `LOWER(name)` unique indexes).
