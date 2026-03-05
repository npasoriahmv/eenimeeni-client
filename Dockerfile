# Use official Bun image
FROM oven/bun:1

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy the rest of the project
COPY . .

# Build Next.js
RUN bun run build

# Expose port 3000 for Dokploy / Traefik
EXPOSE 3000

# Start the app
CMD ["bun", "run", "start"]