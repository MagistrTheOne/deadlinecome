import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, decimal } from 'drizzle-orm/pg-core';
import { user } from './schema';
import { board, boardColumn } from './schema-boards';
import { issue } from './schema';

// Таблица метрик досок
export const boardMetrics = pgTable('board_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  totalIssues: integer('total_issues').notNull().default(0),
  completedIssues: integer('completed_issues').notNull().default(0),
  inProgressIssues: integer('in_progress_issues').notNull().default(0),
  pendingIssues: integer('pending_issues').notNull().default(0),
  overdueIssues: integer('overdue_issues').notNull().default(0),
  newIssues: integer('new_issues').notNull().default(0),
  resolvedIssues: integer('resolved_issues').notNull().default(0),
  averageResolutionTime: decimal('average_resolution_time', { precision: 10, scale: 2 }),
  averageLeadTime: decimal('average_lead_time', { precision: 10, scale: 2 }),
  throughput: decimal('throughput', { precision: 10, scale: 2 }),
  cycleTime: decimal('cycle_time', { precision: 10, scale: 2 }),
  workInProgress: integer('work_in_progress').notNull().default(0),
  activeUsers: integer('active_users').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица аналитики по колонкам
export const boardColumnAnalytics = pgTable('board_column_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  columnId: uuid('column_id').notNull().references(() => boardColumn.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  issuesCount: integer('issues_count').notNull().default(0),
  averageTimeInColumn: decimal('average_time_in_column', { precision: 10, scale: 2 }),
  maxTimeInColumn: decimal('max_time_in_column', { precision: 10, scale: 2 }),
  minTimeInColumn: decimal('min_time_in_column', { precision: 10, scale: 2 }),
  wipLimit: integer('wip_limit'),
  wipUtilization: decimal('wip_utilization', { precision: 5, scale: 2 }), // Процент использования WIP лимита
  bottleneckScore: decimal('bottleneck_score', { precision: 5, scale: 2 }), // Оценка узкого места
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица аналитики по пользователям
export const boardUserAnalytics = pgTable('board_user_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id),
  date: timestamp('date').notNull(),
  issuesAssigned: integer('issues_assigned').notNull().default(0),
  issuesCompleted: integer('issues_completed').notNull().default(0),
  issuesCreated: integer('issues_created').notNull().default(0),
  averageResolutionTime: decimal('average_resolution_time', { precision: 10, scale: 2 }),
  totalWorkTime: decimal('total_work_time', { precision: 10, scale: 2 }), // В часах
  productivityScore: decimal('productivity_score', { precision: 5, scale: 2 }),
  collaborationScore: decimal('collaboration_score', { precision: 5, scale: 2 }),
  qualityScore: decimal('quality_score', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица burndown данных
export const boardBurndownData = pgTable('board_burndown_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  sprintId: uuid('sprint_id'),
  date: timestamp('date').notNull(),
  totalStoryPoints: integer('total_story_points').notNull().default(0),
  completedStoryPoints: integer('completed_story_points').notNull().default(0),
  remainingStoryPoints: integer('remaining_story_points').notNull().default(0),
  idealBurndown: integer('ideal_burndown').notNull().default(0),
  actualBurndown: integer('actual_burndown').notNull().default(0),
  scopeChange: integer('scope_change').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица velocity данных
export const boardVelocityData = pgTable('board_velocity_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  sprintId: uuid('sprint_id'),
  sprintNumber: integer('sprint_number').notNull(),
  plannedStoryPoints: integer('planned_story_points').notNull().default(0),
  completedStoryPoints: integer('completed_story_points').notNull().default(0),
  velocity: decimal('velocity', { precision: 10, scale: 2 }),
  averageVelocity: decimal('average_velocity', { precision: 10, scale: 2 }),
  velocityTrend: decimal('velocity_trend', { precision: 5, scale: 2 }), // Тренд velocity
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица cumulative flow данных
export const boardCumulativeFlowData = pgTable('board_cumulative_flow_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  columnData: jsonb('column_data').$type<Array<{
    columnId: string;
    columnName: string;
    cumulativeCount: number;
    newIssues: number;
    completedIssues: number;
  }>>(),
  totalIssues: integer('total_issues').notNull().default(0),
  flowEfficiency: decimal('flow_efficiency', { precision: 5, scale: 2 }),
  averageCycleTime: decimal('average_cycle_time', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица отчетов
export const boardReport = pgTable('board_report', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // burndown, velocity, cumulative_flow, user_productivity, etc.
  createdById: uuid('created_by_id').notNull().references(() => user.id),
  isPublic: boolean('is_public').default(false),
  isScheduled: boolean('is_scheduled').default(false),
  scheduleConfig: jsonb('schedule_config').$type<{
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    recipients: string[]; // Email addresses
  }>(),
  filters: jsonb('filters').$type<{
    dateRange?: {
      start: string;
      end: string;
    };
    users?: string[];
    issueTypes?: string[];
    priorities?: string[];
    customFilters?: any;
  }>(),
  data: jsonb('data').$type<any>(), // Кэшированные данные отчета
  lastGenerated: timestamp('last_generated'),
  nextGeneration: timestamp('next_generation'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица шаблонов отчетов
export const boardReportTemplate = pgTable('board_report_template', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  category: text('category').notNull(), // sprint, team, project, custom
  template: jsonb('template').$type<{
    title: string;
    description: string;
    charts: Array<{
      type: string;
      title: string;
      dataSource: string;
      config: any;
    }>;
    metrics: Array<{
      name: string;
      value: string;
      format: string;
    }>;
    filters: any;
  }>(),
  isPublic: boolean('is_public').default(false),
  createdById: uuid('created_by_id').notNull().references(() => user.id),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица уведомлений аналитики
export const boardAnalyticsNotification = pgTable('board_analytics_notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull().references(() => board.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id),
  type: text('type').notNull(), // bottleneck, overdue, velocity_drop, etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  severity: text('severity').notNull(), // info, warning, error, critical
  data: jsonb('data').$type<any>(),
  isRead: boolean('is_read').default(false),
  isResolved: boolean('is_resolved').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
  resolvedAt: timestamp('resolved_at'),
});

// Экспорт типов
export type BoardMetrics = typeof boardMetrics.$inferSelect;
export type NewBoardMetrics = typeof boardMetrics.$inferInsert;
export type BoardColumnAnalytics = typeof boardColumnAnalytics.$inferSelect;
export type NewBoardColumnAnalytics = typeof boardColumnAnalytics.$inferInsert;
export type BoardUserAnalytics = typeof boardUserAnalytics.$inferSelect;
export type NewBoardUserAnalytics = typeof boardUserAnalytics.$inferInsert;
export type BoardBurndownData = typeof boardBurndownData.$inferSelect;
export type NewBoardBurndownData = typeof boardBurndownData.$inferInsert;
export type BoardVelocityData = typeof boardVelocityData.$inferSelect;
export type NewBoardVelocityData = typeof boardVelocityData.$inferInsert;
export type BoardCumulativeFlowData = typeof boardCumulativeFlowData.$inferSelect;
export type NewBoardCumulativeFlowData = typeof boardCumulativeFlowData.$inferInsert;
export type BoardReport = typeof boardReport.$inferSelect;
export type NewBoardReport = typeof boardReport.$inferInsert;
export type BoardReportTemplate = typeof boardReportTemplate.$inferSelect;
export type NewBoardReportTemplate = typeof boardReportTemplate.$inferInsert;
export type BoardAnalyticsNotification = typeof boardAnalyticsNotification.$inferSelect;
export type NewBoardAnalyticsNotification = typeof boardAnalyticsNotification.$inferInsert;
