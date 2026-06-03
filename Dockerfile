# Dockerfile for Railway Deployment
# Railway will use this to deploy the application

# Build stage for Go Gateway
FROM golang:1.23-alpine AS gateway-builder
WORKDIR /app/gateway
COPY gateway/go.mod gateway/go.sum ./
RUN go mod download
COPY gateway .
RUN CGO_ENABLED=0 GOOS=linux go build -o gateway ./cmd

# Build stage for React frontend
FROM node:20-alpine AS web-builder
WORKDIR /app/web-app
COPY web-app/package*.json ./
RUN npm ci
COPY web-app .
RUN npm run build

# Final stage - combined application
FROM alpine:latest
WORKDIR /app

# Install required tools
RUN apk add --no-cache curl bash postgresql-client

# Copy gateway binary
COPY --from=gateway-builder /app/gateway/gateway ./gateway

# Copy React build
COPY --from=web-builder /app/web-app/build ./web-app/build

# Set environment variables
ENV PORT=8080
ENV JWT_SECRET=railway-production-secret-key-32-chars-min-8e9f7a2b4c5d6e9f0a1b2c3d4e5f6g7h

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expose port
EXPOSE 8080

# Start gateway
CMD ["./gateway"]
