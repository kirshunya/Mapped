# Описание программных структур Mapped

## 4.1 Структуры данных микросервисов

---

## 4.1.1 User - Структура пользователя с ролевой системой

Структура User используется для представления пользователя системы с поддержкой различных ролей и валидацией данных.

**Назначение:** Хранение основной информации о пользователе, включая аутентификационные данные и профиль.

### Исходный код:

```go
type User struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    Email     string         `gorm:"uniqueIndex;not null" json:"email"`
    Username  string         `gorm:"uniqueIndex;not null" json:"username"`
    Password  string         `gorm:"not null" json:"-"`
    Role      Role           `gorm:"type:varchar(20);default:user" json:"role"`
    Avatar    string         `json:"avatar,omitempty"`
    Bio       string         `json:"bio,omitempty"`
    IsActive  bool           `gorm:"default:true" json:"is_active"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Role string

const (
    RoleUser      Role = "user"
    RoleModerator Role = "moderator"
    RoleAdmin     Role = "admin"
)
```

### Описание полей:

| Поле | Тип | Описание | Валидация |
|------|-----|---------|-----------|
| **ID** | uint | Первичный ключ | AUTO_INCREMENT |
| **Email** | string | Email пользователя | UNIQUE, NOT NULL |
| **Username** | string | Имя пользователя | UNIQUE, NOT NULL |
| **Password** | string | Хешированный пароль | NOT NULL, скрыт в JSON |
| **Role** | Role | Роль пользователя | user/moderator/admin |
| **Avatar** | string | URL аватара | Optional |
| **Bio** | string | Биография | Optional |
| **IsActive** | bool | Активен ли аккаунт | Default: true |
| **CreatedAt** | time.Time | Дата создания | Auto |
| **UpdatedAt** | time.Time | Дата последнего обновления | Auto |
| **DeletedAt** | gorm.DeletedAt | Soft delete флаг | Для логического удаления |

### Вычисляемое свойство - IsValidRole():

```go
func (u *User) IsValidRole() bool {
    validRoles := []Role{RoleUser, RoleModerator, RoleAdmin}
    for _, role := range validRoles {
        if u.Role == role {
            return true
        }
    }
    return false
}
```

**Описание:** Проверяет, является ли роль пользователя одной из допустимых ролей. Используется при изменении роли.

### Использование в приложении:

- **Регистрация:** Создается новый User с Role = "user"
- **Авторизация:** User загружается из БД и проверяется пароль
- **Управление правами:** Role определяет доступные операции
- **Профиль:** Avatar и Bio отображаются в приложении

---

## 4.1.2 Place - Структура места с геолокацией и приватностью

Структура Place используется для представления географического места с поддержкой различных уровней приватности и статусов одобрения.

**Назначение:** Хранение информации о местах на карте с координатами, описанием и метаданными.

### Исходный код:

```go
type Privacy string
type ApprovalStatus string

const (
    PrivacyPublic  Privacy = "public"
    PrivacyPrivate Privacy = "private"
    PrivacyGroup   Privacy = "group"
)

const (
    ApprovalPending  ApprovalStatus = "pending"
    ApprovalApproved ApprovalStatus = "approved"
    ApprovalRejected ApprovalStatus = "rejected"
)

type Place struct {
    ID          uint           `gorm:"primaryKey" json:"id"`
    Name        string         `gorm:"not null" json:"name"`
    Description string         `json:"description"`
    Latitude    float64        `gorm:"not null" json:"latitude"`
    Longitude   float64        `gorm:"not null" json:"longitude"`
    Address     string         `json:"address"`
    Category    string         `json:"category"`
    Privacy     Privacy        `gorm:"type:varchar(20);default:public" json:"privacy"`
    Approval    ApprovalStatus `gorm:"type:varchar(20);default:pending" json:"approval"`
    GroupID     *uint          `gorm:"index" json:"group_id,omitempty"`
    Rating      float64        `gorm:"default:0" json:"rating"`
    ReviewCount int            `gorm:"default:0" json:"review_count"`
    LikeCount   int            `gorm:"default:0" json:"like_count"`
    UserID      uint           `gorm:"index" json:"user_id"`
    Username    string         `json:"username"`
    UserAvatar  string         `json:"user_avatar"`
    MediaURLs   string         `json:"media_urls"`
    IsVerified  bool           `gorm:"default:false" json:"is_verified"`
    IsDeleted   bool           `gorm:"default:false" json:"is_deleted"`
    CreatedAt   time.Time      `json:"created_at"`
    UpdatedAt   time.Time      `json:"updated_at"`
}
```

### Вычисляемое свойство - IsVisibleToUser(viewerID, viewerRole):

```go
func (p *Place) IsVisibleToUser(viewerID uint, viewerRole string) bool {
    // Не видно удалённые места
    if p.IsDeleted {
        return false
    }
    
    // Админ видит всё
    if viewerRole == "admin" {
        return true
    }
    
    // Только одобренные места видны всем
    if p.Privacy == PrivacyPublic && p.Approval == ApprovalApproved {
        return true
    }
    
    // Создатель видит своё место
    if p.UserID == viewerID {
        return true
    }
    
    // Модератор видит в режиме одобрения
    if viewerRole == "moderator" && p.Approval == ApprovalPending {
        return true
    }
    
    return false
}
```

**Описание:** Вычисляемое свойство проверяет видимость места для конкретного пользователя на основе:
- Приватности места (public/private/group)
- Статуса одобрения (pending/approved/rejected)
- Роли пользователя (user/moderator/admin)
- Является ли пользователь создателем

### Вычисляемое свойство - CanBeEdited(editorID, editorRole):

```go
func (p *Place) CanBeEdited(editorID uint, editorRole string) bool {
    // Только создатель или администратор
    if p.UserID == editorID || editorRole == "admin" {
        return true
    }
    return false
}
```

**Описание:** Проверяет, может ли пользователь редактировать место. Используется при обновлении информации о месте.

### Использование в приложении:

- **Создание места:** Пользователь добавляет место на карту
- **Геопоиск:** Получение мест рядом с пользователем
- **Фильтрация:** Отображение только видимых мест на основе приватности
- **Модерация:** Статус одобрения для проверки новых мест
- **Рейтинг:** Средний рейтинг и количество отзывов

---

## 4.1.3 Post - Структура поста с медиа и реакциями

Структура Post используется для представления постов пользователей с привязкой к местам и поддержкой медиа.

**Назначение:** Хранение постов в ленте с комментариями, медиа и счётчиками.

### Исходный код:

```go
type Post struct {
    ID           uint      `gorm:"primaryKey" json:"id"`
    UserID       uint      `gorm:"index;not null" json:"user_id"`
    Username     string    `gorm:"size:100" json:"username"`
    UserAvatar   string    `gorm:"size:500" json:"user_avatar"`
    Content      string    `gorm:"type:text" json:"content"`
    MediaURLs    string    `json:"media_urls"` // JSON array string
    PlaceID      *uint     `gorm:"index" json:"place_id,omitempty"`
    PlaceName    string    `gorm:"size:200" json:"place_name,omitempty"`
    LikeCount    int       `gorm:"default:0" json:"like_count"`
    CommentCount int       `gorm:"default:0" json:"comment_count"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}

type PostReaction struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    PostID    uint      `gorm:"index;not null" json:"post_id"`
    UserID    uint      `gorm:"index;not null" json:"user_id"`
    Type      string    `gorm:"size:20;not null" json:"type"` // "like" или "dislike"
    CreatedAt time.Time `json:"created_at"`
}
```

### Вычисляемое свойство - UserHasReacted(userID, reactionType):

```go
func (p *Post) UserHasReacted(userID uint, reactionType string) bool {
    // Это должно быть заполнено из БД через repository
    // Проверяет, есть ли реакция данного пользователя
    // Используется в PostResponse для отображения состояния кнопок
}
```

**Описание:** Проверяет, выполнил ли пользователь конкретную реакцию (like/dislike) на пост. Используется при отображении состояния кнопок в UI.

### PostResponse - DTO для отправки клиенту:

```go
type PostResponse struct {
    Post
    UserLiked    bool `json:"user_liked"`     // Лайкнул ли текущий пользователь
    UserDisliked bool `json:"user_disliked"`  // Дизлайкнул ли текущий пользователь
}
```

**Описание:** Данный DTO расширяет Post дополнительной информацией о реакции текущего пользователя, необходимой для правильного отображения UI.

### Использование в приложении:

- **Создание поста:** Пользователь публикует текст + фото с привязкой к месту
- **Лента новостей:** Отображение постов подписок
- **Реакции:** Лайки и дизлайки
- **Комментарии:** Добавление комментариев к посту
- **Счётчики:** Количество лайков и комментариев

---

## 4.1.4 Review - Структура отзыва с рейтингом

Структура Review используется для представления отзывов о местах с числовым рейтингом.

**Назначение:** Хранение отзывов о местах с оценками для расчёта среднего рейтинга.

### Исходный код:

```go
type Review struct {
    ID         uint      `gorm:"primaryKey" json:"id"`
    PlaceID    uint      `gorm:"index" json:"place_id"`
    UserID     uint      `gorm:"index" json:"user_id"`
    Username   string    `json:"username"`
    UserAvatar string    `json:"user_avatar"`
    UserRole   string    `json:"user_role"`
    Content    string    `json:"content"`
    Rating     float64   `gorm:"not null" json:"rating"`
    MediaURLs  string    `json:"media_urls"`
    LikeCount  int       `gorm:"default:0" json:"like_count"`
    CreatedAt  time.Time `json:"created_at"`
    UpdatedAt  time.Time `json:"updated_at"`
}

type CreateReviewRequest struct {
    PlaceID   uint     `json:"place_id" binding:"required"`
    Content   string   `json:"content"`
    Rating    float64  `json:"rating" binding:"required,min=0,max=5"`
    MediaURLs []string `json:"media_urls"`
}
```

### Вычисляемое свойство - IsValidRating():

```go
func (r *Review) IsValidRating() bool {
    return r.Rating >= 0 && r.Rating <= 5
}
```

**Описание:** Проверяет, находится ли рейтинг в допустимом диапазоне (0-5). Аналогично примеру с MenuView, которое проверяло satisfyDefaultRules.

### Использование в приложении:

- **Оценка места:** Пользователь выставляет рейтинг от 0 до 5
- **Расчёт среднего:** Rating используется для расчёта среднего рейтинга места
- **Фильтрация:** Фильтрация мест по минимальному рейтингу
- **Сортировка:** Сортировка мест по рейтингу

---

## 4.1.5 Chat и ChatMessage - Структуры сообщений

Структуры Chat и ChatMessage используются для представления чатов и сообщений в реал-тайм коммуникации.

**Назначение:** Хранение чатов (direct и group) и сообщений между пользователями.

### Исходный код:

```go
type Chat struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"size:200" json:"name"`
    Type      string    `gorm:"size:20;default:direct" json:"type"` // "direct" или "group"
    OwnerID   uint      `gorm:"index" json:"owner_id"`
    CreatedAt time.Time `json:"created_at"`
}

type ChatMessage struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    ChatID    uint      `gorm:"index" json:"chat_id"`
    UserID    uint      `gorm:"index" json:"user_id"`
    Username  string    `gorm:"size:100" json:"username"`
    Text      string    `gorm:"type:text" json:"text"`
    CreatedAt time.Time `json:"created_at"`
}

type ChatMember struct {
    ID       uint   `gorm:"primaryKey" json:"id"`
    ChatID   uint   `gorm:"index" json:"chat_id"`
    UserID   uint   `gorm:"index" json:"user_id"`
    Username string `gorm:"size:100" json:"username"`
    Role     string `gorm:"size:20;default:member" json:"role"` // "owner" или "member"
}
```

### Вычисляемое свойство - IsDirectChat():

```go
func (c *Chat) IsDirectChat() bool {
    return c.Type == "direct"
}
```

**Описание:** Проверяет, является ли чат прямым (между двумя пользователями) или групповым. Используется для определения способа отображения и управления участниками.

### Вычисляемое свойство - CanUserManageChat(userID):

```go
func (c *Chat) CanUserManageChat(userID uint) bool {
    // Только владелец может управлять чатом
    return c.OwnerID == userID
}
```

**Описание:** Проверяет, может ли пользователь управлять чатом (добавлять/удалять участников, менять название). Используется при редактировании параметров чата.

### Использование в приложении:

- **Direct чат:** Личная переписка между двумя пользователями
- **Group чат:** Групповая переписка в группе/месте
- **Сообщения:** Обмен текстовыми сообщениями с вложениями
- **WebSocket:** Реал-тайм доставка сообщений

---

## 4.1.6 Group - Структура группы мест

Структура Group используется для представления группы мест, объединённых пользователем.

**Назначение:** Хранение информации о группах, которые пользователи могут создавать для организации мест.

### Исходный код:

```go
type Group struct {
    ID          uint      `gorm:"primaryKey" json:"id"`
    Name        string    `gorm:"not null" json:"name"`
    Description string    `json:"description"`
    OwnerID     uint      `gorm:"index" json:"owner_id"`
    CreatedAt   time.Time `json:"created_at"`
}

type GroupMember struct {
    ID         uint      `gorm:"primaryKey" json:"id"`
    GroupID    uint      `gorm:"index" json:"group_id"`
    UserID     uint      `gorm:"index" json:"user_id"`
    Role       string    `gorm:"default:member" json:"role"` // "owner" или "member"
    Username   string    `gorm:"size:100" json:"username"`
    UserAvatar string    `gorm:"size:500" json:"user_avatar"`
    JoinedAt   time.Time `json:"joined_at"`
}

type GroupResponse struct {
    Group
    IsMember bool `json:"is_member"` // Является ли текущий пользователь членом группы
}
```

### Вычисляемое свойство - CanUserManageGroup(userID):

```go
func (g *Group) CanUserManageGroup(userID uint) bool {
    // Только владелец может управлять группой
    return g.OwnerID == userID
}
```

**Описание:** Проверяет, может ли пользователь управлять группой (добавлять/удалять места, приглашать членов).

### Использование в приложении:

- **Создание группы:** Владелец создаёт группу для организации мест
- **Приглашение членов:** Владелец приглашает пользователей
- **Управление местами:** Добавление/удаление мест в группу
- **Общий чат:** Групповой чат для обсуждения мест

---

## 4.1.7 MediaFile - Структура загруженного файла

Структура MediaFile используется для представления загруженных медиафайлов с метаданными.

**Назначение:** Хранение информации об uploaded файлах для отслеживания и управления хранилищем.

### Исходный код:

```go
type MediaFile struct {
    ID        uint      `json:"id"`
    URL       string    `json:"url"`                  // Публичный URL файла
    Name      string    `json:"name"`                 // Исходное имя файла
    Size      int64     `json:"size"`                 // Размер в байтах
    MimeType  string    `json:"mime_type"`            // MIME тип (image/jpeg, etc)
    OwnerID   uint      `json:"owner_id"`             // ID пользователя, загрузившего файл
    CreatedAt time.Time `json:"created_at"`
}

type UploadResponse struct {
    URL string `json:"url"`
}
```

### Вычисляемое свойство - IsImage():

```go
func (m *MediaFile) IsImage() bool {
    imageTypes := []string{"image/jpeg", "image/png", "image/gif", "image/webp"}
    for _, t := range imageTypes {
        if m.MimeType == t {
            return true
        }
    }
    return false
}
```

**Описание:** Проверяет, является ли файл изображением. Используется для определения способа обработки и отображения файла в UI.

### Вычисляемое свойство - IsVideo():

```go
func (m *MediaFile) IsVideo() bool {
    videoTypes := []string{"video/mp4", "video/webm", "video/quicktime"}
    for _, t := range videoTypes {
        if m.MimeType == t {
            return true
        }
    }
    return false
}
```

**Описание:** Проверяет, является ли файл видео.

### Использование в приложении:

- **Загрузка медиа:** При создании поста, места или отзыва
- **Хранение:** Файлы сохраняются в S3 или локальное хранилище
- **Обработка:** Изображения могут быть обработаны (изменение размера, кроп)
- **Дисплей:** URL используется для отображения в UI

---

## 4.1.8 DTO Структуры (Request/Response)

DTO (Data Transfer Object) структуры используются для валидации входных данных и преобразования результатов для отправки клиенту.

### RegisterRequest - Запрос на регистрацию:

```go
type RegisterRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Username string `json:"username" binding:"required,min=3,max=30"`
    Password string `json:"password" binding:"required,min=6"`
}
```

**Валидация:**
- Email: обязателен, должен быть корректный email адрес
- Username: 3-30 символов
- Password: минимум 6 символов

### CreatePostRequest - Запрос на создание поста:

```go
type CreatePostRequest struct {
    Content   string   `json:"content"`
    MediaURLs []string `json:"media_urls"`
    PlaceID   *uint    `json:"place_id"`
    PlaceName string   `json:"place_name"`
}
```

**Описание:** Содержит данные для создания нового поста. PlaceID опциональный для привязки к месту.

### PlaceResponse - Ответ с информацией о месте:

```go
type PlaceResponse struct {
    Place
    Liked    bool `json:"liked"`     // Лайкнул ли текущий пользователь
    Disliked bool `json:"disliked"`  // Дизлайкнул ли текущий пользователь
}
```

**Описание:** Расширяет базовую информацию о месте флагами реакций текущего пользователя для корректного отображения в UI.

---

## 4.2 Паттерны использования структур

### 4.2.1 Паттерн "Computed Property" для валидации

Как в примере MenuView с `satisfyDefaultRules`, в структурах используются вычисляемые свойства для проверки:

```go
// Вместо этого:
if user.Role == "admin" || user.Role == "moderator" {
    // разрешить
}

// Используется это:
func (u *User) IsAdmin() bool {
    return u.Role == RoleAdmin
}

if user.IsAdmin() {
    // разрешить
}
```

**Преимущества:**
- Читаемость кода
- Централизованная логика
- Легче тестировать

### 4.2.2 Паттерн "DTO для реакций пользователя"

Аналогично тому, как MenuView отслеживает состояние (выбранные параметры), PostResponse отслеживает реакции пользователя:

```go
// Entity (из БД)
type Post struct {
    ID        uint
    Content   string
    LikeCount int      // Общее число лайков
}

// DTO (для клиента)
type PostResponse struct {
    Post
    UserLiked    bool  // Выполнил ли ЭТО текущий пользователь
    UserDisliked bool
}
```

**Аналогия с MenuView:**
- MenuView: отслеживает defaultRules → показывает заполненный/незаполненный значок
- PostResponse: отслеживает user reactions → показывает активную/неактивную кнопку лайка

---

## Заключение

Все структуры данных в Mapped следуют принципам:
1. **Чистоты данных** - валидация на уровне структур
2. **Безопасности** - проверка прав доступа через вычисляемые свойства
3. **Удобства** - использование DTO для правильного формата ответов
4. **Производительности** - оптимальные индексы в БД

Этот подход обеспечивает надежное и масштабируемое приложение.
