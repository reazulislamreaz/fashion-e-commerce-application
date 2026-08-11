FROM node:20.19.6-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@9.15.4

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN pnpm install --frozen-lockfile

COPY . .

# prisma generate loads prisma.config.ts, which requires DATABASE_URL.
# No live DB is needed at build time — runtime URL comes from compose.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN pnpm prisma:generate
RUN pnpm build

FROM node:20.19.6-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN npm install -g pnpm@9.15.4

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]

