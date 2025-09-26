-- Analytics performance indexes
-- Created for PR2: Drizzle Migrations for Prod

-- Index for issues by project and creation date (most recent first)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_project_created
  ON issue (project_id, created_at DESC);

-- Index for issues by assignee and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_assignee_status
  ON issue (assignee_id, status)
  WHERE assignee_id IS NOT NULL;

-- Index for board analytics by board and date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_analytics_board_date
  ON board_column_analytics (board_id, date DESC);

-- Index for board metrics by board
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_metrics_board
  ON board_metrics (board_id);

-- Index for AI analytics by project
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_analytics_project
  ON ai_analytics (project_id, created_at DESC);

-- Index for user notifications by user and read status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_notifications_user_read
  ON user_notification (user_id, is_read, created_at DESC);
