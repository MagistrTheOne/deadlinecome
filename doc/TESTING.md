# 🧪 Тестирование проекта Deadline

## Обзор

Проект Deadline включает комплексную систему тестирования для обеспечения качества и надежности кода.

## 🚀 Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Запуск тестов
```bash
# Запуск всех тестов
npm test

# Запуск тестов в режиме наблюдения
npm run test:watch

# Запуск тестов с покрытием
npm run test:coverage
```

## 📁 Структура тестов

```
src/tests/
├── setup.ts                    # Настройка тестовой среды
├── components/                 # Тесты компонентов
│   ├── user-profile.test.tsx
│   └── ai-code-review.test.tsx
└── api/                       # Тесты API
    ├── user-profile.test.ts
    └── code-review.test.ts
```

## 🧪 Типы тестов

### 1. Компонентные тесты
- **UserProfile** - тестирование пользовательского профиля
- **AICodeReviewDashboard** - тестирование AI code review

### 2. API тесты
- **User Profile API** - тестирование эндпоинтов профиля
- **Code Review API** - тестирование эндпоинтов code review

## 📊 Покрытие кода

Минимальные требования к покрытию:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🔧 Настройка тестовой среды

### Jest конфигурация
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**',
  ],
}
```

### Моки и заглушки
- **fetch** - мокирование API вызовов
- **IntersectionObserver** - для виртуализации
- **ResizeObserver** - для адаптивности
- **crypto.randomUUID** - для генерации ID

## 🎯 Примеры тестов

### Тест компонента
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from '@/components/ui/user-profile';

describe('UserProfile Component', () => {
  it('renders user profile data after loading', async () => {
    const mockProfile = {
      id: "user-1",
      name: "Test User",
      // ... остальные данные
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    });

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });
});
```

### Тест API
```typescript
import { GET } from '@/app/api/user/profile/route';

describe('/api/user/profile', () => {
  it('returns user profile data', async () => {
    const request = new NextRequest('http://localhost:3000/api/user/profile?userId=user-1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id', 'user-1');
  });
});
```

## 🚨 Обработка ошибок

### API ошибки
```typescript
it('handles API errors gracefully', async () => {
  global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));

  render(<UserProfile />);

  await waitFor(() => {
    // Должен использовать fallback данные
    expect(screen.getByText('MagistrTheOne')).toBeInTheDocument();
  });
});
```

### Валидация данных
```typescript
it('validates required fields', async () => {
  const request = new NextRequest('http://localhost:3000/api/user/profile');
  const response = await GET(request);
  const data = await response.json();

  expect(response.status).toBe(400);
  expect(data).toHaveProperty('error', 'UserId parameter is required');
});
```

## 🔍 Отладка тестов

### Полезные команды
```bash
# Запуск конкретного теста
npm test -- --testNamePattern="UserProfile"

# Запуск тестов с подробным выводом
npm test -- --verbose

# Запуск тестов в определенной папке
npm test -- src/tests/components/
```

### Полезные утилиты
- `screen.debug()` - вывод DOM в консоль
- `waitFor()` - ожидание асинхронных операций
- `fireEvent` - симуляция пользовательских действий

## 📈 Метрики качества

### Покрытие кода
```bash
npm run test:coverage
```

### Производительность тестов
- Время выполнения: < 30 секунд
- Параллельное выполнение: включено
- Кэширование: включено

## 🛠️ Интеграция с CI/CD

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## 📚 Дополнительные ресурсы

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Next.js Testing](https://nextjs.org/docs/testing)

## 🎉 Заключение

Система тестирования Deadline обеспечивает:
- ✅ **Надежность** - все критические компоненты покрыты тестами
- ✅ **Качество** - минимальное покрытие 70%
- ✅ **Производительность** - оптимизированные тесты
- ✅ **Поддерживаемость** - четкая структура и документация
