# Как настроить Railway после развёртывания docker-compose

## Проблема

На Railway каждый сервис (контейнер) развёртывается **отдельно** и не находятся в одной Docker сети. Поэтому микросервисы не могут обращаться друг к другу по DNS-имёнам (типа `http://auth-service:8081`).

## Решение

Нужно установить **переменные окружения** в каждом сервисе с правильными Railway URLs.

## Как настроить

### 1. Откройте Railway Dashboard
https://dashboard.railway.app

### 2. Для каждого сервиса выполните:

#### **gateway** (Main API)
Переменные для подключения к микросервисам:

```env
AUTH_SERVICE_URL=https://auth-service-xxx.railway.app
PLACES_SERVICE_URL=https://places-service-xxx.railway.app
REVIEWS_SERVICE_URL=https://reviews-service-xxx.railway.app
POSTS_SERVICE_URL=https://posts-service-xxx.railway.app
CHAT_SERVICE_URL=https://chat-service-xxx.railway.app
MEDIA_SERVICE_URL=https://media-service-xxx.railway.app
JWT_SECRET=your-secret-key
PORT=8080
```

**Где найти эти URLs:**
1. В Dashboard → нажмите на каждый сервис (auth-service, places-service и т.д.)
2. Найдите раздел "Public URL" или "Domain"
3. Если нет Public URL → нажмите Settings → Enable Public Networking → Generate Domain
4. Скопируйте URL и подставьте в переменные выше

#### **postgres** (Database)
```env
POSTGRES_USER=mapsocial
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=mapsocial
```

#### **kafka** (Message Broker)
```env
KAFKA_BROKER_ID=1
KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:29092
# Остальное оставьте как есть в docker-compose.yml
```

#### **auth-service**, **places-service**, **reviews-service**, **posts-service**, **chat-service**

Каждому сервису нужен доступ к базе данных PostgreSQL:

```env
DATABASE_URL=postgresql://mapsocial:your-password@postgres-host:5432/mapsocial
# ИЛИ отдельные переменные:
DB_HOST=postgres-xxx.railway.app  # Internal Railway URL
DB_PORT=5432
DB_USER=mapsocial
DB_PASSWORD=your-password
DB_NAME=mapsocial
DB_SSLMODE=require
```

Для **Kafka**:
```env
KAFKA_BROKER=kafka-xxx.railway.app:29092
```

## Шаг за шагом для Gateway

1. Откройте Railway Dashboard
2. Нажмите на проект "Mapped"
3. Нажмите на сервис "gateway"
4. Перейдите в раздел "Variables"
5. Нажмите "New Variable" и добавьте:

```
AUTH_SERVICE_URL = https://[auth-service-id].railway.app
PLACES_SERVICE_URL = https://[places-service-id].railway.app
REVIEWS_SERVICE_URL = https://[reviews-service-id].railway.app
POSTS_SERVICE_URL = https://[posts-service-id].railway.app
CHAT_SERVICE_URL = https://[chat-service-id].railway.app
MEDIA_SERVICE_URL = https://[media-service-id].railway.app
JWT_SECRET = your-secret-key
```

6. Нажмите "Deploy" чтобы пересобрать сервис

## Как узнать Public URL каждого сервиса

1. В Dashboard нажмите на сервис (например, auth-service)
2. Вверху должна быть строка с доменом типа:
   ```
   https://auth-service-production-1234.railway.app
   ```
3. Скопируйте этот URL и используйте в переменных

## Если у вас нет Public URL для сервиса

1. Нажмите на сервис
2. Перейдите в Settings
3. Найдите раздел "Public Networking"
4. Нажмите "Generate Domain"
5. Railway создаст публичный URL

## Альтернатива: Использовать Internal Railway URLs

Railway позволяет использовать **internal URLs** для сервисов внутри одного проекта:

```
AUTH_SERVICE_URL=http://auth-service:8081
```

**НО** это работает только если все сервисы в одном Railway проекте и используют Docker network.

Если это не работает → используйте Public URLs (как описано выше).

## Проверка

После настройки всех переменных:

1. Откройте URL вашего gateway (Public URL)
2. Попробуйте зарегистрироваться
3. Проверьте логи в Railway Dashboard (сервис gateway → Logs)
4. Если ошибка "no such host" → переменные окружения установлены неправильно

## Быстрая настройка (если торопитесь)

Минимально нужно установить для **gateway**:
```env
AUTH_SERVICE_URL=http://auth-service:8081
PLACES_SERVICE_URL=http://places-service:8082
REVIEWS_SERVICE_URL=http://reviews-service:8083
POSTS_SERVICE_URL=http://posts-service:8085
CHAT_SERVICE_URL=http://chat-service:8086
MEDIA_SERVICE_URL=http://media-service:8084
```

И проверить логи. Если `auth-service` тоже ошибается → нужно настроить ему `DATABASE_URL`.

---

**ВАЖНО:** После каждого изменения переменных нужно нажать "Deploy" чтобы перезагрузить сервис!
