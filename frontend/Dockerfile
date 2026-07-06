# syntax=docker/dockerfile:1

# ---- dependencies ----
FROM docker.io/library/node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM docker.io/library/node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Per-environment NEXT_PUBLIC_* values come from .env.production by default
# (Next loads it for production builds). Optionally override via build args —
# e.g. to point a local Docker demo at http://localhost:8080. When an arg is
# empty it is unset so the committed .env.production value wins.
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN [ -n "$NEXT_PUBLIC_API_URL" ] || unset NEXT_PUBLIC_API_URL; \
    [ -n "$NEXT_PUBLIC_GOOGLE_CLIENT_ID" ] || unset NEXT_PUBLIC_GOOGLE_CLIENT_ID; \
    npm run build

# ---- runtime ----
FROM docker.io/library/node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# The standalone output bundles a minimal server + only the needed node_modules.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
