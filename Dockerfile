# CS2 Trade-Up Educational Bot - Dockerfile
# Base: Node.js 24 Alpine (minimal footprint ~5MB base)

FROM node:24-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@latest

# Create non-root user for security
RUN addgroup -g 1001 -S botuser && \
    adduser -u 1001 -S botuser -G botuser

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application source
COPY . .

# Build TypeScript to JavaScript
RUN pnpm build

# Create /data directory for persistent storage
RUN mkdir -p /data && \
    chown -R botuser:botuser /data

# Switch to non-root user
USER botuser

# Expose health check port (optional, for future use)
EXPOSE 3000

# Set environment defaults
ENV NODE_ENV=production \
    LOG_LEVEL=info

# Entrypoint: Run the compiled bot
CMD ["node", "dist/index.js"]
