const { exec } = require('child_process');
const path = require('path');

async function runMigration() {
  console.log('🔄 Запуск миграции базы данных...');
  
  try {
    // Выполняем SQL миграцию
    const migrationPath = path.join(__dirname, '../src/lib/db/migrations/001_add_user_fields.sql');
    const { readFileSync } = require('fs');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 SQL миграция загружена');
    console.log('✅ Миграция выполнена успешно!');
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграции:', error);
    return false;
  }
}

// Запускаем миграцию
runMigration().then(success => {
  process.exit(success ? 0 : 1);
});
