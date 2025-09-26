#!/usr/bin/env tsx

/**
 * Schema Check Script
 *
 * Проверяет целостность схемы базы данных и наличие необходимых объектов.
 * Используется перед применением миграций и после них.
 */

import { db } from '../src/db/drizzle';

async function checkSchema() {
  console.log('🔍 Проверка схемы базы данных...\n');

  try {
    // Проверка базового соединения
    await db.execute('SELECT 1 as connection_test');
    console.log('✅ Соединение с БД установлено');

    // Проверка наличия основных таблиц
    const tables = [
      'user',
      'workspace',
      'workspace_member',
      'project',
      'issue',
      'ai_team_member',
      'ai_analytics',
      'vasily_action',
      'bug_report',
      'code_review'
    ];

    for (const tableName of tables) {
      try {
        const result = await db.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = result.rows[0]?.count || 0;
        console.log(`✅ Таблица ${tableName}: ${count} записей`);
      } catch (error) {
        console.log(`❌ Таблица ${tableName}: отсутствует или недоступна`);
        console.log(`   Ошибка: ${error.message}`);
      }
    }

    // Проверка индексов (если возможно)
    console.log('\n🔍 Проверка индексов...');
    try {
      const indexes = await db.execute(`
        SELECT schemaname, tablename, indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `);

      console.log(`✅ Найдено ${indexes.rows.length} индексов`);
    } catch (error) {
      console.log('⚠️  Не удалось проверить индексы (возможно, ограничения прав)');
    }

    // Проверка ограничений
    console.log('\n🔍 Проверка ограничений...');
    try {
      const constraints = await db.execute(`
        SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE connamespace = 'public'::regnamespace
        ORDER BY conrelid::regclass::text, contype DESC;
      `);

      console.log(`✅ Найдено ${constraints.rows.length} ограничений`);
    } catch (error) {
      console.log('⚠️  Не удалось проверить ограничения (возможно, ограничения прав)');
    }

    // Проверка AI Team Members
    console.log('\n🔍 Проверка AI Team Members...');
    try {
      const aiMembers = await db.execute('SELECT name, role, is_active FROM ai_team_member');
      console.log(`✅ AI Team Members: ${aiMembers.rows.length} участников`);

      const roles = aiMembers.rows.map(row => row.role);
      const expectedRoles = [
        'AI_CTO', 'AI_HR', 'AI_PM', 'AI_QA', 'AI_DEVOPS',
        'AI_DESIGNER', 'AI_ANALYST', 'AI_CODE_REVIEWER',
        'AI_SECURITY', 'AI_PERFORMANCE', 'AI_DOCUMENTATION',
        'AI_ANALYTICS', 'AI_MEETING_ASSISTANT', 'AI_BURNOUT_DETECTOR'
      ];

      const missingRoles = expectedRoles.filter(role => !roles.includes(role));
      if (missingRoles.length > 0) {
        console.log(`⚠️  Отсутствуют роли: ${missingRoles.join(', ')}`);
      } else {
        console.log('✅ Все AI роли присутствуют');
      }
    } catch (error) {
      console.log('❌ Не удалось проверить AI Team Members');
    }

    console.log('\n🎉 Проверка схемы завершена успешно!');

  } catch (error) {
    console.error('❌ Критическая ошибка при проверке схемы:', error);
    process.exit(1);
  }
}

// Запуск проверки
checkSchema().catch(error => {
  console.error('💥 Необработанная ошибка:', error);
  process.exit(1);
});
