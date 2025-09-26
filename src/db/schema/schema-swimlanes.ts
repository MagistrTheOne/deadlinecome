import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { user } from './schema';
import { board } from './schema-boards';

// Таблица swimlanes (дорожек) для досок
export const boardSwimlane = pgTable('board_swimlane', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // assignee, epic, priority, component, fixVersion, custom
  field: text('field'), // Поле для группировки (например, assignee, epic, priority)
  color: text('color'),
  order: integer('order').notNull().default(0),
  isCollapsed: boolean('is_collapsed').default(false),
  isVisible: boolean('is_visible').default(true),
  settings: jsonb('settings').$type<{
    groupBy: string; // Поле для группировки
    sortBy?: string; // Поле для сортировки
    sortOrder?: 'asc' | 'desc';
    showEmpty?: boolean; // Показывать пустые группы
    showSubtasks?: boolean; // Показывать подзадачи
    showEpics?: boolean; // Показывать эпики
    customGroups?: Array<{
      id: string;
      name: string;
      filter: string; // JQL фильтр
      color?: string;
    }>;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица настроек swimlanes для пользователей
export const boardSwimlaneUserSettings = pgTable('board_swimlane_user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  swimlaneId: uuid('swimlane_id').notNull().references(() => boardSwimlane.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  isCollapsed: boolean('is_collapsed').default(false),
  isVisible: boolean('is_visible').default(true),
  customOrder: integer('custom_order'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица групп в swimlanes
export const boardSwimlaneGroup = pgTable('board_swimlane_group', {
  id: uuid('id').primaryKey().defaultRandom(),
  swimlaneId: uuid('swimlane_id').notNull().references(() => boardSwimlane.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  value: text('value'), // Значение для группировки (например, ID пользователя, эпика)
  color: text('color'),
  order: integer('order').notNull().default(0),
  isCollapsed: boolean('is_collapsed').default(false),
  isVisible: boolean('is_visible').default(true),
  settings: jsonb('settings').$type<{
    showCount?: boolean; // Показывать количество задач
    showProgress?: boolean; // Показывать прогресс
    showStoryPoints?: boolean; // Показывать story points
    customFilter?: string; // Дополнительный JQL фильтр
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица истории изменений swimlanes
export const boardSwimlaneHistory = pgTable('board_swimlane_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  swimlaneId: uuid('swimlane_id').notNull().references(() => boardSwimlane.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id),
  action: text('action').notNull(), // created, updated, deleted, reordered, etc.
  changes: jsonb('changes').$type<{
    field: string;
    oldValue: any;
    newValue: any;
  }[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Экспорт типов
export type BoardSwimlane = typeof boardSwimlane.$inferSelect;
export type NewBoardSwimlane = typeof boardSwimlane.$inferInsert;
export type BoardSwimlaneUserSettings = typeof boardSwimlaneUserSettings.$inferSelect;
export type NewBoardSwimlaneUserSettings = typeof boardSwimlaneUserSettings.$inferInsert;
export type BoardSwimlaneGroup = typeof boardSwimlaneGroup.$inferSelect;
export type NewBoardSwimlaneGroup = typeof boardSwimlaneGroup.$inferInsert;
export type BoardSwimlaneHistory = typeof boardSwimlaneHistory.$inferSelect;
export type NewBoardSwimlaneHistory = typeof boardSwimlaneHistory.$inferInsert;
