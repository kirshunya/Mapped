# В начале Makefile добавьте:
export CONFIG_PATH ?= $(shell cat .env | grep '^CONFIG_PATH=' | cut -d '=' -f2)

# Для сервиса пользователя:
user:
	@echo "Starting user service..."
	go run ./user-service/cmd/main.go

# Для сервиса места:
place:
	@echo "Starting place service..."
	go run ./place-service/cmd/main.go
