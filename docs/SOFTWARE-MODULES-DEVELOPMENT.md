# Разработка программных модулей

## Оглавление
1. [Обзор архитектуры](#обзор-архитектуры)
2. [Структура микросервисов](#структура-микросервисов)
3. [Схема БД (ER-диаграмма)](#схема-бд)
4. [Ключевые алгоритмы](#ключевые-алгоритмы)
5. [Модуль аутентификации](#модуль-аутентификации)
6. [Модуль постов](#модуль-постов)
7. [Модуль мест](#модуль-мест)
8. [Модуль медиа](#модуль-медиа)
9. [Модуль чата](#модуль-чата)
10. [API Gateway](#api-gateway)

---

## Обзор архитектуры

Приложение Mapped построено на микросервисной архитектуре с использованием:
- **Go (Gin)** - для REST API
- **PostgreSQL** - для хранения данных
- **React** - для frontend
- **Docker** - для контейнеризации
- **JWT** - для аутентификации

### Архитектурные компоненты

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Frontend (web-app)                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP/WebSocket
┌────────────────────────────────▼────────────────────────────────┐
│                        API Gateway                               │
│              (Request Routing, Authentication)                   │
└────────┬──────────┬──────────┬──────────┬──────────┬─────────────┘
         │          │          │          │          │
    ┌────▼──┐ ┌────▼──┐ ┌────▼──┐ ┌────▼──┐ ┌────▼──┐ ┌────▼──┐
    │ Auth  │ │ Posts │ │Places │ │Review │ │ Chat  │ │Media  │
    │Service│ │Service│ │Service│ │Service│ │Service│ │Service│
    └────┬──┘ └────┬──┘ └────┬──┘ └────┬──┘ └────┬──┘ └────┬──┘
         │         │         │         │         │         │
         └─────────┴─────────┴─────────┴─────────┴─────────┘
                              │
                ┌─────────────▼──────────────┐
                │     PostgreSQL Database    │
                │    (Shared Data Store)     │
                └────────────────────────────┘
                              │
                ┌─────────────▼──────────────┐
                │     File Storage (S3)      │
                │    (Media Files)           │
                └────────────────────────────┘
```

---

## Структура микросервисов

Каждый микросервис следует одинаковой структуре:

```
services/{service-name}/
├── cmd/
│   └── main.go                 # Точка входа приложения
├── internal/
│   ├── config/
│   │   └── config.go           # Конфигурация сервиса
│   ├── handlers/
│   │   └── handlers.go         # HTTP обработчики запросов
│   ├── models/
│   │   └── models.go           # Структуры данных (Entity, DTO)
│   ├── repository/
│   │   └── repository.go       # Работа с БД (GORM)
│   ├── service/
│   │   └── service.go          # Бизнес-логика
│   └── middleware/
│       └── middleware.go       # JWT, логирование, CORS
├── migrations/
│   └── *.sql                   # Миграции БД
└── go.mod                      # Зависимости
```

### Паттерны в структуре

- **Handlers** - получение HTTP запросов, валидация, преобразование в DTO
- **Service** - бизнес-логика, вызов Repository, обработка ошибок
- **Repository** - абстракция БД, GORM операции
- **Models** - Entity (объекты БД) + DTO (Request/Response)

---

## Схема БД

**Ссылка на диаграмму:** `docs/er-diagram.mmd`

### Основные таблицы:

| Таблица | Описание | Связи |
|---------|----------|-------|
| **USER** | Пользователи | 1:N с Post, Chat, Review, Place |
| **PLACE** | Места (локации) | 1:N с Post, Review, PlaceLike |
| **POST** | Посты пользователей | 1:N с PostComment, PostReaction, PostView |
| **REVIEW** | Отзывы о местах | 1:N с ReviewReaction, ReviewComment |
| **CHAT** | Чаты (direct и group) | 1:N с ChatMessage, ChatMember |
| **GROUP** | Группы мест | 1:N с GroupMember, Place |
| **MEDIA_FILE** | Загруженные файлы | N:1 с User |

### Индексы:
- `User(email)` - поиск по email (UNIQUE)
- `User(username)` - поиск по username (UNIQUE)
- `Place(user_id)` - поиск мест пользователя
- `Post(user_id)` - поиск постов пользователя
- `Review(place_id)` - поиск отзывов о месте
- `Chat(owner_id)` - поиск чатов владельца
- Geo-индекс на `Place(latitude, longitude)` - для поиска мест рядом

---

## Ключевые алгоритмы

**Ссылка на блок-схемы:** `docs/algorithms-flowcharts.mmd`

### 1. Аутентификация и авторизация

#### Алгоритм регистрации

```
INPUT: email, username, password
↓
VALIDATE: email format, username length (3-30), password length (≥6)
↓
QUERY DB: SELECT User WHERE email = ?
↓
IF exists: RETURN ERROR (email already registered)
↓
HASH PASSWORD: bcrypt.GenerateFromPassword(password, cost=10)
↓
INSERT User: {email, username, hashedPassword, role='user', created_at=NOW()}
↓
GENERATE JWT: jwt.SignedString({userID, role, exp: now + 24h})
↓
RETURN: {token, user_data}
```

**Сложность:** O(n) - одна операция БД + O(1) хеширование

#### Алгоритм логина

```
INPUT: email, password
↓
QUERY DB: SELECT User WHERE email = ?
↓
IF NOT found: RETURN ERROR (user not found)
↓
COMPARE PASSWORD: bcrypt.CompareHashAndPassword(stored_hash, provided)
↓
IF mismatch: RETURN ERROR (invalid password)
↓
GENERATE JWT TOKEN
↓
RETURN: {token, user_data}
```

**Защита:** Bcrypt с cost=10 → 1-2 секунды на хеширование, защита от brute-force

---

### 2. Геопоиск (Geo-Search)

#### Алгоритм поиска мест рядом

```
INPUT: latitude, longitude, radius_km, user_id
↓
CONVERT: radius_km to radians (radius / 111.32)
↓
QUERY DB (оптимизированный SQL):
  SELECT Place 
  FROM place 
  WHERE 
    ST_Distance_Sphere(
      ST_Point(longitude, latitude), 
      ST_Point(user.latitude, user.longitude)
    ) <= radius * 1000
    AND privacy = 'public' 
    AND approval = 'approved'
    AND is_deleted = false
  ORDER BY rating DESC
  LIMIT 20
↓
FOR EACH place:
  - Проверить: понравилось ли user (SELECT FROM place_like)
  - Добавить флаги: liked, disliked
↓
SORT: по рейтингу (кэшируется)
↓
RETURN: []PlaceResponse
```

**Производительность:**
- Геопространственный индекс: O(log n)
- Без индекса: O(n) - полный scan
- Кэширование результатов: Redis (TTL=5 min)

**Геоформула (Haversine):**
```
distance = 2 * R * asin(sqrt(sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)))
где R = 6371 км (радиус Земли)
```

---

### 3. Загрузка медиа и хранение

#### Алгоритм загрузки файла

```
INPUT: file (multipart), userID
↓
VALIDATE FILE:
  - Проверить размер: max 50MB
  - Проверить mime-type: allowed list [image/jpeg, image/png, video/mp4]
  - Проверить расширение файла
↓
GENERATE UNIQUE FILENAME:
  hash = md5(userID + timestamp + random)
  filename = "{userID}_{hash}.{extension}"
↓
SAVE TO FILE STORAGE:
  path = "/uploads/2026/04/15/{filename}"
  IF storage == S3:
    PutObject(bucket, path, file, ACL=private)
  ELSE:
    Write to disk: /var/uploads/{path}
↓
GENERATE PUBLIC URL:
  IF S3: url = "https://s3.bucket.url/{path}"
  ELSE: url = "https://api.mapped.com/media/{path}"
↓
INSERT INTO media_file:
  {url, name, size, mime_type, owner_id, created_at}
↓
RETURN: {url, id, size}
```

**Ограничения:**
- Максимальный размер: 50MB
- Поддерживаемые форматы: JPG, PNG, GIF, MP4, WebM
- Хранилище: S3 (AWS) или локальное

---

### 4. Расчет рейтинга места

#### Алгоритм обновления рейтинга

```
INPUT: placeID, new_review_rating
↓
QUERY DB: SELECT AVG(rating) FROM review WHERE place_id = ?
↓
avgRating = result
↓
QUERY DB: SELECT COUNT(*) FROM review WHERE place_id = ?
↓
reviewCount = result
↓
UPDATE place SET:
  - rating = ROUND(avgRating, 2)
  - review_count = reviewCount
  - updated_at = NOW()
WHERE id = placeID
↓
INVALIDATE CACHE: redis.DEL("place:{placeID}:details")
↓
BROADCAST: WebSocket event "place_rating_updated"
↓
RETURN: updated place
```

**Формула:**
```
avgRating = SUM(all_ratings) / COUNT(reviews)
```

**Кэширование:**
- Cache key: `place:{placeID}:details`
- TTL: 1 час (при обновлении - инвалидация)

---

### 5. Лента новостей (Feed Algorithm)

#### Алгоритм получения ленты

```
INPUT: userID, limit=20, offset=0
↓
QUERY 1 - Получить IDs подписок пользователя:
  SELECT following_id FROM follow WHERE follower_id = userID
  following_ids = [id1, id2, ..., idN]
↓
QUERY 2 - Получить посты от подписок:
  SELECT Post 
  FROM post 
  WHERE user_id IN (following_ids)
  ORDER BY created_at DESC
  LIMIT limit OFFSET offset
↓
QUERY 3 - Для каждого поста:
  - Получить реакции пользователя (like/dislike)
  - Получить count комментариев и лайков
↓
BUILD RESPONSE:
  FOR EACH post:
    {
      post_data,
      user_liked: boolean,
      user_disliked: boolean,
      comment_count: int,
      like_count: int
    }
↓
CACHE RESULT: redis.SET("feed:{userID}:{offset}", result, TTL=5min)
↓
RETURN: []PostResponse
```

**Оптимизация:**
- Кэширование ленты на 5 минут
- Пагинация: offset-based (OFFSET 0, LIMIT 20)
- Индексы: post(user_id), post(created_at)
- Временное окно: посты за последние 30 дней

---

## Модуль аутентификации (auth-service)

### Структура

```
auth-service/
├── handlers/
│   └── auth_handlers.go
├── models/
│   └── models.go            # User, RegisterRequest, AuthResponse
├── repository/
│   └── auth_repository.go   # Database operations
├── service/
│   └── auth_service.go      # Business logic
└── middleware/
    └── jwt_middleware.go    # JWT verification
```

### Ключевые функции

#### 1. Register(req RegisterRequest) AuthResponse

```go
// Псевдокод
func (s *AuthService) Register(req RegisterRequest) AuthResponse {
    // 1. Валидация входных данных
    if !isValidEmail(req.Email) {
        return ERROR: "Invalid email format"
    }
    if len(req.Password) < 6 {
        return ERROR: "Password too short"
    }
    
    // 2. Проверка уникальности
    user, err := s.repo.GetUserByEmail(req.Email)
    if err == nil {
        return ERROR: "Email already registered"
    }
    
    // 3. Хеширование пароля
    hashedPassword := bcrypt.GenerateFromPassword(
        []byte(req.Password), 
        bcrypt.DefaultCost  // 10
    )
    
    // 4. Создание пользователя
    newUser := &User{
        Email:    req.Email,
        Username: req.Username,
        Password: string(hashedPassword),
        Role:     RoleUser,
        IsActive: true,
    }
    
    // 5. Сохранение в БД
    s.repo.CreateUser(newUser)
    
    // 6. Генерация JWT токена
    token := s.generateToken(newUser.ID, newUser.Role)
    
    // 7. Возврат ответа
    return AuthResponse{
        Token: token,
        User:  *newUser,
    }
}
```

#### 2. Login(req LoginRequest) AuthResponse

```go
func (s *AuthService) Login(req LoginRequest) AuthResponse {
    // 1. Поиск пользователя
    user, err := s.repo.GetUserByEmail(req.Email)
    if err != nil {
        return ERROR: "User not found"
    }
    
    // 2. Сравнение пароля
    err = bcrypt.CompareHashAndPassword(
        []byte(user.Password),
        []byte(req.Password),
    )
    if err != nil {
        return ERROR: "Invalid password"
    }
    
    // 3. Проверка активности
    if !user.IsActive {
        return ERROR: "User account is inactive"
    }
    
    // 4. Генерация нового JWT токена
    token := s.generateToken(user.ID, user.Role)
    
    // 5. Возврат ответа
    return AuthResponse{
        Token: token,
        User:  *user,
    }
}
```

#### 3. ValidateToken(tokenString string) (userID, role, error)

```go
func (s *AuthService) ValidateToken(tokenString string) (uint, string, error) {
    // 1. Парсирование токена
    token, err := jwt.ParseWithClaims(
        tokenString,
        &jwt.StandardClaims{},
        func(token *jwt.Token) (interface{}, error) {
            return []byte(s.jwtSecret), nil
        },
    )
    
    if err != nil {
        return 0, "", ERROR: "Invalid token"
    }
    
    // 2. Валидация подписи
    if !token.Valid {
        return 0, "", ERROR: "Token expired or invalid"
    }
    
    // 3. Извлечение claims
    claims := token.Claims.(*jwt.StandardClaims)
    
    // 4. Проверка времени истечения
    if claims.ExpiresAt < time.Now().Unix() {
        return 0, "", ERROR: "Token expired"
    }
    
    // 5. Возврат userID и role
    userID := claims.Subject  // stored as string in JWT
    return userID, claims.Role, nil
}
```

### JWT Структура токена

```
Header: {
    "alg": "HS256",
    "typ": "JWT"
}

Payload: {
    "user_id": 789,
    "role": "user",
    "exp": 1713078000,        # timestamp (24 часа от создания)
    "iat": 1712991600,        # issued at
    "iss": "mapped-api"       # issuer
}

Signature: HMACSHA256(
    base64UrlEncode(header) + "." +
    base64UrlEncode(payload),
    secret_key
)
```

---

## Модуль постов (posts-service)

### Структура

```
posts-service/
├── handlers/
│   ├── post_handlers.go
│   └── comment_handlers.go
├── models/
│   └── models.go
├── repository/
│   ├── post_repository.go
│   └── comment_repository.go
├── service/
│   └── posts_service.go
└── middleware/
    └── auth_middleware.go
```

### Ключевые функции

#### 1. CreatePost(userID, username, req CreatePostRequest) Post

```
INPUT: userID, username, {content, mediaURLs[], placeID}
↓
VALIDATE:
  - content not empty AND length <= 10000
  - IF placeID: check place exists
↓
CREATE Post:
  {
    user_id: userID,
    username: username,
    content: content,
    media_urls: JSON.stringify(mediaURLs),
    place_id: placeID,
    like_count: 0,
    comment_count: 0,
    created_at: NOW()
  }
↓
INSERT into DB
↓
IF placeID:
  - UPDATE place SET like_count = like_count + 1
  - Broadcast WebSocket event "post_created"
↓
CACHE: redis.SET("post:{postID}", post_data, TTL=1hour)
↓
RETURN: Post object
```

#### 2. GetFeed(userID, limit, offset) []PostResponse

```
INPUT: userID, limit=20, offset=0
↓
QUERY: Following users
  SELECT following_id 
  FROM follow 
  WHERE follower_id = userID
  → following_ids = [...]
↓
QUERY: Posts from following
  SELECT Post 
  FROM post 
  WHERE user_id IN (following_ids)
  ORDER BY created_at DESC
  LIMIT limit OFFSET offset
↓
FOR EACH post:
  - Get user reactions: SELECT FROM post_reaction WHERE post_id = ? AND user_id = ?
  - Get counts: SELECT COUNT FROM post_reaction
  - Build PlaceResponse if place_id
↓
BUILD Response with enriched data
↓
RETURN: []PostResponse
```

#### 3. AddComment(postID, userID, req CreateCommentRequest) PostComment

```
INPUT: postID, userID, {content, mediaURLs[]}
↓
VALIDATE:
  - Post exists
  - Content not empty
  - Content length <= 5000
↓
CREATE PostComment:
  {
    post_id: postID,
    user_id: userID,
    content: content,
    media_urls: JSON.stringify(mediaURLs),
    created_at: NOW()
  }
↓
INSERT into DB
↓
UPDATE Post: comment_count = comment_count + 1
↓
Broadcast WebSocket: "comment_added"
↓
CACHE invalidate: redis.DEL("post:{postID}:comments")
↓
RETURN: PostComment object
```

---

## Модуль мест (places-service)

### Структура

```
places-service/
├── handlers/
│   ├── place_handlers.go
│   └── group_handlers.go
├── models/
│   └── models.go
├── repository/
│   ├── place_repository.go
│   └── group_repository.go
├── service/
│   └── places_service.go
└── geo/
    └── geosearch.go
```

### Ключевые функции

#### 1. GetNearbyPlaces(lat, lng, radius, userID) []PlaceResponse

**Алгоритм с пространственным поиском:**

```
INPUT: lat=55.75, lng=37.62, radius=5km
↓
CONVERT radius: 5km = 0.045 radians
↓
QUERY with ST_Distance (PostGIS):
  SELECT p.*, 
         ST_Distance_Sphere(
           ST_Point(p.longitude, p.latitude),
           ST_Point(?, ?)
         ) as distance
  FROM place p
  WHERE ST_Distance_Sphere(
    ST_Point(p.longitude, p.latitude),
    ST_Point(?, ?)
  ) <= ? * 1000
  AND p.privacy = 'public'
  AND p.approval = 'approved'
  AND p.is_deleted = false
  ORDER BY p.rating DESC, distance ASC
  LIMIT 20
  
Parameters: [lng, lat, lng, lat, radius]
↓
FOR EACH place:
  - Check if user liked: SELECT FROM place_like WHERE place_id = ? AND user_id = ?
  - Add flags: liked, disliked
↓
BUILD PlaceResponse[]
↓
CACHE: redis.SET("geo:{lat}:{lng}:{radius}", results, TTL=5min)
↓
RETURN: []PlaceResponse
```

**Производительность:**
- С GiST индексом на (latitude, longitude): O(log n)
- Без индекса: O(n) - full table scan
- Кэширование результатов значительно ускоряет повторные запросы

#### 2. CreatePlace(userID, username, req CreatePlaceRequest) Place

```
INPUT: userID, username, {name, description, lat, lng, category}
↓
VALIDATE:
  - name not empty
  - lat/lng in valid range
  - category from allowed list
↓
CREATE Place:
  {
    name: name,
    description: description,
    latitude: lat,
    longitude: lng,
    address: reverse_geocode(lat, lng),
    category: category,
    user_id: userID,
    username: username,
    privacy: 'public',
    approval: 'pending',
    rating: 0,
    review_count: 0,
    like_count: 0
  }
↓
INSERT into DB (with GIS Point index)
↓
Add to cache: redis.SET("place:{placeID}", place_data)
↓
Broadcast: WebSocket "place_created"
↓
RETURN: Place object
```

---

## Модуль медиа (media-service)

### Структура

```
media-service/
├── handlers/
│   └── upload_handlers.go
├── models/
│   └── models.go
├── repository/
│   └── media_repository.go
├── storage/
│   ├── s3_storage.go
│   └── local_storage.go
└── service/
    └── media_service.go
```

### Ключевые функции

#### 1. UploadFile(file multipart.FileHeader, userID) string

```
INPUT: file object, userID
↓
VALIDATE FILE:
  - Size: 0 < size <= 50MB
  - Mime-type: check ALLOWED_TYPES
  - Extension: verify against whitelist
  - Content: scan for malware (optional)
↓
GENERATE UNIQUE FILENAME:
  timestamp = NOW().Format("2006-01-02")
  hash = MD5(userID + timestamp + random(100000, 999999))
  ext = filepath.Ext(file.Filename)
  filename = fmt.Sprintf("%d_%s%s", userID, hash, ext)
  path = fmt.Sprintf("/uploads/%s/%s", timestamp, filename)
↓
SAVE FILE:
  IF storage_type == "S3":
    - Create S3 client
    - PutObject(bucket, path, file_data, {
        ContentType: file.Header.Get("Content-Type"),
        ACL: "private"
      })
    - Generate signed URL (valid for 1 hour)
  ELSE (local storage):
    - Create directories if not exist
    - Write file to /var/uploads/{path}
    - Generate URL: https://api.mapped.com/media/{path}
↓
INSERT INTO media_file:
  {
    url: generated_url,
    name: file.Filename,
    size: file.Size,
    mime_type: file.Header.Get("Content-Type"),
    owner_id: userID,
    created_at: NOW()
  }
↓
RETURN: url
```

**Безопасность:**
- Проверка MIME-типа
- Переименование файла (защита от перезаписи)
- Ограничение размера (50MB)
- Приватный ACL на S3
- Сканирование вирусов (optional)

---

## Модуль чата (chat-service)

### Структура

```
chat-service/
├── handlers/
│   └── chat_handlers.go
├── models/
│   └── models.go
├── repository/
│   └── chat_repository.go
├── service/
│   └── chat_service.go
└── websocket/
    ├── connection.go
    └── broadcast.go
```

### Ключевые функции

#### 1. SendMessage(chatID, userID, text) ChatMessage

```
INPUT: chatID, userID, text
↓
VALIDATE:
  - User is member of chat
  - Text not empty
  - Text length <= 5000
↓
CREATE ChatMessage:
  {
    chat_id: chatID,
    user_id: userID,
    text: text,
    created_at: NOW()
  }
↓
INSERT into DB
↓
GET chat members:
  SELECT user_id FROM chat_member WHERE chat_id = ?
↓
BROADCAST via WebSocket:
  FOR EACH connected member in chat:
    - Send message event
    - Include: message_data, sender_name, avatar
↓
UPDATE Chat:
  - Set last_message_id
  - Update last_activity timestamp
↓
RETURN: ChatMessage object
```

#### 2. WebSocket Real-time Messaging

```
WebSocket Connection Flow:

1. USER connects:
   ws://api.mapped.com/ws?token=JWT&chatID=123
   
2. Server validates JWT token
   
3. Server adds connection to chat room:
   chat_connections[123] = [conn1, conn2, conn3, ...]
   
4. USER sends message:
   {
     "type": "message",
     "text": "Hello",
     "chat_id": 123
   }
   
5. SERVER broadcasts to all connections:
   FOR EACH conn in chat_connections[123]:
     conn.WriteJSON({
       "type": "message",
       "user_id": 456,
       "username": "john",
       "text": "Hello",
       "created_at": "2026-04-15T10:30:00Z",
       "avatar": "https://..."
     })
     
6. USER disconnects:
   - Remove from chat_connections[123]
   - Broadcast "user_left" event
   - Cleanup connection resources
```

---

## API Gateway

### Функции

1. **Маршрутизация запросов** к соответствующим микросервисам
2. **JWT валидация** всех входящих запросов
3. **Rate limiting** - ограничение количества запросов
4. **CORS** - управление кроссдоменными запросами
5. **Логирование** - логирование всех запросов
6. **Balancing** - распределение нагрузки между инстансами

### Структура маршрутов

```
GET    /api/auth/profile          → auth-service
POST   /api/auth/register         → auth-service
POST   /api/auth/login            → auth-service
PUT    /api/auth/profile          → auth-service

POST   /api/media/upload          → media-service
GET    /api/media/{mediaID}       → media-service

GET    /api/places/nearby         → places-service
POST   /api/places                → places-service
GET    /api/places/{placeID}      → places-service
PUT    /api/places/{placeID}      → places-service

POST   /api/posts                 → posts-service
GET    /api/posts/feed            → posts-service
GET    /api/posts/{postID}        → posts-service
POST   /api/posts/{postID}/react  → posts-service

POST   /api/reviews               → reviews-service
GET    /api/reviews/place/{id}    → reviews-service

POST   /api/chat                  → chat-service
GET    /api/chat/{chatID}         → chat-service
POST   /api/chat/{chatID}/send    → chat-service
WS     /ws                        → chat-service (WebSocket)
```

### Rate Limiting Алгоритм (Token Bucket)

```
FOR EACH user:
    bucket = {
        tokens: 100,              # максимальное число токенов
        max_tokens: 100,
        refill_rate: 10,          # токены в секунду
        last_refill: NOW()
    }
    
ON REQUEST:
    elapsed = NOW() - last_refill
    new_tokens = min(max_tokens, tokens + (elapsed * refill_rate))
    
    IF new_tokens >= 1:
        new_tokens -= 1
        Allow request
    ELSE:
        Reject with 429 Too Many Requests
```

---

## Интеграционные тесты

### Тестовые сценарии

1. **End-to-End: Create Post**
   - Frontend → API Gateway → Posts Service → Media Service → DB
   
2. **Integration: Geo-Search**
   - Places Service → PostgreSQL → GiST index search
   
3. **Real-time: Chat**
   - WebSocket connection → Chat Service → Broadcast to clients

---

## Производительность и оптимизация

### Кэширование (Redis)

| Key | TTL | Использование |
|-----|-----|----------------|
| `post:{id}` | 1h | Данные поста |
| `feed:{userID}` | 5m | Кэш ленты |
| `geo:{lat}:{lng}:{radius}` | 5m | Результаты геопоиска |
| `place:{id}:details` | 1h | Детали места |
| `user:{id}:profile` | 30m | Профиль пользователя |

### Индексы БД

```sql
-- User
CREATE UNIQUE INDEX idx_user_email ON user(email);
CREATE UNIQUE INDEX idx_user_username ON user(username);

-- Place (GiST для геопоиска)
CREATE INDEX idx_place_geo ON place USING GIST (
  ST_Point(longitude, latitude)
);
CREATE INDEX idx_place_user ON place(user_id);
CREATE INDEX idx_place_approval ON place(approval);

-- Post
CREATE INDEX idx_post_user ON post(user_id);
CREATE INDEX idx_post_created ON post(created_at DESC);
CREATE INDEX idx_post_place ON post(place_id);

-- Review
CREATE INDEX idx_review_place ON review(place_id);
CREATE INDEX idx_review_user ON review(user_id);

-- Chat
CREATE INDEX idx_chat_owner ON chat(owner_id);
CREATE INDEX idx_chat_member ON chat_member(chat_id);

-- Foreign keys
ALTER TABLE post ADD CONSTRAINT fk_post_place FOREIGN KEY (place_id) REFERENCES place(id);
ALTER TABLE review ADD CONSTRAINT fk_review_place FOREIGN KEY (place_id) REFERENCES place(id);
```

---

## Обработка ошибок

### Стандартные коды ответов

| Код | Причина | Решение |
|-----|---------|---------|
| 400 | Bad Request | Проверить формат данных |
| 401 | Unauthorized | Передать валидный JWT токен |
| 403 | Forbidden | Проверить права доступа |
| 404 | Not Found | Проверить ID ресурса |
| 409 | Conflict | Email/Username уже существует |
| 429 | Too Many Requests | Ожидать перед новым запросом |
| 500 | Internal Server Error | Проблема на сервере |

---

## Документация диаграмм

### Доступные диаграммы

1. **ER-диаграмма БД:** `docs/er-diagram.mmd`
   - Все таблицы и связи
   - Просмотр на Mermaid Live
   
2. **Блок-схемы алгоритмов:** `docs/algorithms-flowcharts.mmd`
   - Регистрация и аутентификация
   - Геопоиск
   - Загрузка медиа
   - Расчет рейтинга
   - Система подписок

3. **Диаграммы последовательностей:** `docs/sequence-diagrams.mmd`
   - 10 основных сценариев использования
   - Взаимодействие компонентов

4. **Диаграмма классов:** `docs/class-diagram.mmd`
   - 44 класса с UML связями
   - Архитектурные зависимости

---

## Заключение

Архитектура Mapped основана на современных принципах:
- **Микросервисы** - независимое развитие и развертывание
- **REST API** - стандартизированное взаимодействие
- **JWT** - безопасная аутентификация
- **Геопространственные индексы** - эффективный поиск мест
- **Кэширование** - оптимизация производительности
- **WebSocket** - реал-тайм коммуникация

Применение этих паттернов обеспечивает масштабируемость, безопасность и производительность приложения.
