FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod .
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o chat-service ./cmd/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/chat-service .
EXPOSE 8086
CMD ["./chat-service"]
