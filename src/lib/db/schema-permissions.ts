import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { user } from './schema';
import { board } from './schema-boards';

// Таблица ролей для досок
export const boardRole = pgTable('board_role', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false), // Системная роль (admin, viewer, etc.)
  permissions: jsonb('permissions').$type<{
    view: boolean;
    edit: boolean;
    delete: boolean;
    manageUsers: boolean;
    manageColumns: boolean;
    manageSwimlanes: boolean;
    manageFilters: boolean;
    manageSettings: boolean;
    export: boolean;
    import: boolean;
    createIssues: boolean;
    editIssues: boolean;
    deleteIssues: boolean;
    assignIssues: boolean;
    commentIssues: boolean;
    attachFiles: boolean;
    voteIssues: boolean;
    watchIssues: boolean;
    customPermissions?: Array<{
      action: string;
      allowed: boolean;
      conditions?: any;
    }>;
  }>(),
  color: text('color'),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица назначений ролей пользователям
export const boardUserRole = pgTable('board_user_role', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => boardRole.id, { onDelete: 'cascade' }),
  assignedById: uuid('assigned_by_id').notNull().references(() => user.id),
  expiresAt: timestamp('expires_at'), // Время истечения роли
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata').$type<{
    reason?: string;
    notes?: string;
    conditions?: any;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица разрешений для конкретных действий
export const boardPermission = pgTable('board_permission', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').references(() => boardRole.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // view, edit, delete, manage_users, etc.
  resource: text('resource').notNull(), // board, column, swimlane, filter, issue, etc.
  resourceId: uuid('resource_id'), // ID конкретного ресурса
  isAllowed: boolean('is_allowed').notNull(),
  conditions: jsonb('conditions').$type<{
    timeRestrictions?: {
      startTime?: string;
      endTime?: string;
      daysOfWeek?: number[];
    };
    ipRestrictions?: string[];
    locationRestrictions?: string[];
    customConditions?: any;
  }>(),
  expiresAt: timestamp('expires_at'),
  createdById: uuid('created_by_id').notNull().references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица истории изменений разрешений
export const boardPermissionHistory = pgTable('board_permission_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id),
  action: text('action').notNull(), // granted, revoked, modified, expired
  permissionId: uuid('permission_id').references(() => boardPermission.id),
  roleId: uuid('role_id').references(() => boardRole.id),
  details: jsonb('details').$type<{
    oldPermissions?: any;
    newPermissions?: any;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица групп доступа
export const boardAccessGroup = pgTable('board_access_group', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // team, department, custom
  permissions: jsonb('permissions').$type<{
    view: boolean;
    edit: boolean;
    delete: boolean;
    manageUsers: boolean;
    customPermissions?: any;
  }>(),
  isActive: boolean('is_active').default(true),
  createdById: uuid('created_by_id').notNull().references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица участников групп доступа
export const boardAccessGroupMember = pgTable('board_access_group_member', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => boardAccessGroup.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  addedById: uuid('added_by_id').notNull().references(() => user.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица шаблонов разрешений
export const boardPermissionTemplate = pgTable('board_permission_template', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // public, private, team, project
  permissions: jsonb('permissions').$type<{
    roles: Array<{
      name: string;
      description: string;
      permissions: any;
    }>;
    defaultRole: string;
    customPermissions?: any;
  }>(),
  isPublic: boolean('is_public').default(false),
  createdById: uuid('created_by_id').notNull().references(() => user.id),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Экспорт типов
export type BoardRole = typeof boardRole.$inferSelect;
export type NewBoardRole = typeof boardRole.$inferInsert;
export type BoardUserRole = typeof boardUserRole.$inferSelect;
export type NewBoardUserRole = typeof boardUserRole.$inferInsert;
export type BoardPermission = typeof boardPermission.$inferSelect;
export type NewBoardPermission = typeof boardPermission.$inferInsert;
export type BoardPermissionHistory = typeof boardPermissionHistory.$inferSelect;
export type NewBoardPermissionHistory = typeof boardPermissionHistory.$inferInsert;
export type BoardAccessGroup = typeof boardAccessGroup.$inferSelect;
export type NewBoardAccessGroup = typeof boardAccessGroup.$inferInsert;
export type BoardAccessGroupMember = typeof boardAccessGroupMember.$inferSelect;
export type NewBoardAccessGroupMember = typeof boardAccessGroupMember.$inferInsert;
export type BoardPermissionTemplate = typeof boardPermissionTemplate.$inferSelect;
export type NewBoardPermissionTemplate = typeof boardPermissionTemplate.$inferInsert;
