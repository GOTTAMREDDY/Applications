FROM python:3.9-slim AS builder

WORKDIR /app

RUN addgroup --system roboshop && adduser --system --ingroup roboshop roboshop

COPY --from=builder /install /app
COPY . .

# 🔥 FIX: add this line
ENV PATH="/app/bin:$PATH"

RUN chown -R roboshop:roboshop /app

USER roboshop

ENV CART_HOST=cart \
    CART_PORT=8080 \
    USER_HOST=user \
    USER_PORT=8080 \
    AMQP_HOST=rabbitmq \
    AMQP_USER=roboshop \
    AMQP_PASS=roboshop123

EXPOSE 8080

CMD ["uwsgi", "--ini", "payment.ini"]