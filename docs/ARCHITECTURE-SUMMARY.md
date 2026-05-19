# Architecture Visualization Complete

## Created Files

1. **ARCHITECTURE-DIAGRAM.md** (Primary Document)
   - High-level architecture overview with ASCII diagrams
   - Detailed service architecture (layered/hexagonal pattern)
   - Complete data flow diagrams
   - Database schema & relationships
   - API routes and service mapping
   - Technology stack details
   - Key architectural decisions explained
   - Deployment architecture
   - Scalability & performance considerations
   - Security considerations

2. **ARCHITECTURE-PLANTUML.puml**
   - Professional PlantUML component diagram
   - Can be rendered in:
     - PlantUML Online Editor (plantuml.com)
     - VS Code with PlantUML extension
     - GitHub (when converted to SVG)
     - Miro, Lucidchart, and other diagram tools

3. **ARCHITECTURE-MERMAID.md**
   - GitHub-native Mermaid diagram
   - Automatically renders in GitHub README
   - Shows complete system topology with colors

## Architecture Summary

### 7 Components
```
┌─────────────────────────────────────────┐
│         API Gateway :8080               │ (Router + Header Forwarding)
├─────────────────────────────────────────┤
│ Auth :8081 │ Posts :8085 │ Places :8082 │
│ Reviews :8083 │ Chat :8084 │ Media :8086 │
├─────────────────────────────────────────┤
│         PostgreSQL :5432                │ (Shared Database)
└─────────────────────────────────────────┘
```

### Key Data Flows

1. **User Authentication**
   - Client → Gateway → Auth Service → PostgreSQL
   - Returns JWT + user_id
   - Headers forwarded to all services

2. **Post Creation**
   - Client (POST /posts) → Gateway → Posts Service → PostgreSQL
   - User ID extracted from X-User-ID header
   - 201 Created response with post details

3. **User Search with Filters**
   - Client (GET /users/search?role=regular&followers=5) → Gateway → Auth Service
   - SQL query with GROUP BY and HAVING clauses
   - Returns user profiles with follower counts

4. **Service-to-Service Communication**
   - Services verify users via Auth Service (HTTP calls)
   - All data flows through shared PostgreSQL
   - No direct database replication needed

### Layered Service Architecture (Example: Auth Service)

```
HTTP Handlers (handlers.go)
       ↓
Business Logic (service.go)
       ↓
Data Access (repository.go)
       ↓
Models (models.go)
       ↓
PostgreSQL Database
```

### Database Schema Organization

- **Users Table**: Core user data + hashtags
- **Auth Tables**: users, follows
- **Posts Tables**: posts, post_comments, post_reactions, comment_reactions
- **Places Tables**: groups, group_members, places
- **Reviews Tables**: reviews, review_reactions
- **Chat Tables**: chats, chat_members, chat_messages
- **Media Tables**: media_files

All connected via Foreign Key constraints for referential integrity.

### Gateway Responsibilities

✅ Route requests to correct service
✅ Forward X-User-ID, X-Username, X-Avatar headers
✅ Handle CORS
✅ Future: Rate limiting, request signing, API versioning

### Technology Stack

**Backend**: Go 1.23+ with Chi Router
**ORM**: GORM with PostgreSQL driver
**Testing**: Testify with table-driven pattern
**Logging**: Structured logging
**Container**: Docker & Docker Compose
**Frontend**: React 18+ with Material-UI

## Files Showing Architecture in Code

### Gateway Pattern
- `gateway/cmd/main.go:proxyTo()` - Header forwarding implementation

### Service Layer Structure
- `services/auth-service/internal/handlers/handlers.go` - HTTP endpoints
- `services/auth-service/internal/service/service.go` - Business logic
- `services/auth-service/internal/repository/repository.go` - Database queries
- `services/auth-service/internal/models/models.go` - Data structures

### Database Setup
- `migrations/001_initial_schema.sql` - All table definitions
- `migrations/003_add_posts_fk_constraint.sql` - Foreign key relationships
- `migrations/004_add_hashtags_to_users.sql` - Hashtag support

## How to View Diagrams

1. **Markdown with ASCII** (view in any text editor)
   - `docs/ARCHITECTURE-DIAGRAM.md`
   - Fully formatted, no dependencies needed

2. **PlantUML Diagram**
   - Copy content from `docs/ARCHITECTURE-PLANTUML.puml`
   - Paste into: https://www.plantuml.com/plantuml/uml/
   - Or use VS Code extension: "PlantUML" by jebbs

3. **Mermaid Diagram**
   - View directly in GitHub or any markdown viewer
   - `docs/ARCHITECTURE-MERMAID.md`
   - Renders as interactive diagram

## Scalability Roadmap

**Current State**: Single PostgreSQL, microservices with shared database
**Near Term**: Add Redis caching, read replicas
**Medium Term**: Database sharding, message queues
**Long Term**: Per-service databases, event-driven architecture

## Next Steps Options

1. **Increase Test Coverage to 75%**
   - Add SQLite in-memory tests for repository layer
   - Implement integration tests with real database

2. **Fix Frontend Post Creation Error**
   - Debug the "message port closed" Service Worker issue
   - Verify all HTTP headers are correctly passed

3. **Production Hardening**
   - Add request signing & API key management
   - Implement comprehensive rate limiting
   - Add distributed tracing (OpenTelemetry)
   - Set up monitoring & alerting

4. **Feature Development**
   - Implement feed personalization
   - Add real-time notifications (WebSockets)
   - Implement full-text search
   - Add analytics dashboard

---

**Status**: ✅ Architecture visualization complete with detailed documentation and multiple diagram formats.
