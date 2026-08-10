# CLAUDE.md

This repository is the **Easy Fashion Limited Software Engineer Technical Assessment**.

## Mandatory reading

1. Read `AGENTS.md` completely before making changes.
2. Follow the assessment requirements and the current development phase.
3. Do not implement future-phase business features early.

## Current phase

**Phase 1 — Database Schema, Relationships, Constraints & Seed System**

Completed through Phase 1:

- NestJS + Next.js foundations (Phase 0)
- PostgreSQL + Prisma schema, migrations, and seed (Phase 1)

Do **not** implement authentication APIs, JWT/RBAC guards, or catalog/order CRUD yet (Phase 2+).

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

Database:

```bash
cd backend
pnpm db:up
pnpm prisma:migrate
pnpm prisma:seed
```
