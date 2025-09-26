import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function fixDatabase() {
  console.log('🔧 Исправляем схему базы данных...');
  
  try {
    // Проверяем и добавляем недостающие колонки в таблицу user
    console.log('📝 Проверяем таблицу user...');
    
    const userColumns = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user' AND table_schema = 'public'
    `;
    
    const existingColumns = userColumns.map((row: any) => row.column_name);
    console.log('Существующие колонки:', existingColumns);
    
    // Добавляем недостающие колонки
    const missingColumns = [
      { name: 'username', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" text' },
      { name: 'status', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "status" text DEFAULT \'OFFLINE\'' },
      { name: 'status_message', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "status_message" text' },
      { name: 'bio', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "bio" text' },
      { name: 'location', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "location" text' },
      { name: 'website', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "website" text' },
      { name: 'timezone', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" text DEFAULT \'UTC\'' },
      { name: 'language', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "language" text DEFAULT \'ru\'' },
      { name: 'theme', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "theme" text DEFAULT \'DARK\'' },
      { name: 'notifications', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "notifications" text' },
      { name: 'preferences', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "preferences" text' },
      { name: 'last_active', sql: 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "last_active" timestamp DEFAULT now()' }
    ];
    
    for (const column of missingColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`➕ Добавляем колонку: ${column.name}`);
        await client.unsafe(column.sql);
      } else {
        console.log(`✅ Колонка ${column.name} уже существует`);
      }
    }
    
    // Создаем уникальный индекс для username если его нет
    console.log('🔍 Проверяем индексы...');
    const indexes = await client`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'user' AND indexname = 'user_username_unique'
    `;
    
    if (indexes.length === 0) {
      console.log('➕ Создаем уникальный индекс для username');
      await client.unsafe('CREATE UNIQUE INDEX IF NOT EXISTS "user_username_unique" ON "user" ("username")');
    } else {
      console.log('✅ Индекс user_username_unique уже существует');
    }
    
    // Обновляем существующих пользователей
    console.log('👥 Обновляем существующих пользователей...');
    await client`
      UPDATE "user" SET 
        "username" = COALESCE("username", split_part("email", '@', 1)),
        "status" = COALESCE("status", 'ONLINE'),
        "status_message" = COALESCE("status_message", 'Готов к работе!'),
        "timezone" = COALESCE("timezone", 'Europe/Moscow'),
        "language" = COALESCE("language", 'ru'),
        "theme" = COALESCE("theme", 'DARK'),
        "last_active" = COALESCE("last_active", now())
      WHERE "username" IS NULL OR "status" IS NULL
    `;
    
    // Создаем индексы для оптимизации
    console.log('⚡ Создаем индексы для оптимизации...');
    const optimizationIndexes = [
      'CREATE INDEX IF NOT EXISTS "idx_user_email" ON "user" ("email")',
      'CREATE INDEX IF NOT EXISTS "idx_user_status" ON "user" ("status")',
      'CREATE INDEX IF NOT EXISTS "idx_user_last_active" ON "user" ("last_active")',
      'CREATE INDEX IF NOT EXISTS "idx_workspace_owner" ON "workspace" ("owner_id")',
      'CREATE INDEX IF NOT EXISTS "idx_project_workspace" ON "project" ("workspace_id")',
      'CREATE INDEX IF NOT EXISTS "idx_issue_project" ON "issue" ("project_id")',
      'CREATE INDEX IF NOT EXISTS "idx_issue_assignee" ON "issue" ("assignee_id")',
      'CREATE INDEX IF NOT EXISTS "idx_issue_status" ON "issue" ("status")'
    ];
    
    for (const indexSql of optimizationIndexes) {
      await client.unsafe(indexSql);
    }
    
    console.log('✅ База данных успешно исправлена!');
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении БД:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Запускаем исправление
fixDatabase()
  .then(() => {
    console.log('🎉 Исправление завершено успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
