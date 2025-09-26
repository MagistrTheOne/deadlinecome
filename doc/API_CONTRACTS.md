# DeadLine - API Контракты и Аудит

## Обзор
Проект имеет более 70 API эндпоинтов, разделенных на категории: аутентификация, задачи, проекты, AI-функции, аналитика, интеграции и другие.

## Категории API

### 🔐 Аутентификация (Auth)
- **Эндпоинт:** `/api/auth/[...auth]`
- **Методы:** GET, POST
- **Аутентификация:** Better Auth
- **Валидация:** Отсутствует (делегировано Better Auth)
- **Статусы:** 200, 401, 500

### 📋 Задачи (Tasks)
- **Эндпоинт:** `/api/tasks`
- **Методы:** GET, POST, PATCH, DELETE
- **Аутентификация:** ❌ НЕТ (критическая проблема!)
- **Валидация:** Отсутствует
- **Хранение:** Mock данные в памяти (критическая проблема!)
- **Статусы:** 200, 400, 404, 500

#### Проблемы:
```typescript
// Критическая проблема: нет аутентификации
export async function GET(request: NextRequest) {
  // Нет проверки session!
  return NextResponse.json(demoTasks);
}
```

### 🏗️ Проекты (Projects)
- **Эндпоинт:** `/api/projects`
- **Методы:** GET, POST
- **Аутентификация:** ✅ Присутствует
- **Валидация:** Отсутствует
- **Хранение:** Реальная БД через ProjectService
- **Статусы:** 200, 400, 401, 500

### 🤖 AI Функции (26 эндпоинтов)

#### AI Create Task (`/api/ai/create-task`)
- **Методы:** POST
- **Аутентификация:** ✅ Присутствует
- **Валидация:** Базовая (title, projectId)
- **AI Интеграция:** ✅ Vasily AI для оценки задач
- **БД:** ✅ Реальная запись в issue таблицу
- **Статусы:** 200, 400, 401, 404, 500

#### AI Ask (`/api/ai/ask`)
- **Методы:** POST
- **Аутентификация:** ✅ Присутствует
- **Валидация:** Базовая (query)
- **AI Интеграция:** ✅ Vasily + контекст задач
- **БД:** ✅ Запись в aiConversation
- **Статусы:** 200, 400, 401, 500

#### AI Code Generation (`/api/ai/code-generation`)
- **Методы:** POST
- **Аутентификация:** ❌ НЕТ
- **Валидация:** Базовая через action
- **AI Интеграция:** ✅ AICodeGenerationInstance
- **Статусы:** 200, 400, 500

#### AI Auto Documentation (`/api/ai/auto-documentation`)
- **Методы:** GET, POST
- **Аутентификация:** ❌ НЕТ
- **Валидация:** Отсутствует
- **AI Интеграция:** ✅ AutoDocumentation
- **Статусы:** 200, 500

### 📊 Аналитика (Analytics)
- **Эндпоинты:** `/api/analytics/*` (5 эндпоинтов)
- **Методы:** GET
- **Аутентификация:** ❌ НЕТ (критическая проблема!)
- **Валидация:** Отсутствует
- **БД:** Запросы к метрикам
- **Статусы:** 200, 500

### 🔌 Интеграции (Integrations)
- **GitHub:** `/api/integrations/github/*` (4 эндпоинта)
- **Jira:** `/api/integrations/jira/sync`
- **Slack:** `/api/integrations/slack/*` (3 эндпоинта)
- **Аутентификация:** ❌ НЕТ
- **Валидация:** Отсутствует

### 🎯 Доски (Boards)
- **Эндпоинты:** `/api/boards/*` (10+ эндпоинтов)
- **Методы:** GET, POST, PUT, DELETE
- **Аутентификация:** ✅ В некоторых роутах
- **Валидация:** Частично присутствует
- **БД:** ✅ Реальная работа с board таблицами

### ⚡ Real-time и WebSocket
- **Эндпоинты:** `/api/realtime/*`, `/api/websocket/*`, `/api/ws`
- **Методы:** GET, POST
- **Аутентификация:** ❌ НЕТ
- **Валидация:** Отсутствует
- **WebSocket:** Socket.io интеграция

## Критические проблемы безопасности

### 🔴 Высокий приоритет

#### 1. Отсутствие аутентификации в публичных API
**Затронутые роуты:** ~40+ эндпоинтов
```typescript
// Проблемные роуты:
- /api/tasks (CRUD без auth)
- /api/analytics/* (чтение метрик без auth)
- /api/ai/* (большинство AI роутов)
- /api/integrations/* (все интеграции)
- /api/realtime/* (real-time данные)
```

#### 2. Отсутствие валидации входных данных
**Проблема:** Большинство роутов не используют Zod или другую валидацию
```typescript
// Пример проблемы:
const { query, workspaceId, projectId } = await request.json();
// Нет проверки типов, обязательных полей, sanitization
```

#### 3. Mock данные вместо реальной БД
**Затронутые роуты:**
- `/api/tasks` - жестко закодированные демо данные
- Возможно другие роуты с demo/mock данными

### 🟡 Средний приоритет

#### 4. Несогласованная обработка ошибок
**Проблема:** Разные форматы ответов об ошибках
```typescript
// Разные форматы:
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
return NextResponse.json({ error: "Internal server error" }, { status: 500 });
// vs
return ValidationService.createErrorResponse('Failed to fetch', 500);
```

#### 5. Отсутствие rate limiting
**Проблема:** Нет защиты от abuse в публичных API

#### 6. Небезопасное использование JSON.parse
```typescript
// В /api/ai/create-task/route.ts:95
const aiEstimation = JSON.parse(aiResponse);
// Нет проверки валидности JSON или обработки ошибок
```

## Рекомендации по исправлению

### Немедленно (Critical)
1. **Добавить аутентификацию ко всем API роутам**
2. **Убрать mock данные из /api/tasks**
3. **Добавить Zod валидацию для всех входных данных**

### В ближайшее время (High)
1. **Стандартизировать обработку ошибок**
2. **Добавить rate limiting**
3. **Валидировать JSON.parse с try/catch**

### Планирование (Medium)
1. **Добавить API документацию (OpenAPI/Swagger)**
2. **Внедрить API versioning**
3. **Добавить comprehensive logging**

## Структура контрактов API

### Стандартный контракт ответа (рекомендуемый)
```typescript
// Success
{
  data: T,
  meta?: {
    pagination?: { page: number, limit: number, total: number },
    timestamp: string
  }
}

// Error
{
  error: {
    code: string,
    message: string,
    details?: any
  },
  meta: { timestamp: string }
}
```

### Текущие паттерны аутентификации
```typescript
// Правильный паттерн:
const session = await auth.api.getSession({ headers: request.headers });
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Неправильный паттерн (отсутствует):
export async function GET(request: NextRequest) {
  // Нет проверки сессии!
}
```

## Метрики качества API

- **Общее количество роутов:** 70+
- **Роутов без аутентификации:** ~40 (57%)
- **Роутов с валидацией:** ~10 (14%)
- **Роутов с mock данными:** 1+ (подтверждено)
- **Критические проблемы:** 3
- **Высокий приоритет:** 3
- **Средний приоритет:** 3

## Следующие шаги

1. Приоритизировать исправление критических проблем безопасности
2. Создать план миграции с mock данных на реальную БД
3. Внедрить Zod схемы для всех API контрактов
4. Добавить comprehensive API testing
5. Создать OpenAPI документацию
