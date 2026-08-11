# ==========================================
# Next.js 15 Frontend Production Dockerfile
# Multi-stage build optimized for production
# ==========================================

FROM node:20.19.6-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@9.15.4

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# Builder stage
FROM node:20.19.6-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9.15.4

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public API URL argument (defaults to local Docker compose backend port)
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# Runner stage
FROM node:20.19.6-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm install -g pnpm@9.15.4

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD ["pnpm", "start", "-p", "3001"]

