# 📚 Диаграммы UML Mapped — Полный индекс

## 📖 Структура документации

```
docs/
├── class-diagram.mmd              [44 классов, 93 связи]
├── class-diagram.puml             [44 классов, 93 связи]
├── sequence-diagrams.mmd          [5 сценариев, 5 диаграмм]
├── sequence-diagrams.puml         [5 сценариев, 5 диаграмм]
├── CLASS-DIAGRAM-README.md        [Связи, типы, легенда]
├── SEQUENCE-DIAGRAMS-README.md    [10 компонентов, взаимодействие]
├── ARCHITECTURE-10-COMPONENTS.md  [Детальное описание каждого]
└── UML-DIAGRAMS-INDEX.md          [ЭТА ФАЙЛ]
```

---

## 🎯 Диаграмма #1: Классы проекта (44 класса)

### Описание
Полная диаграмма классов проекта **Mapped** по UML 2.0 стандартам.

### Содержимое

#### Сервисы (6 классов)
| Класс | Сервис | Методы |
|-------|--------|--------|
| AuthService | auth-service | Register, Login, GetUserByID, UpdateUser |
| ChatService | chat-service | CreateChat, SendMessage, GetMessages |
| MediaPresenter | media-service | UploadFile, DeleteFile |
| PlacesService | places-service | CreatePlace, GetNearbyPlaces, CreateGroup |
| PostsService | posts-service | CreatePost, GetFeed, ReactToPost |
| ReviewsService | reviews-service | CreateReview, GetPlaceReviews |

#### Репозитории (6 классов)
| Класс | Сервис |
|-------|--------|
| AuthRepository | auth-service |
| ChatRepository | chat-service |
| MediaRepository | media-service |
| PlacesRepository | places-service |
| PostsRepository | posts-service |
| ReviewsRepository | reviews-service |

#### Сущности (20 классов)

**Auth Service:**
- User (ID, Email, Username, Password, Role, Avatar, Bio, IsActive)
- Role (enum: user, moderator, admin)

**Chat Service:**
- Chat (ID, Name, Type, OwnerID)
- ChatMember (ID, ChatID, UserID, Role)
- ChatMessage (ID, ChatID, UserID, Text)
- MessageAttachment (ID, MessageID, URL, Type) ⭐ NEW

**Media Service:**
- MediaFile (ID, URL, Name, Size, MimeType, OwnerID)

**Places Service:**
- Place (ID, Name, Description, Latitude, Longitude, Category, Privacy, Approval)
- Group (ID, Name, Description, OwnerID)
- GroupMember (ID, GroupID, UserID, Role)
- PlaceLike (ID, PlaceID, UserID, Type) ⭐ NEW
- Privacy (enum: public, private, group)
- ApprovalStatus (enum: pending, approved, rejected)

**Posts Service:**
- Post (ID, UserID, Content, MediaURLs, PlaceID)
- PostComment (ID, PostID, UserID, Content)
- PostReaction (ID, PostID, UserID, Type)
- CommentReaction (ID, CommentID, UserID, Type)
- PostAttachment (ID, PostID, URL, Type) ⭐ NEW
- PostView (ID, PostID, UserID, ViewedAt, Duration, Source, Device, Geo) ⭐ EXPANDED

**Reviews Service:**
- Review (ID, PlaceID, UserID, Content, Rating, MediaURLs)
- ReviewReaction (ID, ReviewID, UserID, Type)
- ReviewComment (ID, ReviewID, UserID, Content)

#### DTO Requests (5 классов)
| Класс | Параметры |
|-------|-----------|
| RegisterRequest | Email, Username, Password |
| LoginRequest | Email, Password |
| CreatePlaceRequest | Name, Description, Latitude, Longitude, Category, Privacy |
| CreatePostRequest | Content, MediaURLs, PlaceID |
| CreateReviewRequest | PlaceID, Content, Rating, MediaURLs |

#### DTO Responses (5 классов)
| Класс | Возвращает |
|-------|-----------|
| AuthResponse | Token, User |
| PlaceResponse | Place, Liked, Disliked |
| GroupResponse | Group, IsMember |
| PostResponse | Post, UserLiked, UserDisliked |
| CommentResponse | PostComment, UserLiked, UserDisliked, LikeCount |

### Связи (93 связей)

**Зависимости (56)** — Штриховая линия: `- - ->`
- Service → Repository (6)
- Service → DTO Request (5)
- Service → DTO Response (6)
- Service → Entity (22)
- Repository → Entity (17)

**Ассоциации (19)** — Обычная линия: `─────`
- User к Chat, ChatMember, ChatMessage, MediaFile, Place, PlaceLike, Group, GroupMember, Post, PostComment, PostReaction, CommentReaction, PostView, Review, ReviewReaction, ReviewComment
- Group к Place
- Place к Review, Post

**Композиции (12)** — Залитый ромб: `◆────`
- Chat 1:* ChatMember, ChatMessage
- ChatMessage 1:* MessageAttachment
- Group 1:* GroupMember
- Place 1:* PlaceLike
- Post 1:* PostComment, PostReaction, PostAttachment, PostView
- PostComment 1:* CommentReaction
- Review 1:* ReviewReaction, ReviewComment

**Агрегации (6)** — Пустой ромб: `◇────`
- AuthResponse ◇ User
- PlaceResponse ◇ Place
- PostResponse ◇ Post
- CommentResponse ◇ PostComment
- GroupResponse ◇ Group
- ReviewComment ◇ ReviewComment (self)

### Файлы
- **Mermaid:** `docs/class-diagram.mmd` (663 строк)
- **PlantUML:** `docs/class-diagram.puml` (671 строк)
- **Документация:** `docs/CLASS-DIAGRAM-README.md`

### Просмотр
```
Mermaid: https://mermaid.live/ → Copy paste код из .mmd файла
PlantUML: https://www.plantuml.com/plantuml/uml/
VS Code: Install "Mermaid Markdown Syntax Highlighting" расширение
```

---

## 🎬 Диаграмма #2: Последовательности взаимодействия (5 сценариев)

### Обзор сценариев

#### Сценарий 1️⃣: Создание поста с местом и медиа
**Участники:** 10 компонентов
**Шаги:** 25
**Ключевые операции:**
1. Загрузка медиа → Media Service
2. Сохранение MediaFile → Database
3. Создание Post → Posts Service
4. Обновление Place рейтинга → Places Service

**Файл:** `sequence-diagrams.mmd` (строки 11-67)

---

#### Сценарий 2️⃣: Лайк места и оставление отзыва
**Участники:** 10 компонентов
**Шаги:** 42
**Ключевые операции:**
1. Создание PlaceLike → Database
2. Загрузка медиа отзыва → Media Service
3. Создание Review → Reviews Service
4. Пересчёт среднего рейтинга Place

**Файл:** `sequence-diagrams.mmd` (строки 69-155)

---

#### Сценарий 3️⃣: Поиск мест рядом и просмотр
**Участники:** 8 компонентов
**Шаги:** 35
**Ключевые операции:**
1. Geo-поиск мест → Places Service
2. Получение отзывов → Reviews Service
3. Запись просмотра → PlaceView в Database

**Файл:** `sequence-diagrams.mmd` (строки 157-233)

---

#### Сценарий 4️⃣: Регистрация, логин и профиль
**Участники:** 10 компонентов
**Шаги:** 52
**Ключевые операции:**

**Регистрация:**
1. Валидация email
2. Хеширование пароля (bcrypt)
3. Сохранение User → Database
4. Генерация JWT токена

**Логин:**
1. Поиск User по email
2. Проверка пароля
3. Генерация нового JWT

**Профиль:**
1. Загрузка аватара → Media Service
2. Обновление User → Database

**Файл:** `sequence-diagrams.mmd` (строки 235-347)

---

#### Сценарий 5️⃣: Создание группы и чат
**Участники:** 10 компонентов + WebSocket
**Шаги:** 57
**Ключевые операции:**

**Создание группы:**
1. Создание Group → Database
2. Добавление User1 как owner → GroupMember

**Добавление участника:**
1. Проверка прав (owner)
2. Добавление User2 → GroupMember

**Обмен сообщениями:**
1. Сохранение ChatMessage → Database
2. Загрузка вложений → MessageAttachment
3. **WebSocket трансляция** к другим участникам
4. Real-time обновление Frontend

**Файл:** `sequence-diagrams.mmd` (строки 349-428)

### Файлы
- **Mermaid:** `docs/sequence-diagrams.mmd` (428 строк)
- **PlantUML:** `docs/sequence-diagrams.puml` (384 строк)
- **Документация:** `docs/SEQUENCE-DIAGRAMS-README.md`

---

## 🏗️ 10 ключевых компонентов

| № | Компонент | Функция | Технология |
|----|-----------|---------|-----------|
| 1 | Frontend | UI, состояние | React, TypeScript |
| 2 | API Gateway | Маршрутизация | Gin HTTP |
| 3 | Auth Service | Аутентификация | Go, JWT, bcrypt |
| 4 | Posts Service | Посты, комментарии | Go, Gin, GORM |
| 5 | Places Service | Места, группы, поиск | Go, Gin, GORM, PostGIS |
| 6 | Reviews Service | Отзывы, рейтинги | Go, Gin, GORM |
| 7 | Chat Service | Чаты, сообщения | Go, Gin, GORM, WebSocket |
| 8 | Media Service | Загрузка файлов | Go, Gin, S3/Local |
| 9 | Database | PostgreSQL | PostgreSQL, GORM |
| 10 | File Storage | Медиа-хранилище | Local FS / AWS S3 |

**Подробнее:** `docs/ARCHITECTURE-10-COMPONENTS.md`

---

## 📊 Статистика

### Классы
```
Сервисы:              6 классов
Репозитории:          6 классов
Сущности (Entity):   20 классов
DTO Request:          5 классов
DTO Response:         5 классов
Перечисления:         2 класса (Role, Privacy, ApprovalStatus)
────────────────────────────
ВСЕГО:               44 класса
```

### Связи
```
Зависимости (..>):   56 связей
Ассоциации (--):     19 связей
Композиции (*--):    12 связей
Агрегации (o--):      6 связей
────────────────────────────
ВСЕГО:               93 связи
```

### Последовательности
```
Сценариев:            5
Компонентов:         10
Максимум шагов:      57 (Сценарий 5)
Минимум шагов:       25 (Сценарий 1)
Среднее:             ~42 шага
────────────────────────────
Всего взаимодействий: ~210 шагов
```

---

## 🔍 Как использовать диаграммы

### 1. Просмотр в браузере

**Mermaid (GitHub, GitLab, Notion):**
```markdown
```mermaid
[вставить код из .mmd файла]
```
```

**PlantUML (web editor):**
1. Перейти на https://www.plantuml.com/plantuml/uml/
2. Вставить код из .puml файла
3. Copy as URL для шара

### 2. VS Code

**Расширения:**
- "Mermaid Markdown Syntax Highlighting"
- "PlantUML"

**Использование:**
```
Ctrl+Shift+V → Preview
F1 → PlantUML: Export Current Diagram
```

### 3. Локально с Docker

```bash
# Mermaid CLI
docker run --rm -v $(pwd):/data minlag/mermaid-cli \
  -i /data/docs/class-diagram.mmd \
  -o /data/docs/class-diagram.png

# PlantUML
docker run --rm -v $(pwd):/data plantuml/plantuml \
  /data/docs/sequence-diagrams.puml \
  -o /data/docs/
```

### 4. GitHub

UML диаграммы автоматически отображаются в `.md` файлах с кодом Mermaid/PlantUML.

---

## 📝 Легенда UML

### Связи

```
┌─────────────────────────────────────────────────────┐
│ ТИП СВЯЗИ        │ ОБОЗНАЧЕНИЕ  │ ЗНАЧЕНИЕ          │
├─────────────────────────────────────────────────────┤
│ Зависимость      │ - - - - >    │ Использует        │
│ Ассоциация       │ ─────────    │ Связана с         │
│ Композиция       │ ◆────────    │ Содержит (hard)   │
│ Агрегация        │ ◇────────    │ Содержит (soft)   │
│ Обобщение        │ ──────▷      │ Наследует         │
│ Реализация       │ - - - ▷      │ Реализует         │
└─────────────────────────────────────────────────────┘
```

### Видимость

```
+ public         (публичный)
- private        (приватный)
# protected      (защищённый)
~ package        (пакетный)
```

### Кратность

```
1      - ровно один
0..1   - ноль или один
*      - ноль или более
1..*   - один или более
n      - конкретное число
0..n   - от нуля до n
```

---

## 📚 Дополнительные материалы

### Официальные стандарты
- [UML 2.5.1 Specification](https://www.omg.org/spec/UML/2.5.1/)
- [Mermaid Documentation](https://mermaid.js.org/)
- [PlantUML Documentation](https://plantuml.com/)

### Связанные документы
- `README.md` — Обзор проекта
- `.github/ARCHITECTURE.md` — Архитектурные решения
- `services/*/README.md` — Документация сервисов

---

## ✅ Чеклист для работы с диаграммами

- [ ] Прочитал легенду UML связей
- [ ] Понимаю 10 компонентов архитектуры
- [ ] Изучил все 5 сценариев последовательностей
- [ ] Знаю, как найти нужный класс в диаграмме классов
- [ ] Могу объяснить связи между компонентами
- [ ] Готов обновлять диаграммы при изменении архитектуры

---

## 🔄 Обновление диаграмм

При добавлении новых функций:

1. **Добавить класс** в `class-diagram.mmd`
2. **Добавить связи** с существующими классами
3. **Обновить счётчик** в комментарии (`XX классов`)
4. **Дублировать изменения** в `class-diagram.puml`
5. **Обновить документацию** в `CLASS-DIAGRAM-README.md`
6. **Если новый сценарий** → создать новую диаграмму последовательностей

---

## 🚀 Следующие шаги

- [ ] Создать диаграмму развёртывания (Deployment Diagram)
- [ ] Создать диаграмму компонентов (Component Diagram)
- [ ] Добавить обработку ошибок в последовательности
- [ ] Документировать миграции данных
- [ ] Создать диаграмму состояний для Orders/Transactions

---

**Последнее обновление:** 9 апреля 2026  
**Версия диаграмм:** 2.0  
**Автор:** OpenCode Assistant

