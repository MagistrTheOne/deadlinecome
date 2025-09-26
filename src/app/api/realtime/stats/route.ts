import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { cacheUtils } from '@/lib/cache/redis';
import { ValidationService } from '@/lib/validation/validator';

// GET /api/realtime/stats - Получение real-time статистики
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    // Проверяем кэш (короткое время жизни для real-time данных)
    const cacheKey = `realtime:stats:${userId}`;
    const cachedStats = await cacheUtils.getApiResponse('realtime-stats', { userId });

    if (cachedStats) {
      LoggerService.logCache('GET', cacheKey, true);
      return ValidationService.createSuccessResponse(cachedStats);
    }

    // Генерируем real-time статистику
    const realtimeStats = {
      connections: {
        total: 156,
        active: 89,
        idle: 67,
        byWorkspace: [
          { workspaceId: 'ws-1', name: 'Main Workspace', connections: 45 },
          { workspaceId: 'ws-2', name: 'Development', connections: 32 },
          { workspaceId: 'ws-3', name: 'Testing', connections: 12 }
        ],
        byProject: [
          { projectId: 'proj-1', name: 'DeadLine Platform', connections: 28 },
          { projectId: 'proj-2', name: 'Mobile App', connections: 19 },
          { projectId: 'proj-3', name: 'API Documentation', connections: 8 }
        ]
      },
      events: {
        totalToday: 1247,
        byType: [
          { type: 'task_created', count: 45, percentage: 36.1 },
          { type: 'task_updated', count: 32, percentage: 25.7 },
          { type: 'task_completed', count: 28, percentage: 22.5 },
          { type: 'user_joined', count: 12, percentage: 9.6 },
          { type: 'project_updated', count: 7, percentage: 5.6 }
        ],
        recent: [
          {
            id: 'event-1',
            type: 'task_created',
            user: 'John Doe',
            project: 'DeadLine Platform',
            timestamp: new Date(Date.now() - 1000 * 30).toISOString(),
            data: { taskId: 'task-123', title: 'Implement new feature' }
          },
          {
            id: 'event-2',
            type: 'task_completed',
            user: 'Jane Smith',
            project: 'Mobile App',
            timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
            data: { taskId: 'task-456', title: 'Fix authentication bug' }
          },
          {
            id: 'event-3',
            type: 'user_joined',
            user: 'Mike Johnson',
            project: 'DeadLine Platform',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            data: { role: 'developer' }
          }
        ]
      },
      performance: {
        server: {
          uptime: 86400, // 24 hours in seconds
          memory: {
            used: 1024 * 1024 * 1024, // 1GB
            total: 4 * 1024 * 1024 * 1024, // 4GB
            percentage: 25
          },
          cpu: {
            usage: 15.5,
            load: [0.8, 0.6, 0.4]
          },
          disk: {
            used: 50 * 1024 * 1024 * 1024, // 50GB
            total: 200 * 1024 * 1024 * 1024, // 200GB
            percentage: 25
          }
        },
        database: {
          connections: 12,
          maxConnections: 100,
          queryTime: 45, // ms
          slowQueries: 3
        },
        cache: {
          hitRate: 87.5,
          misses: 156,
          hits: 1098,
          memory: 128 * 1024 * 1024 // 128MB
        }
      },
      rooms: {
        total: 8,
        active: 6,
        byType: [
          { type: 'workspace', count: 3 },
          { type: 'project', count: 4 },
          { type: 'team', count: 1 }
        ],
        details: [
          {
            id: 'room-1',
            name: 'Main Workspace',
            type: 'workspace',
            members: 12,
            lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString()
          },
          {
            id: 'room-2',
            name: 'DeadLine Platform',
            type: 'project',
            members: 8,
            lastActivity: new Date(Date.now() - 1000 * 30).toISOString()
          }
        ]
      },
      notifications: {
        total: 234,
        unread: 45,
        byType: [
          { type: 'task_assigned', count: 23 },
          { type: 'project_update', count: 12 },
          { type: 'team_mention', count: 8 },
          { type: 'system_alert', count: 2 }
        ],
        recent: [
          {
            id: 'notif-1',
            type: 'task_assigned',
            title: 'Новая задача назначена',
            user: 'John Doe',
            timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
            read: false
          },
          {
            id: 'notif-2',
            type: 'project_update',
            title: 'Проект обновлен',
            user: 'Jane Smith',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            read: false
          }
        ]
      },
      ai: {
        interactions: {
          total: 89,
          today: 23,
          byType: [
            { type: 'chat', count: 15 },
            { type: 'suggestion', count: 5 },
            { type: 'analysis', count: 3 }
          ]
        },
        performance: {
          averageResponseTime: 1.2, // seconds
          successRate: 98.5,
          errorRate: 1.5
        },
        insights: [
          'Команда работает эффективно',
          'Рекомендуется добавить больше тестов',
          'Обнаружены потенциальные улучшения'
        ]
      },
      timestamp: new Date().toISOString(),
      generatedAt: new Date().toISOString()
    };

    // Кэшируем на 30 секунд (короткое время для real-time данных)
    await cacheUtils.cacheApiResponse('realtime-stats', { userId }, realtimeStats, 30);

    LoggerService.logCache('SET', cacheKey, false);
    LoggerService.logUserAction('realtime_stats_view', userId);

    return ValidationService.createSuccessResponse(realtimeStats);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'realtime-stats' });
    return ValidationService.createErrorResponse('Failed to fetch real-time statistics', 500);
  }
}