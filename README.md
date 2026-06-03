# 🗺️ Mapped - Geo-Social Network

A modern geosocial network application that combines interactive maps, social features, real-time messaging, and community engagement. Discover places, share experiences, and connect with other explorers.

**Demo:** http://localhost:8080

---

## ✨ Key Features

### 🗺️ Maps & Location Management
- **Interactive OpenStreetMap** - Multiple tile styles (Dark, Satellite, Minimal)
- **Add Places** - One-click place creation anywhere on the map
- **Smart Filtering** - Filter by category, privacy level, and rating
- **Rich Place Details** - Photos, reviews, ratings, and creator info
- **My Location** - Geolocation button to center on current position
- **Real-Time Search** - Search by place name and description

### 👥 Social Features
- **User Profiles** - Customizable profiles with bios and social links
- **Follow/Unfollow** - Build your social network and discover communities
- **Smart Recommendations** - AI-powered suggestions (popular, nearby, random places)
- **User Discovery** - Search and explore other users' profiles and content
- **Online Status** - See who's active in real-time

### 📝 Content & Engagement
- **Community Feed** - Chronological feed of posts and recommendations
- **Post Creation** - Share places with photos and descriptions
- **Comments & Reactions** - Like, dislike, and comment on posts
- **Reviews & Ratings** - Rate places and write detailed reviews with photos
- **Photo Gallery** - Rich media support with lightbox viewer

### 💬 Real-Time Messaging
- **Direct Messages** - Private one-on-one conversations
- **Group Chats** - Create and manage group conversations
- **WebSocket Integration** - Instant message delivery with zero latency
- **Location Sharing** - Send places directly in chats
- **Chat History** - Browse up to 200 previous messages
- **User Avatars** - Profile pictures in message threads

### 👫 Groups & Communities
- **Group Management** - Create, join, and manage communities
- **Member Roles** - Owner, admin, moderator, and member roles
- **Group Discovery** - Search and explore existing communities
- **Member Management** - Add/remove members and assign roles

### 🛡️ Moderation & Admin
- **Content Approval** - Pending place approval workflow
- **Role-Based Access** - Admin/moderator/user permission system
- **Moderation Dashboard** - Review and approve user submissions
- **User Management** - Admin controls for user accounts

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- **React 18** - Modern UI with Hooks
- **Material-UI (MUI)** - Component library
- **Leaflet + OpenStreetMap** - Interactive maps
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **Axios** - HTTP client

**Backend:**
- **Go 1.19+** - Backend language
- **Gin** - Web framework
- **PostgreSQL** - Primary database
- **GORM** - ORM layer
- **JWT** - Token-based authentication
- **WebSocket** - Real-time communication

**DevOps & Infrastructure:**
- **Docker & Docker Compose** - Containerization
- **PostgreSQL** - Database
- **Kafka** - Message queue
- **Zookeeper** - Kafka coordination
- **MinIO** - Object storage for files

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                          │
│  Pages: Map, Feed, Places, Chats, Groups, Profile, Settings     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    HTTP + WebSocket Connection
                                 │
┌────────────────────────────────┴────────────────────────────────┐
│                   API Gateway (Go + Gin)                         │
│     Routing │ Authentication │ Static Files │ Rate Limiting     │
└────┬──────────┬──────────────┬──────────────┬────────────────────┘
     │          │              │              │
  ┌──┴─────┐ ┌─┴──────────┐ ┌─┴──────────┐ ┌─┴──────────┐
  │ Auth   │ │ Chat      │ │ Places    │ │ Other      │
  │Service │ │ Service   │ │ Service   │ │ Services   │
  │        │ │           │ │           │ │            │
  │- Login │ │- Messages │ │- Create   │ │- Posts     │
  │- Reg   │ │- WebSocket│ │- Search   │ │- Reviews   │
  │- Users │ │- Groups   │ │- Filter   │ │- Media     │
  └──────────┘ └───────────┘ └──────────┘ └────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───┴────┐   ┌──────┴──────┐  ┌───┴────┐
    │Database│   │   Storage   │  │ Queue  │
    │        │   │             │  │        │
    │ PgSQL  │   │ MinIO       │  │ Kafka  │
    │        │   │             │  │        │
    └────────┘   └─────────────┘  └────────┘
```

### Microservices Breakdown

| Service | Function | Port |
|---------|----------|------|
| **Gateway** | API routing, static files, auth proxy | 8080 |
| **Auth Service** | User auth, profiles, following | 5001 |
| **Chat Service** | Messaging, WebSocket, groups | 5002 |
| **Places Service** | Location CRUD, search, filters | 5003 |
| **Posts Service** | Feed, posts, comments | 5004 |
| **Reviews Service** | Ratings, reviews, reactions | 5005 |
| **Media Service** | File uploads, image storage | 5006 |

### Database Schema

**User Management:**
- `users` - User accounts, profiles, roles
- `follows` - Follow relationships

**Location Data:**
- `places` - Place entries with coordinates, categories, privacy
- `reviews` - Reviews and ratings for places
- `likes` - User likes on places and posts

**Social Content:**
- `posts` - Community posts
- `comments` - Post comments
- `post_reactions` - Post reactions (likes/dislikes)
- `review_reactions` - Review reactions

**Real-Time Communication:**
- `chats` - Chat rooms (direct or group)
- `chat_members` - Chat participants with roles
- `chat_messages` - Messages with location data
- `groups` - Community groups
- `group_members` - Group members with roles

---

## 🚀 Quick Start

### Option 1: Local Development

#### Prerequisites

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**

#### Installation & Startup (3 Steps)

```bash
# 1. Clone repository
git clone https://github.com/kirshunya/Mapped.git
cd Mapped

# 2. Start all services
docker-compose up -d --build

# 3. Open in browser
# Main app: http://localhost:8080
```

That's it! The system will:
- ✅ Build all Go microservices
- ✅ Build React frontend
- ✅ Initialize PostgreSQL
- ✅ Start all 12 containers
- ✅ Run database migrations

---

### Option 2: Cloud Deployment on Railway

Deploy to production in minutes with Railway Hobby Plan!

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login & deploy
railway login
railway init
railway up

# 3. Open in browser
# Your public URL from Railway
```

📚 **Full Cloud Deployment Guide:**
- **Quick Start:** See `RAILWAY_QUICKSTART.md` (5 minutes)
- **Detailed Guide:** See `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Hobby Plan Analysis:** See `RAILWAY_HOBBY_PLAN_ANALYSIS.md`
- **Production Setup:** See `RAILWAY_HYBRID_SETUP.md`
- **Index:** See `RAILWAY_DEPLOYMENT_INDEX.md` for all docs

**Cost:** $5/month (free tier with credits) + ~$5-10/month for resources

### Verify Everything Works

```bash
# Check container status
docker-compose ps

# Check gateway is running
curl http://localhost:8080/health

# View logs
docker-compose logs -f gateway
```

### Stop the Application

```bash
# Stop containers (keep data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

---

## 📖 API Reference

### Authentication
```
POST   /api/v1/auth/register          Register new user
POST   /api/v1/auth/login             Login user
GET    /api/v1/auth/me                Get current user
PUT    /api/v1/auth/me                Update profile
```

### Places
```
GET    /api/v1/places                 Get nearby places
GET    /api/v1/places/all             Get all places
POST   /api/v1/places                 Create new place
GET    /api/v1/places/:id             Get place details
PUT    /api/v1/places/:id             Update place
DELETE /api/v1/places/:id             Delete place
GET    /api/v1/places/recommendations Get recommendations
```

### Chats
```
GET    /api/v1/chats                  Get user's chats
POST   /api/v1/chats                  Create chat
GET    /api/v1/chats/:id/messages     Get chat messages
POST   /api/v1/chats/:id/messages     Send message
WS     /api/v1/ws/chats/:id           WebSocket connection
```

### Posts & Feed
```
GET    /api/v1/posts                  Get community feed
POST   /api/v1/posts                  Create post
GET    /api/v1/posts/recommended      Get recommended posts
DELETE /api/v1/posts/:id              Delete post
POST   /api/v1/posts/:id/comments     Add comment
```

### Groups
```
GET    /api/v1/groups                 Get all groups
POST   /api/v1/groups                 Create group
GET    /api/v1/groups/:id             Get group details
POST   /api/v1/groups/:id/join        Join group
POST   /api/v1/groups/:id/members     Add member
```

### Users
```
GET    /api/v1/users/search           Search users
GET    /api/v1/users/:id              Get user profile
POST   /api/v1/users/:id/follow       Follow user
DELETE /api/v1/users/:id/follow       Unfollow user
```

---

## 🗂️ Project Structure

```
Mapped/
│
├── 📦 Frontend
│   └── web-app/                    # React SPA
│       ├── src/
│       │   ├── pages/              # Page components
│       │   │   ├── MapPage.js       # Main map interface
│       │   │   ├── FeedPage.js      # Community feed
│       │   │   ├── ChatsPage.js     # Messaging
│       │   │   ├── PlacesPage.js    # Places browser
│       │   │   ├── GroupsPage.js    # Group management
│       │   │   └── ProfilePage.js   # User profiles
│       │   │
│       │   ├── components/         # Reusable components
│       │   │   ├── map/            # Map components
│       │   │   ├── place/          # Place cards/details
│       │   │   ├── post/           # Post/comment components
│       │   │   ├── layout/         # Layout wrappers
│       │   │   └── ui/             # Common UI elements
│       │   │
│       │   ├── services/           # API clients
│       │   │   └── api.js          # Axios instance + endpoints
│       │   │
│       │   ├── store/              # Zustand stores
│       │   │   ├── authStore.js
│       │   │   ├── placeStore.js
│       │   │   └── chatStore.js
│       │   │
│       │   └── App.js              # Main app with routing
│       │
│       └── package.json
│
├── 🔌 API Gateway
│   └── gateway/                    # Go Gin server
│       ├── cmd/
│       │   └── main.go             # Entry point
│       ├── middleware/             # Auth, CORS, logging
│       ├── routes/                 # Route definitions
│       └── go.mod
│
├── ⚙️ Microservices
│   └── services/
│       ├── auth-service/           # User management
│       ├── chat-service/           # Real-time messaging
│       ├── places-service/         # Location management
│       ├── posts-service/          # Feed & posts
│       ├── reviews-service/        # Ratings & reviews
│       └── media-service/          # File uploads
│
├── 🗄️ Database
│   └── migrations/                 # SQL migration files
│
├── 🐳 Infrastructure
│   └── docker-compose.yml          # Container orchestration
│
└── 📝 Documentation
    └── README.md                   # This file
```

---

## 🔧 Configuration

### Environment Variables

The application uses sensible defaults. Optionally create `.env`:

```env
# PostgreSQL Configuration
POSTGRES_USER=mapsocial
POSTGRES_PASSWORD=mapsocial123
POSTGRES_DB=mapsocial
DATABASE_URL=postgres://mapsocial:mapsocial123@postgres:5432/mapsocial

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Service URLs (for internal communication)
AUTH_SERVICE_URL=http://auth-service:5001
CHAT_SERVICE_URL=http://chat-service:5002
PLACES_SERVICE_URL=http://places-service:5003
POSTS_SERVICE_URL=http://posts-service:5004
REVIEWS_SERVICE_URL=http://reviews-service:5005
MEDIA_SERVICE_URL=http://media-service:5006

# MinIO (Object Storage)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=http://minio:9000

# Kafka Configuration
KAFKA_BROKER=kafka:9092
```

---

## 🧪 Development

### Frontend Development

```bash
cd web-app

# Install dependencies
npm install

# Start development server (auto-reload)
npm start

# Build production
npm run build

# Run tests
npm test
```

App will open at http://localhost:3000 with hot reload enabled.

### Backend Development

```bash
cd services/auth-service

# Install dependencies
go mod tidy

# Run service
go run cmd/main.go

# Run tests
go test ./...

# Build binary
go build -o auth-service cmd/main.go
```

### Rebuild Individual Service

```bash
# Rebuild and restart a specific service
docker-compose up -d --build chat-service

# Or multiple services
docker-compose up -d --build gateway chat-service places-service
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f chat-service

# Last 100 lines
docker-compose logs --tail=100 gateway

# Real-time follow
docker-compose logs -f --timestamps
```

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Windows: Find process using port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac: Find and kill process
lsof -i :8080
kill -9 <PID>
```

**Database Connection Error**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

**Services Won't Start**
```bash
# Clean everything
docker-compose down -v --remove-orphans
docker system prune -a

# Rebuild from scratch
docker-compose up -d --build --no-cache
```

**WebSocket Connection Failed**
```bash
# Check gateway logs
docker-compose logs -f gateway

# Verify chat service is healthy
docker-compose ps chat-service

# Test connection
curl http://localhost:8080/health
```

### Debug Commands

```bash
# SSH into a container
docker-compose exec gateway sh
docker-compose exec postgres psql -U mapsocial -d mapsocial

# Check database tables
docker-compose exec postgres psql -U mapsocial -d mapsocial -c "\dt"

# View container network
docker-compose exec gateway nslookup chat-service

# Check Docker logs with timestamps
docker-compose logs --timestamps --tail=50
```

---

## 📊 Monitoring & Performance

### Health Checks

```bash
# Gateway health
curl http://localhost:8080/health

# All services health
for svc in gateway auth-service chat-service; do
  echo "=== $svc ==="
  curl http://localhost:8080/api/v1/health 2>/dev/null
done
```

### Database Monitoring

```bash
# Connect to database
docker-compose exec postgres psql -U mapsocial -d mapsocial

# Useful queries
SELECT count(*) FROM users;
SELECT count(*) FROM places;
SELECT count(*) FROM posts;
SELECT count(*) FROM chats;
SELECT * FROM users LIMIT 5;
```

### Resource Usage

```bash
# Check container resource usage
docker stats

# Inspect container details
docker inspect mapped-chat-service-1

# View network connections
docker-compose exec gateway netstat -tulpn
```

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| **Start** | `docker-compose up -d --build` |
| **Stop** | `docker-compose down` |
| **Reset** | `docker-compose down -v` |
| **Logs** | `docker-compose logs -f` |
| **Specific logs** | `docker-compose logs -f service-name` |
| **SSH into service** | `docker-compose exec service-name sh` |
| **DB access** | `docker-compose exec postgres psql -U mapsocial -d mapsocial` |
| **Rebuild one** | `docker-compose up -d --build service-name` |
| **Prune Docker** | `docker system prune -a` |
| **Remove volumes** | `docker-compose down -v` |


