import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { user } from './schema';
import { board } from './schema-boards';

// Таблица фильтров досок
export const boardFilter = pgTable('board_filter', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  jql: text('jql').notNull(), // JQL запрос
  isQuickFilter: boolean('is_quick_filter').default(false),
  isPublic: boolean('is_public').default(false),
  createdById: uuid('created_by_id').notNull().references(() => user.id),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  settings: jsonb('settings').$type<{
    color?: string;
    icon?: string;
    shortcut?: string; // Горячая клавиша
    autoRefresh?: boolean; // Автообновление
    refreshInterval?: number; // Интервал обновления в минутах
    showCount?: boolean; // Показывать количество результатов
    showProgress?: boolean; // Показывать прогресс
    customFields?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  }>(),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица избранных фильтров пользователей
export const boardFilterFavorite = pgTable('board_filter_favorite', {
  id: uuid('id').primaryKey().defaultRandom(),
  filterId: uuid('filter_id').notNull().references(() => boardFilter.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица истории использования фильтров
export const boardFilterHistory = pgTable('board_filter_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  filterId: uuid('filter_id').notNull().references(() => boardFilter.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id),
  action: text('action').notNull(), // applied, created, updated, deleted
  details: jsonb('details').$type<{
    resultCount?: number;
    executionTime?: number;
    error?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица шаблонов фильтров
export const boardFilterTemplate = pgTable('board_filter_template', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // common, project, team, custom
  jql: text('jql').notNull(),
  isPublic: boolean('is_public').default(false),
  createdById: uuid('created_by_id').notNull().references(() => user.id),
  usageCount: integer('usage_count').default(0),
  settings: jsonb('settings').$type<{
    color?: string;
    icon?: string;
    description?: string;
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица сохраненных поисковых запросов
export const boardSavedSearch = pgTable('board_saved_search', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  jql: text('jql').notNull(),
  isDefault: boolean('is_default').default(false),
  settings: jsonb('settings').$type<{
    color?: string;
    icon?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица JQL валидации
export const boardJqlValidation = pgTable('board_jql_validation', {
  id: uuid('id').primaryKey().defaultRandom(),
  jql: text('jql').notNull(),
  isValid: boolean('is_valid').notNull(),
  errorMessage: text('error_message'),
  suggestions: jsonb('suggestions').$type<Array<{
    type: 'field' | 'operator' | 'value' | 'function';
    suggestion: string;
    description: string;
  }>>(),
  validatedAt: timestamp('validated_at').defaultNow().notNull(),
});

// Экспорт типов
export type BoardFilter = typeof boardFilter.$inferSelect;
export type NewBoardFilter = typeof boardFilter.$inferInsert;
export type BoardFilterFavorite = typeof boardFilterFavorite.$inferSelect;
export type NewBoardFilterFavorite = typeof boardFilterFavorite.$inferInsert;
export type BoardFilterHistory = typeof boardFilterHistory.$inferSelect;
export type NewBoardFilterHistory = typeof boardFilterHistory.$inferInsert;
export type BoardFilterTemplate = typeof boardFilterTemplate.$inferSelect;
export type NewBoardFilterTemplate = typeof boardFilterTemplate.$inferInsert;
export type BoardSavedSearch = typeof boardSavedSearch.$inferSelect;
export type NewBoardSavedSearch = typeof boardSavedSearch.$inferInsert;
export type BoardJqlValidation = typeof boardJqlValidation.$inferSelect;
export type NewBoardJqlValidation = typeof boardJqlValidation.$inferInsert;
