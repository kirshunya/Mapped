# Railway.app Deployment Guide

Это руководство описывает, как развернуть приложение Mapped на платформе Railway.app с использованием `docker-compose.yml`.

## Что включено

Приложение состоит из следующих сервисов:
- **PostgreSQL (PostGIS)** - База данных
- **Zookeeper & Kafka** - Message broker для асинхронных операций
- **Auth Service** - Сервис аутентификации и управления пользователями
- **Places Service** - Сервис управления местами и группами
- **Reviews Service** - Сервис отзывов и рецензий
- **Posts Service** - Сервис постов и социальной сети
- **Chat Service** - Сервис чатов и сообщений
- **Media Service** - Сервис загрузки и хранения медиа
- **Gateway** - API Gateway + React фронтенд (все в одном контейнере)

## Подготовка к развёртыванию

### 1. Убедитесь, что код готов

```bash
git status  # Должен быть чистым
git log --oneline -5  # Проверить последние коммиты
```

Убедитесь, что последние коммиты включают:
- `feat: add React static file serving to gateway for SPA deployment`
- `feat: optimize docker-compose for Railway deployment with container networking`

### 2. Создайте аккаунт на Railway.app

Перейдите на https://railway.app и создайте/войдите в аккаунт

## Развёртывание на Railway

### Способ 1: Через GitHub (рекомендуется)

1. **Подключите репозиторий к Railway**
   - На сайте Railway.app нажмите "New Project"
   - Выберите "GitHub" и авторизуйте
   - Выберите репозиторий `kirshunya/Mapped`
   - Выберите ветку `dev`

2. **Railway автоматически обнаружит `docker-compose.yml`**
   - Нажмите "Deploy from docker-compose"
   - Дождитесь завершения сборки (это может занять 5-10 минут)

3. **Проверьте логи**
   - Перейдите в Dashboard → Logs
   - Убедитесь, что все сервисы запустились успешно

### Способ 2: Через Railway CLI

Если вы предпочитаете использовать CLI:

```bash
# Установите Railway CLI
# https://docs.railway.app/develop/cli

# Залогиниться
railway login

# Инициализируйте проект
railway init

# Разверните
railway up
```

## Конфигурация окружения

Railway автоматически использует переменные из `docker-compose.yml`, но вы можете переопределить их в панели управления:

### Переменные, которые может потребоваться изменить:

```env
# Безопасность
JWT_SECRET=mapsocial-super-secret-key-2024  # ИЗМЕНИТЕ НА ПРОДАКШЕНЕ!

# PostgreSQL
POSTGRES_USER=mapsocial
POSTGRES_PASSWORD=mapsocial123  # ИЗМЕНИТЕ НА ПРОДАКШЕНЕ!
POSTGRES_DB=mapsocial

# Kafka
KAFKA_BROKER=kafka:29092  # Это правильно для Docker

# URLs сервисов (используют Docker DNS)
AUTH_SERVICE_URL=http://auth-service:8081
PLACES_SERVICE_URL=http://places-service:8082
REVIEWS_SERVICE_URL=http://reviews-service:8083
POSTS_SERVICE_URL=http://posts-service:8085
CHAT_SERVICE_URL=http://chat-service:8086
MEDIA_SERVICE_URL=http://media-service:8084
```

### Как изменить переменные в Railway:

1. Перейдите в Dashboard проекта
2. Нажмите на нужный сервис (например, `postgres`, `gateway`)
3. Перейдите в "Variables"
4. Добавьте/измените переменные
5. Нажмите "Deploy" для перезагрузки

## Доступ к приложению

После успешного развёртывания:

1. **Основное приложение (фронтенд + API)**
   - URL предоставит Railway (примерно: `https://mapped-prod-abc123.railway.app`)
   - На этом домене будут доступны:
     - Веб-интерфейс React
     - API endpoints: `/api/v1/*`
     - Загрузки медиа: `/media/uploads/*`
     - Health check: `/health`

2. **База данных PostgreSQL**
   - Доступна только внутри контейнеров Docker
   - Извне доступна через внешний IP (если Railway его предоставит)

3. **Логи сервисов**
   - Dashboard → Сервис → Logs

## Мониторинг

### Проверка здоровья приложения

```bash
# Health check endpoint
curl https://your-railway-app-url/health

# Должно вернуть:
# {"status":"ok"}
```

### Просмотр логов в реальном времени

В панели Railway:
1. Перейдите в Dashboard
2. Нажмите на сервис
3. Вкладка "Logs" показывает логи в реальном времени

### Частые проблемы

#### Сервис не запускается
- Проверьте логи в Railway Dashboard
- Убедитесь, что PostgreSQL запустился (healthcheck проходит)
- Проверьте переменные окружения

#### Можешь ли я подключиться к API из фронтенда?
- Railway предоставляет публичный URL
- Фронтенд уже встроен в gateway
- API доступен по адресу `https://your-app-url/api/v1/*`

#### Миграции БД не запускаются
- Убедитесь, что файлы миграций находятся в `/migrations/`
- Проверьте permissions на файлы
- Посмотрите логи PostgreSQL

## Масштабирование

Если приложение растёт:

1. **Увеличьте ресурсы контейнеров**
   - Dashboard → Сервис → Settings → Resources

2. **Добавьте реплики сервисов**
   - Railway позволяет запускать несколько экземпляров одного сервиса

3. **Используйте CDN для статических файлов**
   - Фронтенд обслуживается из `/app/web-app/build/static`

## Откат на предыдущую версию

Если что-то сломалось:

1. Перейдите в Dashboard → Deployments
2. Найдите рабочую версию
3. Нажмите "Rollback"
4. Railway пересоберёт и переразвернёт

## Следующие шаги

После развёртывания на Railway:

1. **Протестируйте все страницы**
   - Groups, Places, Map, Posts, Chats, Profile
   - Язык switching (English/Русский)

2. **Проверьте функциональность**
   - Загрузка изображений
   - Создание групп и постов
   - Чаты в реальном времени

3. **Мониторинг и оптимизация**
   - Проверьте производительность
   - Посмотрите использование ресурсов
   - Оптимизируйте, если нужно

## Полезные ссылки

- [Railway Documentation](https://docs.railway.app/)
- [Docker Compose на Railway](https://docs.railway.app/deploy/dockercompose)
- [Переменные окружения](https://docs.railway.app/develop/variables)
- [Разрешение проблем](https://docs.railway.app/help/troubleshooting)

---

**Последнее обновление**: май 2026
**Версия проекта**: 2.0 (с docker-compose и Gateway)
