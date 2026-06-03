# Dockerfile for Railway Gateway
# Builds only the Go gateway service

FROM golang:1.23-alpine AS builder
WORKDIR /app/gateway
COPY gateway/go.mod gateway/go.sum ./
RUN go mod download
COPY gateway/* .
RUN CGO_ENABLED=0 GOOS=linux go build -o gateway ./cmd

FROM alpine:latest
WORKDIR /app

# Install required tools
RUN apk add --no-cache curl bash

# Copy gateway binary
COPY --from=builder /app/gateway/gateway .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Start gateway
CMD ["./gateway"]
