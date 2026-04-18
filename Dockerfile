# ── 7-Star Layer Management Strategy (LMS) Dockerfile ──

# Stage 1: Build Layer
FROM node:18-alpine AS builder
WORKDIR /app

# LMS Gate: Layer caching optimization
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production Layer (LMS Gating for minimal footprint)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Security Gating: Run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary artifacts (LMS optimization)
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

# LMS Metadata Gating
LABEL project="Dubai Seven Wonders"
LABEL tier="7-Star"
LABEL version="1.0.0"
LABEL maintainer="Shiv Shambhu"

CMD ["npm", "start"]
