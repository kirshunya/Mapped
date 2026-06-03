# 🚀 RAILWAY HOBBY PLAN - VISUALНЫЙ ГАЙД

## 🎯 ВАШ ПЛАН НА 1 ЭКРАН

```
┌─────────────────────────────────────────────────────────────┐
│              RAILWAY HOBBY PLAN DEPLOYMENT                  │
│         Mapped - Geo-Social Network App                      │
└─────────────────────────────────────────────────────────────┘

📊 ВАШИ ЛИМИТЫ:
├─ Storage: 5 GB      ← УЗКОЕ МЕСТО!
├─ vCPU: 48 (per service)
├─ RAM: 48 GB (per service)
├─ Credits: $5/месяц
└─ Uptime: 99.9%

💾 ВАШ ПРОЕКТ ТРЕБУЕТ:
├─ PostgreSQL: 500 MB
├─ Services (6x Go): 300 MB
├─ Docker images: 1.5 GB
├─ Total: 2.3 GB ✅ FITS!
└─ (Kafka + MinIO убрали для экономии)

🎬 ПРОЦЕСС РАЗВЕРТЫВАНИЯ:
│
├─ Шаг 1: Установить Railway CLI (npm install)
├─ Шаг 2: Логин (railway login)
├─ Шаг 3: Подготовить .env (copy + edit)
├─ Шаг 4: Инициализировать (railway init)
├─ Шаг 5: Собрать образы (docker-compose build)
├─ Шаг 6: Развернуть (railway up)
├─ Шаг 7: Мониторить логи (railway logs -f)
├─ Шаг 8: Проверить статус (railway status)
├─ Шаг 9: Получить URLs (railway variables)
└─ Шаг 10: Открыть в браузере ✅ DONE!

⏱️  ВРЕМЯ:
├─ Подготовка: 5 мин
├─ Деплой: 15-20 мин (первый раз)
├─ Обновления: 5-10 мин
└─ ВСЕГО: ~25 мин

💰 СТОИМОСТЬ:
├─ Месяц 1: FREE ($5 credits)
├─ Месяцы 2+: $5-10/месяц
└─ ИТОГО: $5-10/месяц

✅ ВЫ ПОЛУЧАЕТЕ:
├─ PostgreSQL (managed)
├─ 6 Go Microservices
├─ API Gateway
├─ React Frontend
├─ 99.9% Uptime
└─ Auto SSL/TLS
```

---

## 🎯 БЫСТРЫЙ СТАРТ (Для нетерпеливых)

### Скопируйте Блоки Команд и Выполняйте по Очереди:

#### БЛОК 1: Установка (1 мин)
```bash
npm install -g @railway/cli
railway --version
```

#### БЛОК 2: Логин (2 мин - откроется браузер)
```bash
railway login
```

#### БЛОК 3: Подготовка (3 мин - отредактируйте .env!)
```bash
cd D:\GolandProjects\Mapped
copy .env.railway .env
# ⚠️ ОТКРЫТЬ .env в текстовом редакторе и изменить:
#    DB_PASSWORD=your_password
#    JWT_SECRET=your_secret
#    MINIO_PASSWORD=your_password
```

#### БЛОК 4: Инициализация (1 мин)
```bash
railway init
# Ответить: mapped + выбрать region
```

#### БЛОК 5: Сборка Образов (10 мин - терпения!)
```bash
docker-compose -f docker-compose.railway-lite.yml build
```

#### БЛОК 6: Развертывание (10 мин)
```bash
railway up
# ⚠️ НЕ закрывайте терминал!
```

#### БЛОК 7: Мониторинг (открыть в отдельном терминале)
```bash
railway logs -f
# Смотреть пока все сервисы не запустятся
```

#### БЛОК 8: Проверка (после деплоя)
```bash
railway status
railway variables
# Скопировать URL web приложения
```

#### БЛОК 9: Открыть в Браузере
```
Скопировать: https://mapped-web-production.railway.app
Открыть в браузере
Видеть: Карта + Login форма ✅
```

---

## 📋 ФАЙЛЫ КОТОРЫЕ ИСПОЛЬЗУЮТСЯ

```
docker-compose.railway-lite.yml
└─ Содержит: PostgreSQL + 6 Go Services (БЕЗ Kafka/MinIO)
   Размер: ~2.3 GB вместо 5 GB полного
   Зачем: Экономия storage для Hobby Plan

.env (создается из .env.railway)
└─ Содержит: Переменные окружения
   ВАЖНО: Изменить пароли!
   Если забыли: Изменить потом в Railway Dashboard
```

---

## ✅ УСПЕХ ВЫГЛЯДИТ ТАК

### После railway status:
```
Service             Status
─────────────────────────────
postgres            ✓ running
auth-service        ✓ running
places-service      ✓ running
reviews-service     ✓ running
media-service       ✓ running
posts-service       ✓ running
chat-service        ✓ running
gateway             ✓ running
web                 ✓ running
```

### После открытия в браузере:
```
┌────────────────────────────────────────┐
│  Mapped - Geo-Social Network           │
├────────────────────────────────────────┤
│                                        │
│  🗺️  КАРТА С OPENSTREETMAP             │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ Login / Register Form          │   │
│  │ Email: [____________]          │   │
│  │ Password: [____________]       │   │
│  │ [ Login ] [ Register ]         │   │
│  └────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘

✅ ЕСЛИ ВЫ ЭТО ВИДИТЕ - ВСЁ РАБОТАЕТ!
```

---

## 🚨 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### Быстрая Диагностика:

```
Проблема                  Решение
─────────────────────────────────────────────────
Container не стартует     railway logs -f [name]
                          Ищите ERRORS в логах

DB connection error       Подождите 30 секунд
                          postgres инициализируется

railway command not found npm install -g @railway/cli
                          снова

Storage full              Это нормально первый раз
                          Не добавляйте большие файлы

Can't login in Railway    railway logout
                          railway login (снова)
```

---

## 📊 АРХИТЕКТУРА ВАШ APP НА RAILWAY

```
┌──────────────────────────────────────────────────────┐
│           RAILWAY HOBBY PLAN                         │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ PostgreSQL (managed, 500MB)                 │   │
│  └─────────────────────────────────────────────┘   │
│                     ↑                               │
│         ┌───────────┼───────────┐                   │
│         │           │           │                   │
│    ┌────┴────┐ ┌───┴────┐ ┌───┴────┐              │
│    │Auth Svc │ │Chat Svc│ │Places  │              │
│    │(8081)   │ │(8086)  │ │(8082)  │              │
│    └────┬────┘ └────┬───┘ └────┬───┘              │
│         │           │          │                   │
│         └───────────┼──────────┘                   │
│                     │                               │
│         ┌───────────┴───────────┐                  │
│         │                       │                  │
│    ┌────┴────┐          ┌──────┴───┐              │
│    │API      │          │React     │              │
│    │Gateway  │          │Frontend  │              │
│    │(8080)   │          │(80)      │              │
│    └────┬────┘          └──────┬───┘              │
│         │                      │                  │
│    URL: /api                   │ URL: /           │
│         │                      │                  │
└─────────┼──────────────────────┼──────────────────┘
          │                      │
          └──────────────────────┘
                  ↓
          🌐 Internet
                  ↓
            📱 Your Users
```

---

## 🎓 ЧТО ВЫ НАУЧИТЕСЬ

Посла успешного деплоя вы будете знать:

✅ Как использовать Railway  
✅ Как деплоить микросервисы в облако  
✅ Как работать с Docker Compose  
✅ Как масштабировать приложение  
✅ Как мониторить production сервис  

---

## 📞 ВАЖНЫЕ ССЫЛКИ

```
Railway Dashboard: https://railway.app/dashboard
Railway Docs: https://docs.railway.app/
Your Project Git: https://github.com/kirshunya/Mapped
```

---

## 🏁 ФИНАЛЬНЫЙ ЧЕК-ЛИСТ

```
⬜ Railway CLI установлен
⬜ Залогинен в Railway
⬜ .env файл подготовлен и пароли изменены
⬜ railway init выполнен
⬜ docker-compose build выполнен
⬜ railway up запущен
⬜ railway logs -f показывает прогресс
⬜ railway status показывает все RUNNING
⬜ Фронтенд открывается в браузере
⬜ Можно зарегистрироваться
⬜ Приложение полностью работает ✅

Если все галочки ✅ - ПОЗДРАВЛЯЕМ! 🎉
```

---

## 🎉 ВЫ СДЕЛАЛИ ЭТО!

Вы успешно развернули:
- ✅ Production микросервисное приложение
- ✅ На облачном хостинге Railway
- ✅ С управляемой PostgreSQL БД
- ✅ С автоматическим SSL
- ✅ С 99.9% uptime гарантией
- ✅ За $5-10 в месяц

### Дальнейшие Шаги:
1. Поделиться URL'ом с пользователями
2. Мониторить логи: `railway logs -f`
3. Когда вырастет - upgrade на Pro Plan

---

**НАЧНИТЕ ПРЯМО СЕЙЧАС!** 🚀

Выполните БЛОК 1 команд выше.

Вопросы? Я здесь! 💬
