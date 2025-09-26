import { eq, and, desc, asc, sql, gte, lte, between } from 'drizzle-orm';
import { db } from '@/lib/db';
import { 
  boardMetrics,
  boardColumnAnalytics,
  boardUserAnalytics,
  boardBurndownData,
  boardVelocityData,
  boardCumulativeFlowData,
  boardReport,
  boardReportTemplate,
  boardAnalyticsNotification,
  type BoardMetrics,
  type NewBoardMetrics,
  type BoardColumnAnalytics,
  type NewBoardColumnAnalytics,
  type BoardUserAnalytics,
  type NewBoardUserAnalytics,
  type BoardBurndownData,
  type NewBoardBurndownData,
  type BoardVelocityData,
  type NewBoardVelocityData,
  type BoardCumulativeFlowData,
  type NewBoardCumulativeFlowData,
  type BoardReport,
  type NewBoardReport,
  type BoardReportTemplate,
  type NewBoardReportTemplate
} from '@/lib/db/schema-analytics';
import { issue } from '@/lib/db/schema';
import { boardColumn } from '@/lib/db/schema-boards';
import { LoggerService } from '@/lib/logger';

export class AnalyticsService {
  /**
   * Получить общую аналитику доски
   */
  static async getBoardAnalytics(
    boardId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    overview: {
      totalIssues: number;
      completedIssues: number;
      inProgressIssues: number;
      pendingIssues: number;
      overdueIssues: number;
      completionRate: number;
      averageResolutionTime: number;
      throughput: number;
    };
    trends: {
      issuesOverTime: Array<{ date: string; created: number; completed: number }>;
      velocityTrend: Array<{ date: string; velocity: number }>;
      cycleTimeTrend: Array<{ date: string; cycleTime: number }>;
    };
    insights: Array<{
      type: string;
      title: string;
      description: string;
      severity: 'info' | 'warning' | 'error' | 'critical';
      recommendation?: string;
    }>;
  }> {
    try {
      // Получаем текущие метрики
      const currentMetrics = await this.getCurrentBoardMetrics(boardId);
      
      // Получаем исторические данные
      const historicalData = await this.getHistoricalBoardMetrics(boardId, startDate, endDate);
      
      // Получаем тренды
      const trends = await this.getBoardTrends(boardId, startDate, endDate);
      
      // Генерируем инсайты
      const insights = await this.generateBoardInsights(boardId, currentMetrics);

      return {
        overview: currentMetrics,
        trends,
        insights
      };

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'getBoardAnalytics');
      throw error;
    }
  }

  /**
   * Получить текущие метрики доски
   */
  static async getCurrentBoardMetrics(boardId: string): Promise<any> {
    try {
      // Получаем все задачи проекта доски
      const boardData = await db.select().from(board).where(eq(board.id, boardId)).limit(1);
      if (!boardData[0]?.projectId) {
        throw new Error('Board project not found');
      }

      const issues = await db
        .select()
        .from(issue)
        .where(eq(issue.projectId, boardData[0].projectId));

      const totalIssues = issues.length;
      const completedIssues = issues.filter(i => i.status === 'DONE').length;
      const inProgressIssues = issues.filter(i => i.status === 'IN_PROGRESS').length;
      const pendingIssues = issues.filter(i => i.status === 'TODO').length;
      const overdueIssues = issues.filter(i => 
        i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'DONE'
      ).length;

      const completionRate = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;

      // Вычисляем среднее время решения
      const resolvedIssues = issues.filter(i => i.status === 'DONE' && i.resolvedAt);
      const averageResolutionTime = resolvedIssues.length > 0 
        ? resolvedIssues.reduce((sum, i) => {
            const created = new Date(i.createdAt).getTime();
            const resolved = new Date(i.resolvedAt!).getTime();
            return sum + (resolved - created);
          }, 0) / resolvedIssues.length / (1000 * 60 * 60 * 24) // В днях
        : 0;

      return {
        totalIssues,
        completedIssues,
        inProgressIssues,
        pendingIssues,
        overdueIssues,
        completionRate: Math.round(completionRate * 100) / 100,
        averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
        throughput: completedIssues // Упрощенный расчет throughput
      };

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'getCurrentBoardMetrics');
      throw error;
    }
  }

  /**
   * Получить исторические метрики доски
   */
  static async getHistoricalBoardMetrics(boardId: string, startDate?: Date, endDate?: Date): Promise<BoardMetrics[]> {
    try {
      let query = db
        .select()
        .from(boardMetrics)
        .where(eq(boardMetrics.boardId, boardId));

      if (startDate && endDate) {
        query = query.where(and(
          gte(boardMetrics.date, startDate),
          lte(boardMetrics.date, endDate)
        ));
      }

      const metrics = await query.orderBy(asc(boardMetrics.date));
      return metrics;

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'getHistoricalBoardMetrics');
      throw error;
    }
  }

  /**
   * Получить тренды доски
   */
  static async getBoardTrends(
    boardId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    issuesOverTime: Array<{ date: string; created: number; completed: number }>;
    velocityTrend: Array<{ date: string; velocity: number }>;
    cycleTimeTrend: Array<{ date: string; cycleTime: number }>;
  }> {
    try {
      // Получаем данные за последние 30 дней
      const end = endDate || new Date();
      const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      const metrics = await this.getHistoricalBoardMetrics(boardId, start, end);

      // Формируем тренды
      const issuesOverTime = metrics.map(m => ({
        date: m.date.toISOString().split('T')[0],
        created: m.newIssues,
        completed: m.resolvedIssues
      }));

      const velocityTrend = metrics.map(m => ({
        date: m.date.toISOString().split('T')[0],
        velocity: Number(m.throughput || 0)
      }));

      const cycleTimeTrend = metrics.map(m => ({
        date: m.date.toISOString().split('T')[0],
        cycleTime: Number(m.cycleTime || 0)
      }));

      return {
        issuesOverTime,
        velocityTrend,
        cycleTimeTrend
      };

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'getBoardTrends');
      throw error;
    }
  }

  /**
   * Генерировать инсайты для доски
   */
  static async generateBoardInsights(boardId: string, metrics: any): Promise<Array<{
    type: string;
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    recommendation?: string;
  }>> {
    try {
      const insights = [];

      // Проверяем перегрузку
      if (metrics.inProgressIssues > 10) {
        insights.push({
          type: 'workload',
          title: 'Высокая загрузка',
          description: `В работе ${metrics.inProgressIssues} задач. Это может привести к снижению качества.`,
          severity: 'warning' as const,
          recommendation: 'Рассмотрите возможность уменьшения количества задач в работе.'
        });
      }

      // Проверяем просроченные задачи
      if (metrics.overdueIssues > 0) {
        insights.push({
          type: 'overdue',
          title: 'Просроченные задачи',
          description: `${metrics.overdueIssues} задач просрочены.`,
          severity: 'error' as const,
          recommendation: 'Пересмотрите приоритеты и сроки выполнения задач.'
        });
      }

      // Проверяем скорость выполнения
      if (metrics.completionRate < 50) {
        insights.push({
          type: 'performance',
          title: 'Низкая скорость выполнения',
          description: `Только ${metrics.completionRate}% задач завершены.`,
          severity: 'warning' as const,
          recommendation: 'Проанализируйте узкие места в процессе.'
        });
      }

      // Проверяем время решения
      if (metrics.averageResolutionTime > 7) {
        insights.push({
          type: 'resolution_time',
          title: 'Долгое время решения',
          description: `Среднее время решения: ${metrics.averageResolutionTime} дней.`,
          severity: 'info' as const,
          recommendation: 'Оптимизируйте процесс решения задач.'
        });
      }

      return insights;

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'generateBoardInsights');
      throw error;
    }
  }

  /**
   * Получить аналитику по колонкам
   */
  static async getColumnAnalytics(boardId: string): Promise<Array<{
    columnId: string;
    columnName: string;
    issuesCount: number;
    averageTimeInColumn: number;
    wipUtilization: number;
    bottleneckScore: number;
  }>> {
    try {
      // Получаем колонки доски
      const columns = await db
        .select()
        .from(boardColumn)
        .where(eq(boardColumn.boardId, boardId))
        .orderBy(asc(boardColumn.order));

      const columnAnalytics = [];

      for (const column of columns) {
        // Получаем задачи в колонке
        const issues = await db
          .select()
          .from(issue)
          .where(eq(issue.status, column.status));

        const issuesCount = issues.length;
        const wipUtilization = column.wipLimit 
          ? (issuesCount / column.wipLimit) * 100 
          : 0;

        // Вычисляем среднее время в колонке (упрощенно)
        const averageTimeInColumn = issuesCount > 0 ? 2.5 : 0; // Дни

        // Вычисляем оценку узкого места
        const bottleneckScore = wipUtilization > 80 ? 90 : wipUtilization;

        columnAnalytics.push({
          columnId: column.id,
          columnName: column.name,
          issuesCount,
          averageTimeInColumn,
          wipUtilization: Math.round(wipUtilization * 100) / 100,
          bottleneckScore: Math.round(bottleneckScore * 100) / 100
        });
      }

      return columnAnalytics;

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'getColumnAnalytics');
      throw error;
    }
  }

  /**
   * Получить аналитику по пользователям
   */
  static async getUserAnalytics(boardId: string): Promise<Array<{
    userId: string;
    userName: string;
    issuesAssigned: number;
    issuesCompleted: number;
    averageResolutionTime: number;
    productivityScore: number;
    collaborationScore: number;
  }>> {
    try {
      // Получаем все задачи проекта доски
      const boardData = await db.select().from(board).where(eq(board.id, boardId)).limit(1);
      if (!boardData[0]?.projectId) {
        throw new Error('Board project not found');
      }

      const issues = await db
        .select()
        .from(issue)
        .where(eq(issue.projectId, boardData[0].projectId));

      // Группируем по пользователям
      const userStats = new Map<string, {
        userId: string;
        issuesAssigned: number;
        issuesCompleted: number;
        totalResolutionTime: number;
        resolutionCount: number;
      }>();

      for (const issueItem of issues) {
        if (issueItem.assigneeId) {
          if (!userStats.has(issueItem.assigneeId)) {
            userStats.set(issueItem.assigneeId, {
              userId: issueItem.assigneeId,
              issuesAssigned: 0,
              issuesCompleted: 0,
              totalResolutionTime: 0,
              resolutionCount: 0
            });
          }

          const stats = userStats.get(issueItem.assigneeId)!;
          stats.issuesAssigned++;

          if (issueItem.status === 'DONE') {
            stats.issuesCompleted++;
            if (issueItem.resolvedAt) {
              const created = new Date(issueItem.createdAt).getTime();
              const resolved = new Date(issueItem.resolvedAt).getTime();
              stats.totalResolutionTime += (resolved - created) / (1000 * 60 * 60 * 24); // Дни
              stats.resolutionCount++;
            }
          }
        }
      }

      // Формируем результат
      const userAnalytics = [];
      for (const [userId, stats] of userStats) {
        const averageResolutionTime = stats.resolutionCount > 0 
          ? stats.totalResolutionTime / stats.resolutionCount 
          : 0;

        const productivityScore = stats.issuesCompleted > 0 
          ? Math.min((stats.issuesCompleted / stats.issuesAssigned) * 100, 100)
          : 0;

        userAnalytics.push({
          userId,
          userName: `User ${userId}`, // В реальном проекте здесь было бы имя пользователя
          issuesAssigned: stats.issuesAssigned,
          issuesCompleted: stats.issuesCompleted,
          averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
          productivityScore: Math.round(productivityScore * 100) / 100,
          collaborationScore: 75 // Заглушка
        });
      }

      return userAnalytics;

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'getUserAnalytics');
      throw error;
    }
  }

  /**
   * Получить burndown данные
   */
  static async getBurndownData(boardId: string, sprintId?: string): Promise<BoardBurndownData[]> {
    try {
      let query = db
        .select()
        .from(boardBurndownData)
        .where(eq(boardBurndownData.boardId, boardId));

      if (sprintId) {
        query = query.where(eq(boardBurndownData.sprintId, sprintId));
      }

      const burndownData = await query.orderBy(asc(boardBurndownData.date));
      return burndownData;

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'getBurndownData');
      throw error;
    }
  }

  /**
   * Получить velocity данные
   */
  static async getVelocityData(boardId: string): Promise<BoardVelocityData[]> {
    try {
      const velocityData = await db
        .select()
        .from(boardVelocityData)
        .where(eq(boardVelocityData.boardId, boardId))
        .orderBy(asc(boardVelocityData.sprintNumber));

      return velocityData;

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'getVelocityData');
      throw error;
    }
  }

  /**
   * Создать отчет
   */
  static async createReport(data: {
    boardId: string;
    name: string;
    description?: string;
    type: string;
    createdById: string;
    isPublic?: boolean;
    filters?: any;
  }): Promise<BoardReport> {
    try {
      const [report] = await db
        .insert(boardReport)
        .values({
          boardId: data.boardId,
          name: data.name,
          description: data.description,
          type: data.type,
          createdById: data.createdById,
          isPublic: data.isPublic || false,
          filters: data.filters || {}
        })
        .returning();

      LoggerService.logUserAction('board-report-created', data.createdById, {
        reportId: report.id,
        boardId: data.boardId,
        name: report.name,
        type: report.type
      });

      return report;

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'createReport');
      throw error;
    }
  }

  /**
   * Получить отчеты доски
   */
  static async getBoardReports(boardId: string, userId?: string): Promise<BoardReport[]> {
    try {
      let query = db
        .select()
        .from(boardReport)
        .where(eq(boardReport.boardId, boardId));

      if (userId) {
        query = query.where(or(
          eq(boardReport.isPublic, true),
          eq(boardReport.createdById, userId)
        ));
      }

      const reports = await query.orderBy(desc(boardReport.updatedAt));
      return reports;

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'getBoardReports');
      throw error;
    }
  }

  /**
   * Сгенерировать данные отчета
   */
  static async generateReportData(reportId: string): Promise<any> {
    try {
      const [report] = await db
        .select()
        .from(boardReport)
        .where(eq(boardReport.id, reportId))
        .limit(1);

      if (!report) {
        throw new Error('Report not found');
      }

      let reportData = {};

      switch (report.type) {
        case 'burndown':
          reportData = await this.getBurndownData(report.boardId);
          break;
        case 'velocity':
          reportData = await this.getVelocityData(report.boardId);
          break;
        case 'cumulative_flow':
          reportData = await this.getCumulativeFlowData(report.boardId);
          break;
        case 'user_productivity':
          reportData = await this.getUserAnalytics(report.boardId);
          break;
        default:
          reportData = await this.getBoardAnalytics(report.boardId);
      }

      // Обновляем отчет с данными
      await db
        .update(boardReport)
        .set({
          data: reportData,
          lastGenerated: new Date(),
          updatedAt: new Date()
        })
        .where(eq(boardReport.id, reportId));

      return reportData;

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'generateReportData');
      throw error;
    }
  }

  /**
   * Получить cumulative flow данные
   */
  private static async getCumulativeFlowData(boardId: string): Promise<BoardCumulativeFlowData[]> {
    try {
      const cumulativeFlowData = await db
        .select()
        .from(boardCumulativeFlowData)
        .where(eq(boardCumulativeFlowData.boardId, boardId))
        .orderBy(asc(boardCumulativeFlowData.date));

      return cumulativeFlowData;

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'getCumulativeFlowData');
      throw error;
    }
  }

  /**
   * Обновить метрики доски
   */
  static async updateBoardMetrics(boardId: string): Promise<void> {
    try {
      const metrics = await this.getCurrentBoardMetrics(boardId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Проверяем, есть ли уже метрики за сегодня
      const [existingMetrics] = await db
        .select()
        .from(boardMetrics)
        .where(and(
          eq(boardMetrics.boardId, boardId),
          eq(boardMetrics.date, today)
        ))
        .limit(1);

      if (existingMetrics) {
        // Обновляем существующие метрики
        await db
          .update(boardMetrics)
          .set({
            totalIssues: metrics.totalIssues,
            completedIssues: metrics.completedIssues,
            inProgressIssues: metrics.inProgressIssues,
            pendingIssues: metrics.pendingIssues,
            overdueIssues: metrics.overdueIssues,
            averageResolutionTime: metrics.averageResolutionTime,
            throughput: metrics.throughput
          })
          .where(eq(boardMetrics.id, existingMetrics.id));
      } else {
        // Создаем новые метрики
        await db.insert(boardMetrics).values({
          boardId,
          date: today,
          totalIssues: metrics.totalIssues,
          completedIssues: metrics.completedIssues,
          inProgressIssues: metrics.inProgressIssues,
          pendingIssues: metrics.pendingIssues,
          overdueIssues: metrics.overdueIssues,
          averageResolutionTime: metrics.averageResolutionTime,
          throughput: metrics.throughput
        });
      }

      LoggerService.logUserAction('board-metrics-updated', 'system', {
        boardId,
        metrics
      });

    } catch (error) {
      LoggerService.logError(error as Error, 'analytics-service', 'updateBoardMetrics');
      throw error;
    }
  }
}
