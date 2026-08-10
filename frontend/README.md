# Easy Fashion Frontend

Next.js + TypeScript + Tailwind CSS foundation for the Easy Fashion Limited assessment.

## Phase 0 scope

- App bootstrap and base layout
- Environment-based API configuration
- Reusable API client
- Loading / error / empty UI patterns
- Backend health status probe (foundation verification only)

Business pages (storefront, dashboard, auth) are intentionally not implemented yet.

## Setup

From this directory (`frontend/`):

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

App runs on `http://localhost:3001` by default.

Ensure the NestJS API in `../backend` is running and reachable at the URL in `NEXT_PUBLIC_API_BASE_URL`.
