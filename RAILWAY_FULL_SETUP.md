# Railway Полная Архитектура: Пошаговая Инструкция

## Что вы должны сделать

### ШАГ 1: Включите Public Networking для каждого сервиса

На Railway Dashboard для КАЖДОГО сервиса (**кроме gateway**):

1. **Откройте сервис** (например, `postgres`)
2. Перейдите в **Settings** (внизу слева)
3. Найдите раздел **"Public Networking"**
4. Нажмите **"Generate Domain"**
5. Railway создаст публичный URL типа:
   ```
   postgres-production-abc123def456.railway.app
   ```
6. **Скопируйте этот URL** в текстовый файл

**Повторите для ВСЕХ этих сервисов:**
- [ ] postgres
- [ ] zookeeper
- [ ] kafka
- [ ] minio
- [ ] auth-service
- [ ] places-service
- [ ] reviews-service
- [ ] media-service
- [ ] posts-service
- [ ] chat-service

**НЕ включайте Public Networking для gateway** - он уже имеет публичный URL.

---

### ШАГ 2: Соберите все URL в один список

После шага 1 у вас должно быть примерно так:

```
postgres: postgres-production-abc123.railway.app
zookeeper: zookeeper-production-def456.railway.app
kafka: kafka-production-ghi789.railway.app
minio: minio-production-jkl012.railway.app
auth-service: auth-service-production-mno345.railway.app
places-service: places-service-production-pqr678.railway.app
reviews-service: reviews-service-production-stu901.railway.app
media-service: media-service-production-vwx234.railway.app
posts-service: posts-service-production-yza567.railway.app
chat-service: chat-service-production-bcd890.railway.app
```

**Сохраните этот список! Он вам нужен дальше.**

---

### ШАГ 3: Настройте переменные в GATEWAY

На Railway Dashboard:

1. Откройте сервис **gateway**
2. Перейдите в **Variables**
3. Добавьте эти переменные (замените значения на ваши URL из шага 2):

```env
AUTH_SERVICE_URL=https://auth-service-production-mno345.railway.app
PLACES_SERVICE_URL=https://places-service-production-pqr678.railway.app
REVIEWS_SERVICE_URL=https://reviews-service-production-stu901.railway.app
POSTS_SERVICE_URL=https://posts-service-production-yza567.railway.app
CHAT_SERVICE_URL=https://chat-service-production-bcd890.railway.app
MEDIA_SERVICE_URL=https://media-service-production-vwx234.railway.app
JWT_SECRET=mapsocial-super-secret-key-2024
GIN_MODE=release
```

4. Нажмите **"Deploy"** - gateway перезагрузится

---

### ШАГ 4: Настройте переменные в POSTGRES

На Railway Dashboard:

1. Откройте сервис **postgres**
2. Перейдите в **Variables**
3. Убедитесь что там есть:

```env
POSTGRES_USER=mapsocial
POSTGRES_PASSWORD=mapsocial123
POSTGRES_DB=mapsocial
```

Если их нет - добавьте.

---

### ШАГ 5: Настройте переменные в AUTH-SERVICE

На Railway Dashboard:

1. Откройте сервис **auth-service**
2. Перейдите в **Variables**
3. Добавьте (или отредактируйте):

```env
DATABASE_URL=postgresql://mapsocial:mapsocial123@postgres-production-abc123.railway.app:5432/mapsocial
JWT_SECRET=mapsocial-super-secret-key-2024
JWT_EXPIRY=720h
KAFKA_BROKER=kafka-production-ghi789.railway.app:29092
```

Замените `postgres-production-abc123.railway.app` и `kafka-production-ghi789.railway.app` на реальные URL из вашего списка (шаг 2).

4. Нажмите **"Deploy"**

---

### ШАГ 6: Настройте переменные в PLACES-SERVICE

На Railway Dashboard:

1. Откройте сервис **places-service**
2. Перейдите в **Variables**
3. Добавьте:

```env
DATABASE_URL=postgresql://mapsocial:mapsocial123@postgres-production-abc123.railway.app:5432/mapsocial
```

4. Нажмите **"Deploy"**

---

### ШАГ 7: Настройте переменные в REVIEWS-SERVICE

На Railway Dashboard:

1. Откройте сервис **reviews-service**
2. Перейдите в **Variables**
3. Добавьте:

```env
DATABASE_URL=postgresql://mapsocial:mapsocial123@postgres-production-abc123.railway.app:5432/mapsocial
```

4. Нажмите **"Deploy"**

---

### ШАГ 8: Настройте переменные в POSTS-SERVICE

На Railway Dashboard:

1. Откройте сервис **posts-service**
2. Перейдите в **Variables**
3. Добавьте:

```env
DB_HOST=postgres-production-abc123.railway.app
DB_PORT=5432
DB_USER=mapsocial
DB_PASSWORD=mapsocial123
DB_NAME=mapsocial
PORT=8085
KAFKA_BROKER=kafka-production-ghi789.railway.app:29092
```

4. Нажмите **"Deploy"**

---

### ШАГ 9: Настройте переменные в CHAT-SERVICE

На Railway Dashboard:

1. Откройте сервис **chat-service**
2. Перейдите в **Variables**
3. Добавьте:

```env
DATABASE_URL=postgresql://mapsocial:mapsocial123@postgres-production-abc123.railway.app:5432/mapsocial
PORT=8086
KAFKA_BROKER=kafka-production-ghi789.railway.app:29092
```

4. Нажмите **"Deploy"**

---

### ШАГ 10: Настройте переменные в MEDIA-SERVICE

На Railway Dashboard:

1. Откройте сервис **media-service**
2. Перейдите в **Variables**
3. Добавьте:

```env
MEDIA_STORAGE_PATH=/app/storage
MEDIA_PUBLIC_URL=https://gateway-production-xxx.railway.app/media
```

Замените `gateway-production-xxx.railway.app` на реальный URL вашего gateway.

4. Нажмите **"Deploy"**

---

### ШАГ 11: Настройте ZOOKEEPER и KAFKA

Оставьте default переменные из `docker-compose.yml`. Убедитесь что они есть:

**ZOOKEEPER:**
```env
ZOOKEEPER_CLIENT_PORT=2181
ZOOKEEPER_TICK_TIME=2000
```

**KAFKA:**
```env
KAFKA_BROKER_ID=1
KAFKA_ZOOKEEPER_CONNECT=zookeeper-production-def456.railway.app:2181
KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka-production-ghi789.railway.app:29092
KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT
KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
KAFKA_AUTO_CREATE_TOPICS_ENABLE=true
```

Замените `zookeeper-production-def456.railway.app` на реальный URL из шага 2.

---

### ШАГ 12: Настройте MINIO

На Railway Dashboard:

1. Откройте сервис **minio**
2. Переменные:

```env
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
```

---

## Итоговый чек-лист

После выполнения всех шагов у вас должно быть:

- [ ] Все 10 сервисов имеют Public Networking включены
- [ ] Gateway имеет переменные с URL всех микросервисов
- [ ] Auth-service имеет DATABASE_URL и KAFKA_BROKER
- [ ] Places-service имеет DATABASE_URL
- [ ] Reviews-service имеет DATABASE_URL
- [ ] Posts-service имеет DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, KAFKA_BROKER
- [ ] Chat-service имеет DATABASE_URL и KAFKA_BROKER
- [ ] Media-service имеет MEDIA_PUBLIC_URL
- [ ] Kafka имеет ZOOKEEPER_CONNECT с правильным URL
- [ ] Все сервисы были перезагружены (Deploy нажат)

---

## Проверка

Откройте логи Gateway (Dashboard → gateway → Logs) и ищите:
```
Gateway starting on port 8080
```

Если видите эту строку без ошибок - сервис запустился!

Затем откройте URL вашего gateway в браузере и попробуйте зарегистрироваться.

**Если ошибка "no such host":**
- Проверьте что переменные установлены правильно
- Убедитесь что все URL скопированы без пробелов в начале/конце
- Попробуйте еще раз перезагрузить (Deploy)

---

## Если что-то не работает

1. **Проверьте логи** каждого сервиса (Logs вкладка)
2. **Убедитесь что все переменные установлены** (Variables вкладка)
3. **Проверьте что используете HTTPS** (не HTTP) для Public URLs

Дайте мне знать если возникнут проблемы! 🚀
