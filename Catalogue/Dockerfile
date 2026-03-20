# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Runtime
FROM node:18-slim

WORKDIR /app

# Create user again (important)
RUN addgroup --system dev && adduser --system --ingroup dev robo

# Copy built app
COPY --from=builder /app /app

# Set ownership (important for permissions)
RUN chown -R robo:dev /app

USER robo

EXPOSE 8080

CMD ["node", "server.js"]