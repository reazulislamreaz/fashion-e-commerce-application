# CLAUDE.md

This repository is the **Easy Fashion Limited Software Engineer Technical Assessment**.

## Mandatory reading

1. Read `AGENTS.md` completely before making changes.
2. Follow the assessment requirements and the current development phase.
3. Do not implement future-phase business features early.

## Current phase

**Phase 4 — Category, Size & Style Management APIs**

Completed through Phase 4:

- NestJS + Next.js foundations (Phase 0)
- PostgreSQL + Prisma schema, migrations, and seed (Phase 1)
- Email/password auth, bcrypt, JWT access/refresh tokens, logout, `/me` (Phase 2)
- RBAC `@Roles` decorator + global `RolesGuard` (Phase 3 foundation, applied with catalog APIs)
- Category / Size / Style CRUD with validation, pagination, search, filtering, sorting (Phase 4)

Do **not** implement Product CRUD, Order APIs, OAuth, or dashboard UI yet (Phase 5+).

## Stack

- Backend: Node.js, TypeScript, NestJS, PostgreSQL, Prisma
- Frontend: Next.js, TypeScript, Tailwind CSS

## Project layout

```text
backend/   # NestJS API — install & run independently
frontend/  # Next.js app — install & run independently
docs/      # Design notes (including DATABASE.md)
```

## Commands

See root `README.md`, `backend/package.json`, and `frontend/package.json`.

E2E tests (auth + catalog):

```bash
cd backend
pnpm test:e2e
```
