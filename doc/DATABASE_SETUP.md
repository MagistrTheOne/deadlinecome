# 🗄️ Настройка базы данных DeadLine

## 📋 Обзор

DeadLine использует **Neon PostgreSQL** как основную базу данных с **Drizzle ORM** для управления схемой и миграциями.

## 🔧 Настройка

### 1. Переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_Jw9lEFOT5rGf@ep-falling-term-aeli30gd-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# GigaChat API Configuration
GIGACHAT_AUTH_KEY=MDE5OTgyNGItNGMxZS03ZWYxLWI0MjMtYmIzMTU2ZGRlY2VlOmQyMWFjYjkzLWQzMTctNDNjMC04N2FlLWFkMzEyNmIwYjBiZA==

# Better Auth Configuration
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
```

### 2. Установка зависимостей

```bash
npm install
```

## 🚀 Команды для работы с БД

### Генерация миграций
```bash
# Генерирует миграцию на основе изменений в схеме
npm run db:generate
```

### Применение миграций
```bash
# Применяет все миграции к базе данных
npm run db:migrate
```

### Быстрое обновление схемы (без миграций)
```bash
# Прямо обновляет схему в базе данных (для разработки)
npm run db:push
```

### Генерация и применение миграции одной командой
```bash
# Генерирует и сразу применяет миграцию
tsx scripts/generate-migration.ts
```

### Просмотр базы данных
```bash
# Открывает Drizzle Studio для просмотра данных
npm run db:studio
```

## 📊 Структура базы данных

### Основные таблицы:

#### 🔐 Аутентификация (Better Auth)
- `user` - пользователи
- `session` - сессии пользователей
- `account` - аккаунты (OAuth, email/password)
- `verification` - верификация email

#### 🏢 Рабочие пространства
- `workspace` - рабочие пространства
- `workspace_member` - участники рабочих пространств

#### 📋 Проекты и задачи
- `project` - проекты
- `issue` - задачи/баги/истории
- `ai_conversation` - история разговоров с AI
- `ai_task_suggestion` - AI предложения задач

## 🔄 Workflow разработки

### 1. Изменение схемы
```typescript
// В src/lib/db/schema.ts
export const newTable = pgTable("new_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  // ... другие поля
});
```

### 2. Генерация миграции
```bash
npm run db:generate
```

### 3. Применение миграции
```bash
npm run db:migrate
```

### 4. Проверка в Drizzle Studio
```bash
npm run db:studio
```

## 🛠️ Полезные команды

### Сброс базы данных (ОСТОРОЖНО!)
```bash
# Удаляет все таблицы и данные
npm run db:push -- --force
```

### Проверка подключения
```bash
# Тестирует подключение к базе данных
tsx scripts/test-connection.ts
```

### Создание бэкапа
```bash
# Создает дамп базы данных
pg_dump $DATABASE_URL > backup.sql
```

## 🔍 Мониторинг

### Neon Dashboard
- Перейдите в [Neon Console](https://console.neon.tech)
- Выберите ваш проект
- Просматривайте метрики, логи, подключения

### Drizzle Studio
- Запустите `npm run db:studio`
- Откройте http://localhost:4983
- Просматривайте и редактируйте данные

## 🚨 Troubleshooting

### Ошибка подключения
```bash
# Проверьте переменные окружения
echo $DATABASE_URL

# Проверьте доступность базы данных
ping ep-falling-term-aeli30gd-pooler.c-2.us-east-2.aws.neon.tech
```

### Ошибка SSL
```bash
# Убедитесь, что в URL есть sslmode=require
DATABASE_URL=postgresql://...?sslmode=require&channel_binding=require
```

### Ошибка миграций
```bash
# Проверьте статус миграций
npm run db:studio

# Принудительно обновите схему
npm run db:push
```

## 📈 Производительность

### Настройки подключения
```typescript
// В src/lib/db/index.ts
const client = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 20,              // Максимум подключений
  idle_timeout: 20,     // Таймаут простоя
  connect_timeout: 10,  // Таймаут подключения
});
```

### Индексы
Добавьте индексы для часто используемых запросов:
```typescript
export const issue = pgTable("issue", {
  // ... поля
}, (table) => ({
  projectIdIdx: index("project_id_idx").on(table.projectId),
  assigneeIdIdx: index("assignee_id_idx").on(table.assigneeId),
  statusIdx: index("status_idx").on(table.status),
}));
```

## 🎯 Готово!

База данных настроена и готова к работе! 🚀

- ✅ Neon PostgreSQL подключена
- ✅ Drizzle ORM настроен
- ✅ Миграции работают
- ✅ Схема создана
- ✅ AI таблицы готовы
