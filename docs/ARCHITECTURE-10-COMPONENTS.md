# 10 компонентов архитектуры Mapped — Краткая справка

## Быстрая навигация по компонентам

```
┌─────────────────────────────────────────────────────────────┐
│                    🖥️ FRONTEND (React)                      │
│                                                              │
│  ├─ Компоненты: Posts, Places, Reviews, Chat, Profile      │
│  ├─ Состояние: Redux/Context API                            │
│  ├─ API: Fetch/Axios с Bearer токеном                       │
│  └─ Хранилище: localStorage (JWT токен)                     │
└─────────────────────┬──────────────────────────────────────┘
                      │ HTTP REST
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              🚪 API GATEWAY (Gin HTTP)                       │
│                                                              │
│  ├─ Маршрутизация: /auth, /posts, /places, /reviews, /chat │
│  ├─ Middleware: CORS, Auth, Logging                         │
│  ├─ Rate Limiting: по IP адресу                             │
│  └─ Балансировка: round-robin к микросервисам              │
└──┬───────┬────────┬────────┬─────────┬──────────────────────┘
   │       │        │        │         │
   ↓       ↓        ↓        ↓         ↓
┌──────┐┌──────┐┌──────┐┌───────┐┌──────┐
│ 🔐   ││ 📝   ││ 📍   ││ ⭐    ││ 💬   │
│ Auth ││Posts ││Places││Reviews││Chat  │
│ Svc  ││ Svc  ││ Svc  ││ Svc   ││ Svc  │
└────┬─┘└────┬─┘└────┬─┘└───┬───┘└────┬─┘
     │       │       │      │        │
     │       │       │      │        │  ┌─────────┐
     │       │       │      │        ├─→│ 🎬      │
     │       │       │      │        │  │ Media   │
     │       │       │      │        │  │ Service │
     │       │       │      │        │  └────┬────┘
     │       │       │      │        │       │
     └───────┴───────┴──────┴────────┴───────┼───────┐
             ↓                               ↓       ↓
     ┌──────────────────────┐      ┌─────────────────────┐
     │  💾 PostgreSQL       │      │ 📦 File Storage     │
     │      Database        │      │ (Local / AWS S3)    │
     │                      │      │                     │
     │ ├─ Users            │      │ ├─ Post images      │
     │ ├─ Posts            │      │ ├─ Place photos     │
     │ ├─ Places           │      │ ├─ Review media     │
     │ ├─ Reviews          │      │ ├─ Chat attachments │
     │ ├─ Chats            │      │ ├─ User avatars     │
     │ ├─ Groups           │      │ └─ Temp files       │
     │ ├─ Reactions        │      └─────────────────────┘
     │ └─ Like/Views       │
     └──────────────────────┘
```

---

## 📋 Компоненты в деталях

### 1️⃣ Frontend (React)

**Функции:**
- Отрисовка UI компонентов
- Локальное управление состоянием
- Кеширование данных
- WebSocket подписка на обновления

**Используемые API:**
```
GET    /auth/profile          → Получить профиль
POST   /auth/register         → Регистрация
POST   /auth/login            → Логин
POST   /posts/create          → Создать пост
GET    /posts/feed            → Лента постов
POST   /places/nearby         → Поиск мест рядом
GET    /places/{id}           → Детали места
POST   /reviews/create        → Создать отзыв
POST   /chat/send             → Отправить сообщение
WS     /chat/subscribe        → WebSocket чат
```

**Стек:**
- React 18+
- TypeScript
- Redux или Context API
- Axios / Fetch
- WebSocket Client

---

### 2️⃣ API Gateway

**Функции:**
- Маршрутизация запросов к микросервисам
- Валидация JWT токенов
- Обработка CORS
- Rate limiting
- Логирование

**Маршруты:**
```
POST   /auth/*          → Auth Service
GET    /posts/*         → Posts Service
POST   /posts/*         → Posts Service
GET    /places/*        → Places Service
POST   /places/*        → Places Service
GET    /reviews/*       → Reviews Service
POST   /reviews/*       → Reviews Service
POST   /chat/*          → Chat Service
GET    /chat/*          → Chat Service
POST   /media/*         → Media Service
```

**Middleware:**
1. CORS (Access-Control-*)
2. Logging (все запросы/ответы)
3. Auth (проверка JWT для защищённых маршрутов)
4. Rate Limit (например, 100 req/min на IP)
5. Error Handler (404, 500 и т.д.)

**Стек:**
- Go 1.21+
- Gin Web Framework
- JWT middleware

---

### 3️⃣ Auth Service

**Функции:**
- Регистрация (валидация email, хеш пароля)
- Логин (проверка credentials, JWT генерация)
- Обновление профиля (avatar, bio, email)
- Управление ролями (user, moderator, admin)
- Валидация токенов

**Endpoints:**
```
POST   /auth/register           userID, token
POST   /auth/login              userID, token
GET    /auth/profile            user details
PUT    /auth/profile            updated user
POST   /auth/change-role        ✅ (admin only)
```

**Database Tables:**
- `users` (id, email, username, password_hash, role, avatar, bio)

**Стек:**
- Go, Gin
- bcrypt (password hashing)
- jwt-go (JWT generation)
- GORM (ORM)

---

### 4️⃣ Posts Service

**Функции:**
- Создание постов (с текстом, медиа, привязкой к месту)
- Чтение ленты постов
- Реакции на посты (like, dislike)
- Комментарии к постам
- Отслеживание просмотров (PostView)

**Endpoints:**
```
POST   /posts/create           {content, mediaURLs, placeID}
GET    /posts/{id}             post details + liked status
GET    /posts/feed             paginated feed
POST   /posts/{id}/react       {type: "like"|"dislike"}
POST   /posts/{id}/comment     {content, mediaURLs}
GET    /posts/{id}/comments    all comments
DELETE /posts/{id}/comment/{cid} delete comment
```

**Database Tables:**
- `posts`
- `post_comments`
- `post_reactions`
- `post_attachments` (медиа к постам)
- `post_views` (аналитика просмотров)

**Стек:**
- Go, Gin, GORM
- PostgreSQL

---

### 5️⃣ Places Service

**Функции:**
- Создание мест (с координатами, категорией, описанием)
- Поиск мест рядом (geo-search, radius)
- Управление приватностью мест (public, private, group)
- Управление группами
- Лайки мест (PlaceLike)

**Endpoints:**
```
POST   /places/create          {name, lat, lng, category, privacy}
GET    /places/{id}            place details + rating + likes
GET    /places/nearby          {lat, lng, radius} → nearby places
POST   /places/{id}/like       {type: "like"|"dislike"}
GET    /places/{id}/reviews    reviews for place
POST   /places/groups/create   {name, description}
POST   /places/groups/{id}/add {userID}
```

**Database Tables:**
- `places`
- `groups`
- `group_members`
- `place_likes` (реакции на места)
- `place_views` (просмотры мест)

**Стек:**
- Go, Gin, GORM
- PostgreSQL с PostGIS для geo-queries
- Spatial indexes

---

### 6️⃣ Reviews Service

**Функции:**
- Создание отзывов (с рейтингом 0-5)
- Комментарии к отзывам
- Реакции на отзывы
- Пересчёт среднего рейтинга места
- Модерация отзывов

**Endpoints:**
```
POST   /reviews/create         {placeID, rating, content, mediaURLs}
GET    /places/{id}/reviews    all reviews for place
GET    /reviews/{id}/comments  comments on review
POST   /reviews/{id}/react     {type}
DELETE /reviews/{id}           delete review
```

**Database Tables:**
- `reviews` (placeID, userID, rating, content, mediaURLs)
- `review_reactions` (userId, reviewId, type)
- `review_comments` (reviewId, userId, content)

**Стек:**
- Go, Gin, GORM
- PostgreSQL

---

### 7️⃣ Chat Service

**Функции:**
- Создание чатов (1:1 и групповые)
- Отправка сообщений с вложениями
- WebSocket поддержка для real-time
- История сообщений
- Управление участниками чата

**Endpoints:**
```
POST   /chat/create            {type: "direct"|"group", participants}
GET    /chat/{id}/messages     message history
POST   /chat/{id}/send         {text, attachments}
WS     /chat/{id}/subscribe    real-time updates
GET    /chat/list              user's chats
```

**WebSocket Events:**
```
message_sent       → новое сообщение
message_edited     → отредактировано
user_typing        → пользователь печатает
user_joined        → участник присоединился
user_left          → участник ушёл
```

**Database Tables:**
- `chats` (type, ownerId, createdAt)
- `chat_members` (chatId, userId, role, joinedAt)
- `chat_messages` (chatId, userId, text, createdAt)
- `message_attachments` (messageId, url, type)

**Стек:**
- Go, Gin, GORM
- gorilla/websocket
- PostgreSQL

---

### 8️⃣ Media Service

**Функции:**
- Загрузка файлов (images, videos)
- Валидация типа и размера файла
- Сохранение в файловое хранилище
- Генерация превью/thumbnail
- Удаление файлов

**Endpoints:**
```
POST   /media/upload           {file} → {mediaURL}
POST   /media/upload-multiple  {files[]} → {mediaURLs[]}
DELETE /media/{id}             delete file
GET    /media/{id}/thumbnail   get thumbnail
```

**Валидация:**
- Максимальный размер: 50MB
- Допустимые типы: image/*, video/*
- MIME type проверка

**Стек:**
- Go, Gin
- multipart/form-data parser
- File system или AWS S3 SDK

---

### 9️⃣ Database (PostgreSQL)

**Назначение:**
- Центральное хранилище всех данных
- ACID транзакции
- Spatial queries (PostGIS для geo-search)
- Полнотекстовый поиск (FTS)

**Таблицы:**
```
users
posts, post_comments, post_reactions, post_attachments, post_views
places, groups, group_members, place_likes, place_views
reviews, review_reactions, review_comments
chats, chat_members, chat_messages, message_attachments
media_files
```

**Индексы:**
- PK: id (все таблицы)
- FK: userId, postId, placeId, reviewId (ускорение JOIN)
- Composite: (placeId, userId) для PlaceLike
- Spatial: geo index на (latitude, longitude)

**Стек:**
- PostgreSQL 14+
- PostGIS расширение для geo-queries
- pgvector для ML (если будет recommender)

---

### 🔟 File Storage

**Назначение:**
- Хранение медиа-файлов (образы, видео)
- Масштабируемость (не в БД)
- Быстрый доступ через CDN

**Два варианта:**

#### Вариант A: Локальное хранилище
```
/var/mapped-storage/
├── posts/
│   ├── post_123_img1.jpg
│   └── post_123_img2.png
├── users/
│   ├── user_456_avatar.jpg
│   └── user_456_banner.png
├── places/
│   ├── place_789_photo1.jpg
│   └── place_789_review1.jpg
└── chats/
    ├── chat_111_attach1.pdf
    └── chat_111_attach2.jpg
```

#### Вариант B: AWS S3
```
s3://mapped-bucket/
├── posts/
├── users/
├── places/
├── chats/
└── temp/
```

**Стек:**
- Local: Go `os` пакет
- S3: AWS SDK for Go

---

## 🔗 Взаимодействие компонентов

### Frontend → API Gateway
```
Request:
{
  method: "POST",
  url: "https://api.mapped.io/posts/create",
  headers: {
    "Authorization": "Bearer eyJhbGc...",
    "Content-Type": "application/json"
  },
  body: {
    content: "Отличное место!",
    mediaURLs: ["/media/img1.jpg"],
    placeID: 123
  }
}

Response:
{
  status: 201,
  body: {
    postID: 456,
    createdAt: "2024-01-15T10:30:00Z",
    userID: 789
  }
}
```

### Services ↔ Database
```
GORM Query:
db.WithContext(ctx).
  Where("placeID = ? AND userID = ?", placeID, userID).
  First(&placeLike).
  Error

SQL:
SELECT * FROM place_likes 
WHERE placeId = $1 AND userId = $2 
LIMIT 1
```

### Frontend ↔ Chat Service (WebSocket)
```
// Connect
ws://api.mapped.io/chat/123/subscribe?token=Bearer...

// Client → Server
{
  type: "message",
  data: {
    text: "Привет!",
    attachments: [{url: "/media/file.pdf"}]
  }
}

// Server → Clients
{
  type: "message_sent",
  data: {
    messageID: 555,
    userID: 789,
    username: "john_doe",
    text: "Привет!",
    createdAt: "2024-01-15T10:35:00Z"
  }
}
```

---

## 🚀 Deployment

```
Frontend:
  └─→ Vercel / Netlify / AWS S3 + CloudFront

API Gateway:
  └─→ Docker Container → Kubernetes / Docker Compose

Services (Auth, Posts, Places, Reviews, Chat, Media):
  └─→ Docker Containers → Kubernetes pods (replicas=3)

PostgreSQL:
  └─→ AWS RDS / Managed Database / Self-hosted

File Storage:
  └─→ AWS S3 / Local /data volume (if Docker)
```

---

## 📊 Масштабируемость

| Компонент | Масштабирование | Метод |
|-----------|-----------------|-------|
| Frontend | CDN, кеширование | Vercel edge network |
| API Gateway | Горизонтальное | Load balancer (nginx) |
| Services | Горизонтальное | Kubernetes replicas |
| Database | Вертикальное | AWS RDS scaling |
| Storage | Горизонтальное | AWS S3 (неограниченное) |

---

## 🔒 Безопасность

- **Auth:** JWT токены с срок действия 24 часа
- **Transport:** HTTPS/TLS
- **Storage:** Хеширование паролей (bcrypt)
- **CORS:** Ограничение по origin
- **Rate Limit:** 100 req/min на IP
- **Input Validation:** На уровне Gateway и сервисов
- **SQL Injection:** Параметризованные запросы (GORM)

