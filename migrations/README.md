# Database Migrations

This directory contains SQL migration files for the Mapped application.

## Database Setup

The application uses **PostgreSQL 15** with **PostGIS 3.3** for geospatial queries.

### Prerequisites

- PostgreSQL 15+
- PostGIS extension
- Docker (recommended) or local PostgreSQL installation

## Running Migrations

### Option 1: Using Docker (Recommended)

The migrations are automatically applied when the database container starts. However, if you need to run them manually:

```bash
# Connect to the running PostgreSQL container
docker exec -it mapped-postgres psql -U mapsocial -d mapsocial

# Run the migration
\i /path/to/migrations/001_initial_schema.sql
```

### Option 2: Using psql directly

```bash
# Set connection variables
export PGHOST=localhost
export PGPORT=5432
export PGUSER=mapsocial
export PGPASSWORD=mapsocial123
export PGDATABASE=mapsocial

# Run the migration
psql -f migrations/001_initial_schema.sql
```

### Option 3: Add to docker-compose init

You can mount the migrations as init scripts in docker-compose:

```yaml
services:
  postgres:
    image: postgis/postgis:15-3.3
    volumes:
      - ./migrations:/docker-entrypoint-initdb.d:ro
    # ...
```

**Note:** Init scripts only run on first container startup (when data volume is empty).

## Migration Files

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | Creates all tables, indexes, triggers, and functions |
| `001_initial_schema_rollback.sql` | Drops all tables (WARNING: destroys data) |

## Schema Overview

### Tables

| Service | Tables |
|---------|--------|
| **Auth** | `users` |
| **Places** | `places`, `groups`, `group_members` |
| **Reviews** | `reviews`, `reactions`, `comments` |
| **Posts** | `posts`, `post_comments`, `post_reactions`, `comment_reactions` |
| **Chat** | `chats`, `chat_members`, `chat_messages` |

### Features

- **Soft deletes**: `users` table uses `deleted_at` column
- **Auto-timestamps**: All tables have `created_at`, most have `updated_at` with auto-update triggers
- **Denormalized fields**: Username/avatar stored with posts, comments, etc. for performance
- **Cascading deletes**: Related records are deleted when parent is removed
- **Unique constraints**: Prevents duplicate reactions, memberships, etc.
- **Check constraints**: Validates enum values (role, privacy, approval, type)

### Triggers

| Trigger | Description |
|---------|-------------|
| `update_*_updated_at` | Auto-updates `updated_at` on row modification |
| `trigger_update_place_rating` | Recalculates place rating when reviews change |
| `trigger_update_post_comment_count` | Updates post comment count |
| `trigger_update_post_like_count` | Updates post like count |

## Rollback

To rollback the initial migration (WARNING: destroys all data):

```bash
psql -f migrations/001_initial_schema_rollback.sql
```

## Adding New Migrations

1. Create a new file: `002_description.sql`
2. Create corresponding rollback: `002_description_rollback.sql`
3. Document the changes in this README
4. Test in development before applying to production

## Connection Details (Development)

```
Host: localhost (or 'postgres' from Docker network)
Port: 5432
Database: mapsocial
Username: mapsocial
Password: mapsocial123
```
