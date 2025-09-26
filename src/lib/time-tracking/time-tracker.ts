import { LoggerService } from '@/lib/logger';
import { DatabaseService } from '@/lib/services/database-service';

interface TimeEntry {
  id: string;
  userId: string;
  taskId?: string;
  projectId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // в минутах
  isActive: boolean;
  category: 'development' | 'testing' | 'meeting' | 'research' | 'documentation' | 'other';
  tags: string[];
  billable: boolean;
  hourlyRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TimeTrackingSession {
  id: string;
  userId: string;
  taskId?: string;
  projectId?: string;
  startTime: Date;
  isActive: boolean;
  description: string;
  category: string;
  tags: string[];
}

interface TimeTrackingStats {
  totalTime: number; // в минутах
  todayTime: number;
  weekTime: number;
  monthTime: number;
  averageSessionDuration: number;
  mostProductiveHours: number[];
  categoryBreakdown: Record<string, number>;
  projectBreakdown: Record<string, number>;
  billableTime: number;
  nonBillableTime: number;
}

class TimeTracker {
  private activeSessions: Map<string, TimeTrackingSession> = new Map();

  // Начать отслеживание времени
  async startTracking(
    userId: string,
    taskId?: string,
    projectId?: string,
    description: string = '',
    category: string = 'development',
    tags: string[] = []
  ): Promise<TimeTrackingSession> {
    try {
      // Останавливаем активную сессию если есть
      await this.stopTracking(userId);

      const sessionId = this.generateSessionId();
      const session: TimeTrackingSession = {
        id: sessionId,
        userId,
        taskId,
        projectId,
        startTime: new Date(),
        isActive: true,
        description,
        category,
        tags
      };

      this.activeSessions.set(userId, session);

      LoggerService.api.info('Time tracking started', {
        sessionId,
        userId,
        taskId,
        projectId,
        description
      });

      return session;
    } catch (error: any) {
      LoggerService.error.error('Failed to start time tracking', {
        error: error.message,
        userId,
        taskId,
        projectId
      });
      throw error;
    }
  }

  // Остановить отслеживание времени
  async stopTracking(userId: string): Promise<TimeEntry | null> {
    try {
      const session = this.activeSessions.get(userId);
      if (!session) {
        return null;
      }

      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / (1000 * 60)); // в минутах

      const timeEntry: TimeEntry = {
        id: this.generateEntryId(),
        userId: session.userId,
        taskId: session.taskId,
        projectId: session.projectId,
        description: session.description,
        startTime: session.startTime,
        endTime,
        duration,
        isActive: false,
        category: session.category as any,
        tags: session.tags,
        billable: true, // TODO: Определить на основе настроек проекта
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Сохраняем запись времени
      await this.saveTimeEntry(timeEntry);

      // Удаляем активную сессию
      this.activeSessions.delete(userId);

      LoggerService.api.info('Time tracking stopped', {
        sessionId: session.id,
        userId,
        duration,
        description: session.description
      });

      return timeEntry;
    } catch (error: any) {
      LoggerService.error.error('Failed to stop time tracking', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  // Пауза отслеживания
  async pauseTracking(userId: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(userId);
      if (!session) {
        return false;
      }

      // Сохраняем текущую сессию как запись времени
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / (1000 * 60));

      const timeEntry: TimeEntry = {
        id: this.generateEntryId(),
        userId: session.userId,
        taskId: session.taskId,
        projectId: session.projectId,
        description: session.description,
        startTime: session.startTime,
        endTime,
        duration,
        isActive: false,
        category: session.category as any,
        tags: session.tags,
        billable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveTimeEntry(timeEntry);

      // Обновляем сессию с новым временем начала
      session.startTime = new Date();

      LoggerService.api.info('Time tracking paused', {
        sessionId: session.id,
        userId,
        duration
      });

      return true;
    } catch (error: any) {
      LoggerService.error.error('Failed to pause time tracking', {
        error: error.message,
        userId
      });
      return false;
    }
  }

  // Получить активную сессию
  getActiveSession(userId: string): TimeTrackingSession | null {
    return this.activeSessions.get(userId) || null;
  }

  // Получить все активные сессии
  getAllActiveSessions(): TimeTrackingSession[] {
    return Array.from(this.activeSessions.values());
  }

  // Сохранить запись времени
  private async saveTimeEntry(timeEntry: TimeEntry): Promise<void> {
    try {
      // TODO: Сохранить в базу данных
      // await DatabaseService.createTimeEntry(timeEntry);
      
      LoggerService.api.info('Time entry saved', {
        entryId: timeEntry.id,
        userId: timeEntry.userId,
        duration: timeEntry.duration
      });
    } catch (error: any) {
      LoggerService.error.error('Failed to save time entry', {
        error: error.message,
        entryId: timeEntry.id
      });
      throw error;
    }
  }

  // Получить записи времени пользователя
  async getUserTimeEntries(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    projectId?: string,
    taskId?: string
  ): Promise<TimeEntry[]> {
    try {
      // TODO: Получить из базы данных
      // const entries = await DatabaseService.getUserTimeEntries(userId, startDate, endDate, projectId, taskId);
      
      LoggerService.api.info('User time entries retrieved', {
        userId,
        startDate,
        endDate,
        projectId,
        taskId
      });

      return []; // Временная заглушка
    } catch (error: any) {
      LoggerService.error.error('Failed to get user time entries', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  // Получить статистику времени
  async getTimeTrackingStats(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeTrackingStats> {
    try {
      const entries = await this.getUserTimeEntries(userId, startDate, endDate);
      
      const stats: TimeTrackingStats = {
        totalTime: entries.reduce((sum, entry) => sum + (entry.duration || 0), 0),
        todayTime: this.calculateTodayTime(entries),
        weekTime: this.calculateWeekTime(entries),
        monthTime: this.calculateMonthTime(entries),
        averageSessionDuration: this.calculateAverageSessionDuration(entries),
        mostProductiveHours: this.calculateMostProductiveHours(entries),
        categoryBreakdown: this.calculateCategoryBreakdown(entries),
        projectBreakdown: this.calculateProjectBreakdown(entries),
        billableTime: entries.filter(entry => entry.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0),
        nonBillableTime: entries.filter(entry => !entry.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0)
      };

      LoggerService.api.info('Time tracking stats calculated', {
        userId,
        totalTime: stats.totalTime,
        billableTime: stats.billableTime
      });

      return stats;
    } catch (error: any) {
      LoggerService.error.error('Failed to get time tracking stats', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  // Получить статистику по проекту
  async getProjectTimeStats(projectId: string, startDate?: Date, endDate?: Date): Promise<any> {
    try {
      // TODO: Получить статистику по проекту из базы данных
      
      LoggerService.api.info('Project time stats retrieved', {
        projectId,
        startDate,
        endDate
      });

      return {
        totalTime: 0,
        teamMembers: 0,
        averageTimePerMember: 0,
        mostActiveMembers: [],
        timeByCategory: {},
        timeByTask: {}
      };
    } catch (error: any) {
      LoggerService.error.error('Failed to get project time stats', {
        error: error.message,
        projectId
      });
      throw error;
    }
  }

  // Экспорт данных времени
  async exportTimeData(
    userId: string,
    startDate: Date,
    endDate: Date,
    format: 'csv' | 'json' | 'excel' = 'csv'
  ): Promise<Buffer> {
    try {
      const entries = await this.getUserTimeEntries(userId, startDate, endDate);
      
      switch (format) {
        case 'csv':
          return this.exportToCSV(entries);
        case 'json':
          return this.exportToJSON(entries);
        case 'excel':
          return this.exportToExcel(entries);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error: any) {
      LoggerService.error.error('Failed to export time data', {
        error: error.message,
        userId,
        format
      });
      throw error;
    }
  }

  // Вспомогательные методы для расчетов
  private calculateTodayTime(entries: TimeEntry[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return entries
      .filter(entry => entry.startTime >= today && entry.startTime < tomorrow)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);
  }

  private calculateWeekTime(entries: TimeEntry[]): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return entries
      .filter(entry => entry.startTime >= weekAgo)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);
  }

  private calculateMonthTime(entries: TimeEntry[]): number {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return entries
      .filter(entry => entry.startTime >= monthAgo)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);
  }

  private calculateAverageSessionDuration(entries: TimeEntry[]): number {
    if (entries.length === 0) return 0;
    
    const totalDuration = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    return Math.round(totalDuration / entries.length);
  }

  private calculateMostProductiveHours(entries: TimeEntry[]): number[] {
    const hourCounts: Record<number, number> = {};
    
    entries.forEach(entry => {
      const hour = entry.startTime.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + (entry.duration || 0);
    });

    return Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private calculateCategoryBreakdown(entries: TimeEntry[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    entries.forEach(entry => {
      breakdown[entry.category] = (breakdown[entry.category] || 0) + (entry.duration || 0);
    });

    return breakdown;
  }

  private calculateProjectBreakdown(entries: TimeEntry[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    entries.forEach(entry => {
      if (entry.projectId) {
        breakdown[entry.projectId] = (breakdown[entry.projectId] || 0) + (entry.duration || 0);
      }
    });

    return breakdown;
  }

  // Экспорт в CSV
  private exportToCSV(entries: TimeEntry[]): Buffer {
    const headers = ['ID', 'User ID', 'Task ID', 'Project ID', 'Description', 'Start Time', 'End Time', 'Duration (min)', 'Category', 'Tags', 'Billable'];
    const rows = entries.map(entry => [
      entry.id,
      entry.userId,
      entry.taskId || '',
      entry.projectId || '',
      entry.description,
      entry.startTime.toISOString(),
      entry.endTime?.toISOString() || '',
      entry.duration || 0,
      entry.category,
      entry.tags.join(';'),
      entry.billable ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return Buffer.from(csvContent, 'utf-8');
  }

  // Экспорт в JSON
  private exportToJSON(entries: TimeEntry[]): Buffer {
    return Buffer.from(JSON.stringify(entries, null, 2), 'utf-8');
  }

  // Экспорт в Excel
  private async exportToExcel(entries: TimeEntry[]): Promise<Buffer> {
    // TODO: Использовать excel-generator для создания Excel файла
    return Buffer.from('Excel export not implemented yet', 'utf-8');
  }

  // Генерация ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEntryId(): string {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Экспорт трекера
export const timeTracker = new TimeTracker();
