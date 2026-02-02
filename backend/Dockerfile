# backend/Dockerfile
FROM oven/bun:1.3-alpine AS base

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production stage
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunuser

# Copy necessary files
COPY --from=builder --chown=bunuser:nodejs /app/src ./src
COPY --from=builder --chown=bunuser:nodejs /app/package.json ./
COPY --from=deps --chown=bunuser:nodejs /app/node_modules ./node_modules

USER bunuser

EXPOSE 3000

ENV PORT=3000

CMD ["bun", "run", "start"]
