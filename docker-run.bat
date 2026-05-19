@echo off
REM Скрипт для сборки и запуска Docker образа локально на Windows

echo 🔨 Building Docker image...
docker build -t mapped:latest .

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo.
    echo 🚀 Starting container...
    echo    Backend will be available at: http://localhost:8080
    echo    Frontend (static) will be served by backend at: http://localhost:8080
    echo.
    docker run -p 8080:8080 ^
               -e DATABASE_URL="your-database-url" ^
               mapped:latest
) else (
    echo ❌ Build failed!
    exit /b 1
)
