-- Инициализация базы данных для DeadLine
-- Этот скрипт выполняется при первом запуске контейнера PostgreSQL

-- Создаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создаем схему для drizzle
CREATE SCHEMA IF NOT EXISTS drizzle;

-- Создаем таблицу миграций
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash text NOT NULL,
    created_at bigint
);

-- Добавляем недостающие поля в таблицу user
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'OFFLINE';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "status_message" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "bio" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "location" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "website" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" text DEFAULT 'UTC';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "language" text DEFAULT 'ru';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "theme" text DEFAULT 'DARK';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "notifications" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "preferences" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "last_active" timestamp DEFAULT now();

-- Создаем уникальный индекс для username
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_unique" ON "user" ("username");

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "user" ("email");
CREATE INDEX IF NOT EXISTS "idx_user_status" ON "user" ("status");
CREATE INDEX IF NOT EXISTS "idx_user_last_active" ON "user" ("last_active");
CREATE INDEX IF NOT EXISTS "idx_workspace_owner" ON "workspace" ("owner_id");
CREATE INDEX IF NOT EXISTS "idx_project_workspace" ON "project" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_issue_project" ON "issue" ("project_id");
CREATE INDEX IF NOT EXISTS "idx_issue_assignee" ON "issue" ("assignee_id");
CREATE INDEX IF NOT EXISTS "idx_issue_status" ON "issue" ("status");

-- Создаем таблицы для real-time функциональности
CREATE TABLE IF NOT EXISTS realtime_events (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type text NOT NULL,
    user_id text REFERENCES "user"(id),
    workspace_id text,
    project_id text,
    entity_id text,
    data text,
    metadata text,
    is_processed boolean DEFAULT FALSE,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS websocket_connections (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id text REFERENCES "user"(id),
    session_id text NOT NULL,
    workspace_id text,
    project_id text,
    user_agent text,
    ip_address inet,
    is_active boolean DEFAULT TRUE,
    last_ping timestamp DEFAULT now(),
    connected_at timestamp DEFAULT now(),
    disconnected_at timestamp
);

CREATE TABLE IF NOT EXISTS user_notifications (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id text NOT NULL REFERENCES "user"(id),
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data text,
    is_read boolean DEFAULT FALSE,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rooms (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name text NOT NULL,
    type text NOT NULL,
    workspace_id text,
    project_id text,
    created_by text REFERENCES "user"(id),
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_members (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    room_id text NOT NULL REFERENCES rooms(id),
    user_id text NOT NULL REFERENCES "user"(id),
    joined_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_actions (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id text REFERENCES "user"(id),
    action_type text NOT NULL,
    input_data text,
    output_data text,
    success boolean DEFAULT TRUE,
    error_message text,
    duration_ms integer,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_metrics (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    metric_unit text,
    tags text,
    timestamp timestamp DEFAULT now()
);

-- Создаем индексы для новых таблиц
CREATE INDEX IF NOT EXISTS "idx_realtime_events_type" ON realtime_events ("type");
CREATE INDEX IF NOT EXISTS "idx_realtime_events_user" ON realtime_events ("user_id");
CREATE INDEX IF NOT EXISTS "idx_realtime_events_workspace" ON realtime_events ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_realtime_events_project" ON realtime_events ("project_id");
CREATE INDEX IF NOT EXISTS "idx_realtime_events_processed" ON realtime_events ("is_processed");

CREATE INDEX IF NOT EXISTS "idx_websocket_connections_user" ON websocket_connections ("user_id");
CREATE INDEX IF NOT EXISTS "idx_websocket_connections_active" ON websocket_connections ("is_active");
CREATE INDEX IF NOT EXISTS "idx_websocket_connections_workspace" ON websocket_connections ("workspace_id");

CREATE INDEX IF NOT EXISTS "idx_user_notifications_user" ON user_notifications ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_notifications_read" ON user_notifications ("is_read");
CREATE INDEX IF NOT EXISTS "idx_user_notifications_type" ON user_notifications ("type");

CREATE INDEX IF NOT EXISTS "idx_room_members_room" ON room_members ("room_id");
CREATE INDEX IF NOT EXISTS "idx_room_members_user" ON room_members ("user_id");

CREATE INDEX IF NOT EXISTS "idx_ai_actions_user" ON ai_actions ("user_id");
CREATE INDEX IF NOT EXISTS "idx_ai_actions_type" ON ai_actions ("action_type");
CREATE INDEX IF NOT EXISTS "idx_ai_actions_success" ON ai_actions ("success");

CREATE INDEX IF NOT EXISTS "idx_system_metrics_name" ON system_metrics ("metric_name");
CREATE INDEX IF NOT EXISTS "idx_system_metrics_timestamp" ON system_metrics ("timestamp");

-- Создаем функцию для очистки старых данных
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Очищаем старые real-time события (старше 7 дней)
    DELETE FROM realtime_events 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Очищаем неактивные WebSocket соединения (старше 1 дня)
    DELETE FROM websocket_connections 
    WHERE is_active = FALSE AND disconnected_at < NOW() - INTERVAL '1 day';
    
    -- Очищаем старые системные метрики (старше 30 дней)
    DELETE FROM system_metrics 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Очищаем старые AI действия (старше 90 дней)
    DELETE FROM ai_actions 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Создаем задачу для автоматической очистки (если pg_cron доступен)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');

-- Создаем представления для аналитики
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.status,
    u.last_active,
    COUNT(DISTINCT wc.id) as active_connections,
    COUNT(DISTINCT un.id) as unread_notifications,
    COUNT(DISTINCT aa.id) as ai_interactions
FROM "user" u
LEFT JOIN websocket_connections wc ON u.id = wc.user_id AND wc.is_active = TRUE
LEFT JOIN user_notifications un ON u.id = un.user_id AND un.is_read = FALSE
LEFT JOIN ai_actions aa ON u.id = aa.user_id AND aa.created_at > NOW() - INTERVAL '24 hours'
GROUP BY u.id, u.name, u.email, u.status, u.last_active;

CREATE OR REPLACE VIEW system_health_summary AS
SELECT 
    metric_name,
    AVG(metric_value) as avg_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    COUNT(*) as sample_count,
    MAX(timestamp) as last_updated
FROM system_metrics
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY metric_name;

-- Создаем функцию для получения статистики системы
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE (
    total_users bigint,
    active_users bigint,
    total_workspaces bigint,
    total_projects bigint,
    total_issues bigint,
    active_connections bigint,
    unread_notifications bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM "user") as total_users,
        (SELECT COUNT(*) FROM "user" WHERE last_active > NOW() - INTERVAL '24 hours') as active_users,
        (SELECT COUNT(*) FROM workspace) as total_workspaces,
        (SELECT COUNT(*) FROM project) as total_projects,
        (SELECT COUNT(*) FROM issue) as total_issues,
        (SELECT COUNT(*) FROM websocket_connections WHERE is_active = TRUE) as active_connections,
        (SELECT COUNT(*) FROM user_notifications WHERE is_read = FALSE) as unread_notifications;
END;
$$ LANGUAGE plpgsql;

-- Вставляем начальные данные
INSERT INTO "user" (id, name, email, username, status, status_message, timezone, language, theme, last_active)
VALUES (
    'admin-user',
    'Administrator',
    'admin@deadline.local',
    'admin',
    'ONLINE',
    'Системный администратор',
    'Europe/Moscow',
    'ru',
    'DARK',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Создаем рабочее пространство по умолчанию
INSERT INTO workspace (id, name, slug, description, owner_id)
VALUES (
    'default-workspace',
    'Основное рабочее пространство',
    'default',
    'Рабочее пространство по умолчанию',
    'admin-user'
) ON CONFLICT (id) DO NOTHING;

-- Создаем проект по умолчанию
INSERT INTO project (id, name, description, workspace_id)
VALUES (
    'default-project',
    'Демо проект',
    'Демонстрационный проект для тестирования',
    'default-workspace'
) ON CONFLICT (id) DO NOTHING;

-- Логируем успешную инициализацию
INSERT INTO system_metrics (metric_name, metric_value, metric_unit, tags)
VALUES ('database_initialized', 1, 'boolean', '{"timestamp": "' || NOW() || '"}');
