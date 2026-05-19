# Railway: Создание сервисов вручную

## Что нужно сделать

На Railway нужно создать **11 сервисов** вручную:

1. PostgreSQL (база данных)
2. Zookeeper (для Kafka)
3. Kafka (message broker)
4. MinIO (хранилище файлов)
5. Auth Service (микросервис)
6. Places Service (микросервис)
7. Reviews Service (микросервис)
8. Posts Service (микросервис)
9. Chat Service (микросервис)
10. Media Service (микросервис)
11. Gateway (уже есть!)

---

## Как добавить сервис на Railway

### 1. Нажмите "+ New"
   В правой части Railway Dashboard нажмите синяя кнопка "+ New"

### 2. Выберите источник
   - **Для БД и готовых образов:** "Database" или "Container"
   - **Для собственного кода:** "GitHub Repo"

---

## СЕРВИС 1: PostgreSQL

### Шаг 1: Добавить PostgreSQL

1. Railway Dashboard → "+ New" → **"Database"**
2. Выберите **"PostgreSQL"**
3. Railway автоматически создаст сервис с дефолтными переменными

### Шаг 2: Настроить переменные

После создания:
1. Нажмите на сервис **"postgres"**
2. Перейдите в **Variables**
3. Убедитесь что есть:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
```

Или установите свои значения (запомните их!):

```env
POSTGRES_USER=mapsocial
POSTGRES_PASSWORD=mapsocial123
POSTGRES_DB=mapsocial
```

### Шаг 3: Включить Public Networking

1. Settings → **Public Networking** → **Generate Domain**
2. Скопируйте URL (будет что-то типа `postgres-production-xxx.railway.app`)
3. **Сохраните в блокноте!**

---

## СЕРВИС 2: Zookeeper

### Шаг 1: Добавить контейнер

1. Railway Dashboard → "+ New" → **"Container"**
2. Image: `confluentinc/cp-zookeeper:7.5.0`
3. Нажмите "Deploy"

### Шаг 2: Настроить переменные

Variables:
```env
ZOOKEEPER_CLIENT_PORT=2181
ZOOKEEPER_TICK_TIME=2000
```

### Шаг 3: Включить Public Networking

Settings → Public Networking → Generate Domain
Скопируйте URL в блокнот.

---

## СЕРВИС 3: Kafka

### Шаг 1: Добавить контейнер

1. Railway Dashboard → "+ New" → **"Container"**
2. Image: `confluentinc/cp-kafka:7.5.0`
3. Нажмите "Deploy"

### Шаг 2: Настроить переменные

Variables:
```env
KAFKA_BROKER_ID=1
KAFKA_ZOOKEEPER_CONNECT=zookeeper-production-XXX.railway.app:2181
KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka-production-YYY.railway.app:29092
KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT
KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
KAFKA_AUTO_CREATE_TOPICS_ENABLE=true
```

**ВАЖНО:** Замените:
- `zookeeper-production-XXX.railway.app` на реальный URL Zookeeper
- `kafka-production-YYY.railway.app` на реальный URL Kafka (он будет создан после Deploy)

Сначала используйте временные значения, потом обновите.

### Шаг 3: Включить Public Networking

Settings → Public Networking → Generate Domain
Скопируйте URL в блокнот.

---

## СЕРВИС 4: MinIO

### Шаг 1: Добавить контейнер

1. Railway Dashboard → "+ New" → **"Container"**
2. Image: `minio/minio:latest`
3. Нажмите "Deploy"

### Шаг 2: Настроить переменные

Variables:
```env
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
```

Start command:
```
server /data --console-address :9001
```

### Шаг 3: Включить Public Networking

Settings → Public Networking → Generate Domain
Скопируйте URL в блокнот.

---

## СЕРВИСЫ 5-10: Микросервисы из репозитория

Для каждого микросервиса:

### Шаг 1: Добавить из GitHub

1. Railway Dashboard → "+ New"
2. Выберите **"GitHub Repo"**
3. Авторизуйтесь если нужно
4. Выберите **"kirshunya/Mapped"**
5. Branch: **"dev"**

### Шаг 2: Настроить Service

Когда Railway спросит какой сервис добавить:

**Для auth-service:**
- Root Directory: `services/auth-service`
- Dockerfile: `services/auth-service/Dockerfile`

**Для places-service:**
- Root Directory: `services/places-service`
- Dockerfile: `services/places-service/Dockerfile`

(И так для каждого сервиса)

### Шаг 3: Настроить переменные

**auth-service:**
```env
DATABASE_URL=postgresql://mapsocial:mapsocial123@postgres-production-XXX.railway.app:5432/mapsocial
JWT_SECRET=mapsocial-super-secret-key-2024
JWT_EXPIRY=720h
KAFKA_BROKER=kafka-production-YYY.railway.app:29092
```

**places-service:**
```env
DATABASE_URL=postgresql://mapsocial:mapsocial123@postgres-production-XXX.railway.app:5432/mapsocial
```

**reviews-service:**
```env
DATABASE_URL=postgresql://mapsocial:mapsocial123@postgres-production-XXX.railway.app:5432/mapsocial
```

**posts-service:**
```env
DB_HOST=postgres-production-XXX.railway.app
DB_PORT=5432
DB_USER=mapsocial
DB_PASSWORD=mapsocial123
DB_NAME=mapsocial
PORT=8085
KAFKA_BROKER=kafka-production-YYY.railway.app:29092
```

**chat-service:**
```env
DATABASE_URL=postgresql://mapsocial:mapsocial123@postgres-production-XXX.railway.app:5432/mapsocial
PORT=8086
KAFKA_BROKER=kafka-production-YYY.railway.app:29092
```

**media-service:**
```env
MEDIA_STORAGE_PATH=/app/storage
MEDIA_PUBLIC_URL=https://gateway-production-ZZZ.railway.app/media
```

### Шаг 4: Включить Public Networking

Settings → Public Networking → Generate Domain
Скопируйте URL в блокнот.

---

## Итоговый список URL

После создания всех сервисов у вас должно быть:

```
postgres: postgres-production-abc123.railway.app
zookeeper: zookeeper-production-def456.railway.app
kafka: kafka-production-ghi789.railway.app
minio: minio-production-jkl012.railway.app
auth-service: auth-service-production-mno345.railway.app
places-service: places-service-production-pqr678.railway.app
reviews-service: reviews-service-production-stu901.railway.app
posts-service: posts-service-production-vwx234.railway.app
chat-service: chat-service-production-yza567.railway.app
media-service: media-service-production-bcd890.railway.app
gateway: gateway-production-efg123.railway.app
```

---

## ФИНАЛЬНАЯ НАСТРОЙКА: Gateway переменные

После создания всех сервисов:

1. Откройте **gateway** на Railway
2. Variables → добавьте:

```env
AUTH_SERVICE_URL=https://auth-service-production-mno345.railway.app
PLACES_SERVICE_URL=https://places-service-production-pqr678.railway.app
REVIEWS_SERVICE_URL=https://reviews-service-production-stu901.railway.app
POSTS_SERVICE_URL=https://posts-service-production-vwx234.railway.app
CHAT_SERVICE_URL=https://chat-service-production-yza567.railway.app
MEDIA_SERVICE_URL=https://media-service-production-bcd890.railway.app
JWT_SECRET=mapsocial-super-secret-key-2024
GIN_MODE=release
```

3. Нажмите **Deploy**

---

## Проверка

1. Откройте логи gateway (Logs вкладка)
2. Ищите: `Gateway starting on port 8080`
3. Откройте URL gateway в браузере
4. Попробуйте зарегистрироваться

Если работает - готово! 🎉

---

## Если не работает

Проверьте логи каждого сервиса:
- Ищите ошибки подключения к БД
- Убедитесь что все URL скопированы правильно (без пробелов)
- Проверьте что используете HTTPS для Public URLs

Дайте мне знать если что-то не получается! 🚀
