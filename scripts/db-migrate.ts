#!/usr/bin/env tsx

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as dotenv from "dotenv";

// Загружаем переменные окружения
dotenv.config();

async function runMigrations() {
  console.log("🚀 Начинаем миграцию базы данных...");
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL не найден в переменных окружения");
  }

  // Создаем подключение к базе данных
  const client = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    max: 1, // Для миграций используем только одно подключение
  });

  const db = drizzle(client);

  try {
    console.log("📦 Применяем миграции...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Миграции успешно применены!");
  } catch (error) {
    console.error("❌ Ошибка при применении миграций:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Запускаем миграции
runMigrations()
  .then(() => {
    console.log("🎉 Миграции завершены успешно!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Критическая ошибка:", error);
    process.exit(1);
  });
