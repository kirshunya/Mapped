# Railway: Полная архитектура ПРАВИЛЬНО

## ГЛАВНОЕ: Railway Dashboard основной экран

Откройте: https://dashboard.railway.app

Вы должны увидеть:
```
┌─────────────────────────────┐
│ Ваш проект: Mapped          │
├─────────────────────────────┤
│ ☑ gateway (Online)          │
│ (больше ничего не видно)    │
└─────────────────────────────┘
```

---

## ПЛАН

Railway из docker-compose поднял только **gateway** потому что:
1. Docker-compose на Railway работает по-другому
2. Нужно создавать каждый сервис **отдельно**

**Что делать:**

Создадим сервисы **по порядку важности**:

1. **PostgreSQL** (БД) - нужна первой
2. **Auth Service** (микросервис) - самый важный
3. **Gateway обновим** - чтобы работал только с auth-service
4. **Остальное** (optional) - потом если будет время

---

## ШАГ 1: Создать PostgreSQL

### На Railway Dashboard:

1. Нажмите **"+ New"** (синяя кнопка справа)
2. Выберите **"Database"**
3. Выберите **"PostgreSQL"**
4. Railway создаст БД автоматически

### После создания:

1. Нажмите на созданный сервис **"postgres"**
2. Скопируйте **Internal Database URL** (или CONNECTION STRING)
   - Должно быть что-то типа: 
   ```
   postgresql://root:password@localhost:5432/railway
   ```

**СОХРАНИТЕ этот URL!**

---

## ШАГ 2: Создать Auth Service из GitHub

### На Railway Dashboard:

1. Нажмите **"+ New"**
2. Выберите **"GitHub Repo"**
3. Авторизуйтесь если нужно
4. Выберите **"kirshunya/Mapped"**
5. Нажмите **"Add Service"**

### Конфигурация:

Railway спросит:
- **Root Directory**: `services/auth-service`
- Нажмите **Deploy**

### После Deploy:

1. Откройте сервис **"auth-service"**
2. Перейдите в **Variables**
3. Добавьте переменные:

```env
DATABASE_URL=postgresql://root:PASSWORD@postgres-service-name:5432/railway
JWT_SECRET=mapsocial-super-secret-key-2024
JWT_EXPIRY=720h
```

**Где взять правильный DATABASE_URL?**

В postgres сервисе есть вкладка "Connect":
- Копируйте **"Database URL"** оттуда
- Вставьте в `DATABASE_URL=...`

4. Нажмите **Deploy**

---

## ШАГ 3: Обновить Gateway

### На Railway Dashboard:

1. Откройте **"gateway"**
2. Перейдите в **Variables**
3. Добавьте:

```env
AUTH_SERVICE_URL=http://auth-service:8081
GIN_MODE=release
```

(auth-service будет доступна по имени `auth-service` внутри Railway network)

4. Нажмите **Deploy**

---

## ШАГ 4: Проверить работает ли

### Откройте URL gateway в браузере

1. На сервисе **gateway** найдите **Public URL**
   - Должно быть что-то типа: `https://harmonic-reflection-prod-xxxx.railway.app`

2. Откройте в браузере

3. Попробуйте **зарегистрироваться**

4. Если работает ✅ - готово!

5. Если ошибка ❌ - проверьте логи:
   - Сервис gateway → Logs
   - Ищите ошибки про `auth-service`

---

## Если не работает

### Проверьте:

1. **PostgreSQL запущена?**
   - Dashboard → postgres → должен быть зелёный статус "Running"

2. **Auth Service запущена?**
   - Dashboard → auth-service → должен быть зелёный статус "Running"

3. **Переменные окружения правильные?**
   - auth-service → Variables → DATABASE_URL скопирована правильно?

4. **Логи сервисов**
   - Откройте Logs каждого сервиса
   - Ищите ERROR или Connection refused

---

## Если всё работает 🎉

### Что дальше?

Если регистрация работает - архитектура **минимально рабочая**.

Потом можно добавить:
- Places Service
- Posts Service
- Chat Service
- И т.д.

Но для начала главное чтобы **auth-service работал**.

---

## Быстрая чек-лист

- [ ] PostgreSQL создана и Running
- [ ] Auth Service создана и Running  
- [ ] Gateway имеет переменную AUTH_SERVICE_URL=http://auth-service:8081
- [ ] Все сервисы нажал Deploy после изменений
- [ ] Открыл URL gateway в браузере
- [ ] Попробовал зарегистрироваться

Когда сделаете - скажите что получилось! 🚀
