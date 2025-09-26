# Публичные API маршруты DeadLine

Эти маршруты НЕ требуют аутентификации и доступны без авторизации.

## Аутентификация
- `GET|POST /api/auth/[...auth]` - Better Auth обработчик для входа/регистрации

## Мониторинг и здоровье
- `GET /api/health` - Проверка здоровья приложения
- `GET /api/metrics` - Метрики производительности и мониторинга

## Вебхуки интеграций
- `POST /api/integrations/github/webhook` - GitHub webhook для синхронизации
- `POST /api/integrations/slack/commands` - Slack команды (если применимо)
- `POST /api/integrations/github/webhook` - GitHub webhook

## Все остальные API маршруты требуют аутентификации!

Все остальные 160+ эндпойнтов в `/api/*` требуют валидной сессии пользователя.
Без аутентификации возвращается HTTP 401 Unauthorized.
