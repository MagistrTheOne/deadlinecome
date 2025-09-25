#!/usr/bin/env tsx

import { execSync } from "child_process";
import * as dotenv from "dotenv";

// Загружаем переменные окружения
dotenv.config();

async function generateMigration() {
  console.log("🚀 Генерируем новую миграцию...");
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL не найден в переменных окружения");
  }

  try {
    console.log("📦 Генерируем миграцию из схемы...");
    execSync("npx drizzle-kit generate", { stdio: "inherit" });
    console.log("✅ Миграция успешно сгенерирована!");
    
    console.log("📦 Применяем миграцию к базе данных...");
    execSync("npm run db:migrate", { stdio: "inherit" });
    console.log("✅ Миграция успешно применена!");
    
  } catch (error) {
    console.error("❌ Ошибка при генерации/применении миграции:", error);
    throw error;
  }
}

// Запускаем генерацию миграции
generateMigration()
  .then(() => {
    console.log("🎉 Миграция завершена успешно!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Критическая ошибка:", error);
    process.exit(1);
  });
