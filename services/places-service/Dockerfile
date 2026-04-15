FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o places-service ./cmd

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/places-service .
EXPOSE 8082
CMD ["./places-service"]
