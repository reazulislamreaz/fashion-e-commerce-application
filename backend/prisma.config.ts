import 'dotenv/config';
import { defineConfig } from '@prisma/config';

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/easy_fashion_db?schema=public';

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});

