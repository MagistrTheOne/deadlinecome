import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { cacheUtils } from '@/lib/cache/redis';
import { ValidationService } from '@/lib/validation/validator';
import { DatabaseService } from '@/lib/services/database-service';

// GET /api/dashboard/stats - Получение статистики дашборда
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const userId = request.headers.get('x-user-id');
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    
    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    // Проверяем кэш
    const cacheKey = `dashboard:stats:${userId}:${workspaceId || 'all'}`;
    const cachedStats = await cacheUtils.getApiResponse('dashboard-stats', {
      userId,
      workspaceId
    });

    if (cachedStats) {
      LoggerService.logCache('GET', cacheKey, true);
      return ValidationService.createSuccessResponse(cachedStats);
    }

    // Получаем реальные данные из БД
    const workspaces = await DatabaseService.getWorkspacesByUserId(userId);
    const projects = await DatabaseService.getProjectsByWorkspaceId(workspaceId || workspaces[0]?.workspace.id || '');
    
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let pendingTasks = 0;
    let aiActions = 0;

    // Считаем статистику по задачам для каждого проекта
    for (const project of projects) {
      const issues = await DatabaseService.getIssuesByProjectId(project.project.id);
      
      totalTasks += issues.length;
      completedTasks += issues.filter(issue => issue.issue.status === 'DONE').length;
      inProgressTasks += issues.filter(issue => issue.issue.status === 'IN_PROGRESS').length;
      pendingTasks += issues.filter(issue => issue.issue.status === 'TODO').length;
      
      // Получаем AI действия
      const vasilyActions = await DatabaseService.getVasilyActions(project.project.id);
      aiActions += vasilyActions.length;
    }

    const stats = {
      overview: {
        totalProjects: projects.length,
        activeProjects: projects.length,
        completedProjects: 0, // TODO: добавить поле completed в схему проекта
        totalTasks,
        completedTasks,
        pendingTasks: pendingTasks + inProgressTasks,
        teamMembers: workspaces.length,
        activeUsers: workspaces.length // TODO: добавить проверку статуса пользователей
      },
      recentActivity: [
        {
          id: '1',
          type: 'task_completed',
          title: 'Задача "Исправить баг в аутентификации" завершена',
          user: 'John Doe',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          project: 'DeadLine Platform'
        },
        {
          id: '2',
          type: 'project_created',
          title: 'Создан новый проект "Mobile App"',
          user: 'Jane Smith',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          project: 'Mobile App'
        },
        {
          id: '3',
          type: 'user_joined',
          title: 'Новый участник присоединился к команде',
          user: 'Mike Johnson',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          project: 'DeadLine Platform'
        }
      ],
      performance: {
        responseTime: 245,
        uptime: 99.9,
        errorRate: 0.1,
        activeConnections: 156
      },
      charts: {
        tasksOverTime: [
          { date: '2024-01-01', created: 12, completed: 8 },
          { date: '2024-01-02', created: 15, completed: 10 },
          { date: '2024-01-03', created: 8, completed: 12 },
          { date: '2024-01-04', created: 20, completed: 15 },
          { date: '2024-01-05', created: 18, completed: 18 }
        ],
        projectProgress: [
          { name: 'DeadLine Platform', progress: 85, status: 'active' },
          { name: 'Mobile App', progress: 45, status: 'active' },
          { name: 'API Documentation', progress: 100, status: 'completed' },
          { name: 'Testing Suite', progress: 30, status: 'active' }
        ],
        teamProductivity: [
          { name: 'John Doe', tasksCompleted: 23, hoursWorked: 40 },
          { name: 'Jane Smith', tasksCompleted: 18, hoursWorked: 35 },
          { name: 'Mike Johnson', tasksCompleted: 15, hoursWorked: 32 },
          { name: 'Sarah Wilson', tasksCompleted: 21, hoursWorked: 38 }
        ]
      },
      notifications: {
        unread: 5,
        recent: [
          {
            id: '1',
            type: 'task_assigned',
            title: 'Вам назначена новая задача',
            message: 'Задача "Оптимизация производительности" назначена на вас',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            read: false
          },
          {
            id: '2',
            type: 'project_update',
            title: 'Обновление проекта',
            message: 'Проект "Mobile App" обновлен',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: false
          }
        ]
      },
      aiInsights: {
        suggestions: [
          'Рекомендуем добавить больше тестов для модуля аутентификации',
          'Команда работает эффективно, можно увеличить нагрузку',
          'Обнаружены потенциальные узкие места в API'
        ],
        predictions: {
          projectCompletion: '2024-02-15',
          riskLevel: 'low',
          recommendedActions: [
            'Провести code review',
            'Добавить мониторинг производительности'
          ]
        }
      }
    };

    // Кэшируем на 5 минут
    await cacheUtils.cacheApiResponse('dashboard-stats', {
      userId,
      workspaceId
    }, stats, 300);

    LoggerService.logCache('SET', cacheKey, false);
    LoggerService.logUserAction('dashboard_view', userId, { workspaceId });

    return ValidationService.createSuccessResponse(stats);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'dashboard-stats' });
    return ValidationService.createErrorResponse('Failed to fetch dashboard statistics', 500);
  }
}