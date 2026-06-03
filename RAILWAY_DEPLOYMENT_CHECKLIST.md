# ✅ Railway Deployment Checklist

> Используйте этот чек-лист перед началом развертывания на Railway

---

## 📋 Phase 1: Подготовка (Do This First)

### Step 1.1: Убедитесь что у вас есть Railway Hobby Plan
- [ ] Зарегистрированы на https://railway.app
- [ ] Создан Hobby Plan аккаунт
- [ ] Доступ к Dashboard https://railway.app/dashboard

### Step 1.2: Установить необходимое ПО
```bash
# Node.js (if not already installed)
node --version  # Should be 14+

# Railway CLI
npm install -g @railway/cli

# Docker (для локального тестирования)
docker --version  # Should be 20.10+
docker-compose --version  # Should be 2.0+
```

- [ ] Railway CLI установлен: `railway --version`
- [ ] Docker установлен: `docker --version`

### Step 1.3: Подготовить .env файл
```bash
# В корне проекта создайте .env из template
cp .env.railway .env
```

**ВАЖНО:** Измените эти значения (NOT DEFAULT!):
```env
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE_min_12_chars
MINIO_PASSWORD=YOUR_STRONG_PASSWORD_HERE
JWT_SECRET=YOUR_32_CHAR_SECRET_KEY_base64_or_random
```

- [ ] .env файл создан
- [ ] Все пароли изменены на strong values
- [ ] .env НЕ коммитился в git (проверьте .gitignore)

### Step 1.4: Проверить что локально работает
```bash
# (Опционально, но рекомендуется)
docker-compose down -v  # Очистить старые контейнеры
docker-compose up -d --build
sleep 60  # Подождать инициализации
curl http://localhost:8080/health
```

- [ ] Локально запустилось без ошибок (если пробовали)
- [ ] Фронтенд доступен на http://localhost:3000 (если пробовали)

---

## 🎯 Phase 2: Выбор Архитектуры

### Выберите один вариант:

#### ☑️ OPTION A: Simple (All-in-Railway)
- [ ] Прочитал RAILWAY_QUICKSTART.md
- [ ] Прочитал RAILWAY_HOBBY_PLAN_ANALYSIS.md для понимания ограничений
- [ ] Знаю что storage может быть узко но OK для MVP
- [ ] Знаю что Kafka local это тяжелый для Resources

**Двигайтесь к Phase 3A**

---

#### ☑️ OPTION B: Advanced (Hybrid - Recommended)
- [ ] Прочитал RAILWAY_HYBRID_SETUP.md полностью
- [ ] Создал Upstash аккаунт (https://upstash.com)
- [ ] Создал AWS S3 bucket (https://aws.amazon.com)
- [ ] Получил AWS credentials
- [ ] Получил Upstash Kafka credentials
- [ ] Знаю как обновить конфиги микросервисов для S3/Upstash

**Двигайтесь к Phase 3B**

---

## 🚀 Phase 3A: Deploy with Simple Setup (All-in-Railway)

### Step 3A.1: Railway Login
```bash
railway login
```
- [ ] Браузер открыл Railway login страницу
- [ ] Успешно залогинились

### Step 3A.2: Create Railway Project
```bash
railway init
```

Ответьте на вопросы:
- **Project name:** mapped (или другое имя)
- **Region:** выберите регион поближе к вашей локации
- **Select services:** skip (Railway поймет из docker-compose)

- [ ] Project создан в Railway
- [ ] Получили project ID

### Step 3A.3: Deploy
```bash
# Убедитесь что находитесь в root directory проекта
pwd  # должно показать D:\GolandProjects\Mapped

# Запустите деплой
railway up

# Ждите... (15-20 минут первый раз)
```

**Что происходит:**
- Railway читает docker-compose.yml
- Собирает Docker images для каждого сервиса (~10 мин)
- Пушит на серверы Railway (~3 мин)
- Стартует контейнеры и инициализирует БД (~2 мин)

- [ ] Команда `railway up` выполнена
- [ ] Видите логи build процесса
- [ ] Видите сообщение про успешный деплой

### Step 3A.4: Monitor Deployment
```bash
# Пока идет деплой, смотреть логи в другом терминале:
railway logs -f

# Ищите успешные сообщения типа:
# ✅ postgres started
# ✅ auth-service started
# ✅ gateway started
```

- [ ] Включил `railway logs -f` в другом терминале
- [ ] Логи не показывают критичные ошибки

### Step 3A.5: Verify Deployment
```bash
# Проверить статус всех сервисов
railway status

# Получить public URLs
railway variables

# Результат должен показать:
# - Gateway URL
# - Web App URL
# - Других сервисов
```

- [ ] `railway status` показывает все сервисы running
- [ ] Получил URLs для gateway и web app

### Step 3A.6: Test in Browser
```bash
# Скопируйте URL веб приложения из railway variables
# Например: https://mapped-web-prod.railway.app

# Откройте в браузере
```

- [ ] Фронтенд загружается в браузере
- [ ] Видите карту и интерфейс приложения

### Step 3A.7: Functional Test
- [ ] Можно зарегистрироваться
- [ ] Можно залогиниться
- [ ] Можно создать place на карте
- [ ] Можно написать в чат (WebSocket работает)
- [ ] Медиа загружается (если есть MinIO)

✅ **Если всё работает - деплой успешен!**

---

## 🚀 Phase 3B: Deploy with Advanced Setup (Hybrid)

### Step 3B.1: Setup Upstash Kafka

**На https://upstash.com:**

- [ ] Создал Upstash аккаунт
- [ ] Создал Kafka cluster
- [ ] Скопировал Bootstrap Server URL
- [ ] Скопировал Username/Password

**Переменные для сохранения:**
```
KAFKA_BROKER=pkc-xxxxx...
KAFKA_USERNAME=...
KAFKA_PASSWORD=...
```

### Step 3B.2: Setup AWS S3

**На https://aws.amazon.com:**

- [ ] Создал AWS аккаунт
- [ ] Создал S3 bucket (например: mapped-media-prod)
- [ ] Создал IAM user для доступа к S3
- [ ] Создал access key
- [ ] Скопировал Access Key ID
- [ ] Скопировал Secret Access Key

**Переменные для сохранения:**
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET=mapped-media-prod
AWS_REGION=us-east-1
```

### Step 3B.3: Update Service Configs

- [ ] Обновил media-service использовать AWS S3 (see RAILWAY_HYBRID_SETUP.md)
- [ ] Обновил auth/chat-service использовать Upstash Kafka
- [ ] Потестировал локально: `docker-compose up`

### Step 3B.4: Railway Login & Init
```bash
railway login
railway init
# Выберите имя проекта и регион
```

- [ ] Railway project создан

### Step 3B.5: Set Railway Variables
```bash
# Установите все переменные
railway variables set KAFKA_BROKER=pkc-xxxxx...
railway variables set KAFKA_USERNAME=...
railway variables set KAFKA_PASSWORD=...
railway variables set AWS_ACCESS_KEY_ID=...
railway variables set AWS_SECRET_ACCESS_KEY=...
railway variables set AWS_BUCKET=mapped-media-prod
railway variables set DB_PASSWORD=your_strong_password
railway variables set JWT_SECRET=your_32_char_secret
```

- [ ] Все переменные установлены
- [ ] Проверены в Railway Dashboard

### Step 3B.6: Deploy
```bash
railway up
# Ждите... (15-20 минут)
```

- [ ] Деплой запущен
- [ ] Логи показывают успешный build

### Step 3B.7: Test
```bash
# Все те же тесты что в Phase 3A
railway logs -f
railway status
railway variables
```

- [ ] Все сервисы running
- [ ] Фронтенд работает в браузере
- [ ] Функциональность работает

✅ **Если всё работает - production-ready деплой успешен!**

---

## 📊 Phase 4: Post-Deployment

### Step 4.1: Save Important Information
- [ ] Скопировал Gateway URL (используется для API)
- [ ] Скопировал Web App URL (пользователи открывают это)
- [ ] Скопировал Database URL если используется
- [ ] Сохранил credentials где-то safe

### Step 4.2: Setup Monitoring
```bash
# Команды для постоянного мониторинга:
railway logs -f                  # Live логи
railway status                   # Статус сервисов
railway variables | grep URL     # Все URLs
```

- [ ] Знаю как смотреть логи
- [ ] Знаю как проверить статус

### Step 4.3: Test Critical Features
- [ ] ✅ Регистрация работает
- [ ] ✅ Логин работает
- [ ] ✅ Создание места (place) работает
- [ ] ✅ Загрузка медиа работает
- [ ] ✅ Чаты и WebSocket работают
- [ ] ✅ Фид/Posts работают

### Step 4.4: Document Your Setup

Создайте файл `DEPLOYMENT_NOTES.md` с:
```markdown
# Deployment Details

## URLs
- App: https://mapped-web-prod.railway.app
- Gateway: https://mapped-gateway-prod.railway.app

## Database
- Host: railway managed
- Name: mapsocial

## Architecture
- Option A (Simple) / Option B (Hybrid)

## Important Credentials
- [Где хранить пароли]
```

- [ ] Задокументировал deployment details

---

## 🆘 Phase 5: Troubleshooting

### Если что-то не работает:

```bash
# 1. Проверить логи
railway logs -f

# 2. Проверить статус
railway status

# 3. Перезагрузить все
railway down
railway up

# 4. Проверить переменные
railway variables

# 5. SSH в контейнер для отладки
railway shell [service-name]
```

**Common Issues:**

| Проблема | Решение |
|----------|---------|
| Container won't start | Смотреть `railway logs -f` ищите ошибки |
| DB connection error | Проверить `DATABASE_URL` в variables |
| WebSocket не работает | Проверить что gateway proxy WebSocket правильно |
| Storage full | Уменьшить Kafka retention или перейти на Option B |

- [ ] Знаю как troubleshoot

---

## ✅ Final Checklist

- [ ] Phase 1: Подготовка ✅
- [ ] Phase 2: Выбор архитектуры (A или B) ✅
- [ ] Phase 3A или 3B: Деплой ✅
- [ ] Phase 4: Post-deployment ✅
- [ ] Все функции работают ✅
- [ ] Сохранили важную информацию ✅

---

## 🎉 DEPLOYMENT COMPLETE!

Вы успешно развернули полнофункциональное микросервисное приложение на Production!

**Следующие шаги:**
1. Поделитесь app URL с пользователями
2. Настройте мониторинг и alerts
3. Регулярно проверяйте логи
4. Plan для масштабирования при необходимости

---

## 📚 References

- `RAILWAY_QUICKSTART.md` - Быстрый старт
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Полный гайд
- `RAILWAY_HOBBY_PLAN_ANALYSIS.md` - Анализ ограничений
- `RAILWAY_HYBRID_SETUP.md` - Advanced setup

---

**Good Luck! 🚀**
