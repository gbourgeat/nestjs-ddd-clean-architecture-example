# =============================================================================
# Route Solver - Dockerfile
# Multi-stage build optimisé pour NestJS
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Image de base avec Node.js
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Dependencies - Installation des dépendances
# -----------------------------------------------------------------------------
FROM base AS deps

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer toutes les dépendances (y compris devDependencies pour le build)
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 3: Builder - Compilation du projet TypeScript
# -----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copier les dépendances depuis le stage précédent
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source et les fichiers de configuration
COPY package.json ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

# Compiler le projet
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: Production dependencies - Dépendances de production uniquement
# -----------------------------------------------------------------------------
FROM base AS prod-deps

COPY package.json package-lock.json* ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 5: Runner - Image finale de production
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

# Labels pour la documentation de l'image
LABEL org.opencontainers.image.title="Route Solver API"
LABEL org.opencontainers.image.description="API NestJS pour la planification d'itinéraires optimaux entre villes françaises"
LABEL org.opencontainers.image.version="0.0.1"

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Copier les dépendances de production
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copier les fichiers compilés
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Utiliser l'utilisateur non-root
USER nestjs

# Exposer le port de l'application
EXPOSE 3000

# Healthcheck pour vérifier que l'application fonctionne
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Commande de démarrage
CMD ["node", "dist/presentation/rest-api/rest-api.bootsrap.js"]
