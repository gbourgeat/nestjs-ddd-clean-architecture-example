# =============================================================================
# Route Solver - Dockerfile
# Optimized multi-stage build for NestJS
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Base image with Node.js
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Dependencies - Install dependencies
# -----------------------------------------------------------------------------
FROM base AS deps

COPY package.json package-lock.json* ./

RUN npm ci

# -----------------------------------------------------------------------------
# Stage 3: Builder - Compile TypeScript project
# -----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY package.json ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: Production dependencies - Production dependencies only
# -----------------------------------------------------------------------------
FROM base AS prod-deps

COPY package.json package-lock.json* ./

RUN npm ci --only=production && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 5: Runner - Final production image
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

LABEL org.opencontainers.image.title="Route Solver API"
LABEL org.opencontainers.image.description="NestJS API for planning optimal routes between French cities"
LABEL org.opencontainers.image.version="0.0.1"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

CMD ["node", "dist/presentation/rest-api/rest-api.bootsrap.js"]
