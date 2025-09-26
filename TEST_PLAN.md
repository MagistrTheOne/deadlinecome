# DeadLine - План тестирования и аудит покрытия

## Обзор
Проект использует Vitest с jsdom для тестирования. Настроено покрытие кода с высокими порогами (80%), но текущая кодовая база имеет минимальное покрытие.

## Текущая структура тестирования

### 🧪 Test Framework
- **Фреймворк:** Vitest
- **Environment:** jsdom (для React компонентов)
- **Setup:** `src/tests/setup.ts` с mocks для браузерных API
- **Coverage:** @vitest/coverage-v8 с порогами 80%

### 📁 Структура тестов
```
src/tests/
├── api/                    # API роуты тесты
│   ├── code-review.test.ts
│   └── user-profile.test.ts
├── components/             # React компоненты тесты
│   ├── ai-code-review.test.tsx
│   └── user-profile.test.tsx
├── setup.ts               # Глобальная настройка
└── smoke.test.tsx         # Smoke тесты
```

## Критические проблемы

### 🔴 Высокий приоритет

#### 1. Отсутствие интеграционных тестов
**Проблема:** Только unit тесты для API роутов без реальной БД
```typescript
// src/tests/api/code-review.test.ts
const request = createMockRequest('http://localhost:3000/api/code-review');
// Нет реальной БД, только mocks
```

#### 2. Mock данные вместо реального тестирования
**Проблема:** API тесты используют жестко закодированные mock данные
```typescript
// Нет интеграции с реальной базой данных
// Нет тестирования аутентификации
// Нет тестирования бизнес-логики
```

#### 3. Отсутствие E2E тестирования
**Проблема:** Нет Playwright или Cypress для end-to-end сценариев
- Нет тестирования пользовательских workflows
- Нет тестирования real-time функциональности

#### 4. Недостаточное покрытие AI интеграций
**Проблема:** AI сервисы не тестируются
- Нет тестов GigaChat/OpenAI интеграций
- Нет тестов fallback стратегий
- Нет тестов rate limiting

### 🟡 Средний приоритет

#### 5. Недостаточное покрытие компонентов
**Текущие тесты:** Только 2 компонента из 100+
**Покрытие UI:** < 2%

#### 6. Отсутствие тестирования ошибок
**Проблема:** Тесты проверяют только happy path
- Нет тестирования network failures
- Нет тестирования invalid inputs
- Нет тестирования edge cases

#### 7. Устаревшие тестовые паттерны
**Проблема:** Использование Jest API в Vitest
```typescript
// Vitest поддерживает Jest API, но лучше использовать нативный
expect(data).toHaveProperty('reviews'); // Jest style
```

## Анализ существующих тестов

### API Tests (`src/tests/api/`)

#### ✅ Хорошо:
- Правильная структура тестов (describe/it)
- Проверка HTTP статусов
- Валидация структуры ответов

#### ⚠️ Проблемы:
```typescript
// Mock request без реальной валидации
const createMockRequest = (url: string, body?: any) => {
  const request = new NextRequest(url);
  if (body) {
    request.json = jest.fn().mockResolvedValue(body); // Небезопасно
  }
  return request;
};
```

### Component Tests (`src/tests/components/`)

#### ✅ Хорошо:
- Использование React Testing Library
- Правильные assertions

#### ⚠️ Проблемы:
- Минимальное покрытие (2 из 100+ компонентов)
- Нет тестирования взаимодействия
- Нет тестирования состояний

### Smoke Tests (`src/tests/smoke.test.tsx`)

#### ✅ Хорошо:
- Быстрая проверка запуска приложения

#### ⚠️ Проблемы:
- Слишком простые (почти бесполезные)
- Нет реального тестирования функциональности

## Рекомендуемый план тестирования

### Фаза 1: Инфраструктура (1-2 недели)

#### 1. Настройка тестовой базы данных
```typescript
// Добавить test database setup
export const createTestDb = () => {
  // Временная БД для тестов
}

export const cleanupTestDb = () => {
  // Очистка после тестов
}
```

#### 2. Настройка E2E тестирования
```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### 3. Добавить API testing utilities
```typescript
// api-test-utils.ts
export const authenticatedRequest = (userId: string) => {
  // Создание authenticated request для тестов
}
```

### Фаза 2: Unit & Integration Tests (2-4 недели)

#### 4. Тесты сервисов
```typescript
// tests/services/project-service.test.ts
describe('ProjectService', () => {
  it('creates project with valid data', async () => {
    const testDb = createTestDb();
    // Реальные тесты с БД
  });
});
```

#### 5. Тесты AI интеграций
```typescript
// tests/ai/gigachat-service.test.ts
describe('GigaChatService', () => {
  it('handles API errors gracefully', async () => {
    // Mock API failure
    // Test fallback behavior
  });
});
```

#### 6. Тесты компонентов (20% покрытия)
- Формы аутентификации
- Доски Kanban
- AI чат компоненты
- Навигация

### Фаза 3: E2E Tests (2-3 недели)

#### 7. Критические пользовательские сценарии
```typescript
// e2e/auth.spec.ts
test('user can sign in and access dashboard', async ({ page }) => {
  await page.goto('/sign-in');
  // Complete flow test
});
```

#### 8. AI функциональность
```typescript
// e2e/ai-assistant.spec.ts
test('user can ask Vasily for project help', async ({ page }) => {
  // Test AI chat functionality
});
```

### Фаза 4: CI/CD Integration (1 неделя)

#### 9. GitHub Actions оптимизация
```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: npm run test:unit

- name: Run integration tests  
  run: npm run test:integration

- name: Run E2E tests
  run: npm run test:e2e
```

#### 10. Coverage reporting
```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## Метрики качества тестирования

### Текущие метрики:
- **Unit tests:** 6 файлов
- **Coverage target:** 80% (не достигнуто)
- **Test types:** Unit only
- **CI/CD:** Отсутствует

### Целевые метрики (3 месяца):
- **Unit coverage:** 80%+
- **Integration tests:** 50+ сценариев
- **E2E tests:** 20+ пользовательских flows
- **API tests:** Полное покрытие всех роутов
- **Performance tests:** Критические пути

## Риски и приоритеты

### 🚨 Критические риски:
1. **Zero integration testing** - код работает только в идеальных условиях
2. **No E2E validation** - пользовательские сценарии не тестируются
3. **Mock dependencies** - тесты не выявляют реальные проблемы

### ⚠️ Высокие риски:
1. **AI integration blind spots** - критическая функциональность не тестируется
2. **Database integration missing** - нет тестирования с реальной БД
3. **Security testing absent** - нет тестирования аутентификации/авторизации

## Следующие шаги

### Немедленно (Week 1):
1. Настроить тестовую базу данных
2. Добавить базовые интеграционные тесты для API
3. Исправить существующие mock-based тесты

### Краткосрочные (Month 1):
1. Достичь 50% unit coverage
2. Добавить E2E инфраструктуру
3. Протестировать критические AI flows

### Долгосрочные (Months 2-3):
1. Полное E2E покрытие
2. Performance testing
3. Chaos engineering для AI dependencies

## Бюджет и ресурсы

### Оценка effort:
- **Infrastructure setup:** 1 week
- **Unit tests (50% coverage):** 2 weeks
- **Integration tests:** 2 weeks
- **E2E tests:** 3 weeks
- **CI/CD optimization:** 1 week

### Команда:
- **1 QA Engineer:** Полная нагрузка на инфраструктуру и E2E
- **2 Developers:** Unit и integration тесты
- **DevOps:** CI/CD настройка

## Мониторинг прогресса

### KPIs:
- **Coverage:** 80%+ statements, branches, functions
- **Test execution time:** < 5 minutes
- **Flaky tests:** < 1%
- **CI/CD success rate:** 95%+

### Reporting:
- Weekly coverage reports
- Monthly quality metrics
- Automated alerts для failed tests
