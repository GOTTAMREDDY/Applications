# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server.js ./

# Stage 2: Runtime (Alpine for small size)
FROM node:18-alpine

WORKDIR /app

RUN addgroup -S dev && adduser -S robo -G dev

COPY --from=builder /app /app

RUN chown -R robo:dev /app

USER robo

EXPOSE 8080

CMD ["node", "server.js"]