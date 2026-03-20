# -------------------------
# Stage 1: Build (Dependencies)
# -------------------------
FROM python:3.9-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y gcc build-essential

# Copy only requirements first (for caching)
COPY requirements.txt .

# Install dependencies into a separate folder
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# -------------------------
# Stage 2: Runtime (Lightweight)
# -------------------------
FROM python:3.9-slim

WORKDIR /app

# Create user (best practice)
RUN addgroup --system roboshop && adduser --system --ingroup roboshop roboshop

# Copy installed dependencies from builder
COPY --from=builder /install /app

# Copy application code
COPY . .

# Set permissions
RUN chown -R roboshop:roboshop /app

USER roboshop

# Environment variables (same as systemd)
ENV CART_HOST=cart \
    CART_PORT=8080 \
    USER_HOST=user \
    USER_PORT=8080 \
    AMQP_HOST=rabbitmq \
    AMQP_USER=roboshop \
    AMQP_PASS=roboshop123

EXPOSE 8080

# Start application (NO systemd in Docker)
CMD ["uwsgi", "--ini", "payment.ini"]