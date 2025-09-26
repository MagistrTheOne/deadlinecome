# Используем официальный Node.js образ
FROM node:18-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production && npm cache clean --force

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем исходный код
COPY . .

# Создаем директорию для логов
RUN mkdir -p logs && chown -R nextjs:nodejs logs

# Меняем владельца файлов
RUN chown -R nextjs:nodejs /app
USER nextjs

# Собираем приложение
RUN npm run build

# Экспонируем порт
EXPOSE 3000

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Команда запуска
CMD ["npm", "start"]
