import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { user } from './schema';

// Таблица досок (как в Jira)
export const board = pgTable('board', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull().default('kanban'), // kanban, scrum, custom
  workspaceId: uuid('workspace_id').notNull(),
  projectId: uuid('project_id'),
  createdById: uuid('created_by_id').notNull().references(() => user.id),
  isDefault: boolean('is_default').default(false),
  isArchived: boolean('is_archived').default(false),
  settings: jsonb('settings').$type<{
    columns: Array<{
      id: string;
      name: string;
      status: string;
      color?: string;
      order: number;
    }>;
    filters: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    swimlanes?: Array<{
      id: string;
      name: string;
      type: 'assignee' | 'epic' | 'custom';
      field?: string;
    }>;
    quickFilters: Array<{
      id: string;
      name: string;
      jql: string;
    }>;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица колонок доски
export const boardColumn = pgTable('board_column', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: text('status').notNull(), // TODO, IN_PROGRESS, DONE, etc.
  color: text('color'),
  order: integer('order').notNull().default(0),
  isDone: boolean('is_done').default(false),
  isWip: boolean('is_wip').default(false), // Work in Progress
  wipLimit: integer('wip_limit'), // Лимит задач в колонке
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица настроек доски для пользователей
export const boardUserSettings = pgTable('board_user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  columnWidth: integer('column_width').default(300),
  showSwimlanes: boolean('show_swimlanes').default(true),
  showSubTasks: boolean('show_subtasks').default(true),
  showEpics: boolean('show_epics').default(true),
  showStoryPoints: boolean('show_story_points').default(true),
  showLabels: boolean('show_labels').default(true),
  showComponents: boolean('show_components').default(true),
  showFixVersions: boolean('show_fix_versions').default(true),
  showAssignee: boolean('show_assignee').default(true),
  showReporter: boolean('show_reporter').default(true),
  showPriority: boolean('show_priority').default(true),
  showCreated: boolean('show_created').default(true),
  showUpdated: boolean('show_updated').default(true),
  showDueDate: boolean('show_due_date').default(true),
  showTimeTracking: boolean('show_time_tracking').default(true),
  showProgress: boolean('show_progress').default(true),
  customFields: jsonb('custom_fields').$type<Record<string, boolean>>(),
  filters: jsonb('filters').$type<{
    assignee?: string[];
    priority?: string[];
    labels?: string[];
    components?: string[];
    fixVersions?: string[];
    created?: {
      from?: string;
      to?: string;
    };
    updated?: {
      from?: string;
      to?: string;
    };
    dueDate?: {
      from?: string;
      to?: string;
    };
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица шаблонов досок
export const boardTemplate = pgTable('board_template', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // kanban, scrum, bug-tracking, etc.
  isPublic: boolean('is_public').default(false),
  createdById: uuid('created_by_id').notNull().references(() => user.id),
  template: jsonb('template').$type<{
    columns: Array<{
      name: string;
      status: string;
      color: string;
      order: number;
      isDone: boolean;
      isWip: boolean;
      wipLimit?: number;
    }>;
    swimlanes?: Array<{
      name: string;
      type: 'assignee' | 'epic' | 'custom';
      field?: string;
    }>;
    quickFilters: Array<{
      name: string;
      jql: string;
    }>;
  }>(),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица избранных досок
export const boardFavorite = pgTable('board_favorite', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица истории изменений доски
export const boardHistory = pgTable('board_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id),
  action: text('action').notNull(), // created, updated, archived, restored, etc.
  changes: jsonb('changes').$type<{
    field: string;
    oldValue: any;
    newValue: any;
  }[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Экспорт типов
export type Board = typeof board.$inferSelect;
export type NewBoard = typeof board.$inferInsert;
export type BoardColumn = typeof boardColumn.$inferSelect;
export type NewBoardColumn = typeof boardColumn.$inferInsert;
export type BoardUserSettings = typeof boardUserSettings.$inferSelect;
export type NewBoardUserSettings = typeof boardUserSettings.$inferInsert;
export type BoardTemplate = typeof boardTemplate.$inferSelect;
export type NewBoardTemplate = typeof boardTemplate.$inferInsert;
export type BoardFavorite = typeof boardFavorite.$inferSelect;
export type NewBoardFavorite = typeof boardFavorite.$inferInsert;
export type BoardHistory = typeof boardHistory.$inferSelect;
export type NewBoardHistory = typeof boardHistory.$inferInsert;
