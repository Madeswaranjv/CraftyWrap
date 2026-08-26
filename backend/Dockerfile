# ==========================================
# STAGE 1: Build Stage (Builder)
# ==========================================
# We use Node 20 LTS on Alpine Linux for a lightweight, secure base image.
FROM node:20-alpine AS builder

# Set the working directory inside the container for all subsequent commands.
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker layer caching.
# If these files haven't changed, Docker will reuse cached node_modules instead of re-installing.
COPY package*.json ./

# Install all dependencies (including devDependencies like typescript and @types/node).
# 'npm ci' ensures clean, deterministic installs based on package-lock.json.
RUN npm ci

# Copy the rest of the application source code (src/, tsconfig.json).
COPY . .

# Run the TypeScript compiler ('tsc') defined in package.json's build script.
# This compiles .ts files from src/ into production-ready .js files in dist/.
RUN npm run build


# ==========================================
# STAGE 2: Production Runtime Stage (Runner)
# ==========================================
# We start from a fresh lightweight node:20-alpine image to keep the final image minimal,
# discarding build tools and devDependencies.
FROM node:20-alpine AS runner

# Set production environment flag. This turns off debug utilities in express and libraries.
ENV NODE_ENV=production

# Set working directory inside the runtime container.
WORKDIR /app

# Copy package files again to install ONLY production dependencies.
COPY package*.json ./

# Install strictly production dependencies to keep the image lean and minimize security vulnerabilities.
RUN npm ci --only=production

# Copy the compiled JavaScript code from the builder stage into the runner stage.
COPY --from=builder /app/dist ./dist

# Create a non-root system user and group for security.
# Running applications as root inside a container is a security risk.
RUN addgroup -S expressgroup && adduser -S expressuser -G expressgroup

# Change file ownership to the non-root user.
RUN chown -R expressuser:expressgroup /app

# Switch to the non-root user.
USER expressuser

# Inform Docker that the container listens on port 5000 at runtime.
EXPOSE 5000

# Default PORT environment variable if not specified at runtime.
ENV PORT=5000

# Specify the command to start the compiled Express backend.
CMD ["node", "dist/server.js"]
