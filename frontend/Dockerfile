# ==========================================
# STAGE 1: Dependency Installation (deps)
# ==========================================
# Use Node 20 LTS Alpine image for minimal size and security.
FROM node:20-alpine AS deps

# Add libc6-compat for compatibility with native C++ node modules on Alpine Linux.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependency metadata files.
COPY package*.json ./

# Install dependencies cleanly based on lockfile.
RUN npm ci


# ==========================================
# STAGE 2: Application Build Stage (builder)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from the deps stage to avoid reinstalling.
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code.
COPY . .

# Disable Next.js anonymous telemetry collection.
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true

# Next.js bakes NEXT_PUBLIC_* environment variables into client-side JS during build time.
# We accept ARG values during docker build so they can be injected into the build stage.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID

# Build Next.js application. Output: 'standalone' produces .next/standalone.
RUN npm run build


# ==========================================
# STAGE 3: Slim Production Runtime Stage (runner)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Production environment flag to optimize React runtime.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create unprivileged system user and group for security.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets (e.g. images, favicon in public folder).
COPY --from=builder /app/public ./public

# Prepare .next directory with correct user permissions for caching.
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone server output from builder stage.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy compiled static assets (CSS, JS bundles) into .next/static.
# Standalone mode expects static assets at .next/static relative to server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Run container as non-root user.
USER nextjs

# Expose port 3000.
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the standalone Next.js Node server.
CMD ["node", "server.js"]
