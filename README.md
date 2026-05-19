# Mapped - Геосоциальная сеть

Интерактивная карта с отзывами и рекомендациями мест.

## Архитектура

```
Mapped/
├── docker-compose.yml          # Orchestration
├── gateway/                    # API Gateway
├── services/
│   ├── auth-service/           # Регистрация/аутентификация
│   ├── places-service/          # Управление местами
│   ├── reviews-service/        # Отзывы и рейтинги
│   └── media-service/           # Загрузка фото
└── frontend/                   # React SPA с OpenStreetMap
```

## Запуск

```bash
cd D:\GolandProjects\Mapped

# Запуск всех сервисов
docker-compose up -d

# Или для разработки - каждый сервис отдельно:
cd services/auth-service && go mod tidy && go run cmd/main.go
cd services/places-service && go mod tidy && go run cmd/main.go
cd services/reviews-service && go mod tidy && go run cmd/main.go
cd gateway && go mod tidy && go run cmd/main.go
```

## API Endpoints

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/places?lat=&lng=&radius=` - Список мест поблизости
- `POST /api/places` - Добавить место
- `GET /api/places/:id/reviews` - Отзывы места
- `POST /api/reviews` - Оставить отзыв

## Стек

- **Backend**: Go, Gin, GORM
- **Database**: PostgreSQL
- **Message Queue**: Kafka
- **Frontend**: React, Leaflet (OpenStreetMap)
- **Maps**: OpenStreetMap
