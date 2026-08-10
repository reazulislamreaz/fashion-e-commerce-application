# CLAUDE.md

This repository is the **Easy Fashion Limited Software Engineer Technical Assessment**.

## Mandatory reading

1. Read `AGENTS.md` completely before making changes.
2. Follow the assessment requirements and the current development phase.
3. Do not implement future-phase business features early.

## Current phase

**Phase 8 — Next.js Customer E-Commerce Website**

Completed through Phase 8:

- NestJS + Next.js foundations (Phase 0)
- PostgreSQL + Prisma schema, migrations, and seed (Phase 1)
- Email/password auth, bcrypt, JWT access/refresh tokens, logout, `/me` (Phase 2)
- RBAC `@Roles` decorator + global `RolesGuard` (Phase 3 foundation, applied with catalog, product & order APIs)
- Category / Size / Style CRUD with validation, pagination, search, filtering, sorting (Phase 4)
- Product CRUD with Category/Style/Size relationships, images, validation, RBAC, search, multi-filtering, sorting, pagination, transaction safety, and e2e tests (Phase 5)
- Order placement, server-side price calculation, historical unit price snapshots, atomic transactions, customer isolation, management order listing/filtering, status transitions, and e2e tests (Phase 6)
- Quality assurance, security hardening, input validation auditing, error trace masking, health check, and full regression testing (58/58 passing tests across 5 e2e test suites) (Phase 7)
- Next.js customer e-commerce storefront with Black & Gold branding, Hero carousel, catalog overview metrics, URL-driven search/filter/sort/pagination, image gallery, size picker, persistent guest/user cart, secure checkout, auth integration, and order history snapshots (Phase 8)

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
