#!/bin/sh
set -e

echo "==> Running Prisma Database Migrations..."
npx prisma migrate deploy

if [ "$SEED_DB_ON_STARTUP" = "true" ]; then
  echo "==> Seeding Database (roles, catalog, super admin)..."
  if ! pnpm prisma:seed; then
    echo "ERROR: Database seeding failed. Catalog/admin data will be missing."
    echo "Fix the error above, then re-run: docker compose exec backend pnpm prisma:seed"
    exit 1
  fi
  echo "==> Database seeding completed."
fi

echo "==> Starting NestJS Backend Application on Port ${PORT:-3000}..."
exec "$@"
