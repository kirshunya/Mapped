#!/bin/bash

# Скрипт для сборки и запуска Docker образа локально

echo "🔨 Building Docker image..."
docker build -t mapped:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting container..."
    echo "   Backend will be available at: http://localhost:8080"
    echo "   Frontend (static) will be served by backend at: http://localhost:8080"
    echo ""
    docker run -p 8080:8080 \
               -e DATABASE_URL="your-database-url" \
               mapped:latest
else
    echo "❌ Build failed!"
    exit 1
fi
