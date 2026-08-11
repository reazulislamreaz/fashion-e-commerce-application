# Easy Fashion Limited — Full-Stack E-Commerce Application

An enterprise-grade, high-performance full-stack fashion e-commerce application built with **NestJS**, **Next.js 15 (App Router)**, **PostgreSQL**, and **Prisma ORM**.

---

## Technical Architecture & Tech Stack

```text
                               ┌───────────────────────────┐
                               │   Next.js 15 Frontend     │
                               │   (Port 3001 / Docker 9977)│
                               └─────────────┬─────────────┘
                                             │ HTTP REST / JWT
                                             ▼
                               ┌───────────────────────────┐
                               │     NestJS API Backend    │
                               │   (Port 3000 / Docker 9978)│
                               └─────────────┬─────────────┘
                                             │ Prisma ORM / SQL
                                             ▼
                               ┌───────────────────────────┐
                               │    PostgreSQL Database    │
                               │   (Port 5432 / Docker 5430)│
                               └───────────────────────────┘
```

| Layer | Technology | Key Libraries / Frameworks |
| --- | --- | --- |
| **Frontend** | Node.js, TypeScript | Next.js 15 (App Router), Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, TypeScript | NestJS, Passport JWT, Bcrypt, Multer, Cloudinary, Nodemailer |
| **Database & ORM** | PostgreSQL 17 | Prisma ORM, `@prisma/adapter-pg` |
| **DevOps & Tooling** | Docker, Docker Compose | pnpm workspace, ESLint, Prettier |

---

## Prerequisites

Before running the application, make sure you have the following installed on your machine:

- **Node.js**: `>= 20.19.0`
- **pnpm**: `>= 9.0.0` (`npm i -g pnpm` or `corepack enable`)
- **Docker & Docker Compose**: (Recommended for running database and complete stack with one command)
- **Git**

---

## Quick Start (Recommended — Run with Docker Compose)

The entire application (PostgreSQL Database, NestJS Backend API, and Next.js Frontend) can be started with a single command using Docker Compose.

### Step 1: Clone the Repository

```bash
git clone https://github.com/reazulislamreaz/fashion-e-commerce-application.git
cd fashion-e-commerce-application
```

### Step 2: Configure Environment Files

Copy the example environment configuration files:

```bash
# Copy root Docker environment configuration
cp .env.example .env

# Copy backend environment configuration
cp backend/.env.example backend/.env

# Copy frontend environment configuration
cp frontend/.env.example frontend/.env.local
```

### Step 3: Launch Containers

```bash
docker compose up --build
```

This single command will:
1. Start the **PostgreSQL 17** container and wait for database health check.
2. Build and start the **NestJS Backend** container.
3. Automatically run **Prisma database migrations** and seed initial roles, products, catalog, and Super Admin user on startup.
4. Build and start the **Next.js Frontend** container.

### Step 4: Access the Application

Once the containers are up and running:

* **Storefront & Admin Portal (Frontend)**: [http://localhost:9977](http://localhost:9977)
* **Backend REST API**: [http://localhost:9978/api/v1](http://localhost:9978/api/v1)
* **Interactive API Documentation (Swagger)**: [http://localhost:9978/docs](http://localhost:9978/docs)
* **Database (PostgreSQL)**: `localhost:5430` (`easy_user` / `secure_db_password`)

---

## Docker Management Commands

```bash
# Start containers in background (detached mode)
docker compose up -d

# View real-time application logs
docker compose logs -f

# View backend logs specifically
docker compose logs -f backend

# Stop all running containers
docker compose down

# Stop containers and wipe PostgreSQL persistent data (Fresh DB Start)
docker compose down -v
```

---

## Running Locally Without Docker

If you prefer to run the database, backend, and frontend directly on your host machine:

### Step 1: Start a Local PostgreSQL Instance

Option A: Run PostgreSQL via Docker Compose database container only:
```bash
docker compose up -d postgres
```

Option B: Use your local PostgreSQL service and create a database named `easy_fashion_db`.

### Step 2: Install Dependencies

From the repository root:

```bash
# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install

cd ..
```

### Step 3: Configure `.env` Files

Ensure `backend/.env` points to your local PostgreSQL connection string:

```env
# backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/easy_fashion_db?schema=public&sslmode=disable
JWT_ACCESS_SECRET=replace_with_secure_access_secret_min_32_chars
JWT_REFRESH_SECRET=replace_with_secure_refresh_secret_min_32_chars
SUPER_ADMIN_EMAIL=admin@elevateapparel.com.bd
SUPER_ADMIN_PASSWORD=superadmin123
CORS_ORIGIN=http://localhost:3001
PORT=3000
```

Ensure `frontend/.env.local` points to your local backend API URL:

```env
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

### Step 4: Run Database Migrations & Seed Data

```bash
cd backend
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
cd ..
```

### Step 5: Start Development Servers

Run backend and frontend servers in separate terminal windows:

**Terminal 1 (Backend API)**:
```bash
cd backend
pnpm start:dev
```
*Backend will run on [http://localhost:3000](http://localhost:3000)*

**Terminal 2 (Frontend App)**:
```bash
cd frontend
pnpm dev
```
*Frontend will run on [http://localhost:3001](http://localhost:3001)*

---

## Default Super Admin Credentials

When the database is seeded (either via Docker startup or `pnpm prisma:seed`), a default Super Admin account is automatically created:

* **Email**: `admin@elevateapparel.com.bd`
* **Password**: `superadmin123`
* **Role**: `SUPER_ADMIN` (Access to Super Admin Dashboard, Catalog Management, Orders, User Management)

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| --- | --- | --- |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `PORT` | Backend HTTP port | `3000` (Local) / `9978` (Docker) |
| `API_PREFIX` | API routing version prefix | `/api/v1` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/dbname` |
| `CORS_ORIGIN` | Allowed origin URLs for CORS (comma-separated) | `http://localhost:3001,http://localhost:9977` |
| `JWT_ACCESS_SECRET` | Secret key for signing Access JWTs (min 16 chars) | `replace_with_secure_access_secret_min_32_chars` |
| `JWT_REFRESH_SECRET` | Secret key for signing Refresh JWTs (min 16 chars) | `replace_with_secure_refresh_secret_min_32_chars` |
| `JWT_ACCESS_EXPIRES_IN` | Access Token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token lifetime | `7d` |
| `SUPER_ADMIN_EMAIL` | Email for initial database seed super admin | `admin@elevateapparel.com.bd` |
| `SUPER_ADMIN_PASSWORD` | Password for initial database seed super admin | `superadmin123` |
| `FRONTEND_URL` | Frontend URL used for email links (verification, reset password) | `http://localhost:3001` |
| `GMAIL_USER` | *(Optional)* Gmail address for sending automated emails | `your_email@gmail.com` |
| `GMAIL_APP_PASSWORD` | *(Optional)* Gmail App Password for SMTP | `your_app_password` |
| `CLOUDINARY_CLOUD_NAME` | *(Optional)* Cloudinary Cloud Name for product image uploads | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | *(Optional)* Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | *(Optional)* Cloudinary API Secret | `your_api_secret` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default / Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Public API base URL including prefix | `http://localhost:3000/api/v1` (Local) / `http://localhost:9978/api/v1` (Docker) |

---

## Directory Structure Overview

```text
fashion-e-commerce-application/
├── backend/                  # NestJS REST API
│   ├── src/
│   │   ├── common/           # DTOs, guards, interceptors, filters, decorators
│   │   ├── config/           # Joi environment validation & Swagger config
│   │   ├── database/         # Prisma service & module
│   │   ├── modules/          # Auth, Products, Categories, Styles, Sizes, Orders, Users, Health
│   │   └── main.ts           # NestJS bootstrap entrypoint
│   ├── prisma/               # Schema design & database seed script
│   │   ├── schema.prisma     # PostgreSQL schema definition
│   │   └── seed.ts           # Idempotent database seed script
│   ├── Dockerfile            # Multi-stage production NestJS container
│   ├── docker-entrypoint.sh  # Auto-migration & auto-seeding container script
│   └── package.json
├── frontend/                 # Next.js 15 Storefront & Dashboard
│   ├── src/
│   │   ├── app/              # App router pages (storefront, dashboard, auth)
│   │   ├── components/       # UI components (auth, catalog, layout, dashboard)
│   │   ├── lib/              # API client, services, state context
│   │   └── types/            # TypeScript interfaces & enums
│   ├── Dockerfile            # Multi-stage production Next.js container
│   └── package.json
├── docker-compose.yml        # Docker Compose configuration (PostgreSQL, Backend, Frontend)
├── .env.example              # Root environment template for Docker Compose
├── .gitignore                # Git ignore rules for node_modules, build outputs & secrets
└── README.md                 # Complete documentation & developer guide
```

---

## Troubleshooting & FAQ

### 1. Database Connection Failed (`ECONNREFUSED`)
* **Cause**: PostgreSQL is not running or invalid credentials in `DATABASE_URL`.
* **Fix**: Ensure PostgreSQL container is healthy:
  ```bash
  docker compose ps
  ```
  Check database connection string in `backend/.env` or root `.env`.

### 2. Port Already in Use (`EADDRINUSE 3000` / `9978`)
* **Cause**: Another application or orphaned container is using port 3000, 3001, 9978, or 9977.
* **Fix**: Stop existing containers or process on that port:
  ```bash
  docker compose down
  # Or kill process using port 3000 (Linux/macOS):
  lsof -ti:3000 | xargs kill -9
  ```

### 3. Migration or Seed Errors
* **Cause**: Outdated database schema state.
* **Fix**: Reset database and re-run migrations:
  ```bash
  # Docker setup reset:
  docker compose down -v
  docker compose up --build

  # Local setup reset:
  cd backend
  pnpm prisma:migrate:reset
  ```

### 4. CORS Errors on Frontend
* **Cause**: `CORS_ORIGIN` in `backend/.env` does not match the URL of your frontend.
* **Fix**: Update `CORS_ORIGIN` in `backend/.env` to match your frontend origin (e.g. `http://localhost:3001,http://localhost:9977`).

---

## Verification & Testing

To run automated backend unit and integration tests:

```bash
cd backend

# Run NestJS unit tests
pnpm test

# Run E2E API tests
pnpm test:e2e

# Run TypeScript compilation check
pnpm typecheck
```

To test frontend compilation:

```bash
cd frontend
pnpm typecheck
pnpm build
```

---

## Security & Repository Hygiene

- **Secrets**: `.env` and `.env.local` files are strictly included in `.gitignore` and are never committed.
- **Production Build**: Docker images use multi-stage builds and unprivileged user runtime configurations.
- **Passwords**: All user passwords are encrypted using Bcrypt with a minimum cost factor of 12.
