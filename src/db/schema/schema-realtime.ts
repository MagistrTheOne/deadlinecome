import { pgTable, text, timestamp, boolean, integer, json, uuid } from "drizzle-orm/pg-core";
import { user } from "./schema";

// Real-time события
export const realtimeEvent = pgTable("realtime_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull().$type<
    "TASK_CREATED" | "TASK_UPDATED" | "TASK_DELETED" |
    "PROJECT_CREATED" | "PROJECT_UPDATED" | "PROJECT_DELETED" |
    "USER_JOINED" | "USER_LEFT" | "USER_STATUS_CHANGED" |
    "AI_ACTION" | "AI_NOTIFICATION" | "CHAT_MESSAGE" |
    "COMMENT_ADDED" | "FILE_UPLOADED" | "DEADLINE_ALERT"
  >(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id"),
  projectId: text("project_id"),
  entityId: text("entity_id"), // ID сущности (задача, проект и т.д.)
  data: json("data"), // Дополнительные данные события
  metadata: json("metadata"), // Метаданные события
  isProcessed: boolean("is_processed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at")
});

// WebSocket соединения
export const websocketConnection = pgTable("websocket_connection", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  sessionId: text("session_id").notNull(),
  workspaceId: text("workspace_id"),
  projectId: text("project_id"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  isActive: boolean("is_active").default(true),
  lastPing: timestamp("last_ping").defaultNow(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  disconnectedAt: timestamp("disconnected_at")
});

// Уведомления пользователей
export const userNotification = pgTable("user_notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  type: text("type").notNull().$type<
    "TASK_ASSIGNED" | "TASK_COMPLETED" | "DEADLINE_REMINDER" |
    "PROJECT_UPDATE" | "TEAM_MEMBER_JOINED" | "AI_SUGGESTION" |
    "COMMENT_MENTION" | "FILE_SHARED" | "SYSTEM_ALERT"
  >(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: json("data"), // Дополнительные данные уведомления
  isRead: boolean("is_read").default(false),
  isImportant: boolean("is_important").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at")
});

// Комнаты для группировки пользователей
export const room = pgTable("room", {
  id: text("id").primaryKey(), // workspace:123, project:456, user:789
  type: text("type").notNull().$type<"WORKSPACE" | "PROJECT" | "USER" | "GLOBAL">(),
  entityId: text("entity_id"), // ID сущности
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  settings: json("settings"), // Настройки комнаты
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull()
});

// Участники комнат
export const roomMember = pgTable("room_member", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: text("room_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").$type<"ADMIN" | "MEMBER" | "OBSERVER">().default("MEMBER"),
  permissions: json("permissions"), // Права доступа
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at")
});

// Статистика real-time активности
export const realtimeStats = pgTable("realtime_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: timestamp("date").notNull(),
  hour: integer("hour").notNull(), // 0-23
  activeUsers: integer("active_users").default(0),
  totalConnections: integer("total_connections").default(0),
  messagesSent: integer("messages_sent").default(0),
  eventsProcessed: integer("events_processed").default(0),
  averageLatency: integer("average_latency").default(0), // в миллисекундах
  errorCount: integer("error_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// AI действия и логи
export const aiAction = pgTable("ai_action", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  workspaceId: text("workspace_id"),
  projectId: text("project_id"),
  actionType: text("action_type").notNull().$type<
    "TASK_SUGGESTION" | "AUTO_ASSIGNMENT" | "DEADLINE_ALERT" |
    "PROJECT_ANALYSIS" | "TEAM_OPTIMIZATION" | "RISK_DETECTION" |
    "CODE_REVIEW" | "DOCUMENTATION_UPDATE" | "MEETING_SUMMARY"
  >(),
  description: text("description").notNull(),
  inputData: json("input_data"),
  outputData: json("output_data"),
  confidence: integer("confidence"), // 0-100
  isSuccessful: boolean("is_successful").default(true),
  errorMessage: text("error_message"),
  processingTime: integer("processing_time"), // в миллисекундах
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Системные метрики
export const systemMetrics = pgTable("system_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  metricType: text("metric_type").notNull().$type<
    "CPU_USAGE" | "MEMORY_USAGE" | "DISK_USAGE" | "NETWORK_LATENCY" |
    "DATABASE_CONNECTIONS" | "WEBSOCKET_CONNECTIONS" | "API_RESPONSE_TIME"
  >(),
  value: integer("value").notNull(),
  unit: text("unit").notNull(), // "percent", "ms", "bytes", etc.
  tags: json("tags"), // Дополнительные теги
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

// Индексы для оптимизации
export const realtimeEventIndexes = {
  userId: "realtime_event_user_id_idx",
  type: "realtime_event_type_idx", 
  workspaceId: "realtime_event_workspace_id_idx",
  projectId: "realtime_event_project_id_idx",
  createdAt: "realtime_event_created_at_idx",
  isProcessed: "realtime_event_is_processed_idx"
};

export const userNotificationIndexes = {
  userId: "user_notification_user_id_idx",
  isRead: "user_notification_is_read_idx",
  type: "user_notification_type_idx",
  createdAt: "user_notification_created_at_idx"
};

export const websocketConnectionIndexes = {
  userId: "websocket_connection_user_id_idx",
  isActive: "websocket_connection_is_active_idx",
  lastPing: "websocket_connection_last_ping_idx"
};
