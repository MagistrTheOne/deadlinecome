import { db } from '@/db/drizzle';
import { issue, project, workspace, workspaceMember, user, vasilyAction } from '@/db/schema';
import { eq, and, count, sql } from 'drizzle-orm';

export interface DashboardStats {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    teamMembers: number;
    activeUsers: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    user: string;
    timestamp: string;
    project: string;
  }>;
  performance: {
    responseTime: number;
    uptime: number;
    errorRate: number;
    activeConnections: number;
  };
  charts: {
    tasksOverTime: Array<{
      date: string;
      created: number;
      completed: number;
    }>;
    projectProgress: Array<{
      name: string;
      progress: number;
      status: string;
    }>;
    teamProductivity: Array<{
      name: string;
      tasksCompleted: number;
      hoursWorked: number;
    }>;
  };
  notifications: {
    unread: number;
    recent: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      timestamp: string;
      read: boolean;
    }>;
  };
  aiInsights: {
    suggestions: string[];
    predictions: {
      projectCompletion: string;
      riskLevel: string;
      recommendedActions: string[];
    };
  };
}

/**
 * Получить статистику дашборда для пользователя
 */
export async function getDashboardStats(userId: string, workspaceId?: string): Promise<DashboardStats> {
  // Получаем воркспейсы пользователя
  const workspaces = await db
    .select({
      id: workspace.id,
      name: workspace.name,
    })
    .from(workspace)
    .innerJoin(workspaceMember, eq(workspace.id, workspaceMember.workspaceId))
    .where(eq(workspaceMember.userId, userId));

  // Получаем проекты для выбранного воркспейса или всех воркспейсов
  const targetWorkspaceId = workspaceId || workspaces[0]?.id;
  const projects = targetWorkspaceId
    ? await db
        .select({
          id: project.id,
          name: project.name,
          key: project.key,
        })
        .from(project)
        .where(eq(project.workspaceId, targetWorkspaceId))
    : [];

  // Считаем статистику по задачам
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let pendingTasks = 0;
  let aiActionsCount = 0;

  const projectStats = [];
  const teamProductivity = [];

  for (const project of projects) {
    // Получаем задачи проекта
    const issues = await db
      .select({
        id: issue.id,
        status: issue.status,
        assigneeId: issue.assigneeId,
        estimatedHours: issue.estimatedHours,
        actualHours: issue.actualHours,
      })
      .from(issue)
      .where(eq(issue.projectId, project.id));

    const projectCompleted = issues.filter(i => i.status === 'DONE').length;
    const projectInProgress = issues.filter(i => i.status === 'IN_PROGRESS').length;
    const projectPending = issues.filter(i => i.status === 'TODO').length;
    const projectTotal = issues.length;

    totalTasks += projectTotal;
    completedTasks += projectCompleted;
    inProgressTasks += projectInProgress;
    pendingTasks += projectPending;

    // Статистика проекта для графика прогресса
    const progress = projectTotal > 0 ? Math.round((projectCompleted / projectTotal) * 100) : 0;
    projectStats.push({
      name: project.name,
      progress,
      status: progress === 100 ? 'completed' : 'active',
    });

    // Получаем AI действия для проекта
    const vasilyActions = await db
      .select({
        id: vasilyAction.id,
      })
      .from(vasilyAction)
      .where(eq(vasilyAction.projectId, project.id));

    aiActionsCount += vasilyActions.length;

    // Группируем по assignee для продуктивности команды
    const assigneeStats = new Map<string, { tasks: number; hours: number; name: string }>();

    for (const issue of issues) {
      if (issue.assigneeId) {
        const existing = assigneeStats.get(issue.assigneeId) || { tasks: 0, hours: 0, name: '' };
        existing.tasks += issue.status === 'DONE' ? 1 : 0;
        existing.hours += issue.actualHours || issue.estimatedHours || 0;

        // Получаем имя пользователя если не знаем
        if (!existing.name) {
          const [userData] = await db
            .select({ name: user.name })
            .from(user)
            .where(eq(user.id, issue.assigneeId));
          existing.name = userData?.name || 'Unknown';
        }

        assigneeStats.set(issue.assigneeId, existing);
      }
    }

    // Добавляем статистику команды
    for (const [userId, stats] of assigneeStats) {
      teamProductivity.push({
        name: stats.name,
        tasksCompleted: stats.tasks,
        hoursWorked: Math.round(stats.hours),
      });
    }
  }

  // Получаем участников команды
  const teamMembers = await db
    .select({
      id: workspaceMember.id,
    })
    .from(workspaceMember)
    .where(eq(workspaceMember.workspaceId, targetWorkspaceId || workspaces[0]?.id || ''));

  // Генерируем моковые данные для демо (в реальном проекте эти данные будут из БД)
  const recentActivity = [
    {
      id: '1',
      type: 'task_completed',
      title: 'Задача "Исправить баг в аутентификации" завершена',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      project: projects[0]?.name || 'DeadLine Platform'
    },
    {
      id: '2',
      type: 'project_created',
      title: `Создан новый проект "${projects[1]?.name || 'Mobile App'}"`,
      user: 'Jane Smith',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      project: projects[1]?.name || 'Mobile App'
    },
    {
      id: '3',
      type: 'user_joined',
      title: 'Новый участник присоединился к команде',
      user: 'Mike Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      project: projects[0]?.name || 'DeadLine Platform'
    }
  ];

  const tasksOverTime = [
    { date: '2024-01-01', created: 12, completed: 8 },
    { date: '2024-01-02', created: 15, completed: 10 },
    { date: '2024-01-03', created: 8, completed: 12 },
    { date: '2024-01-04', created: 20, completed: 15 },
    { date: '2024-01-05', created: 18, completed: 18 }
  ];

  const notifications = {
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
        message: `Проект "${projects[0]?.name || 'DeadLine Platform'}" обновлен`,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false
      }
    ]
  };

  const aiInsights = {
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
  };

  return {
    overview: {
      totalProjects: projects.length,
      activeProjects: projects.length,
      completedProjects: 0, // TODO: добавить поле completed в схему проекта
      totalTasks,
      completedTasks,
      pendingTasks: pendingTasks + inProgressTasks,
      teamMembers: teamMembers.length,
      activeUsers: teamMembers.length // TODO: добавить проверку статуса пользователей
    },
    recentActivity,
    performance: {
      responseTime: 245,
      uptime: 99.9,
      errorRate: 0.1,
      activeConnections: 156
    },
    charts: {
      tasksOverTime,
      projectProgress: projectStats,
      teamProductivity: teamProductivity.slice(0, 4) // Ограничиваем до 4 человек для демо
    },
    notifications,
    aiInsights
  };
}

/**
 * Получить задачи по проекту
 */
export async function getIssuesByProjectId(projectId: string) {
  return await db
    .select()
    .from(issue)
    .where(eq(issue.projectId, projectId));
}

/**
 * Получить проекты по воркспейсу
 */
export async function getProjectsByWorkspaceId(workspaceId: string) {
  return await db
    .select({
      project: {
        id: project.id,
        name: project.name,
        key: project.key,
        description: project.description,
        workspaceId: project.workspaceId,
        leadId: project.leadId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }
    })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));
}

/**
 * Получить воркспейсы по пользователю
 */
export async function getWorkspacesByUserId(userId: string) {
  return await db
    .select({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        ownerId: workspace.ownerId,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      }
    })
    .from(workspace)
    .innerJoin(workspaceMember, eq(workspace.id, workspaceMember.workspaceId))
    .where(eq(workspaceMember.userId, userId));
}

/**
 * Получить действия Василия по проекту
 */
export async function getVasilyActions(projectId: string) {
  return await db
    .select()
    .from(vasilyAction)
    .where(eq(vasilyAction.projectId, projectId));
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(userId: string) {
  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return userData;
}
