# ⚡ Railway Hobby Plan - Быстрый Старт

## 3 Простых Шага

### 1️⃣ Подготовка (5 мин)
```bash
# Установить Railway CLI
npm install -g @railway/cli

# Залогиниться
railway login

# Создать .env с паролями
cp .env.railway .env
# Отредактируйте пароли в .env!

# Инициализировать проект
railway init
```

### 2️⃣ Деплой (15-20 мин)
```bash
# Railway автоматически соберет и разверет
railway up
```

### 3️⃣ Получить URLs (1 мин)
```bash
# Посмотреть все созданные endpoints
railway variables

# Результат:
# Gateway: https://mapped-gateway-prod.railway.app ← используйте эту для фронтенда
# Web: https://mapped-web-prod.railway.app ← откройте в браузере
```

---

## ✅ Проверка что Работает

```bash
# В браузере откройте:
https://mapped-web-prod.railway.app

# Или в терминале:
curl https://mapped-gateway-prod.railway.app/health
```

---

## 💰 Ожидаемая Стоимость

- **$0-5** в месяц (в пределах бесплатных credits)
- Если больше: примерно **$10-15/месяц**

---

## 🆘 Если что-то не работает

```bash
# Смотреть live логи
railway logs -f

# Смотреть статус сервисов
railway status

# Перезагрузить все
railway down
railway up
```

---

## 📚 Полный Гайд

Смотрите `RAILWAY_DEPLOYMENT_GUIDE.md` для подробных инструкций!
