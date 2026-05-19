# Stage 1: Build backend (Go)
FROM golang:1.23-alpine AS backend-builder

WORKDIR /app

# Скопируй весь проект
COPY . .

WORKDIR /app/gateway

# Загрузи зависимости и собери
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o gateway ./cmd

# Stage 2: Build frontend (React)
FROM node:18-alpine AS frontend-builder

WORKDIR /app

COPY web-app /app

# Установи зависимости и собери
RUN npm install --legacy-peer-deps
RUN npm run build

# Stage 3: Runtime (Alpine Linux с поддержкой обоих сервисов)
FROM alpine:latest

# Установи необходимые утилиты
RUN apk add --no-cache \
    ca-certificates \
    curl \
    libc6-compat \
    nodejs \
    npm

WORKDIR /app

# Скопируй backend
COPY --from=backend-builder /app/gateway/gateway /app/gateway

# Скопируй frontend build
COPY --from=frontend-builder /app/build /app/web-app/build

# Скопируй миграции БД если есть
COPY migrations /app/migrations

# Expose ports
# 8080 для backend (Go)
# 3000 для frontend (если понадобится для разработки)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Запусти backend
CMD ["/app/gateway"]
