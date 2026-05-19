# Локальное тестирование с Docker Compose

Этот файл описывает, как тестировать всё приложение локально перед развёртыванием на Railway.

## Требования

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git
- ~8GB свободной памяти и места на диске

## Подготовка

### 1. Клонируйте репозиторий (если ещё не клонировали)

```bash
git clone https://github.com/kirshunya/Mapped.git
cd Mapped
git checkout dev
```

### 2. Убедитесь, что нет запущенных контейнеров

```bash
docker-compose down -v  # Удалит все контейнеры и volumes
```

## Запуск приложения локально

### Способ 1: Linux/Mac (использовать bash)

```bash
# Перейдите в корень проекта
cd /path/to/Mapped

# Запустите все сервисы
docker-compose up -d

# Проверьте статус
docker-compose ps

# Следите за логами
docker-compose logs -f

# Для остановки
docker-compose down
```

### Способ 2: Windows (использовать PowerShell)

```powershell
# Используйте скрипт docker-run.bat
.\docker-run.bat

# Или вручную:
docker-compose up -d
docker-compose ps
docker-compose logs -f
```

## Проверка статуса запуска

Проверьте, что все контейнеры запустились:

```bash
docker-compose ps
```

Должно показать (примерно так):

```
NAME                    COMMAND                  SERVICE              STATUS       
gateway                 "/app/gateway"           gateway              Up (healthy) 
postgres                "docker-entrypoint..."   postgres             Up (healthy)
kafka                   "/etc/confluent/d..."   kafka                Up (healthy) 
auth-service            "/app/auth-service..."  auth-service         Up            
places-service          "/app/places-servic..."  places-service       Up            
posts-service           "/app/posts-service..."  posts-service        Up            
chat-service            "/app/chat-service..."   chat-service         Up            
media-service           "/app/media-service..."  media-service        Up            
reviews-service         "/app/reviews-servic...  reviews-service      Up            
zookeeper               "/etc/confluent/d..."   zookeeper            Up (healthy) 
minio                   "/usr/bin/minio se..."  minio                Up            
```

## Доступ к приложению

После запуска всё доступно на `localhost`:

### Фронтенд и API
- **Веб-приложение**: http://localhost:8080
- **API**: http://localhost:8080/api/v1/*
- **Health check**: http://localhost:8080/health

### Отдельные сервисы (для отладки)
- **Auth Service**: http://localhost:8081
- **Places Service**: http://localhost:8082
- **Reviews Service**: http://localhost:8083
- **Media Service**: http://localhost:8084
- **Posts Service**: http://localhost:8085
- **Chat Service**: http://localhost:8086

### Инструменты
- **Kafka UI**: http://localhost:8080 (включён в логику if needed)
- **MinIO Console**: http://localhost:9001 (minioadmin / minioadmin123)

## Чек-лист тестирования

Откройте http://localhost:8080 и протестируйте:

### 1. Основной функционал
- [ ] Страница загружается без ошибок
- [ ] Все навигационные ссылки работают
- [ ] Нет консольных ошибок (F12 → Console)

### 2. Аутентификация
- [ ] Регистрация нового пользователя работает
- [ ] Логин работает
- [ ] Профиль загружается

### 3. Язык (English/Русский)
- [ ] Переключение языка работает
- [ ] Все тексты переводятся
- [ ] На страницах Groups, Places, Map, Posts, Chats, Profile

### 4. Основные страницы
- **Groups**
  - [ ] Список групп загружается
  - [ ] Можно создать группу
  - [ ] Можно присоединиться/покинуть группу

- **Places**
  - [ ] Список мест загружается
  - [ ] Фотографии мест отображаются (если есть)
  - [ ] Фильтрация/поиск работает
  - [ ] Можно создать место

- **Map**
  - [ ] Карта загружается
  - [ ] Маркеры мест видны
  - [ ] Клик на маркер показывает информацию
  - [ ] Кнопка "View Creator" ведёт на профиль

- **Posts**
  - [ ] Лента постов загружается
  - [ ] Можно создать пост
  - [ ] Реакции работают
  - [ ] Комментарии работают

- **Chat**
  - [ ] Диалоги загружаются
  - [ ] Можно отправить сообщение
  - [ ] Сообщения появляются в реальном времени

- **Profile**
  - [ ] Профиль пользователя загружается
  - [ ] Посты пользователя видны
  - [ ] Места пользователя видны
  - [ ] Можно отредактировать профиль

### 5. Загрузка файлов
- [ ] Загрузка изображений в посты работает
- [ ] Загрузка фото профиля работает
- [ ] Загрузка фото места работает

### 6. Ошибки и пограничные случаи
- [ ] Нет сообщений об ошибках в консоли браузера
- [ ] Навигация не ломается при переключении между страницами
- [ ] Поиск с пустым результатом обрабатывается корректно

## Просмотр логов сервисов

```bash
# Логи всех сервисов
docker-compose logs

# Логи конкретного сервиса (в реальном времени)
docker-compose logs -f gateway
docker-compose logs -f postgres
docker-compose logs -f auth-service

# Последние 100 строк
docker-compose logs --tail=100 gateway
```

## Отладка

### Зайти в контейнер
```bash
# Зайти в контейнер сервиса
docker-compose exec gateway sh
docker-compose exec postgres psql -U mapsocial -d mapsocial
```

### Перестартить сервис
```bash
# Перестартить один сервис
docker-compose restart gateway

# Перестартить все
docker-compose restart
```

### Пересобрать образы
```bash
# Пересобрать все образы (если поменялся код)
docker-compose build

# И запустить заново
docker-compose up -d
```

### Очистить всё
```bash
# Остановить и удалить всё
docker-compose down -v

# Удалить также неиспользуемые образы
docker image prune -a
```

## Проверка доступа к БД

```bash
# Подключиться к PostgreSQL
docker-compose exec postgres psql -U mapsocial -d mapsocial

# В psql выполнить:
\dt                    # Показать таблицы
SELECT * FROM users;   # Пример запроса
\q                     # Выход
```

## Проверка Kafka

```bash
# Зайти в контейнер Kafka
docker-compose exec kafka bash

# Просмотреть темы
kafka-topics --list --bootstrap-server kafka:29092

# Создать тему (если нужно)
kafka-topics --create --topic test --bootstrap-server kafka:29092

# Выход
exit
```

## Типичные проблемы и решения

### Ошибка: "port already in use"
```bash
# Port 8080 уже используется. Убейте процесс:
# Linux/Mac:
lsof -i :8080
kill -9 <PID>

# Windows (PowerShell):
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Ошибка: "Cannot connect to gateway"
- Убедитесь, что gateway запустился: `docker-compose ps | grep gateway`
- Проверьте логи: `docker-compose logs gateway`
- Дождитесь инициализации (~30 сек после запуска)

### Ошибка: "PostgreSQL не готов"
- PostgreSQL может запускаться долго. Дождитесь: `docker-compose logs postgres | grep "database system is ready"`
- Если зависнет - перестартите: `docker-compose restart postgres`

### Приложение медленное
- Может быть проблема с памятью. Проверьте: `docker stats`
- Увеличьте выделенную память Docker
- Попробуйте перестартить: `docker-compose restart`

### Нет миграций БД
- Проверьте файлы в `/migrations/`
- Логи: `docker-compose logs postgres` (ищите ошибки)
- Может потребоваться ручная инициализация схемы

## После успешного локального тестирования

Если всё работает локально:

1. **Убедитесь, что код готов к продакшену**
   ```bash
   git status  # Чистая рабочая область
   git log --oneline -5  # Посмотрите последние коммиты
   ```

2. **Выполните финальный коммит, если нужно**
   ```bash
   git add .
   git commit -m "test: verify docker-compose setup works locally"
   git push origin dev
   ```

3. **Переходите к развёртыванию на Railway**
   - Следуйте инструкциям в `RAILWAY_DEPLOYMENT.md`

## Полезные команды

```bash
# Основные
docker-compose up -d                    # Запустить
docker-compose down                     # Остановить
docker-compose ps                       # Статус
docker-compose logs -f                  # Логи в реальном времени

# Отладка
docker-compose exec <service> sh        # Зайти в контейнер
docker-compose restart <service>        # Перестартить сервис
docker-compose build                    # Пересобрать образы
docker-compose down -v                  # Удалить всё включая volumes

# Очистка
docker system prune                     # Очистить неиспользуемое
docker image prune -a                   # Удалить все неиспользуемые образы
```

---

**Последнее обновление**: май 2026
