import 'dotenv/config';
import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'Missing environment variable DATABASE_URL. Set it in backend/.env (see .env.example).',
  );
}

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});

