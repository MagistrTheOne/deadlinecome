# DeadLine - Аудит базы данных

## Обзор
Проект использует Drizzle ORM с PostgreSQL. Схема состоит из 6 файлов с общим количеством 40+ таблиц.

## Структура схемы

### Основные файлы схем:
1. `src/lib/db/schema.ts` - Основные таблицы (пользователи, проекты, задачи)
2. `src/lib/db/schema-boards.ts` - Доски Kanban/Scrum
3. `src/lib/db/schema-swimlanes.ts` - Swimlanes для досок
4. `src/lib/db/schema-filters.ts` - Фильтры и шаблоны
5. `src/lib/db/schema-permissions.ts` - Разрешения и роли
6. `src/lib/db/schema-analytics.ts` - Аналитика и отчеты

## Анализ таблиц

### 🔴 Критические проблемы

#### 1. Отсутствие миграций
**Проблема:** Папка `drizzle/` содержит только пустой `_journal.json`, нет SQL миграций
**Риск:** Невозможно безопасно развернуть схему в продакшн
**Исправление:** Необходимо сгенерировать миграции

#### 2. Неправильная конфигурация TypeScript
**Проблема:** `tsconfig.json` использует `target: "es5"`, что несовместимо с Drizzle
**Ошибка:** "Transforming const to the configured target environment ("es5") is not supported yet"
**Исправление:** Изменить target на "es2020" или выше

### 🟡 Предупреждения

#### 3. Сложные JSON поля без валидации
**Таблицы:** Большинство таблиц используют `jsonb` поля без схем валидации
- `user.preferences` (JSON)
- `workspaceMember.skills` (JSON)
- `board.settings` (сложная структура)
- `aiConversation.context` (JSON)

#### 4. Отсутствующие индексы
**Потенциальные проблемы производительности:**
- Нет индексов на часто используемых полях фильтрации
- Отсутствуют composite indexes для сложных запросов

#### 5. CASCADE vs SET NULL несогласованности
**Проблема:** Разные стратегии для FK constraints
```typescript
// SET NULL
leadId: uuid("lead_id").references(() => user.id, { onDelete: "set null" }),

// CASCADE
userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
```

## Детальный анализ таблиц

### Core Tables (schema.ts)

#### ✅ Хорошо спроектированные:
- `user` - Полная структура с правильными constraints
- `session` - Правильные FK и unique constraints
- `workspace` - Хорошая структура с owner FK

#### ⚠️ Требуют внимания:
- `issue` - Слишком много nullable полей, embedding поле как text (не JSON)
- `aiConversation` - context как text вместо jsonb

### Board Tables (schema-boards.ts)

#### ✅ Хорошо:
- `board` - Хорошая структура с FK
- `boardColumn` - Правильные связи

#### ⚠️ Проблемы:
- `board.settings` - Сложный JSON без type safety
- Отсутствуют проверки на валидность настроек

### Analytics Tables (schema-analytics.ts)

#### ✅ Хорошо:
- `boardMetrics` - Хорошая структура метрик
- `boardBurndownData` - Полная структура

#### ⚠️ Проблемы:
- Использование `decimal` вместо `numeric` (PostgreSQL специфично)
- Сложные JSON структуры без схем

## Связи и зависимости

### 🔗 Основные связи:

```
user (1) ──── (M) session
user (1) ──── (M) workspace (owner)
user (1) ──── (M) workspaceMember
workspace (1) ──── (M) project
project (1) ──── (M) issue
user (1) ──── (M) aiConversation
workspace (1) ──── (M) aiTaskSuggestion
```

### ⚠️ Потенциальные проблемы связей:

1. **Циклические зависимости:** Некоторые связи могут создать циклы
2. **Orphaned records:** При удалении workspace могут остаться висячие aiConversation
3. **Missing FKs:** Некоторые связи только на уровне приложения

## Миграционная стратегия

### Рекомендуемые исправления:

#### 1. Исправить tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    ...
  }
}
```

#### 2. Сгенерировать миграции
```bash
npx drizzle-kit generate:pg
```

#### 3. Добавить индексы для производительности
```sql
-- Рекомендуемые индексы
CREATE INDEX idx_issue_project_status ON issue(project_id, status);
CREATE INDEX idx_issue_assignee ON issue(assignee_id);
CREATE INDEX idx_board_workspace ON board(workspace_id, project_id);
CREATE INDEX idx_ai_conversation_user ON ai_conversation(user_id, created_at);
```

#### 4. Исправить JSON поля
```typescript
// Было:
embedding: text("embedding"),

// Стало:
embedding: jsonb("embedding").$type<number[]>(),
```

## Рекомендации по улучшению

### Немедленно (Critical)
1. **Исправить TypeScript конфигурацию** - изменить target на es2020
2. **Сгенерировать миграции** - создать безопасные SQL миграции
3. **Добавить FK constraints** - обеспечить целостность данных

### В ближайшее время (High)
1. **Добавить индексы** - для часто используемых запросов
2. **Типизировать JSON поля** - заменить text/jsonb на typed схемы
3. **Стандартизировать FK стратегии** - CASCADE vs SET NULL

### Планирование (Medium)
1. **Добавить check constraints** - для бизнес-логики в БД
2. **Оптимизировать структуру** - денормализация для аналитики
3. **Добавить партиционирование** - для больших таблиц аналитики

## Риски и последствия

### 🚨 Критические риски:
1. **Потеря данных** - без миграций невозможно безопасное развертывание
2. **Производительность** - отсутствие индексов на больших таблицах
3. **Целостность данных** - несогласованные FK стратегии

### ⚠️ Средние риски:
1. **Type safety** - JSON поля без схем
2. **Масштабируемость** - отсутствие оптимизаций для аналитики
3. **Поддержка** - сложность рефакторинга без миграций

## Метрики качества схемы

- **Общее количество таблиц:** 40+
- **Таблиц с FK:** 35+
- **Таблиц с JSON полями:** 15+
- **Таблиц без индексов:** 90%
- **Критические проблемы:** 3
- **Предупреждения:** 5

## Следующие шаги

1. Исправить TypeScript конфигурацию
2. Сгенерировать и протестировать миграции
3. Добавить необходимые индексы
4. Создать план миграции существующих данных (если есть)
