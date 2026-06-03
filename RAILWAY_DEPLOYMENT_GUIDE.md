# Гайд: Деплой Mapped на Railway Hobby Plan

## Шаг 1: Подготовка Проекта

### 1.1 Установите Railway CLI
```bash
npm install -g @railway/cli
```

### 1.2 Логин в Railway
```bash
railway login
```
Откроется браузер для авторизации

### 1.3 Подготовьте .env файл
```bash
cp .env.railway .env
```

Отредактируйте `.env` с security-conscious значениями:
- Измените `DB_PASSWORD`
- Измените `JWT_SECRET` (минимум 32 символа)
- Измените `MINIO_PASSWORD`

**ВАЖНО:** Не коммитьте `.env` в git! (уже в .gitignore)

---

## Шаг 2: Инициализация Railway Проекта

```bash
# Создайте новый Railway проект
railway init

# Выберите имя проекта: "Mapped" или "mapped-geosocial"
# Выберите регион поближе к вашим пользователям
```

---

## Шаг 3: Деплой с Docker Compose

Railway поддерживает `docker-compose.yml`. Два варианта:

### Вариант A: Использовать встроенный docker-compose
```bash
# Railway автоматически прочитает docker-compose.yml
railway up
```

### Вариант B: Использовать оптимизированный для Railway
```bash
# Если хотите использовать railway.docker-compose.yml
docker-compose -f railway.docker-compose.yml up -d
railway link
```

---

## Шаг 4: Мониторинг Деплоя

```bash
# Смотреть логи
railway logs

# Смотреть статус сервисов
railway status

# Открыть Dashboard в браузере
railway open
```

---

## Шаг 5: Получить Public URLs

После успешного деплоя Railway создаст public URLs для каждого сервиса:

```bash
# Смотреть все endpoints
railway variables

# Вывод примерно:
# Gateway: https://mapped-gateway-production.railway.app
# Web: https://mapped-web-production.railway.app
# Auth Service: https://mapped-auth-production.railway.app
```

---

## Шаг 6: Обновить переменные окружения

После деплоя обновите `.env` с реальными URLs:

```bash
railway variables set REACT_APP_API_URL=https://your-gateway-url.railway.app/api
railway variables set MEDIA_PUBLIC_URL=https://your-media-url.railway.app/media
```

Или через Railway Dashboard:
1. Откройте проект в Dashboard
2. Перейдите в Variables
3. Обновите значения

---

## Шаг 7: Проверка Здоровья

```bash
# Проверить gateway
curl https://your-gateway-url.railway.app/health

# Проверить фронтенд
# Откройте в браузере: https://your-web-url.railway.app
```

---

## 🎯 Hobby Plan Оптимизации (Уже применены)

### Storage (5 GB лимит)
✅ Kafka retention: 72 часа вместо неограниченного  
✅ Kafka segment: 512MB вместо 1GB  
✅ PostgreSQL будет занимать большую часть  
✅ MinIO ограничить или использовать AWS S3

### Memory/CPU
✅ Zookeeper: -Xmx256M (вместо default 1G)  
✅ Kafka: -Xmx512M (вместо default 2G)  
✅ Все сервисы используют Go - легкий  

### Восстановление после падений
✅ Все сервисы: `restart: always`  
✅ Health checks на критичных сервисах  

---

## 📊 Мониторинг Стоимости

Railway считает по использованию:
- 1 vCPU-час = $0.000694 USD
- 1 GB RAM-час = $0.000694 USD
- Storage = $0.10 за GB/месяц

**Примерная стоимость для вашего проекта:**
- 2 vCPU работающих постоянно: ~$10/месяц
- 4 GB RAM: ~$3/месяц
- Storage (5GB): ~$0.50/месяц
- **ИТОГО:** ~$13.50/месяц (в пределах $5 credits + ваши деньги)

---

## ⚠️ Важные Замечания

### 1. Первый Деплой Медленнее
- Build сервисов: 5-10 минут
- Инициализация БД: 1-2 минуты
- Общее время: 15-20 минут

### 2. Если хранилище переполнится
```bash
# Уменьшить retention Kafka еще больше
KAFKA_LOG_RETENTION_HOURS=24

# Или очистить media storage
# (будьте осторожны - удалите пользовательские файлы)
```

### 3. Если нужна масштабируемость
Upgrade на Pro Plan:
- Unlimited storage
- Больше Resources
- $7/месяц за service

---

## 🚀 Команды для Частого Использования

```bash
# Посмотреть логи live
railway logs -f

# Перезагрузить определенный сервис
railway down [service-name]
railway up [service-name]

# Обновить код и пересобрать
git push
# Railway автоматически пересоберет если git connected

# SSH в контейнер (для отладки)
railway shell [service-name]

# Смотреть текущие variables
railway variables

# Установить variable
railway variables set KEY=value

# Снять проект с боевого
railway down
```

---

## 🐛 Troubleshooting

### Сервис не стартует
```bash
railway logs -f [service-name]
# Смотреть последние ошибки
```

### PostgreSQL не инициализируется
```bash
# Check migrations выполнены
railway shell postgres
psql -U mapsocial -d mapsocial -c "\dt"
```

### WebSocket не работает
- Проверьте что gateway правильно proxy WebSocket
- Railway поддерживает WebSocket out-of-the-box

### Нет памяти/storage
```bash
# Upgrade на Pro Plan
# Или оптимизировать Kafka retention
# Или использовать Upstash Kafka
```

---

## ✅ Успешный Деплой - Чек-лист

- [ ] Railway CLI установлен и залогинен
- [ ] `.env` файл подготовлен с новыми паролями
- [ ] `railway init` выполнен
- [ ] `railway up` или `docker-compose up` выполнены
- [ ] Логи показывают успешный старт всех сервисов
- [ ] Gateway返回 200 OK на `/health`
- [ ] Фронтенд загружается в браузере
- [ ] Можно залогиниться в приложение
- [ ] WebSocket работает (чаты показывают сообщения)

---

## 📚 Полезные Ссылки

- Railway Docs: https://docs.railway.app/
- Docker Compose на Railway: https://docs.railway.app/develop/services
- Hobby Plan Details: https://railway.app/pricing
- Railway CLI Commands: https://docs.railway.app/cli/commands

---

Готовы начать деплой? Пишите если возникнут вопросы! 🚀
