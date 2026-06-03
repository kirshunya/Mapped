📋 CREDENTIALS FOR YOUR MAPPED APP

════════════════════════════════════════════════════════════════════════════════
🔐 LOCAL DEVELOPMENT (.env.local)
════════════════════════════════════════════════════════════════════════════════

Database:
├─ User: mapsocial
├─ Password: mapsocial123
└─ Name: mapsocial

JWT:
└─ Secret: local-secret-key-for-testing-minimum-32-chars!

MinIO:
├─ User: minioadmin
└─ Password: minioadmin123

API URLs:
├─ API: http://localhost:8080
└─ Media: http://localhost:8084/media

FILE: .env.local (already created)

════════════════════════════════════════════════════════════════════════════════
🚀 PRODUCTION (RAILWAY) (.env.production & .env)
════════════════════════════════════════════════════════════════════════════════

Database:
├─ User: mapsocial
├─ Password: RailwayProd2024!SecurePass123
└─ Name: mapsocial

JWT:
└─ Secret: railway-production-secret-key-32-chars-min-8e9f7a2b4c5d6e9f0a1b2c3d4e5f6g7h

MinIO:
├─ User: minioadmin
└─ Password: MinioRailwayProd2024!Secure456

API URLs:
├─ API: /api (Railway will set dynamically)
└─ Media: /media (Railway will set dynamically)

FILES: 
├─ .env (currently active for Railway deployment)
└─ .env.production (backup copy)

════════════════════════════════════════════════════════════════════════════════
⚡ HOW TO USE
════════════════════════════════════════════════════════════════════════════════

For Local Development:
cp .env.local .env.local
docker-compose up -d --build

For Railway Production (WHAT WE'RE DOING NOW):
.env file is already configured
railway up (will use current .env)

════════════════════════════════════════════════════════════════════════════════
✅ NEXT STEPS
════════════════════════════════════════════════════════════════════════════════

1. Save this file (you already have it in CREDENTIALS.md)
2. Ready for Railway deployment
3. After deployment, you can access:
   - PostgreSQL with: mapsocial / RailwayProd2024!SecurePass123
   - Admin interface with JWT token

════════════════════════════════════════════════════════════════════════════════
