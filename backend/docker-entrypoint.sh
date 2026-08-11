#!/bin/sh
set -e

echo "==> Running Prisma Database Migrations..."
npx prisma migrate deploy

if [ "$SEED_DB_ON_STARTUP" = "true" ]; then
  echo "==> Seeding Database..."
  pnpm prisma:seed || echo "Database seeding completed or skipped."
fi

echo "==> Starting NestJS Backend Application on Port ${PORT:-3000}..."
exec "$@"
