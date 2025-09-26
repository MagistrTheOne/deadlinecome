# 🐳 Docker Setup для DeadLine

## 🚀 Быстрый старт

### 1. Клонирование и настройка
```bash
git clone <repository-url>
cd deadline
cp .env.example .env
# Настройте переменные окружения в .env
```

### 2. Запуск в режиме разработки
```bash
# Запуск всех сервисов
docker-compose -f docker-compose.dev.yml up -d

# Просмотр логов
docker-compose -f docker-compose.dev.yml logs -f

# Остановка
docker-compose -f docker-compose.dev.yml down
```

### 3. Запуск в продакшене
```bash
# Сборка и запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

## 📋 Сервисы

### Основные сервисы:
- **app** (порт 3000) - DeadLine приложение
- **db** (порт 5432) - PostgreSQL база данных
- **redis** (порт 6379) - Redis кэш
- **nginx** (порт 80) - Reverse proxy

### Мониторинг:
- **prometheus** (порт 9090) - Метрики
- **grafana** (порт 3001) - Дашборды
- **drizzle-studio** (порт 4983) - Управление БД (только dev)

## 🔧 Настройка

### Переменные окружения (.env):
```env
# Database
DATABASE_URL=postgresql://postgres:password@db:5432/deadline

# Redis
REDIS_URL=redis://redis:6379

# Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# AI
GIGACHAT_API_KEY=your-gigachat-key
OPENAI_API_KEY=your-openai-key

# Monitoring
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
```

### Nginx конфигурация:
- Rate limiting для API endpoints
- Security headers
- Proxy для приложения
- Кэширование статических файлов

## 📊 Мониторинг

### Prometheus (http://localhost:9090):
- Метрики приложения
- Метрики базы данных
- Метрики Redis
- Системные метрики

### Grafana (http://localhost:3001):
- Логин: admin
- Пароль: admin
- Дашборды DeadLine
- Алерты и уведомления

## 🛠️ Разработка

### Hot Reload:
```bash
# Запуск в режиме разработки с hot reload
docker-compose -f docker-compose.dev.yml up -d

# Просмотр логов приложения
docker-compose -f docker-compose.dev.yml logs -f app
```

### Drizzle Studio:
- URL: http://localhost:4983
- Управление базой данных
- Просмотр схемы
- Выполнение запросов

### Тестирование:
```bash
# Запуск тестов
docker-compose -f docker-compose.dev.yml exec app npm test

# Запуск тестов с покрытием
docker-compose -f docker-compose.dev.yml exec app npm run test:coverage
```

## 🔍 Отладка

### Просмотр логов:
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f redis
```

### Подключение к контейнерам:
```bash
# Приложение
docker-compose exec app sh

# База данных
docker-compose exec db psql -U postgres -d deadline

# Redis
docker-compose exec redis redis-cli
```

### Проверка здоровья:
```bash
# Health check приложения
curl http://localhost:3000/api/health

# Метрики Prometheus
curl http://localhost:9090/metrics

# Статус Grafana
curl http://localhost:3001/api/health
```

## 🚀 Продакшен

### Безопасность:
- Все пароли в переменных окружения
- Nginx с rate limiting
- Security headers
- HTTPS (настроить SSL сертификаты)

### Масштабирование:
- Горизонтальное масштабирование приложения
- Connection pooling для БД
- Redis кластер для кэширования
- Load balancer для высокой доступности

### Backup:
```bash
# Backup базы данных
docker-compose exec db pg_dump -U postgres deadline > backup.sql

# Restore базы данных
docker-compose exec -T db psql -U postgres deadline < backup.sql
```

## 📈 Мониторинг в продакшене

### Алерты:
- Высокое использование CPU/Memory
- Медленные запросы к БД
- Ошибки в приложении
- Недоступность сервисов

### Дашборды:
- Обзор системы
- Производительность API
- Использование ресурсов
- Пользовательская активность

## 🔧 Troubleshooting

### Частые проблемы:

1. **Порт уже используется:**
   ```bash
   # Проверить какие процессы используют порт
   lsof -i :3000
   # Остановить процесс
   kill -9 <PID>
   ```

2. **База данных не подключается:**
   ```bash
   # Проверить статус БД
   docker-compose ps db
   # Перезапустить БД
   docker-compose restart db
   ```

3. **Redis недоступен:**
   ```bash
   # Проверить Redis
   docker-compose exec redis redis-cli ping
   # Перезапустить Redis
   docker-compose restart redis
   ```

4. **Приложение не запускается:**
   ```bash
   # Проверить логи
   docker-compose logs app
   # Пересобрать образ
   docker-compose build app
   ```

## 📚 Полезные команды

```bash
# Очистка всех контейнеров и volumes
docker-compose down -v
docker system prune -a

# Пересборка образов
docker-compose build --no-cache

# Просмотр использования ресурсов
docker stats

# Backup volumes
docker run --rm -v deadline_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```
