# 🚀 Railway Hobby Plan - Точный План Деплоя для Вас

## 🎯 Ваша Ситуация

**Hobby Plan ограничения:**
- ✅ $5 monthly credits
- ✅ Up to 48 vCPU / 48 GB RAM per service
- ✅ Up to 5 GB storage **← УЗКОЕ МЕСТО!**

**Ваш проект требует:**
- PostgreSQL: ~500MB
- All Go services: ~300MB
- Docker images: ~1.5GB
- **Total: ~2.3GB** (в пределах 5GB!)

**Решение:** Убираем Kafka, Zookeeper, MinIO (экономим ~2GB)

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### ШАГИ 1-3: Подготовка (5 минут)

#### Шаг 1: Установить Railway CLI
```bash
npm install -g @railway/cli
```

Проверить:
```bash
railway --version
```

#### Шаг 2: Логин в Railway
```bash
railway login
```

Откроется браузер для авторизации. Залогиниться в свой аккаунт.

#### Шаг 3: Подготовить .env файл
```bash
# Перейти в папку проекта
cd D:\GolandProjects\Mapped

# Скопировать template
copy .env.railway .env

# ⚠️ ОТКРЫТЬ .env в редакторе (VS Code, notepad и т.д.)
# и ОБЯЗАТЕЛЬНО ИЗМЕНИТЬ пароли:

# Найти эти строки и ИЗМЕНИТЬ:
DB_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD
JWT_SECRET=your_32_character_secret_key_here_min_32
MINIO_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD

# Пример:
DB_PASSWORD=SuperSecurePass123!
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
MINIO_PASSWORD=MinioPass123!
```

**ВАЖНО:** Не используйте default пароли! Измените обязательно.

---

### ШАГИ 4-6: Инициализация Railway (2 минуты)

#### Шаг 4: Инициализировать Railway проект
```bash
railway init
```

Ответить на вопросы:
```
? Project name: mapped
? Region: us-west-1  (выберите ближайший к вам)
```

**Результат:** Railway создал проект и ID сохранен

#### Шаг 5: Убедиться что находимся в правильной папке
```bash
pwd
# Должна вывести: D:\GolandProjects\Mapped
```

#### Шаг 6: Проверить что файлы на месте
```bash
dir docker-compose.railway-lite.yml
dir .env
```

Обе команды должны показать файлы

---

### ШАГ 7: ДЕПЛОЙ (Главный момент!)

```bash
# Команда для деплоя с облегченным docker-compose
# (БЕЗ Kafka, Zookeeper, MinIO - для экономии storage)

docker-compose -f docker-compose.railway-lite.yml build
railway up
```

**Что происходит:**
1. Docker собирает образы (~5-10 минут)
2. Railway пушит на серверы (~2-3 минуты)
3. Контейнеры стартуют (~2-3 минуты)
4. PostgreSQL инициализируется (~2 минуты)
5. **Готово!** Приложение на production

**Общее время:** 15-20 минут первый раз

---

### ШАГ 8: Мониторинг Деплоя (параллельно с Шагом 7)

**Откройте НОВЫЙ терминал** (не закрывайте первый) и запустите:

```bash
railway logs -f
```

**Что смотреть:**
```
✅ postgres started         - БД запустилась
✅ auth-service started     - Сервис запустился
✅ ... (остальные сервисы)
❌ Красные ошибки = проблемы
```

---

### ШАГ 9: Проверить Статус (после деплоя)

```bash
railway status
```

**Нужно видеть:**
```
✓ postgres       running
✓ auth-service   running
✓ places-service running
✓ reviews-service running
✓ media-service  running
✓ posts-service  running
✓ chat-service   running
✓ gateway        running
✓ web            running
```

---

### ШАГ 10: Получить Public URLs

```bash
railway variables
```

**Вывод будет примерно:**
```
REACT_APP_API_URL=http://localhost:8080
AUTH_SERVICE_URL=http://auth-service:8081
CHAT_SERVICE_URL=http://chat-service:8086
... (много переменных)
```

**Нужно найти:**
```
GATEWAY_URL или просто скопировать из Dashboard
```

Если не видно - открыть Railway Dashboard и там будут URLs.

---

### ШАГ 11: Открыть в Браузере

```bash
# Скопировать URL фронтенда (обычно что-то типа):
https://mapped-web-production.railway.app

# Открыть в браузере
```

**Если откроется:**
- ✅ Видна карта
- ✅ Есть форма регистрации
- ✅ Приложение работает

**Готово! Деплой успешен!** 🎉

---

## ✅ ТЕСТИРОВАНИЕ ПОСЛЕ ДЕПЛОЯ

Проверить что всё работает:

```bash
# 1. Регистрация
Открыть фронтенд → нажать Register → создать аккаунт
Результат: ✅ Должно сработать

# 2. Логин
Введите email/password
Результат: ✅ Должно залогиниться

# 3. Создать place
На карте нажать на место → "Add Place"
Результат: ✅ Место создалось, видно на карте

# 4. Чаты (WebSocket)
Зайти в Chats → написать сообщение
Результат: ✅ Сообщение отправилось
```

**Если всё работает - поздравляем!** 🎉

---

## ⚠️ ЧТО ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### Проблема 1: "railway up" не находит docker-compose.yml

```bash
# Убедитесь что используете правильный файл
railway up --config docker-compose.railway-lite.yml
```

### Проблема 2: "Container won't start"

```bash
# Смотреть логи для деталей
railway logs -f [service-name]

# Примеры:
railway logs -f auth-service
railway logs -f postgres
```

### Проблема 3: "Database connection error"

```bash
# Проверить что DATABASE_URL правильный
railway variables | findstr DATABASE_URL

# Если пусто - PostgreSQL не запустился
railway logs -f postgres
```

### Проблема 4: Storage заканчивается

```bash
# Проверить использование
railway info

# Если proche to limit - нужно почистить
# или перейти на файл docker-compose.yml с Kafka отключенным
```

---

## 📊 ПОСЛЕ УСПЕШНОГО ДЕПЛОЯ

### 1. Поделиться URL'ом
Скопировать URL фронтенда и поделиться с командой/пользователями

### 2. Мониторить Логи
```bash
railway logs -f
# Смотреть периодически что всё работает
```

### 3. Следить за Storage
```bash
railway info
# Если что-то не так - сообщить мне
```

### 4. Когда хочется Kafka Back

Если нужны async messaging:
- Использовать Upstash Kafka (бесплатный tier)
- Обновить конфиги микросервисов
- Переключиться на docker-compose.hybrid.yml

---

## 🎯 ИТОГОВЫЙ ЧЕКЛИСТ

Перед деплоем:
- [ ] Railway CLI установлен: `railway --version`
- [ ] .env файл создан: `copy .env.railway .env`
- [ ] Пароли изменены в .env (не default!)
- [ ] `railway login` выполнен
- [ ] `railway init` выполнен с именем проекта

Во время деплоя:
- [ ] `docker-compose -f docker-compose.railway-lite.yml build`
- [ ] `railway up` запущен
- [ ] `railway logs -f` в отдельном терминале показывает прогресс
- [ ] Нет критичных ошибок в логах

После деплоя:
- [ ] `railway status` показывает все сервисы RUNNING
- [ ] Фронтенд открывается в браузере
- [ ] Можно зарегистрироваться
- [ ] Можно создать place
- [ ] Чаты работают

---

## 📞 СПРАВОЧНАЯ ИНФОРМАЦИЯ

**Размеры компонентов:**
- PostgreSQL: ~500MB
- Each Go service: ~50MB (x6 = 300MB)
- Docker layers: ~1.5GB
- Total: ~2.3GB ✅ В пределах 5GB!

**Что убрали (экономия ~2GB):**
- Kafka + Zookeeper: -1.5GB
- MinIO: -200MB
- Зато: NO async messaging, no object storage

**Стоимость:**
- Месяц 1: FREE ($5 credits)
- Месяцы 2+: $5-10/месяц

---

## 🚀 ГОТОВЫ?

Выполните 11 шагов выше по порядку.

Если что-то не понятно - спросите на каком конкретно шаге застрял.

**Happy Deploying!** 🗺️
