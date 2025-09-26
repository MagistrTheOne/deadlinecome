-- Добавляем недостающие поля в таблицу user
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'OFFLINE';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "status_message" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "bio" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "location" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "website" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" text DEFAULT 'UTC';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "language" text DEFAULT 'ru';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "theme" text DEFAULT 'DARK';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "notifications" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "preferences" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "last_active" timestamp DEFAULT now();

-- Создаем уникальный индекс для username
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_unique" ON "user" ("username");

-- Обновляем существующих пользователей
UPDATE "user" SET 
  "username" = split_part("email", '@', 1),
  "status" = 'ONLINE',
  "status_message" = 'Готов к работе!',
  "timezone" = 'Europe/Moscow',
  "language" = 'ru',
  "theme" = 'DARK',
  "last_active" = now()
WHERE "username" IS NULL;
