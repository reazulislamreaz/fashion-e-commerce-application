# CLAUDE.md

This repository is the **Easy Fashion Limited Software Engineer Technical Assessment**.

## Mandatory reading

1. Read `AGENTS.md` completely before making changes.
2. Follow the assessment requirements and the current development phase.
3. Do not implement future-phase business features early.

## Current phase

**Phase 2 — Authentication & JWT System**

Completed through Phase 2:

- NestJS + Next.js foundations (Phase 0)
- PostgreSQL + Prisma schema, migrations, and seed (Phase 1)
- Email/password auth, bcrypt, JWT access/refresh tokens, logout, `/me` (Phase 2)

Do **not** implement RBAC role guards, OAuth, or catalog/order CRUD yet (Phase 3+).

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

Auth e2e tests:

```bash
cd backend
pnpm test:e2e
```
