# Railway Configuration Script

Эта инструкция поможет быстро настроить Railway для работы приложения Mapped.

## Ситуация

На Railway каждый контейнер запускается **отдельно** и они не могут видеть друг друга по DNS имёнам типа `auth-service:8081`.

Railway НЕ поддерживает `docker-compose` так же хорошо как локально.

## Решение: Два варианта

### Вариант 1: Упрощённая архитектура (РЕКОМЕНДУЕТСЯ)

Запустить только **необходимые сервисы**, а остальное заглушить.

**Минимум для работы:**
- PostgreSQL (база данных)
- Gateway + React (фронтенд + API)
- Auth Service (аутентификация)

**Опционально:**
- Places Service
- Posts Service
- Chat Service

**Удалить / не запускать:**
- Kafka, Zookeeper (используются только для async events)
- MinIO (используется только для фото)
- Media Service (не критична)

### Вариант 2: Полная архитектура с Public URLs

Запустить все сервисы, но каждому дать **Public URL** для обращения друг к другу.

Это работает, но дорого (много Public URLs) и медленно (каждое обращение через интернет).

---

## Что выбрать?

**Если хотите быстро получить работающее приложение:**
→ Вариант 1 (Упрощённая архитектура)

**Если нужна полная функциональность:**
→ Вариант 2 (Полная архитектура с Public URLs)

---

## Вариант 1: Упрощённая архитектура (Быстро)

### 1. Удалите ненужные сервисы из docker-compose.yml

Нужно оставить только:
```yaml
services:
  postgres:
    # ...
  auth-service:
    # ...
  gateway:
    # ...
```

### 2. На Railway:

Нужно **удалить** или **остановить** эти сервисы:
- zookeeper
- kafka
- minio
- media-service
- places-service
- reviews-service
- posts-service
- chat-service

**Как удалить сервис на Railway:**
1. Dashboard → Сервис → Settings → Delete service

### 3. Обновить API эндпоинты

Закомментировать в фронтенде обращения к сервисам, которых нет:
- Places (карта, места)
- Posts (посты)
- Chats (чаты)

Или вернуть mock данные.

---

## Вариант 2: Полная архитектура (Надёжно)

### 1. Включить Public Networking для каждого сервиса

**На Railway для каждого сервиса:**

1. Откройте сервис (например, `auth-service`)
2. Settings → Public Networking
3. Нажмите "Generate Domain"
4. Railway создаст URL типа: `https://auth-service-production-xxxx.railway.app`
5. **Скопируйте этот URL**

Повторите для всех сервисов:
- auth-service
- places-service
- reviews-service
- posts-service
- chat-service
- media-service
- postgres (если нужен external доступ)

### 2. Установить переменные в gateway

В gateway → Variables добавьте:

```env
AUTH_SERVICE_URL=https://auth-service-production-xxxx.railway.app
PLACES_SERVICE_URL=https://places-service-production-xxxx.railway.app
REVIEWS_SERVICE_URL=https://reviews-service-production-xxxx.railway.app
POSTS_SERVICE_URL=https://posts-service-production-xxxx.railway.app
CHAT_SERVICE_URL=https://chat-service-production-xxxx.railway.app
MEDIA_SERVICE_URL=https://media-service-production-xxxx.railway.app
```

Замените `xxxx` на реальные ID из Railway.

### 3. Установить переменные в микросервисах

Каждому микросервису нужен доступ к PostgreSQL:

```env
DATABASE_URL=postgresql://mapsocial:password@postgres-production-xxxx.railway.app:5432/mapsocial
```

или

```env
DB_HOST=postgres-production-xxxx.railway.app
DB_PORT=5432
DB_USER=mapsocial
DB_PASSWORD=your_password
DB_NAME=mapsocial
```

---

## Что рекомендую ЭТО МОМЕНТАЛЬНО

Потому что Вариант 2 очень сложный, а Вариант 1 быстрый.

**Предлагаю:**

1. **Удалить лишние сервисы** из docker-compose.yml (все кроме postgres, auth-service, gateway)
2. **Пересобрать** на Railway (он автоматически поднимет только нужные)
3. **Настроить** переменные для gateway и auth-service

Это займёт 15 минут и будет работать!

---

**Какой вариант выбираете?**

Напишите, и я помогу с настройкой! 🚀
