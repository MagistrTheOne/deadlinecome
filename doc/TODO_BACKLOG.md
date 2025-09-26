# DeadLine - Backlog задач (приоритизированный)

## 🔴 Critical (Блокеры продакшена)

### Security & Auth (Приоритет 1)
1. **FIX: Отсутствие аутентификации в 40+ API роутах**
   - Файлы: `src/app/api/tasks/route.ts`, `src/app/api/analytics/*/route.ts`, etc.
   - Риск: Полный доступ к данным без авторизации
   - Сложность: High
   - Владелец: Backend Team

2. **FIX: Mock данные в /api/tasks вместо реальной БД**
   - Файл: `src/app/api/tasks/route.ts`
   - Риск: Несогласованность данных, потеря информации
   - Сложность: Medium
   - Владелец: Backend Team

3. **FIX: TypeScript target "es5" ломает Drizzle генерацию**
   - Файл: `tsconfig.json`
   - Риск: Невозможно создать миграции БД
   - Сложность: Low
   - Владелец: DevOps

### Database (Приоритет 1)
4. **FIX: Отсутствие SQL миграций**
   - Файл: `drizzle/` (пустая)
   - Риск: Невозможно развернуть схему безопасно
   - Сложность: Medium
   - Владелец: DBA

5. **FIX: Дублирование GigaChat клиентов**
   - Файлы: `gigachat.ts` vs `gigachat-service.ts`
   - Риск: Код дублирование, несогласованная конфигурация
   - Сложность: Medium
   - Владелец: AI Team

## 🟠 High (Значительные проблемы)

### API Quality (Приоритет 2)
6. **ADD: Zod валидация для всех API входных данных**
   - Файлы: Все `src/app/api/**/route.ts`
   - Риск: Invalid data processing, crashes
   - Сложность: High
   - Владелец: Backend Team

7. **ADD: Rate limiting для публичных API**
   - Файлы: Все публичные API роуты
   - Риск: Abuse, cost overrun
   - Сложность: Medium
   - Владелец: Backend Team

8. **ADD: Стандартизация обработки ошибок**
   - Файлы: Все API роуты
   - Риск: Inconsistent error responses
   - Сложность: Medium
   - Владелец: Backend Team

### AI Integration (Приоритет 2)
9. **ADD: Circuit breaker для AI API**
   - Файлы: `src/lib/ai/gigachat*.ts`
   - Риск: Cascade failure при недоступности AI
   - Сложность: Medium
   - Владелец: AI Team

10. **FIX: Небезопасный JSON парсинг в AI**
    - Файл: `src/lib/ai/gigachat-service.ts:311`
    - Риск: Crashes при malformed AI responses
    - Сложность: Low
    - Владелец: AI Team

11. **ADD: AI response caching**
    - Файлы: AI сервисы
    - Риск: Slow responses, high costs
    - Сложность: Medium
    - Владелец: AI Team

## 🟡 Medium (Качественные улучшения)

### Testing (Приоритет 3)
12. **ADD: Интеграционные тесты с реальной БД**
    - Файлы: `src/tests/api/`
    - Риск: Код работает только в идеальных условиях
    - Сложность: High
    - Владелец: QA Team

13. **ADD: E2E тестирование (Playwright)**
    - Файлы: Новая директория `e2e/`
    - Риск: Пользовательские сценарии не тестируются
    - Сложность: High
    - Владелец: QA Team

14. **ADD: Тесты AI интеграций**
    - Файлы: `src/tests/ai/`
    - Риск: AI функциональность не тестируется
    - Сложность: Medium
    - Владелец: QA Team

### Code Quality (Приоритет 3)
15. **FIX: Убрать все `as any` приведения типов**
    - Файлы: 30+ файлов с `as any`
    - Риск: Type safety потеряна
    - Сложность: Medium
    - Владелец: Frontend Team

16. **ADD: Индексы для производительности БД**
    - Файлы: Drizzle schema файлы
    - Риск: Медленные запросы на больших данных
    - Сложность: Low
    - Владелец: DBA

17. **ADD: Type safety для JSON полей**
    - Файлы: Schema файлы с `jsonb` полями
    - Риск: Runtime errors
    - Сложность: Medium
    - Владелец: Backend Team

## 🟢 Low (Оптимизации)

### Performance & UX (Приоритет 4)
18. **ADD: AI метрики и мониторинг**
    - Файлы: AI сервисы
    - Риск: Невидимость проблем с AI
    - Сложность: Medium
    - Владелец: AI Team

19. **OPTIMIZE: AI prompt management**
    - Файлы: AI сервисы
    - Риск: Hard to maintain prompts
    - Сложность: Low
    - Владелец: AI Team

20. **ADD: Component testing (50% coverage)**
    - Файлы: `src/components/`
    - Риск: UI regressions
    - Сложность: Medium
    - Владелец: Frontend Team

### Documentation (Приоритет 4)
21. **ADD: OpenAPI/Swagger документация**
    - Файлы: Все API роуты
    - Риск: API hard to use
    - Сложность: Medium
    - Владелец: Backend Team

22. **ADD: ADR для архитектурных решений**
    - Файлы: `docs/architecture/`
    - Риск: Knowledge loss
    - Сложность: Low
    - Владелец: Tech Lead

## 📊 Метрики прогресса

### Текущий статус:
- **Critical issues:** 5 (все не исправлены)
- **High priority:** 7 (все не исправлены)
- **Medium priority:** 6 (все не исправлены)
- **Low priority:** 5 (все не исправлены)

### Целевые сроки:
- **Week 1:** Исправить все Critical issues
- **Month 1:** Завершить High priority
- **Month 2:** Завершить Medium priority
- **Month 3:** Завершить Low priority

## 🎯 Definition of Done

### Для каждой задачи:
- [ ] Код написан и протестирован
- [ ] Добавлены соответствующие тесты
- [ ] Обновлена документация
- [ ] Проведен code review
- [ ] Развернуто в staging
- [ ] Проверено мониторингом

### Критерии качества:
- **Test coverage:** 80%+ для новых функций
- **Type safety:** Нет `as any` в новых кодах
- **Security:** Все API с аутентификацией
- **Performance:** < 200ms для API responses
- **Monitoring:** Метрики для всех AI calls

## 📈 Ожидаемый impact

### После исправления Critical:
- ✅ Безопасное развертывание в продакшн
- ✅ Защита данных пользователей
- ✅ Стабильная работа AI интеграций

### После полного completion:
- ✅ 80%+ test coverage
- ✅ < 1s response times для API
- ✅ 99.9% uptime для AI services
- ✅ Полная traceability через monitoring
- ✅ Zero security vulnerabilities

## 🚀 Следующие шаги

1. **Немедленно:** Создать PR для исправления Critical issues
2. **Week 1:** Начать работу над High priority задачами
3. **Ongoing:** Еженедельные status meetings для tracking прогресса
4. **Monthly:** Code quality reviews и coverage reports
