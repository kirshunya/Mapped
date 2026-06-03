# ⚡ RAILWAY HOBBY PLAN - ТОЧНЫЕ КОМАНДЫ ДЛЯ ВАШЕГО ДЕПЛОЯ

## 🎯 Сокращенная Версия (Все Команды Здесь)

### Этап 1: Подготовка
```bash
# 1. Установить Railway CLI
npm install -g @railway/cli

# 2. Проверить установку
railway --version

# 3. Логин в Railway
railway login
# Откроется браузер, залогиниться в свой аккаунт

# 4. Перейти в папку проекта
cd D:\GolandProjects\Mapped

# 5. Скопировать .env
copy .env.railway .env

# 6. ⚠️ ОТРЕДАКТИРОВАТЬ .env в текстовом редакторе
# Найти и ИЗМЕНИТЬ:
#   DB_PASSWORD=change_to_strong_password
#   JWT_SECRET=change_to_32_char_secret
#   MINIO_PASSWORD=change_to_strong_password
```

### Этап 2: Инициализация
```bash
# 7. Инициализировать Railway проект
railway init
# Ответить:
#   Project name: mapped
#   Region: выберите ближайший (например us-west-1)

# 8. Проверить файлы
dir docker-compose.railway-lite.yml
dir .env
# Оба файла должны существовать
```

### Этап 3: ДЕПЛОЙ (Главное)
```bash
# 9. Собрать Docker образы
docker-compose -f docker-compose.railway-lite.yml build
# Ждите 5-10 минут

# 10. Развернуть на Railway
railway up
# Ждите 15-20 минут, пока всё запустится
```

### Этап 4: Мониторинг (в отдельном терминале)
```bash
# 11. Смотреть логи развертывания (откройте новый терминал)
railway logs -f
# Смотрите пока не появится сообщение про готовность всех сервисов
```

### Этап 5: Проверка
```bash
# 12. Проверить статус (после деплоя)
railway status
# Все сервисы должны быть RUNNING

# 13. Получить URLs
railway variables
# Найти URL для фронтенда и gateway

# 14. Открыть в браузере
# Скопировать URL фронтенда (примерно):
# https://mapped-web-production.railway.app
# Открыть в браузере
```

---

## 📋 ДЛЯ БЫСТРОЙ ССЫЛКИ - КОМАНДЫ БЛОКОМ

**Просто скопируйте и выполняйте по одной:**

```bash
# Установка
npm install -g @railway/cli
railway --version

# Логин
railway login

# Подготовка
cd D:\GolandProjects\Mapped
copy .env.railway .env
# ⚠️ ОТРЕДАКТИРУЙТЕ .env перед продолжением!

# Инициализация
railway init

# Деплой
docker-compose -f docker-compose.railway-lite.yml build
railway up

# В отдельном терминале (параллельно)
railway logs -f

# После деплоя
railway status
railway variables
```

---

## ✅ ЧЕК-ЛИСТ ГОТОВНОСТИ

### Перед Деплоем
```
[ ] npm install -g @railway/cli выполнен
[ ] railway login выполнен (браузер открывался)
[ ] copy .env.railway .env выполнен
[ ] .env файл отредактирован (пароли изменены)
[ ] railway init выполнен
[ ] Я в папке D:\GolandProjects\Mapped
[ ] docker-compose.railway-lite.yml существует
```

### Во Время Деплоя
```
[ ] docker-compose build выполняется
[ ] railway up запущен
[ ] railway logs -f открыт в отдельном терминале
[ ] Логи показывают сервисы стартующие
[ ] Нет критичных ошибок (красные ERRORS)
```

### После Деплоя
```
[ ] railway status показывает все RUNNING
[ ] railway variables выполнен
[ ] Скопировал URL фронтенда
[ ] Открыл в браузере - видна карта
[ ] Смог зарегистрироваться
[ ] Смог залогиниться
[ ] Смог создать place на карте
```

---

## 🚨 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### ошибка: "docker-compose command not found"
```bash
# Установить Docker Desktop для Windows
# https://www.docker.com/products/docker-desktop
```

### Ошибка: "railway up не находит файл"
```bash
# Убедитесь что находитесь в правильной папке
pwd  # должно показать: D:\GolandProjects\Mapped

# Проверить что файл существует
dir docker-compose.railway-lite.yml

# Если файла нет - скопировать путь и использовать полный путь
railway up --config D:\GolandProjects\Mapped\docker-compose.railway-lite.yml
```

### Ошибка: "Container won't start"
```bash
# Смотреть логи для конкретного сервиса
railway logs -f postgres          # если postgres не стартует
railway logs -f auth-service      # если auth не стартует
railway logs -f gateway           # если gateway не стартует

# Ищите красные ERRORS в логах
```

### Ошибка: "Database connection refused"
```bash
# Проверить что PostgreSQL running
railway logs -f postgres

# Подождать 20-30 секунд пока БД инициализируется
```

### Ошибка: "Storage limit exceeded"
```bash
# Это значит что 5GB используется полностью
# Решения:
# 1. Перейти на Pro Plan ($7/месяц)
# 2. Использовать docker-compose с Kafka отключенным (уже используете)
# 3. Удалить ненужные данные из БД
```

---

## 📊 ОЖИДАЕМЫЙ ВЫВОД

### railway status должен выглядеть так:
```
Service             Status      Region
─────────────────────────────────────────
postgres            ✓ running   us-west-1
auth-service        ✓ running   us-west-1
places-service      ✓ running   us-west-1
reviews-service     ✓ running   us-west-1
media-service       ✓ running   us-west-1
posts-service       ✓ running   us-west-1
chat-service        ✓ running   us-west-1
gateway             ✓ running   us-west-1
web                 ✓ running   us-west-1
```

### railway logs -f должен показывать:
```
2024-06-03T10:45:23.123Z postgres started successfully
2024-06-03T10:45:45.456Z auth-service started on port 8081
2024-06-03T10:46:00.789Z places-service started on port 8082
... (остальные сервисы)
2024-06-03T10:47:30.012Z gateway started on port 8080
2024-06-03T10:47:45.345Z web started on port 80
```

### Фронтенд в браузере должен показать:
```
🗺️  Карта с OpenStreetMap
Login/Register форма
Меню с Pages: Map, Feed, Chats, Groups, Profile
```

---

## 💡 СОВЕТЫ

1. **Первый деплой медленнее** (15-20 мин)
   - Railway собирает Docker образы
   - Инициализирует БД
   - Второй деплой будет быстрее (5-10 мин)

2. **Не закрывайте терминал** пока идет `railway up`
   - Это может прерватьupload

3. **Смотрите логи параллельно**
   - Откройте второй терминал
   - Запустите `railway logs -f`
   - Видите прогресс в реальном времени

4. **Если зависает на 50%**
   - Это нормально, просто медленно идет build
   - Не закрывайте, ждите 10 минут еще

5. **Пароли важны!**
   - Не оставляйте default пароли
   - Используйте strong passwords
   - Сохраните где-то в safe place

---

## 🎯 ИТОГО

**7 Командных Блоков для Копирования:**

1. `npm install -g @railway/cli && railway --version`
2. `railway login`
3. `cd D:\GolandProjects\Mapped && copy .env.railway .env`
4. `[отредактируйте .env вручную в текстовом редакторе]`
5. `railway init`
6. `docker-compose -f docker-compose.railway-lite.yml build`
7. `railway up`

**Плюс мониторинг в отдельном терминале:**
8. `railway logs -f`

**Проверка после деплоя:**
9. `railway status && railway variables`

---

## 📞 ЕСЛИ ЗАСТРЯЛ

Скажите мне:
1. На каком шаге застрял?
2. Какая ошибка?
3. Полный вывод ошибки

Я помогу! 🚀
