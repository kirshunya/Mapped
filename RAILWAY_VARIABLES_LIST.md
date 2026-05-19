# Railway: Полный список переменных всех сервисов

## 🔧 DATABASE CREDENTIALS (используются везде)

```
DB_USER: postgres
DB_PASSWORD: UTzvjpZleWOMWNbzJZsUQWPggHbZKwto
DB_HOST_PRIVATE: postgres.railway.internal
DB_HOST_PUBLIC: tramway.proxy.rlwy.net
DB_PORT: 10307
DB_NAME: railway
```

---

## 📋 ПЕРЕМЕННЫЕ ДЛЯ КАЖДОГО СЕРВИСА

### 1️⃣ GATEWAY (уже создан)

**Variables для установки:**
```env
AUTH_SERVICE_URL=http://auth-service:8081
PLACES_SERVICE_URL=http://places-service:8082
REVIEWS_SERVICE_URL=http://reviews-service:8083
POSTS_SERVICE_URL=http://posts-service:8085
CHAT_SERVICE_URL=http://chat-service:8086
MEDIA_SERVICE_URL=http://media-service:8084
JWT_SECRET=mapsocial-super-secret-key-2024
GIN_MODE=release
PORT=8080
```

**Public URL:** `https://gateway-production-aa0c.up.railway.app`

---

### 2️⃣ AUTH-SERVICE (уже создана)

**Variables для установки:**
```env
DATABASE_URL=postgresql://postgres:UTzvjpZleWOMWNbzJZsUQWPggHbZKwto@postgres.railway.internal:5432/railway
JWT_SECRET=mapsocial-super-secret-key-2024
JWT_EXPIRY=720h
GIN_MODE=release
PORT=8081
```

---

### 3️⃣ PLACES-SERVICE (нужно создать)

**Как создать:**
- Railway Dashboard → "+ New" → "GitHub Repo" → "kirshunya/Mapped"
- Root Directory: `services/places-service`

**Variables для установки:**
```env
DATABASE_URL=postgresql://postgres:UTzvjpZleWOMWNbzJZsUQWPggHbZKwto@postgres.railway.internal:5432/railway
GIN_MODE=release
PORT=8082
```

---

### 4️⃣ REVIEWS-SERVICE (нужно создать)

**Как создать:**
- Railway Dashboard → "+ New" → "GitHub Repo" → "kirshunya/Mapped"
- Root Directory: `services/reviews-service`

**Variables для установки:**
```env
DATABASE_URL=postgresql://postgres:UTzvjpZleWOMWNbzJZsUQWPggHbZKwto@postgres.railway.internal:5432/railway
GIN_MODE=release
PORT=8083
```

---

### 5️⃣ POSTS-SERVICE (нужно создать)

**Как создать:**
- Railway Dashboard → "+ New" → "GitHub Repo" → "kirshunya/Mapped"
- Root Directory: `services/posts-service`

**Variables для установки:**
```env
DB_HOST=postgres.railway.internal
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=UTzvjpZleWOMWNbzJZsUQWPggHbZKwto
DB_NAME=railway
DB_SSLMODE=disable
PORT=8085
KAFKA_BROKER=kafka:29092
GIN_MODE=release
```

---

### 6️⃣ CHAT-SERVICE (нужно создать)

**Как создать:**
- Railway Dashboard → "+ New" → "GitHub Repo" → "kirshunya/Mapped"
- Root Directory: `services/chat-service`

**Variables для установки:**
```env
DATABASE_URL=postgresql://postgres:UTzvjpZleWOMWNbzJZsUQWPggHbZKwto@postgres.railway.internal:5432/railway
PORT=8086
KAFKA_BROKER=kafka:29092
GIN_MODE=release
```

---

### 7️⃣ MEDIA-SERVICE (нужно создать)

**Как создать:**
- Railway Dashboard → "+ New" → "GitHub Repo" → "kirshunya/Mapped"
- Root Directory: `services/media-service`

**Variables для установки:**
```env
MEDIA_STORAGE_PATH=/app/storage
MEDIA_PUBLIC_URL=https://gateway-production-aa0c.up.railway.app/media
PORT=8084
GIN_MODE=release
```

---

### 8️⃣ KAFKA (нужно создать)

**Как создать:**
- Railway Dashboard → "+ New" → "Container"
- Image: `confluentinc/cp-kafka:7.5.0`

**Variables для установки:**
```env
KAFKA_BROKER_ID=1
KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:29092
KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT
KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
KAFKA_AUTO_CREATE_TOPICS_ENABLE=true
```

---

### 9️⃣ ZOOKEEPER (нужно создать)

**Как создать:**
- Railway Dashboard → "+ New" → "Container"
- Image: `confluentinc/cp-zookeeper:7.5.0`

**Variables для установки:**
```env
ZOOKEEPER_CLIENT_PORT=2181
ZOOKEEPER_TICK_TIME=2000
```

---

## ✅ ЧЕК-ЛИСТ УСТАНОВКИ

### Уже есть:
- [x] PostgreSQL (база данных)
- [x] Gateway (API + фронтенд)
- [x] Auth Service (аутентификация)

### Нужно создать:
- [ ] Places Service
- [ ] Reviews Service
- [ ] Posts Service
- [ ] Chat Service
- [ ] Media Service
- [ ] Kafka
- [ ] Zookeeper

### После создания всех:
- [ ] Обновить переменные в Gateway (добавить URL всех сервисов)
- [ ] Протестировать регистрацию
- [ ] Протестировать все функции

---

## 🚀 БЫСТРЫЙ СТАРТ

Если хотите **сразу начать**, создайте в таком порядке:

**1-й день:**
1. Places Service
2. Reviews Service

**2-й день:**
3. Posts Service
4. Chat Service

**3-й день:**
5. Media Service
6. Kafka + Zookeeper

---

## ⚠️ ВАЖНО

### Как устанавливать переменные:

1. Railway Dashboard → выбрать сервис
2. Вкладка **Variables**
3. Нажать **"New Variable"** для каждой переменной
4. **KEY** = левая часть (например `DATABASE_URL`)
5. **VALUE** = правая часть (например `postgresql://...`)
6. Нажать **Deploy** внизу

### Если не работает:

1. Проверьте что все переменные установлены
2. Нажали Deploy после каждого изменения
3. Посмотрите логи сервиса (Logs вкладка)
4. Ищите ошибки подключения к БД

---

Начните с **Places Service** и скажите когда создадите! 🚀
