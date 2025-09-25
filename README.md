# DeadLine - Project Management Tool

Полнофункциональное веб-приложение для управления проектами, вдохновленное Jira. Построено на Next.js 15 с Better Auth и Neon PostgreSQL.

**Автор**: MagistrTheOne  
**Дата разработки**: 2025  
**Контакты**: [Telegram](https://t.me/MagistrTheOne) | [GitHub](https://github.com/MagistrTheOne) | [LinkedIn](https://linkedin.com/in/magistrtheone)

## 🚀 Технологический стек

- **Frontend**: Next.js 15 (App Router)
- **База данных**: Neon PostgreSQL
- **Аутентификация**: Better Auth
- **ORM**: Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **TypeScript**: Строгая типизация

## 📋 Возможности

- ✅ Полная аутентификация (Email/Password + Google OAuth)
- ✅ Защищенные и публичные роуты
- ✅ Управление пользователями
- ✅ Рабочие пространства и проекты
- ✅ **AI-ассистент Василий** на базе Sber GigaChat API
- ✅ Автоматический fallback на OpenAI GPT-4o-mini
- ✅ **Система эмоций и настроений** Василия (8 состояний)
- ✅ **Голосовые команды** с распознаванием и синтезом речи
- ✅ **Плавающая кнопка** Василия в правом нижнем углу
- ✅ **Адаптивный дизайн** для всех устройств
- ✅ Современный UI с glass-morphism дизайном
- ✅ Адаптивный дизайн
- ✅ TypeScript везде

## 🛠️ Установка и запуск

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd deadline
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.local` и настройте переменные:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/deadline

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
BETTER_AUTH_URL=http://localhost:3000

# Social Providers (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Настройка базы данных

```bash
# Генерация миграций
npm run db:generate

# Применение миграций и создание тестовых данных
npm run db:setup
```

### 4. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## 🔐 Тестовые данные

После выполнения `npm run db:setup` будет создан тестовый пользователь:

- **Email**: test@example.com
- **Пароль**: password123

## 📁 Структура проекта

```
src/
├── app/
│   ├── (auth)/          # Страницы аутентификации
│   ├── dashboard/       # Панель управления
│   ├── profile/         # Профиль пользователя
│   ├── api/            # API routes
│   └── layout.tsx      # Корневой layout
├── components/
│   ├── auth/           # Компоненты аутентификации
│   ├── ui/             # UI компоненты (shadcn/ui)
│   └── common/         # Общие компоненты
├── lib/
│   ├── auth.ts         # Конфигурация Better Auth
│   ├── auth-client.ts  # Клиент Better Auth
│   ├── auth-provider.tsx # Провайдер аутентификации
│   ├── db/             # База данных и схема
│   └── utils.ts        # Утилиты
└── data/
    └── repositories/   # Репозитории для работы с БД
```

## 🔧 Доступные скрипты

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для продакшена
- `npm run start` - Запуск продакшен сборки
- `npm run lint` - Проверка кода линтером
- `npm run test` - Запуск тестов
- `npm run db:generate` - Генерация миграций БД
- `npm run db:setup` - Настройка БД с тестовыми данными

## 🌐 API Endpoints

### Аутентификация
- `POST /api/auth/sign-in` - Вход в систему
- `POST /api/auth/sign-up` - Регистрация
- `POST /api/auth/sign-out` - Выход из системы

### Пользователи
- `GET /api/users` - Получение списка пользователей
- `PUT /api/users` - Обновление профиля пользователя

## 🛡️ Безопасность

- Все API routes защищены аутентификацией
- Middleware проверяет сессии для защищенных роутов
- Валидация данных с помощью Zod
- Безопасное хранение паролей с Better Auth

## 🎨 UI/UX

- Современный дизайн с glass-morphism эффектами
- Адаптивная верстка для всех устройств
- Темная тема по умолчанию
- Плавные анимации и переходы
- Интуитивно понятный интерфейс

## 📱 Поддерживаемые браузеры

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы, создайте Issue в репозитории.

---

**Создано с ❤️ для эффективного управления проектами**