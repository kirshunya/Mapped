# Railway Deployment Guide for Mapped

## Quick Start (3 Steps)

### Step 1: Connect GitHub Repository
1. Go to https://railway.app/dashboard
2. Select your "mapped" project
3. Go to **Settings → GitHub**
4. Click "Connect Repository" 
5. Select **kirshunya/Mapped** repository
6. Choose branch: **dev**
7. Click "Deploy"

### Step 2: Add Environment Variables
Once Railway creates the services, add these variables to **each service**:

#### Option A: Use Railway Dashboard
1. Click on each service (postgres, auth-service, places-service, etc.)
2. Go to **Variables** tab
3. Add variables from `.env.railway.production`

#### Option B: Use Railway CLI (if you have token)
```bash
railway env:add DB_USER=mapsocial
railway env:add DB_PASSWORD=RailwayProd2024!SecurePass123
railway env:add DB_NAME=mapped_db
railway env:add JWT_SECRET=railway-production-secret-key-32-chars-min-8e9f7a2b4c5d6e9f0a1b2c3d4e5f6g7h
# ... add rest from .env.railway.production
```

### Step 3: Configure Service URLs in Gateway
Railway automatically sets service URLs when services are in same network.
The `gateway` service needs to know where other services are:

In **gateway** service Variables, set:
```
AUTH_SERVICE_URL=http://auth-service:8081
PLACES_SERVICE_URL=http://places-service:8082
REVIEWS_SERVICE_URL=http://reviews-service:8083
MEDIA_SERVICE_URL=http://media-service:8084
POSTS_SERVICE_URL=http://posts-service:8085
CHAT_SERVICE_URL=http://chat-service:8086
```

## Service Mapping

| Service | Port | Docker Compose Name | Railway Name |
|---------|------|-------------------|--------------|
| PostgreSQL | 5432 | postgres | postgres |
| Auth Service | 8081 | auth-service | auth-service |
| Places Service | 8082 | places-service | places-service |
| Reviews Service | 8083 | reviews-service | reviews-service |
| Media Service | 8084 | media-service | media-service |
| Posts Service | 8085 | posts-service | posts-service |
| Chat Service | 8086 | chat-service | chat-service |
| Gateway | 8080 | gateway | gateway |
| Web App | 80 | web | web |

## Environment Variables by Service

### PostgreSQL
```
POSTGRES_USER=mapsocial
POSTGRES_PASSWORD=RailwayProd2024!SecurePass123
POSTGRES_DB=mapped_db
```

### All Go Microservices (auth, places, reviews, media, posts, chat)
```
DATABASE_URL=postgresql://mapsocial:RailwayProd2024!SecurePass123@postgres:5432/mapped_db
JWT_SECRET=railway-production-secret-key-32-chars-min-8e9f7a2b4c5d6e9f0a1b2c3d4e5f6g7h
KAFKA_ENABLED=false
```

### Gateway
```
PORT=8080
JWT_SECRET=railway-production-secret-key-32-chars-min-8e9f7a2b4c5d6e9f0a1b2c3d4e5f6g7h
AUTH_SERVICE_URL=http://auth-service:8081
PLACES_SERVICE_URL=http://places-service:8082
REVIEWS_SERVICE_URL=http://reviews-service:8083
MEDIA_SERVICE_URL=http://media-service:8084
POSTS_SERVICE_URL=http://posts-service:8085
CHAT_SERVICE_URL=http://chat-service:8086
```

### Web App
```
REACT_APP_API_URL=https://your-railway-domain.up.railway.app/api/v1
PORT=80
```

## Deployment Flow

```
GitHub Push (dev branch)
    ↓
GitHub Actions Workflow Triggered
    ↓
Railway receives webhook
    ↓
Railway pulls docker-compose.railway-lite.yml
    ↓
Railway builds Docker images for all services
    ↓
Railway starts all 9 services
    ↓
PostgreSQL initializes with migrations
    ↓
All Go services connect to PostgreSQL
    ↓
Gateway and Web App start
    ↓
Application is live!
```

## Monitoring Deployment

1. Go to Railway Dashboard
2. Click your project "mapped"
3. You'll see all services building and starting
4. Check logs for each service to debug issues
5. Once all services show "Running" status, deployment is complete

## Getting Public URLs

Once deployed:
1. Click on **gateway** service
2. Go to **Settings → Domains**
3. Railway will give you a public domain like: `mapped-production.up.railway.app`
4. This is your public API URL
5. Update `.env.railway.production` with: `REACT_APP_API_URL=https://mapped-production.up.railway.app/api/v1`

## Testing the Deployment

```bash
# Test API Gateway Health
curl https://your-railway-domain.up.railway.app/api/v1/health

# Test Frontend
Open https://your-railway-domain.up.railway.app in browser

# Test Auth Service
curl -X POST https://your-railway-domain.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "email": "test@example.com", "password": "testpass"}'
```

## Troubleshooting

### Services Keep Restarting
- Check logs: Railway Dashboard → Service → Logs
- Usually means service can't connect to PostgreSQL
- Verify DATABASE_URL and credentials

### PostgreSQL Connection Failed
- Verify POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB match across all services
- Check that migrations are running: Railway Dashboard → postgres → Logs

### Service Discovery Fails
- Make sure all services are in the same Railway project
- Service URLs must match service names: `http://service-name:port`
- Don't use `localhost` or `127.0.0.1` - use service names

### Frontend Not Loading
- Check that gateway is serving static files from `/app/web-app/build`
- Verify web service is running
- Check gateway logs for 404 errors

## Storage Limitations (Hobby Plan)

Total: 5GB storage
- PostgreSQL: ~1GB
- Docker images: ~2GB
- Logs and data: ~1-2GB remaining

This is why we removed:
- Kafka & Zookeeper (~800MB)
- MinIO (~1GB)

## Rollback

If something breaks:
1. Go to Railway Dashboard
2. Click service → Deployments
3. Select previous working deployment
4. Click "Redeploy"

## Next Steps After Deployment

1. Update `REACT_APP_API_URL` with your actual Railway domain
2. Redeploy to update frontend
3. Test all features (register, create places, chat, etc.)
4. Monitor logs for any issues
5. Set up error tracking (Sentry, etc.)
