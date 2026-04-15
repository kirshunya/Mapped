# Алгоритмы основных сценариев Mapped

## 4.2 Алгоритмы

Некоторые из представленных ниже алгоритмов в исходном коде представляют сразу несколько методов или функций. Это обусловлено тем, что для улучшения читаемости исходного крупные методы разбиваются на несколько методов меньшего размера, где каждый из меньших методов выполняет конкретную небольшую задачу.

---

## 4.2.1 Алгоритм регистрации пользователя с хешированием пароля

Целью данного алгоритма является безопасное создание нового пользователя в системе с валидацией входных данных и хешированием пароля. Этот алгоритм используется при регистрации нового пользователя через REST API.

### Шаги алгоритма:

**Шаг 1.** Начало алгоритма.

**Шаг 2.** Получить входные параметры: `req` (RegisterRequest с email, username, password).

**Шаг 3.** Создать функцию валидации `validateEmail(email string) bool`.

**Шаг 4.** Проверить формат email с помощью регулярного выражения: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`.

**Шаг 5.** Если email не валидный, вернуть ошибку "Invalid email format" с кодом 400.

**Шаг 6.** Проверить длину username: `len(req.Username) >= 3 AND len(req.Username) <= 30`.

**Шаг 7.** Если условие не выполняется, вернуть ошибку "Username must be 3-30 characters" с кодом 400.

**Шаг 8.** Проверить длину пароля: `len(req.Password) >= 6`.

**Шаг 9.** Если условие не выполняется, вернуть ошибку "Password must be at least 6 characters" с кодом 400.

**Шаг 10.** Создать запрос к БД: `SELECT User WHERE email = req.Email`.

**Шаг 11.** Если пользователь найден, вернуть ошибку "Email already registered" с кодом 409 (Conflict).

**Шаг 12.** Создать запрос к БД: `SELECT User WHERE username = req.Username`.

**Шаг 13.** Если пользователь найден, вернуть ошибку "Username already taken" с кодом 409.

**Шаг 14.** Вызвать функцию хеширования пароля: `bcrypt.GenerateFromPassword([]byte(req.Password), 10)`.

**Шаг 15.** Если хеширование не удалось, вернуть ошибку "Failed to hash password" с кодом 500.

**Шаг 16.** Создать объект User:
```
{
    Email: req.Email,
    Username: req.Username,
    Password: hashedPassword,
    Role: "user",
    IsActive: true,
    CreatedAt: NOW(),
    UpdatedAt: NOW()
}
```

**Шаг 17.** Выполнить запрос к БД: `INSERT User {...}`.

**Шаг 18.** Если INSERT не выполнен, вернуть ошибку "Failed to create user" с кодом 500.

**Шаг 19.** Получить созданного пользователя из БД с ID.

**Шаг 20.** Создать Claims для JWT токена:
```
{
    UserID: user.ID,
    Role: user.Role,
    ExpiresAt: NOW() + 24 hours,
    IssuedAt: NOW(),
    Issuer: "mapped-api"
}
```

**Шаг 21.** Вызвать функцию генерации JWT: `jwt.SignedString(claims, secretKey)`.

**Шаг 22.** Если генерация токена не удалась, вернуть ошибку "Failed to generate token" с кодом 500.

**Шаг 23.** Создать объект AuthResponse:
```
{
    Token: generatedToken,
    User: {
        ID: user.ID,
        Email: user.Email,
        Username: user.Username,
        Role: user.Role,
        Avatar: user.Avatar,
        Bio: user.Bio
    }
}
```

**Шаг 24.** Вернуть AuthResponse с кодом 201 (Created).

**Шаг 25.** Конец алгоритма.

### Функции-помощники:

#### validateEmail(email string) bool
```go
func validateEmail(email string) bool {
    pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
    matched, _ := regexp.MatchString(pattern, email)
    return matched
}
```

#### hashPassword(password string) (string, error)
```go
func hashPassword(password string) (string, error) {
    hashedPassword, err := bcrypt.GenerateFromPassword(
        []byte(password),
        bcrypt.DefaultCost, // 10
    )
    if err != nil {
        return "", err
    }
    return string(hashedPassword), nil
}
```

#### generateJWTToken(userID uint, role string) (string, error)
```go
func generateJWTToken(userID uint, role string) (string, error) {
    claims := jwt.StandardClaims{
        Subject: fmt.Sprint(userID),
        ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
        IssuedAt: time.Now().Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(jwtSecret))
}
```

---

## 4.2.2 Алгоритм логина пользователя с валидацией пароля

Целью данного алгоритма является аутентификация пользователя путём сравнения введённого пароля с сохранённым хешем. Этот алгоритм используется при входе пользователя в систему.

### Шаги алгоритма:

**Шаг 1.** Начало алгоритма.

**Шаг 2.** Получить входные параметры: `req` (LoginRequest с email и password).

**Шаг 3.** Проверить email на валидность (аналогично шагу 4 алгоритма 4.2.1).

**Шаг 4.** Если email не валидный, вернуть ошибку "Invalid email format" с кодом 400.

**Шаг 5.** Выполнить запрос к БД: `SELECT User WHERE email = req.Email`.

**Шаг 6.** Если пользователь не найден, вернуть ошибку "User not found" с кодом 404.

**Шаг 7.** Проверить активность пользователя: `IF user.IsActive == false`.

**Шаг 8.** Если пользователь неактивен, вернуть ошибку "User account is inactive" с кодом 403.

**Шаг 9.** Вызвать функцию сравнения пароля: `bcrypt.CompareHashAndPassword(user.Password, req.Password)`.

**Шаг 10.** Если пароли не совпадают, вернуть ошибку "Invalid password" с кодом 401.

**Шаг 11.** Создать Claims для JWT токена (аналогично шагу 20 алгоритма 4.2.1).

**Шаг 12.** Вызвать функцию генерации JWT токена.

**Шаг 13.** Если генерация не удалась, вернуть ошибку "Failed to generate token" с кодом 500.

**Шаг 14.** Обновить поле последнего входа: `UPDATE User SET last_login = NOW() WHERE id = user.ID`.

**Шаг 15.** Создать объект AuthResponse с токеном и данными пользователя.

**Шаг 16.** Вернуть AuthResponse с кодом 200 (OK).

**Шаг 17.** Конец алгоритма.

### Функция-помощник:

#### comparePassword(hashedPassword string, providedPassword string) bool
```go
func comparePassword(hashedPassword string, providedPassword string) bool {
    err := bcrypt.CompareHashAndPassword(
        []byte(hashedPassword),
        []byte(providedPassword),
    )
    return err == nil
}
```

---

## 4.2.3 Алгоритм поиска мест рядом с пользователем (Geo-Search)

Целью данного алгоритма является поиск мест в радиусе от текущей позиции пользователя с использованием геопространственных индексов. Этот алгоритм используется для отображения мест на карте в приложении.

### Шаги алгоритма:

**Шаг 1.** Начало алгоритма.

**Шаг 2.** Получить входные параметры: `latitude`, `longitude`, `radius` (в км), `userID`.

**Шаг 3.** Проверить валидность координат: `latitude >= -90 AND latitude <= 90 AND longitude >= -180 AND longitude <= 180`.

**Шаг 4.** Если координаты невалидны, вернуть ошибку "Invalid coordinates" с кодом 400.

**Шаг 5.** Проверить радиус: `radius > 0 AND radius <= 100` (максимум 100 км).

**Шаг 6.** Если радиус невалидный, вернуть ошибку "Radius must be between 0 and 100 km" с кодом 400.

**Шаг 7.** Проверить кэш Redis: `redis.GET("geo:{latitude}:{longitude}:{radius}")`.

**Шаг 8.** Если результат найден в кэше и TTL > 0, вернуть результат (пропустить шаги 9-15).

**Шаг 9.** Создать SQL запрос с использованием PostGIS ST_Distance_Sphere:
```sql
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
```

**Шаг 10.** Параметры запроса: `[longitude, latitude, longitude, latitude, radius]`.

**Шаг 11.** Выполнить запрос к БД.

**Шаг 12.** Если запрос вернул ошибку, вернуть ошибку "Database error" с кодом 500.

**Шаг 13.** Для каждого места из результата:
- Выполнить запрос: `SELECT FROM place_like WHERE place_id = ? AND user_id = ? AND type = 'like'`
- Если найдено, установить флаг `liked = true`
- Выполнить запрос: `SELECT FROM place_like WHERE place_id = ? AND user_id = ? AND type = 'dislike'`
- Если найдено, установить флаг `disliked = true`

**Шаг 14.** Создать объект PlaceResponse для каждого места с флагами реакций.

**Шаг 15.** Сохранить результаты в кэш Redis: `redis.SET("geo:{lat}:{lng}:{radius}", result, TTL=5min)`.

**Шаг 16.** Вернуть массив PlaceResponse с кодом 200 (OK).

**Шаг 17.** Конец алгоритма.

### Формула Haversine для расстояния между точками:

```
distance = 2 * R * arcsin(sqrt(sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)))

где:
R = 6371 км (радиус Земли)
φ1, φ2 = широты в радианах
Δφ = разница широт
Δλ = разница долгот

PostGIS использует эту формулу в функции ST_Distance_Sphere()
```

### Функция-помощник:

#### getPlaceLikeStatus(placeID uint, userID uint) (liked bool, disliked bool)
```go
func getPlaceLikeStatus(placeID uint, userID uint) (bool, bool) {
    var like PlaceLike
    likeExists := db.Where("place_id = ? AND user_id = ? AND type = ?", 
        placeID, userID, "like").First(&like).RowsAffected > 0
    
    var dislike PlaceLike
    dislikeExists := db.Where("place_id = ? AND user_id = ? AND type = ?", 
        placeID, userID, "dislike").First(&dislike).RowsAffected > 0
    
    return likeExists, dislikeExists
}
```

---

## 4.2.4 Алгоритм создания поста с медиа и привязкой к месту

Целью данного алгоритма является создание нового поста пользователя с валидацией, сохранением медиа-файлов и уведомлением подписчиков. Этот алгоритм используется при публикации нового поста.

### Шаги алгоритма:

**Шаг 1.** Начало алгоритма.

**Шаг 2.** Получить входные параметры: `userID`, `username`, `req` (CreatePostRequest с content, mediaURLs, placeID).

**Шаг 3.** Проверить JWT токен и авторизацию пользователя.

**Шаг 4.** Если токен невалидный или истёк, вернуть ошибку "Unauthorized" с кодом 401.

**Шаг 5.** Проверить длину content: `len(req.Content) > 0 AND len(req.Content) <= 10000`.

**Шаг 6.** Если условие не выполняется, вернуть ошибку "Content must be 1-10000 characters" с кодом 400.

**Шаг 7.** Если `req.PlaceID` не nil, выполнить запрос: `SELECT Place WHERE id = req.PlaceID`.

**Шаг 8.** Если место не найдено, вернуть ошибку "Place not found" с кодом 404.

**Шаг 9.** Проверить видимость места для пользователя (вызвать функцию `IsVisibleToUser()`).

**Шаг 10.** Если место не видно, вернуть ошибку "Place is not accessible" с кодом 403.

**Шаг 11.** Валидировать медиа-URLs: для каждого URL проверить существование медиа-файла.

**Шаг 12.** Если медиа-файл не найден, вернуть ошибку "Media file not found" с кодом 404.

**Шаг 13.** Выполнить запрос: `SELECT User WHERE id = userID`.

**Шаг 14.** Получить данные пользователя: username, avatar.

**Шаг 15.** Создать объект Post:
```
{
    UserID: userID,
    Username: username,
    UserAvatar: user.Avatar,
    Content: req.Content,
    MediaURLs: JSON.stringify(req.MediaURLs),
    PlaceID: req.PlaceID,
    PlaceName: place.Name,
    LikeCount: 0,
    CommentCount: 0,
    CreatedAt: NOW(),
    UpdatedAt: NOW()
}
```

**Шаг 16.** Выполнить запрос: `INSERT Post {...}`.

**Шаг 17.** Если INSERT не выполнен, вернуть ошибку "Failed to create post" с кодом 500.

**Шаг 18.** Получить созданный пост с ID.

**Шаг 19.** Если `placeID` не nil, выполнить: `UPDATE Place SET like_count = like_count + 1 WHERE id = placeID`.

**Шаг 20.** Инвалидировать кэш: `redis.DEL("feed:{userID}:*")`.

**Шаг 21.** Получить всех подписчиков пользователя: `SELECT follower_id FROM follow WHERE following_id = userID`.

**Шаг 22.** Для каждого подписчика:
- Инвалидировать кэш ленты: `redis.DEL("feed:{subscriberID}:*")`
- Отправить WebSocket уведомление: "new_post" event

**Шаг 23.** Создать объект PostResponse с флагами реакций текущего пользователя.

**Шаг 24.** Вернуть PostResponse с кодом 201 (Created).

**Шаг 25.** Конец алгоритма.

### Функция-помощник:

#### validateMediaURLs(urls []string, userID uint) ([]string, error)
```go
func validateMediaURLs(urls []string, userID uint) ([]string, error) {
    validURLs := []string{}
    
    for _, url := range urls {
        var media MediaFile
        result := db.Where("url = ? AND owner_id = ?", url, userID).First(&media)
        
        if result.RowsAffected == 0 {
            return nil, fmt.Errorf("media file not found: %s", url)
        }
        
        validURLs = append(validURLs, url)
    }
    
    return validURLs, nil
}
```

---

## 4.2.5 Алгоритм получения ленты новостей с пагинацией

Целью данного алгоритма является получение ленты новостей пользователя из постов подписок с сортировкой и кэшированием. Этот алгоритм используется для отображения ленты в главном экране приложения.

### Шаги алгоритма:

**Шаг 1.** Начало алгоритма.

**Шаг 2.** Получить входные параметры: `userID`, `limit` (по умолчанию 20), `offset` (по умолчанию 0).

**Шаг 3.** Проверить параметры пагинации: `limit > 0 AND limit <= 100 AND offset >= 0`.

**Шаг 4.** Если параметры невалидны, вернуть ошибку "Invalid pagination parameters" с кодом 400.

**Шаг 5.** Проверить кэш Redis: `redis.GET("feed:{userID}:{offset}:{limit}")`.

**Шаг 6.** Если результат найден в кэше и TTL > 0, вернуть результат (пропустить шаги 7-15).

**Шаг 7.** Выполнить запрос: `SELECT following_id FROM follow WHERE follower_id = userID`.

**Шаг 8.** Если подписок нет, вернуть пустой массив с кодом 200.

**Шаг 9.** Создать переменную `followingIDs` с массивом ID подписок.

**Шаг 10.** Выполнить SQL запрос:
```sql
SELECT p.* FROM post p
WHERE p.user_id IN (followingIDs)
ORDER BY p.created_at DESC
LIMIT limit OFFSET offset
```

**Шаг 11.** Если запрос вернул ошибку, вернуть ошибку "Database error" с кодом 500.

**Шаг 12.** Для каждого поста из результата:
- Выполнить запрос: `SELECT COUNT(*) FROM post_reaction WHERE post_id = ? AND type = 'like'`
- Сохранить количество лайков
- Выполнить запрос: `SELECT FROM post_reaction WHERE post_id = ? AND user_id = ? AND type = 'like'`
- Если найдено, установить флаг `user_liked = true`
- Выполнить запрос: `SELECT FROM post_reaction WHERE post_id = ? AND user_id = ? AND type = 'dislike'`
- Если найдено, установить флаг `user_disliked = true`

**Шаг 13.** Создать объект PostResponse для каждого поста с флагами и счётчиками.

**Шаг 14.** Сохранить результаты в кэш Redis: `redis.SET("feed:{userID}:{offset}:{limit}", result, TTL=5min)`.

**Шаг 15.** Вернуть массив PostResponse с кодом 200 (OK).

**Шаг 16.** Конец алгоритма.

### Функция-помощник:

#### getFollowingIDs(userID uint) ([]uint, error)
```go
func getFollowingIDs(userID uint) ([]uint, error) {
    var followIDs []uint
    
    result := db.Table("follow").
        Select("following_id").
        Where("follower_id = ?", userID).
        Scan(&followIDs)
    
    if result.Error != nil {
        return nil, result.Error
    }
    
    return followIDs, nil
}
```

---

## 4.2.6 Алгоритм отправки сообщения в чат с WebSocket уведомлением

Целью данного алгоритма является отправка сообщения в чат с реал-тайм доставкой через WebSocket. Этот алгоритм используется при обмене сообщениями между пользователями.

### Шаги алгоритма:

**Шаг 1.** Начало алгоритма.

**Шаг 2.** Получить входные параметры: `chatID`, `userID`, `text`.

**Шаг 3.** Проверить JWT токен и авторизацию.

**Шаг 4.** Если токен невалидный, вернуть ошибка "Unauthorized" с кодом 401.

**Шаг 5.** Выполнить запрос: `SELECT Chat WHERE id = chatID`.

**Шаг 6.** Если чат не найден, вернуть ошибка "Chat not found" с кодом 404.

**Шаг 7.** Проверить, является ли пользователь членом чата: `SELECT FROM chat_member WHERE chat_id = chatID AND user_id = userID`.

**Шаг 8.** Если пользователь не член чата, вернуть ошибка "Access denied" с кодом 403.

**Шаг 9.** Проверить длину текста: `len(text) > 0 AND len(text) <= 5000`.

**Шаг 10.** Если условие не выполняется, вернуть ошибка "Message must be 1-5000 characters" с кодом 400.

**Шаг 11.** Получить имя пользователя: `SELECT username FROM user WHERE id = userID`.

**Шаг 12.** Создать объект ChatMessage:
```
{
    ChatID: chatID,
    UserID: userID,
    Username: username,
    Text: text,
    CreatedAt: NOW()
}
```

**Шаг 13.** Выполнить запрос: `INSERT ChatMessage {...}`.

**Шаг 14.** Если INSERT не выполнен, вернуть ошибка "Failed to send message" с кодом 500.

**Шаг 15.** Получить созданное сообщение с ID.

**Шаг 16.** Обновить чат: `UPDATE Chat SET last_message_id = messageID, updated_at = NOW() WHERE id = chatID`.

**Шаг 17.** Получить всех членов чата: `SELECT user_id FROM chat_member WHERE chat_id = chatID`.

**Шаг 18.** Для каждого WebSocket соединения в чате:
- Если соединение активно, отправить JSON сообщение:
```json
{
    "type": "message",
    "id": messageID,
    "user_id": userID,
    "username": username,
    "text": text,
    "created_at": "2026-04-15T10:30:00Z"
}
```

**Шаг 19.** Создать объект ChatMessageResponse.

**Шаг 20.** Вернуть ChatMessageResponse с кодом 201 (Created).

**Шаг 21.** Конец алгоритма.

### Функция-помощник:

#### broadcastMessage(chatID uint, message ChatMessage)
```go
func broadcastMessage(chatID uint, message ChatMessage) {
    // Получить все активные WebSocket соединения в чате
    connections := ChatConnections[chatID]
    
    // Создать JSON для отправки
    messageJSON, _ := json.Marshal(map[string]interface{}{
        "type": "message",
        "id": message.ID,
        "user_id": message.UserID,
        "username": message.Username,
        "text": message.Text,
        "created_at": message.CreatedAt,
    })
    
    // Отправить каждому соединению
    for _, conn := range connections {
        if conn != nil {
            conn.WriteMessage(websocket.TextMessage, messageJSON)
        }
    }
}
```

---

## 4.2.7 Алгоритм расчёта среднего рейтинга места

Целью данного алгоритма является расчёт среднего рейтинга места на основе всех отзывов и обновление статистики в БД. Этот алгоритм вызывается при добавлении или изменении отзыва.

### Шаги алгоритма:

**Шаг 1.** Начало алгоритма.

**Шаг 2.** Получить входной параметр: `placeID`.

**Шаг 3.** Выполнить SQL запрос:
```sql
SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
FROM review
WHERE place_id = placeID
```

**Шаг 4.** Если запрос вернул ошибку, вернуть ошибка "Database error" с кодом 500.

**Шаг 5.** Если отзывов нет, установить:
- `avgRating = 0`
- `reviewCount = 0`

**Шаг 6.** Если отзывы есть, получить результаты:
- `avgRating = result.avg_rating`
- `reviewCount = result.review_count`

**Шаг 7.** Округлить рейтинг до 2 знаков: `avgRating = ROUND(avgRating, 2)`.

**Шаг 8.** Выполнить запрос на обновление:
```sql
UPDATE place 
SET rating = avgRating, 
    review_count = reviewCount,
    updated_at = NOW()
WHERE id = placeID
```

**Шаг 9.** Если UPDATE не выполнен, вернуть ошибка "Failed to update place rating" с кодом 500.

**Шаг 10.** Инвалидировать кэш места: `redis.DEL("place:{placeID}:details")`.

**Шаг 11.** Получить данные обновлённого места.

**Шаг 12.** Отправить WebSocket уведомление всем просматривающим место: `"place_rating_updated"` event.

**Шаг 13.** Вернуть обновлённое место с кодом 200 (OK).

**Шаг 14.** Конец алгоритма.

### Функция-помощник:

#### updatePlaceRating(placeID uint) error
```go
func updatePlaceRating(placeID uint) error {
    var stats struct {
        AvgRating float64
        ReviewCount int64
    }
    
    result := db.Table("review").
        Select("AVG(rating) as avg_rating, COUNT(*) as review_count").
        Where("place_id = ?", placeID).
        Scan(&stats)
    
    if result.Error != nil {
        return result.Error
    }
    
    avgRating := math.Round(stats.AvgRating*100) / 100
    
    updateResult := db.Model(&Place{}).
        Where("id = ?", placeID).
        Updates(map[string]interface{}{
            "rating": avgRating,
            "review_count": stats.ReviewCount,
            "updated_at": time.Now(),
        })
    
    if updateResult.Error != nil {
        return updateResult.Error
    }
    
    // Инвалидировать кэш
    redis.Del(fmt.Sprintf("place:%d:details", placeID))
    
    return nil
}
```

---

## 4.2.8 Алгоритм добавления подписки на пользователя

Целью данного алгоритма является добавление подписки между пользователями и отправка уведомления. Этот алгоритм используется при нажатии кнопки "Follow" на профиле пользователя.

### Шаги алгоритма:

**Шаг 1.** Начало алгоритма.

**Шаг 2.** Получить входные параметры: `followerID` (текущий пользователь), `followeeID` (целевой пользователь).

**Шаг 3.** Проверить JWT токен и авторизацию пользователя.

**Шаг 4.** Если токен невалидный, вернуть ошибка "Unauthorized" с кодом 401.

**Шаг 5.** Проверить, не пытается ли пользователь подписаться на себя: `IF followerID == followeeID`.

**Шаг 6.** Если условие истинно, вернуть ошибка "Cannot follow yourself" с кодом 400.

**Шаг 7.** Выполнить запрос: `SELECT User WHERE id = followeeID`.

**Шаг 8.** Если пользователь не найден, вернуть ошибка "User not found" с кодом 404.

**Шаг 9.** Выполнить запрос: `SELECT FROM follow WHERE follower_id = followerID AND following_id = followeeID`.

**Шаг 10.** Если связь уже существует, вернуть ошибка "Already following this user" с кодом 409.

**Шаг 11.** Создать объект Follow:
```
{
    FollowerID: followerID,
    FolloweeID: followeeID,
    CreatedAt: NOW()
}
```

**Шаг 12.** Выполнить запрос: `INSERT Follow {...}`.

**Шаг 13.** Если INSERT не выполнен, вернуть ошибка "Failed to follow user" с кодом 500.

**Шаг 14.** Выполнить запрос: `UPDATE User SET follower_count = follower_count + 1 WHERE id = followeeID`.

**Шаг 15.** Выполнить запрос: `UPDATE User SET following_count = following_count + 1 WHERE id = followerID`.

**Шаг 16.** Получить данные подписчика: имя, аватар.

**Шаг 17.** Создать уведомление: `"notification": "{followerName} started following you"`.

**Шаг 18.** Если целевой пользователь подключён через WebSocket, отправить уведомление:
```json
{
    "type": "notification",
    "event": "new_follower",
    "user_id": followerID,
    "username": followerName,
    "avatar": followerAvatar,
    "created_at": "2026-04-15T10:30:00Z"
}
```

**Шаг 19.** Инвалидировать кэши:
- `redis.DEL("user:{followeeID}:followers")`
- `redis.DEL("user:{followerID}:following")`

**Шаг 20.** Вернуть успешный ответ с кодом 201 (Created).

**Шаг 21.** Конец алгоритма.

---

## Заключение

Все алгоритмы в системе Mapped следуют принципам:

1. **Валидация входных данных** на первом шаге
2. **Проверка прав доступа** перед выполнением операции
3. **Обработка ошибок** с возвратом соответствующих кодов HTTP
4. **Кэширование результатов** для оптимизации производительности
5. **Инвалидация кэша** при изменении данных
6. **Реал-тайм уведомления** через WebSocket
7. **Логирование** всех операций для аудита

Такой подход обеспечивает надежность, безопасность и масштабируемость приложения.
