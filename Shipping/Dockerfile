# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy only pom.xml
COPY pom.xml .

# Download dependencies (cached layer)
RUN mvn dependency:go-offline

# Copy source
COPY src ./src

# Build
RUN mvn clean package

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/shipping-1.0.jar /app/shipping.jar
RUN addgroup -S dev && adduser -S robo -G dev
ENV  CART_ENDPOINT=cart:8080 \
     DB_HOST=mysql

RUN chown -R robo:dev /app

USER robo

EXPOSE 8080

CMD ["java", "-jar", "shipping.jar"]