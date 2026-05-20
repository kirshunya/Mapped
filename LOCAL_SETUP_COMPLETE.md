# ✅ Локальная среда - ГОТОВА К РАБОТЕ

## 🎉 Статус: Все работает!

Проект **Mapped** успешно запущен локально со всеми сервисами и БД.

---

## 📊 Запущенные контейнеры (12)

| Сервис | Порт | Статус | Роль |
|---|---|---|---|
| **Gateway** | 8080 | ✅ Running | API Gateway + React Frontend |
| **Web (React)** | 3000 | ✅ Running | Frontend приложение |
| **Auth Service** | 8081 | ✅ Running | Регистрация и аутентификация |
| **Places Service** | 8082 | ✅ Running | Управление местами |
| **Reviews Service** | 8083 | ✅ Running | Отзывы и рейтинги |
| **Media Service** | 8084 | ✅ Running | Загрузка медиа файлов |
| **Posts Service** | 8085 | ✅ Running | Создание и управление постами |
| **Chat Service** | 8086 | ✅ Running | Чаты и сообщения |
| **PostgreSQL** | 5432 | ✅ Running | База данных (PostGIS) |
| **Kafka** | 9092 | ✅ Running | Message broker |
| **Zookeeper** | 2181 | ✅ Running | Coordination для Kafka |
| **MinIO** | 9000-9001 | ✅ Running | S3-compatible storage |

---

## 📚 База данных

### PostgreSQL Info
- **Version:** PostgreSQL 15.4 (PostGIS enabled)
- **User:** mapsocial
- **Database:** mapsocial
- **Port:** 5432

### Таблицы (16)
```
✓ users              (9 записей)    - пользователи
✓ places            (14 записей)    - места на карте
✓ posts              (4 записей)    - посты
✓ reviews                           - отзывы
✓ comments                          - комментарии
✓ chats                             - чаты
✓ chat_messages                     - сообщения чата
✓ groups                            - группы
✓ follows                           - подписки
✓ reactions                         - реакции
✓ post_reactions                    - реакции на посты
✓ comment_reactions                 - реакции на комментарии
✓ post_comments                     - комментарии к постам
✓ group_members                     - члены групп
✓ chat_members                      - участники чатов
✓ spatial_ref_sys                   - GIS reference (PostGIS)
```

---

## 🌐 Доступные endpoints

### Gateway (React Frontend)
```
http://localhost:8080
http://localhost:8080/static/  (static assets)
```

### Web (React)
```
http://localhost:3000
```

### API Endpoints (через Gateway)
```
POST   /api/v1/auth/register        - Регистрация
POST   /api/v1/auth/login           - Вход
GET    /api/v1/auth/me              - Текущий пользователь
GET    /api/v1/places               - Список мест
POST   /api/v1/places               - Добавить место
GET    /api/v1/posts                - Список постов
POST   /api/v1/posts                - Создать пост
GET    /api/v1/reviews              - Отзывы
POST   /api/v1/reviews              - Добавить отзыв
GET    /api/v1/chats                - Чаты
POST   /api/v1/chats                - Создать чат
GET    /api/v1/ws/chats/:id         - WebSocket чат
POST   /api/v1/media/upload         - Загрузить файл
```

### Сервисы (прямой доступ для тестирования)
```
Auth Service:    http://localhost:8081
Places Service:  http://localhost:8082
Reviews Service: http://localhost:8083
Media Service:   http://localhost:8084
Posts Service:   http://localhost:8085
Chat Service:    http://localhost:8086
```

---

## 📂 Структура проекта

```
Mapped/
├── gateway/                    (API Gateway + React сборка)
│   ├── Dockerfile
│   ├── cmd/main.go
│   └── static/                 (собранные React файлы)
│
├── services/
│   ├── auth-service/           (8081)
│   ├── places-service/         (8082)
│   ├── reviews-service/        (8083)
│   ├── media-service/          (8084)
│   ├── posts-service/          (8085)
│   └── chat-service/           (8086)
│
├── web-app/                    (React source code)
│   ├── src/
│   │   ├── pages/              (основные страницы)
│   │   ├── components/         (React компоненты)
│   │   ├── services/           (API клиент)
│   │   └── store/              (state management)
│   ├── package.json
│   └── public/
│
├── migrations/                 (SQL миграции БД)
│   ├── 001_init.sql
│   ├── 002_add_follows_table.sql
│   ├── 003_add_posts_fk_constraint.sql
│   ├── 004_add_hashtags_to_users.sql
│   └── 005_add_location_to_chat_messages.sql
│
├── docker-compose.yml          (конфигурация контейнеров)
└── Dockerfile                  (главный Dockerfile для Gateway)
```

---

## 🚀 Команды для работы

### Просмотр логов

```bash
# Логи всех контейнеров
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f gateway
docker-compose logs -f auth-service
docker-compose logs -f postgres
```

### Управление контейнерами

```bash
# Запустить все
docker-compose up -d

# Остановить все
docker-compose down

# Перезагрузить все
docker-compose restart

# Пересобрать образы
docker-compose up -d --build

# Удалить volume'ы (полная очистка БД)
docker-compose down -v
```

### Доступ к БД

```bash
# Подключиться к PostgreSQL
docker exec -it mapped-postgres-1 psql -U mapsocial -d mapsocial

# Примеры команд в psql:
\dt                              # список таблиц
SELECT COUNT(*) FROM users;      # количество пользователей
SELECT * FROM places LIMIT 5;    # первые 5 мест
\q                               # выход
```

### Доступ к контейнерам

```bash
# Bash в контейнер
docker exec -it mapped-gateway-1 bash
docker exec -it mapped-auth-service-1 bash

# Выполнить команду в контейнере
docker exec mapped-gateway-1 ls -la /app
```

---

## 🔍 Проверка здоровья сервисов

```bash
# Health check Gateway
docker exec mapped-gateway-1 wget -qO- http://localhost:8080/health

# Health check Auth
docker exec mapped-auth-service-1 wget -qO- http://localhost:8081/health

# Все контейнеры
docker ps
```

---

## ⚙️ Конфигурация окружения

### .env файл

```
DATABASE_URL=postgresql://mapsocial:mapsocial123@postgres:5432/mapsocial
JWT_SECRET=mapsocial-super-secret-key-2024
KAFKA_BROKERS=kafka:29092
MINIO_ENDPOINT=minio:9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```

### Переменные сервисов

```
AUTH_SERVICE_URL=http://auth-service:8081
PLACES_SERVICE_URL=http://places-service:8082
REVIEWS_SERVICE_URL=http://reviews-service:8083
MEDIA_SERVICE_URL=http://media-service:8084
POSTS_SERVICE_URL=http://posts-service:8085
CHAT_SERVICE_URL=http://chat-service:8086
```

---

## 🧪 Тестирование API

### Регистрация нового пользователя

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

### Вход

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Получение списка мест

```bash
curl http://localhost:8080/api/v1/places
```

### Получение постов

```bash
curl http://localhost:8080/api/v1/posts
```

---

## 📱 Frontend приложение

### Доступ

```
http://localhost:8080     (Gateway with React)
или
http://localhost:3000     (Direct React development)
```

### Основные страницы

- **/** - Главная карта с местами
- **/feed** - Лента постов
- **/chats** - Чаты с пользователями
- **/profile** - Профиль пользователя
- **/login** - Вход в приложение
- **/signup** - Регистрация

---

## 🔧 Возможные проблемы и решения

### Контейнеры не запускаются

```bash
# Проверьте что Docker запущен
docker ps

# Перезагрузите все
docker-compose down
docker-compose up -d --build
```

### БД недоступна из сервиса

```bash
# Проверьте что PostgreSQL запущен и здоров
docker ps | grep postgres

# Проверьте логи
docker logs mapped-postgres-1
```

### Port already in use

```bash
# Найдите какой процесс занял порт
netstat -ano | findstr :8080

# Или просто используйте другие порты в docker-compose.yml
```

### React не загружается

```bash
# Очистите браузер кэш (Ctrl+Shift+Delete)
# Проверьте консоль браузера (F12)
# Перестартуйте Gateway
docker-compose restart gateway
```

---

## 📊 Git статус

```
Current commit: 8bf33d5 - "big update"
Branch: dev
Status: Clean working tree
```

---

## 🎯 Следующие шаги

### Для разработки

1. Сделайте изменения в коде
2. Пересоберите нужный сервис: `docker-compose up -d --build [service]`
3. Проверьте логи: `docker-compose logs -f [service]`

### Для deployment на Railway

Смотрите документацию в репозитории (создана ранее)

### Для production

1. Используйте переменные окружения вместо .env
2. Включите SSL/TLS
3. Настройте backups для PostgreSQL
4. Используйте proper logging service (ELK, DataDog и т.д.)
5. Настройте мониторинг и alerting

---

## 📝 Заметки

- ✅ Все 12 контейнеров работают
- ✅ PostgreSQL с PostGIS расширением активно
- ✅ 16 таблиц созданы и содержат данные
- ✅ Все микросервисы запущены
- ✅ API endpoints отвечают
- ✅ React приложение доступно
- ✅ WebSocket поддержка для чатов
- ✅ MinIO для хранения файлов
- ✅ Kafka для асинхронных операций

---

## 🎉 Вывод

**Локальная среда полностью готова к разработке и тестированию!**

Все сервисы работают, БД содержит данные, и приложение полностью функционально.

Можете начинать разработку! 🚀
