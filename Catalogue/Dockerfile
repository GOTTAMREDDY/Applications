# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev 

COPY server.js ./

# Stage 2: Runtime (Alpine for small size)
FROM node:18-alpine

WORKDIR /app

RUN addgroup -S dev && adduser -S robo -G dev

COPY --from=builder /app /app
ENV MONGO=true \
     MONGO_URL="mongodb://mongodb:27017/catalogue"

RUN chown -R robo:dev /app

USER robo

EXPOSE 8080

CMD ["node", "server.js"]