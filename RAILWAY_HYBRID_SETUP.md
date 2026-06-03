# Railway Hobby Plan - Option 2: Hybrid Setup (Рекомендуется)

> Этот гайд для оптимальной конфигурации: Railway + Upstash Kafka + AWS S3

## 🎯 Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                     Railway Hobby Plan                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ PostgreSQL   │  │  All Go      │  │  React Frontend  │  │
│  │ (Managed)    │  │  Microservices│  │  (Static)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         ├─────────────────────────┬─────────────────────────┐
         │                         │                         │
    ┌────┴────────┐          ┌────┴────────┐         ┌──────┴──────┐
    │ Upstash     │          │ AWS S3      │         │ Backups     │
    │ Kafka       │          │ Media       │         │ (Railway)   │
    │ (Serverless)│          │ Storage     │         │             │
    └─────────────┘          └─────────────┘         └─────────────┘
```

## 🔧 Шаг 1: Настроить Upstash Kafka

### 1.1 Создать Upstash Аккаунт

1. Перейдите на https://upstash.com/
2. Sign up (бесплатно)
3. Create Kafka cluster
4. Выберите регион поближе
5. Скопируйте credentials

### 1.2 Получить Connection String

В Upstash Dashboard:
```
Bootstrap Server: pkc-xxxxx.region.provider.confluent.cloud:9092
Username: ...
Password: ...
```

### 1.3 Обновить `.env` для Upstash

```env
# Upstash Kafka
KAFKA_BROKER=pkc-xxxxx.region.provider.confluent.cloud:9092
KAFKA_USERNAME=username
KAFKA_PASSWORD=password
KAFKA_SECURITY_PROTOCOL=SASL_SSL
KAFKA_SASL_MECHANISM=PLAIN
```

---

## 🏗️ Шаг 2: AWS S3 для Media

### 2.1 Создать AWS S3 Bucket

1. Перейдите на https://aws.amazon.com/
2. Создайте аккаунт (free tier доступен)
3. Перейдите в S3 → Create bucket
4. Назовите bucket: `mapped-media-production`
5. Выключите "Block public access" (если нужен public access)

### 2.2 Создать IAM User для S3

1. Перейдите в IAM → Users → Create user
2. Назовите: `mapped-media-user`
3. Attach policy: `AmazonS3FullAccess`
4. Create access key
5. Скопируйте:
   - Access Key ID
   - Secret Access Key

### 2.3 Обновить `.env` для S3

```env
# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET=mapped-media-production
AWS_ENDPOINT=https://s3.amazonaws.com
```

---

## 🔄 Шаг 3: Обновить Конфиги Микросервисов

### 3.1 Media Service - Использовать S3 вместо MinIO

**Файл:** `services/media-service/main.go` (примерно)

```go
package main

import (
    "github.com/aws/aws-sdk-go/aws"
    "github.com/aws/aws-sdk-go/aws/session"
    "github.com/aws/aws-sdk-go/service/s3"
)

func init() {
    // Инициализировать S3 вместо MinIO
    sess := session.Must(session.NewSession(&aws.Config{
        Region: aws.String(os.Getenv("AWS_REGION")),
    }))
    
    s3Client := s3.New(sess)
    // ... upload files to S3
}
```

Или используйте Go AWS SDK:
```bash
go get github.com/aws/aws-sdk-go
```

---

### 3.2 Auth & Chat Services - Использовать Upstash Kafka

**Файл:** `services/auth-service/main.go` (примерно)

```go
package main

import (
    "github.com/segmentio/kafka-go"
    "os"
)

func initKafka() *kafka.Writer {
    dialer := &kafka.Dialer{
        SASLMechanism: plain.Mechanism{
            User:     os.Getenv("KAFKA_USERNAME"),
            Pass:     os.Getenv("KAFKA_PASSWORD"),
        },
        TLS: &tls.Config{},
    }
    
    return &kafka.Writer{
        Addr: kafka.ParseURL(os.Getenv("KAFKA_BROKER")),
        Dialer: dialer,
    }
}
```

---

## 📝 Шаг 4: Обновить docker-compose.yml

Создайте `docker-compose.hybrid.yml`:

```yaml
services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_USER: ${DB_USER:-mapsocial}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-change_me}
      POSTGRES_DB: ${DB_NAME:-mapsocial}
    ports:
      - "5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d:ro
    restart: always

  # Заметьте: НЕТ Zookeeper, Kafka, MinIO контейнеров!
  # Они теперь в облаке (Upstash, AWS S3)

  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile
    ports:
      - "8081"
    environment:
      - DATABASE_URL=host=postgres user=${DB_USER} password=${DB_PASSWORD} dbname=${DB_NAME} port=5432 sslmode=disable
      - JWT_SECRET=${JWT_SECRET}
      - KAFKA_BROKER=${KAFKA_BROKER}
      - KAFKA_USERNAME=${KAFKA_USERNAME}
      - KAFKA_PASSWORD=${KAFKA_PASSWORD}
      - KAFKA_SECURITY_PROTOCOL=${KAFKA_SECURITY_PROTOCOL:-SASL_SSL}
    depends_on:
      postgres:
        condition: service_healthy
    restart: on-failure

  chat-service:
    build:
      context: ./services/chat-service
      dockerfile: Dockerfile
    ports:
      - "8086"
    environment:
      - DATABASE_URL=host=postgres user=${DB_USER} password=${DB_PASSWORD} dbname=${DB_NAME} port=5432 sslmode=disable
      - KAFKA_BROKER=${KAFKA_BROKER}
      - KAFKA_USERNAME=${KAFKA_USERNAME}
      - KAFKA_PASSWORD=${KAFKA_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    restart: on-failure

  media-service:
    build:
      context: ./services/media-service
      dockerfile: Dockerfile
    ports:
      - "8084"
    environment:
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_REGION=${AWS_REGION}
      - AWS_BUCKET=${AWS_BUCKET}
    restart: on-failure

  # ... остальные сервисы (places, posts, reviews, gateway, web)

volumes:
  postgres_data:
```

---

## 🚀 Шаг 5: Деплой на Railway

### 5.1 Залогиниться в Railway

```bash
railway login
railway init
```

### 5.2 Установить переменные окружения

```bash
# Для Upstash
railway variables set KAFKA_BROKER=pkc-xxxxx...
railway variables set KAFKA_USERNAME=...
railway variables set KAFKA_PASSWORD=...

# Для AWS S3
railway variables set AWS_ACCESS_KEY_ID=AKIA...
railway variables set AWS_SECRET_ACCESS_KEY=...
railway variables set AWS_REGION=us-east-1
railway variables set AWS_BUCKET=mapped-media-production

# Для БД
railway variables set DB_PASSWORD=strong_password_here
railway variables set JWT_SECRET=super_secret_jwt_key
```

### 5.3 Деплой

```bash
# Использовать hybrid compose
docker-compose -f docker-compose.hybrid.yml build
railway up
```

Или просто обновить переменные и Railway пересоберет:

```bash
git push
# Railway автоматически пересобирает если подключен GitHub
```

---

## ✅ Проверка

```bash
# Логи
railway logs -f

# Проверить что Upstash Kafka работает
railway shell auth-service
# Внутри контейнера:
kafka-broker-api-versions --bootstrap-server=$KAFKA_BROKER --client-id=test

# Проверить что S3 работает
railway shell media-service
# Попробуйте загрузить медиа через API

# Проверить фронтенд
# Откройте в браузере: https://mapped-web-prod.railway.app
```

---

## 💰 Стоимость Option 2

| Сервис | Цена |
|--------|------|
| Railway (PostgreSQL + 6 микросервисов + фронтенд) | $5-10/месяц |
| Upstash Kafka | Free tier! (затем $10-20) |
| AWS S3 | $0.50-2/месяц (в free tier huge) |
| **ИТОГО** | **$5-12/месяц** |

**Плюсы:**
- 5GB storage лимит Railway = не проблема!
- Kafka = управляемый и надежный
- S3 = неограниченные медиа файлы
- Auto-scaling по мере роста
- Production-ready архитектура

---

## 🎯 Когда Использовать Option 2

✅ Если нужен Production-качество  
✅ Если хотите масштабироваться без bottlenecks  
✅ Если не хотите управлять Kafka/MinIO самостоятельно  
✅ Если хранилище медиа может расти быстро  

---

## 📚 Полезные Ссылки

- [Upstash Docs](https://upstash.com/docs/kafka/overview)
- [AWS S3 Getting Started](https://aws.amazon.com/s3/getting-started/)
- [Railway External Services](https://docs.railway.app/develop/external-services)

---

## 🆘 Troubleshooting

**Kafka connection failed:**
```bash
# Проверить credentials
echo $KAFKA_BROKER
echo $KAFKA_USERNAME

# Убедиться что Security Protocol правильный
# Upstash требует SASL_SSL
```

**S3 upload failed:**
```bash
# Проверить AWS credentials
railway shell media-service
aws s3 ls --region $AWS_REGION

# Убедиться что bucket доступен
```

---

**Готовы к гибридной установке?** Начните со Step 1! 🚀
