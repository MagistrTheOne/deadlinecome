import { db } from "./index";
import { readFileSync } from "fs";
import { join } from "path";

export async function runMigrations() {
  try {
    console.log("🔄 Запуск миграций базы данных...");
    
    // Читаем SQL файл миграции
    const migrationPath = join(process.cwd(), "src/lib/db/migrations/001_add_user_fields.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");
    
    // Выполняем миграцию
    await db.execute(migrationSQL);
    
    console.log("✅ Миграции выполнены успешно!");
    return true;
  } catch (error) {
    console.error("❌ Ошибка при выполнении миграций:", error);
    return false;
  }
}

// Запускаем миграции если файл выполняется напрямую
if (require.main === module) {
  runMigrations().then(success => {
    process.exit(success ? 0 : 1);
  });
}
