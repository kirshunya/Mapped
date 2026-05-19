# Render.com: Полная архитектура в 5 минут

## Почему Render?

✅ Полностью поддерживает `docker-compose.yml`  
✅ Всё поднимается **автоматически**  
✅ Бесплатный tier для тестирования  
✅ Не нужно создавать каждый сервис отдельно  
✅ Просто загружаешь файл и готово!

---

## ШАГ 1: Подготовить репозиторий

На локальной машине убедитесь что в корне репозитория есть файлы:
- ✅ `docker-compose.yml` - уже есть
- ✅ `.dockerignore` - уже есть  
- ✅ `Dockerfile` - уже есть (для gateway)

Проверьте что `docker-compose.yml` содержит все сервисы (postgres, kafka, auth-service и т.д.).

### Обновить docker-compose.yml для Render

В `docker-compose.yml` **убедитесь** что сервисы используют **environment variables** вместо hardcoded значений:

```yaml
services:
  postgres:
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-mapped}
```

Это нужно чтобы Render мог переопределять переменные.

### Коммитьте и пушьте

```bash
git add .
git commit -m "chore: prepare for Render deployment"
git push origin dev
```

---

## ШАГ 2: Создать аккаунт на Render

1. Перейдите на https://render.com
2. Нажмите **"Sign up"**
3. Авторизуйтесь через **GitHub** (проще всего)
4. Разрешьте доступ к вашему репозиторию

---

## ШАГ 3: Развернуть docker-compose

### На Render Dashboard:

1. Нажмите **"+ New"** (сверху)
2. Выберите **"Docker Compose"**
3. Выберите ветку **"dev"**
4. Нажмите **"Create Web Service"**

Render автоматически найдёт `docker-compose.yml` в вашем репозитории.

### Конфигурация:

Render спросит параметры:

**Name:** `mapped-production` (или любое имя)

**Runtime:** Docker Compose (уже выбрано)

**Branch:** `dev`

**Root Directory:** `.` (текущая папка - оставить как есть)

Нажмите **"Create Web Service"**

---

## ШАГ 4: Добавить переменные окружения

После создания:

1. Перейдите в **Environment**
2. Добавьте переменные:

```env
POSTGRES_USER=mapsocial
POSTGRES_PASSWORD=mapsocial123
POSTGRES_DB=mapped
JWT_SECRET=mapsocial-super-secret-key-2024
GIN_MODE=release
KAFKA_BROKER=kafka:29092
DATABASE_URL=postgresql://mapsocial:mapsocial123@postgres:5432/mapped
```

3. Нажмите **"Deploy"**

Render **автоматически** поднимет все сервисы из `docker-compose.yml`!

---

## ШАГ 5: Дождитесь деплоя

Render начнёт **собирать и запускать** все контейнеры:
- PostgreSQL ✅
- Zookeeper ✅
- Kafka ✅
- Auth Service ✅
- Places Service ✅
- Posts Service ✅
- Chat Service ✅
- Media Service ✅
- Gateway ✅

Это займёт **5-10 минут**.

Смотрите логи - должны быть зелёные галочки рядом с каждым сервисом.

---

## ШАГ 6: Получить Public URL

После успешного деплоя:

1. Render Dashboard → ваш сервис
2. Вверху будет **Public URL** (примерно `https://mapped-production-xxxx.onrender.com`)
3. Откройте в браузере
4. Попробуйте зарегистрироваться 🎉

---

## Проверка

Если всё работает:
```
✅ Фронтенд загружается
✅ Можешь зарегистрироваться
✅ Видишь логи всех сервисов
```

Если ошибки:
1. Посмотри логи каждого сервиса
2. Проверь переменные окружения
3. Убедись что все Dockerfile'ы корректные

---

## Если что-то не работает

### Ошибка: "Container failed to start"

Проверьте:
1. **Dockerfile синтаксис** - должен быть правильный
2. **docker-compose.yml** - должен быть валидный YAML
3. **Переменные** - все переменные должны быть установлены в Environment

### Ошибка: "Port already in use"

Render обычно это решает автоматически. Если нет:
1. Удалите старое развертывание
2. Создайте новое

### Логи не видны

В Render Dashboard:
- Нажмите на сервис
- Нажмите **"Logs"** вкладку
- Там будут все логи

---

## Плюсы Render для твоего проекта

✅ **Один клик** - и всё развёрнуто  
✅ **Автоматический docker-compose** - не нужно создавать каждый сервис  
✅ **Бесплатный** - для тестирования  
✅ **Быстро** - 5-10 минут на развёртывание  
✅ **Легко масштабировать** - можешь увеличить ресурсы одной кнопкой  

---

## Следующие шаги

После успешного деплоя:

1. **Протестируй приложение**
   - Регистрация
   - Логин
   - Создание групп/мест/постов
   - Чаты

2. **Если всё работает** - готово! 🎉

3. **Если нужны улучшения:**
   - Добавить HTTPS (Render делает автоматически)
   - Увеличить ресурсы
   - Настроить автоматические обновления при push в GitHub

---

**Начинайте!** Выполните ШАГ 1-2, и я помогу с остальным! 🚀
