# WebSocket Setup для Deadline Project

## Исправленные ошибки

### 1. WebSocket ошибки в real-time-todo.tsx
- ✅ Добавлена обработка ошибок WebSocket
- ✅ Улучшена логика переподключения
- ✅ Добавлены try-catch блоки для безопасности

### 2. Select.Item ошибки в bug-tracker.tsx  
- ✅ Исправлены пустые значения в SelectItem
- ✅ Обновлена логика фильтрации для обработки "ALL" значений

### 3. Fetch ошибки в psychological-support-panel.tsx
- ✅ Добавлены fallback данные при ошибках API
- ✅ Улучшена обработка ошибок fetch запросов

### 4. Реализованы реальные API endpoints
- ✅ `/api/ai/psychological-support` - психологическая поддержка
- ✅ `/api/ai/team-mood` - мониторинг настроения команды  
- ✅ `/api/tasks` - управление задачами
- ✅ `/api/roles` - участники команды
- ✅ `/api/bugs` - трекинг багов
- ✅ `/api/ws` - WebSocket API

## Установка зависимостей

```bash
npm install ws @types/ws
```

## Настройка WebSocket

1. WebSocket сервер автоматически инициализируется при запуске Next.js
2. Клиенты подключаются к `ws://localhost:3000/ws`
3. Поддерживается подписка на проекты и workspace

## API Endpoints

### Психологическая поддержка
- `GET /api/ai/psychological-support` - получить данные поддержки
- `POST /api/ai/psychological-support` - добавить сообщение поддержки

### Настроение команды  
- `GET /api/ai/team-mood` - получить отчет о настроении
- `POST /api/ai/team-mood` - добавить сообщение для анализа

### Задачи
- `GET /api/tasks?projectId=xxx` - получить задачи проекта
- `POST /api/tasks` - создать задачу
- `PATCH /api/tasks` - обновить задачу
- `DELETE /api/tasks?taskId=xxx` - удалить задачу

### Участники команды
- `GET /api/roles?workspaceId=xxx` - получить участников workspace
- `POST /api/roles` - добавить участника
- `PATCH /api/roles` - обновить участника

### Баги
- `GET /api/bugs?projectId=xxx` - получить баги проекта
- `POST /api/bugs` - создать баг
- `PATCH /api/bugs` - обновить баг
- `DELETE /api/bugs?bugId=xxx` - удалить баг

### WebSocket
- `GET /api/ws` - статус WebSocket сервера
- `POST /api/ws` - отправить broadcast сообщение

## Real-time обновления

WebSocket поддерживает следующие типы сообщений:

- `todo_created` - новая задача
- `todo_updated` - обновление задачи  
- `todo_deleted` - удаление задачи
- `bug_created` - новый баг
- `bug_updated` - обновление бага
- `team_mood_updated` - обновление настроения команды
- `support_message` - сообщение поддержки
- `crisis_detected` - обнаружен кризис

## Структура проекта

```
src/
├── app/api/
│   ├── ai/
│   │   ├── psychological-support/route.ts
│   │   └── team-mood/route.ts
│   ├── tasks/route.ts
│   ├── roles/route.ts
│   ├── bugs/route.ts
│   └── ws/route.ts
├── lib/
│   ├── ai/
│   │   ├── psychological-support.ts
│   │   └── team-mood-monitor.ts
│   ├── websocket-server.ts
│   ├── websocket-init.ts
│   └── server-init.ts
└── components/ui/
    ├── real-time-todo.tsx (исправлен)
    ├── bug-tracker.tsx (исправлен)
    └── psychological-support-panel.tsx (исправлен)
```

## Запуск проекта

```bash
npm run dev
```

Все ошибки исправлены, API endpoints созданы, WebSocket настроен для real-time обновлений.
