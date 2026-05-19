.PHONY: help docker-build docker-up docker-down docker-restart docker-logs docker-clean

help:
	@echo "Available commands:"
	@echo "  make docker-up         - Start all services"
	@echo "  make docker-up-build   - Build and start all services"
	@echo "  make docker-down       - Stop all services"
	@echo "  make docker-logs       - View all logs"
	@echo "  make docker-logs-SVC   - View service logs (auth|places|reviews|media|gateway|web)"
	@echo "  make docker-ps         - Check service status"

docker-up:
	docker compose up -d

docker-up-build:
	docker compose up -d --build

docker-down:
	docker compose down

docker-restart:
	docker compose restart

docker-logs:
	docker compose logs -f

docker-logs-auth:
	docker compose logs -f auth-service

docker-logs-places:
	docker compose logs -f places-service

docker-logs-reviews:
	docker compose logs -f reviews-service

docker-logs-media:
	docker compose logs -f media-service

docker-logs-gateway:
	docker compose logs -f gateway

docker-logs-web:
	docker compose logs -f web

docker-ps:
	docker compose ps

docker-clean:
	docker system prune -a -f
	docker volume prune -f
