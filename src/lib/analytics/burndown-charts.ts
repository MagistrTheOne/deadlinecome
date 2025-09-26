import { LoggerService } from '@/lib/logger';
import { DatabaseService } from '@/lib/services/database-service';

interface Sprint {
  id: string;
  name: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  totalStoryPoints: number;
  completedStoryPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BurndownDataPoint {
  date: string;
  idealRemaining: number;
  actualRemaining: number;
  completed: number;
  added: number;
  total: number;
}

interface BurndownChart {
  sprintId: string;
  sprintName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalStoryPoints: number;
  dataPoints: BurndownDataPoint[];
  currentProgress: number;
  isOnTrack: boolean;
  velocity: number;
  projectedCompletion: string;
}

interface VelocityChart {
  sprintId: string;
  sprintName: string;
  plannedVelocity: number;
  actualVelocity: number;
  completedStories: number;
  totalStories: number;
  averageStorySize: number;
  teamCapacity: number;
  utilizationRate: number;
}

interface CumulativeFlowChart {
  sprintId: string;
  sprintName: string;
  dates: string[];
  backlog: number[];
  inProgress: number[];
  testing: number[];
  done: number[];
  blocked: number[];
}

class BurndownChartsService {
  // Создать спринт
  async createSprint(
    name: string,
    projectId: string,
    startDate: Date,
    endDate: Date,
    totalStoryPoints: number
  ): Promise<Sprint> {
    try {
      const sprint: Sprint = {
        id: this.generateSprintId(),
        name,
        projectId,
        startDate,
        endDate,
        totalStoryPoints,
        completedStoryPoints: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // TODO: Сохранить в базу данных
      // await DatabaseService.createSprint(sprint);

      LoggerService.api.info('Sprint created', {
        sprintId: sprint.id,
        name,
        projectId,
        totalStoryPoints
      });

      return sprint;
    } catch (error: any) {
      LoggerService.error.error('Failed to create sprint', {
        error: error.message,
        name,
        projectId
      });
      throw error;
    }
  }

  // Получить burndown chart для спринта
  async getBurndownChart(sprintId: string): Promise<BurndownChart> {
    try {
      // TODO: Получить данные спринта из базы данных
      const sprint = await this.getSprint(sprintId);
      if (!sprint) {
        throw new Error('Sprint not found');
      }

      // Генерируем точки данных для burndown chart
      const dataPoints = await this.generateBurndownDataPoints(sprint);
      
      // Рассчитываем текущий прогресс
      const currentProgress = this.calculateCurrentProgress(dataPoints);
      
      // Проверяем, идет ли спринт по плану
      const isOnTrack = this.isSprintOnTrack(dataPoints);
      
      // Рассчитываем скорость команды
      const velocity = this.calculateVelocity(dataPoints);
      
      // Прогнозируем завершение
      const projectedCompletion = this.projectCompletion(dataPoints, sprint.endDate);

      const chart: BurndownChart = {
        sprintId: sprint.id,
        sprintName: sprint.name,
        startDate: sprint.startDate.toISOString().split('T')[0],
        endDate: sprint.endDate.toISOString().split('T')[0],
        totalDays: this.calculateTotalDays(sprint.startDate, sprint.endDate),
        totalStoryPoints: sprint.totalStoryPoints,
        dataPoints,
        currentProgress,
        isOnTrack,
        velocity,
        projectedCompletion
      };

      LoggerService.api.info('Burndown chart generated', {
        sprintId,
        totalStoryPoints: sprint.totalStoryPoints,
        currentProgress,
        isOnTrack
      });

      return chart;
    } catch (error: any) {
      LoggerService.error.error('Failed to get burndown chart', {
        error: error.message,
        sprintId
      });
      throw error;
    }
  }

  // Получить velocity chart
  async getVelocityChart(sprintId: string): Promise<VelocityChart> {
    try {
      const sprint = await this.getSprint(sprintId);
      if (!sprint) {
        throw new Error('Sprint not found');
      }

      // TODO: Получить данные о задачах и команде
      const plannedVelocity = sprint.totalStoryPoints;
      const actualVelocity = sprint.completedStoryPoints;
      const completedStories = 0; // TODO: Подсчитать завершенные истории
      const totalStories = 0; // TODO: Подсчитать общее количество историй
      const averageStorySize = totalStories > 0 ? plannedVelocity / totalStories : 0;
      const teamCapacity = 0; // TODO: Получить capacity команды
      const utilizationRate = teamCapacity > 0 ? (actualVelocity / teamCapacity) * 100 : 0;

      const chart: VelocityChart = {
        sprintId: sprint.id,
        sprintName: sprint.name,
        plannedVelocity,
        actualVelocity,
        completedStories,
        totalStories,
        averageStorySize,
        teamCapacity,
        utilizationRate
      };

      LoggerService.api.info('Velocity chart generated', {
        sprintId,
        plannedVelocity,
        actualVelocity,
        utilizationRate
      });

      return chart;
    } catch (error: any) {
      LoggerService.error.error('Failed to get velocity chart', {
        error: error.message,
        sprintId
      });
      throw error;
    }
  }

  // Получить cumulative flow chart
  async getCumulativeFlowChart(sprintId: string): Promise<CumulativeFlowChart> {
    try {
      const sprint = await this.getSprint(sprintId);
      if (!sprint) {
        throw new Error('Sprint not found');
      }

      // TODO: Получить данные о статусах задач по дням
      const dates = this.generateDateRange(sprint.startDate, sprint.endDate);
      const backlog = dates.map(() => 0); // TODO: Получить реальные данные
      const inProgress = dates.map(() => 0);
      const testing = dates.map(() => 0);
      const done = dates.map(() => 0);
      const blocked = dates.map(() => 0);

      const chart: CumulativeFlowChart = {
        sprintId: sprint.id,
        sprintName: sprint.name,
        dates: dates.map(date => date.toISOString().split('T')[0]),
        backlog,
        inProgress,
        testing,
        done,
        blocked
      };

      LoggerService.api.info('Cumulative flow chart generated', {
        sprintId,
        totalDays: dates.length
      });

      return chart;
    } catch (error: any) {
      LoggerService.error.error('Failed to get cumulative flow chart', {
        error: error.message,
        sprintId
      });
      throw error;
    }
  }

  // Получить статистику спринта
  async getSprintStats(sprintId: string): Promise<any> {
    try {
      const sprint = await this.getSprint(sprintId);
      if (!sprint) {
        throw new Error('Sprint not found');
      }

      const totalDays = this.calculateTotalDays(sprint.startDate, sprint.endDate);
      const daysPassed = this.calculateDaysPassed(sprint.startDate, new Date());
      const daysRemaining = totalDays - daysPassed;
      const progressPercentage = (sprint.completedStoryPoints / sprint.totalStoryPoints) * 100;
      const idealProgress = (daysPassed / totalDays) * 100;
      const isBehind = progressPercentage < idealProgress - 10; // 10% tolerance
      const isAhead = progressPercentage > idealProgress + 10;

      const stats = {
        sprint: {
          id: sprint.id,
          name: sprint.name,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          totalDays,
          daysPassed,
          daysRemaining
        },
        progress: {
          totalStoryPoints: sprint.totalStoryPoints,
          completedStoryPoints: sprint.completedStoryPoints,
          remainingStoryPoints: sprint.totalStoryPoints - sprint.completedStoryPoints,
          progressPercentage: Math.round(progressPercentage * 100) / 100,
          idealProgress: Math.round(idealProgress * 100) / 100
        },
        status: {
          isBehind,
          isAhead,
          isOnTrack: !isBehind && !isAhead,
          riskLevel: this.calculateRiskLevel(progressPercentage, idealProgress)
        },
        velocity: {
          averageDailyVelocity: sprint.completedStoryPoints / Math.max(daysPassed, 1),
          requiredDailyVelocity: (sprint.totalStoryPoints - sprint.completedStoryPoints) / Math.max(daysRemaining, 1),
          projectedCompletion: this.projectSprintCompletion(sprint, daysRemaining)
        }
      };

      LoggerService.api.info('Sprint stats calculated', {
        sprintId,
        progressPercentage,
        isBehind,
        riskLevel: stats.status.riskLevel
      });

      return stats;
    } catch (error: any) {
      LoggerService.error.error('Failed to get sprint stats', {
        error: error.message,
        sprintId
      });
      throw error;
    }
  }

  // Обновить прогресс спринта
  async updateSprintProgress(sprintId: string, completedStoryPoints: number): Promise<void> {
    try {
      // TODO: Обновить в базе данных
      // await DatabaseService.updateSprintProgress(sprintId, completedStoryPoints);

      LoggerService.api.info('Sprint progress updated', {
        sprintId,
        completedStoryPoints
      });
    } catch (error: any) {
      LoggerService.error.error('Failed to update sprint progress', {
        error: error.message,
        sprintId,
        completedStoryPoints
      });
      throw error;
    }
  }

  // Вспомогательные методы
  private async getSprint(sprintId: string): Promise<Sprint | null> {
    // TODO: Получить из базы данных
    return null;
  }

  private async generateBurndownDataPoints(sprint: Sprint): Promise<BurndownDataPoint[]> {
    const dataPoints: BurndownDataPoint[] = [];
    const totalDays = this.calculateTotalDays(sprint.startDate, sprint.endDate);
    
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(sprint.startDate);
      date.setDate(date.getDate() + i);
      
      const idealRemaining = sprint.totalStoryPoints - (sprint.totalStoryPoints * i / totalDays);
      const actualRemaining = Math.max(0, sprint.totalStoryPoints - sprint.completedStoryPoints);
      
      dataPoints.push({
        date: date.toISOString().split('T')[0],
        idealRemaining,
        actualRemaining,
        completed: sprint.completedStoryPoints,
        added: 0, // TODO: Подсчитать добавленные задачи
        total: sprint.totalStoryPoints
      });
    }
    
    return dataPoints;
  }

  private calculateCurrentProgress(dataPoints: BurndownDataPoint[]): number {
    if (dataPoints.length === 0) return 0;
    
    const latest = dataPoints[dataPoints.length - 1];
    return (latest.completed / latest.total) * 100;
  }

  private isSprintOnTrack(dataPoints: BurndownDataPoint[]): boolean {
    if (dataPoints.length === 0) return true;
    
    const latest = dataPoints[dataPoints.length - 1];
    const deviation = Math.abs(latest.actualRemaining - latest.idealRemaining);
    const tolerance = latest.total * 0.1; // 10% tolerance
    
    return deviation <= tolerance;
  }

  private calculateVelocity(dataPoints: BurndownDataPoint[]): number {
    if (dataPoints.length < 2) return 0;
    
    const completed = dataPoints[dataPoints.length - 1].completed;
    const days = dataPoints.length - 1;
    
    return completed / days;
  }

  private projectCompletion(dataPoints: BurndownDataPoint[], endDate: Date): string {
    if (dataPoints.length < 2) return endDate.toISOString().split('T')[0];
    
    const latest = dataPoints[dataPoints.length - 1];
    const remaining = latest.actualRemaining;
    const velocity = this.calculateVelocity(dataPoints);
    
    if (velocity <= 0) return endDate.toISOString().split('T')[0];
    
    const daysToComplete = Math.ceil(remaining / velocity);
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysToComplete);
    
    return projectedDate.toISOString().split('T')[0];
  }

  private calculateTotalDays(startDate: Date, endDate: Date): number {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateDaysPassed(startDate: Date, currentDate: Date): number {
    const diffTime = currentDate.getTime() - startDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateRiskLevel(progressPercentage: number, idealProgress: number): 'low' | 'medium' | 'high' {
    const deviation = Math.abs(progressPercentage - idealProgress);
    
    if (deviation <= 10) return 'low';
    if (deviation <= 25) return 'medium';
    return 'high';
  }

  private projectSprintCompletion(sprint: Sprint, daysRemaining: number): string {
    const remainingStoryPoints = sprint.totalStoryPoints - sprint.completedStoryPoints;
    const averageVelocity = sprint.completedStoryPoints / Math.max(this.calculateDaysPassed(sprint.startDate, new Date()), 1);
    
    if (averageVelocity <= 0) return sprint.endDate.toISOString().split('T')[0];
    
    const daysToComplete = Math.ceil(remainingStoryPoints / averageVelocity);
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysToComplete);
    
    return projectedDate.toISOString().split('T')[0];
  }

  private generateDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  private generateSprintId(): string {
    return `sprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Экспорт сервиса
export const burndownChartsService = new BurndownChartsService();
