# -------- Stage 1 --------
FROM python:3.9-slim AS builder

WORKDIR /install
COPY requirements.txt .
RUN pip install --prefix=/install -r requirements.txt

# -------- Stage 2 --------
FROM python:3.9-slim

WORKDIR /app

RUN addgroup --system roboshop && adduser --system --ingroup roboshop roboshop

COPY --from=builder /install /usr/local
COPY . .

ENV PATH="/usr/local/bin:$PATH"

RUN chown -R roboshop:roboshop /app
USER roboshop

EXPOSE 8080
CMD ["uwsgi", "--ini", "payment.ini"]