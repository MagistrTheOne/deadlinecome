#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';

// Подключение к базе данных
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function pushDatabase() {
  try {
    console.log('🚀 Начинаем пуш базы данных...');
    
    // Проверяем подключение
    console.log('📡 Проверяем подключение к БД...');
    await client`SELECT 1`;
    console.log('✅ Подключение к БД успешно');
    
    // Применяем миграции
    console.log('📦 Применяем миграции...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Миграции применены');
    
    // Проверяем схему
    console.log('🔍 Проверяем схему БД...');
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📋 Найденные таблицы:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Проверяем основные таблицы
    const requiredTables = ['user', 'workspace', 'project', 'issue', 'ai_analytics'];
    const existingTables = tables.map((t: any) => t.table_name);
    
    console.log('🔧 Проверяем обязательные таблицы...');
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        console.log(`  ✅ ${table} - существует`);
      } else {
        console.log(`  ❌ ${table} - отсутствует`);
      }
    }
    
    console.log('🎉 Пуш базы данных завершен успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при пуше БД:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Запускаем пуш
pushDatabase();
