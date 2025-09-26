import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { 
  boardSwimlane,
  boardSwimlaneUserSettings,
  boardSwimlaneGroup,
  boardSwimlaneHistory,
  type BoardSwimlane,
  type NewBoardSwimlane,
  type BoardSwimlaneUserSettings,
  type NewBoardSwimlaneUserSettings,
  type BoardSwimlaneGroup,
  type NewBoardSwimlaneGroup
} from '@/lib/db/schema-swimlanes';
import { issue } from '@/lib/db/schema';
import { LoggerService } from '@/lib/logger';

export class SwimlaneService {
  /**
   * Создать swimlane для доски
   */
  static async createSwimlane(data: {
    boardId: string;
    name: string;
    type: 'assignee' | 'epic' | 'priority' | 'component' | 'fixVersion' | 'custom';
    field?: string;
    color?: string;
    order: number;
    settings?: any;
  }): Promise<BoardSwimlane> {
    try {
      const [newSwimlane] = await db
        .insert(boardSwimlane)
        .values({
          boardId: data.boardId,
          name: data.name,
          type: data.type,
          field: data.field,
          color: data.color,
          order: data.order,
          settings: data.settings || {
            groupBy: data.field || data.type,
            showEmpty: true,
            showSubtasks: true,
            showEpics: true
          }
        })
        .returning();

      LoggerService.logUserAction('swimlane-created', 'system', {
        swimlaneId: newSwimlane.id,
        boardId: data.boardId,
        name: newSwimlane.name,
        type: newSwimlane.type
      });

      return newSwimlane;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'createSwimlane');
      throw error;
    }
  }

  /**
   * Получить swimlanes доски
   */
  static async getBoardSwimlanes(boardId: string): Promise<BoardSwimlane[]> {
    try {
      const swimlanes = await db
        .select()
        .from(boardSwimlane)
        .where(and(eq(boardSwimlane.boardId, boardId), eq(boardSwimlane.isVisible, true)))
        .orderBy(asc(boardSwimlane.order));

      return swimlanes;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'getBoardSwimlanes');
      throw error;
    }
  }

  /**
   * Получить swimlane по ID
   */
  static async getSwimlaneById(swimlaneId: string): Promise<BoardSwimlane | null> {
    try {
      const [swimlane] = await db
        .select()
        .from(boardSwimlane)
        .where(eq(boardSwimlane.id, swimlaneId))
        .limit(1);

      return swimlane || null;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'getSwimlaneById');
      throw error;
    }
  }

  /**
   * Обновить swimlane
   */
  static async updateSwimlane(swimlaneId: string, data: Partial<NewBoardSwimlane>): Promise<BoardSwimlane> {
    try {
      const [updatedSwimlane] = await db
        .update(boardSwimlane)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(boardSwimlane.id, swimlaneId))
        .returning();

      LoggerService.logUserAction('swimlane-updated', 'system', {
        swimlaneId,
        changes: data
      });

      return updatedSwimlane;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'updateSwimlane');
      throw error;
    }
  }

  /**
   * Удалить swimlane
   */
  static async deleteSwimlane(swimlaneId: string): Promise<boolean> {
    try {
      await db.delete(boardSwimlane).where(eq(boardSwimlane.id, swimlaneId));

      LoggerService.logUserAction('swimlane-deleted', 'system', { swimlaneId });

      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'deleteSwimlane');
      throw error;
    }
  }

  /**
   * Переупорядочить swimlanes
   */
  static async reorderSwimlanes(boardId: string, swimlaneOrders: Array<{ swimlaneId: string; order: number }>): Promise<boolean> {
    try {
      for (const { swimlaneId, order } of swimlaneOrders) {
        await db
          .update(boardSwimlane)
          .set({ order, updatedAt: new Date() })
          .where(and(eq(boardSwimlane.id, swimlaneId), eq(boardSwimlane.boardId, boardId)));
      }

      LoggerService.logUserAction('swimlanes-reordered', 'system', {
        boardId,
        swimlaneOrders
      });

      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'reorderSwimlanes');
      throw error;
    }
  }

  /**
   * Получить настройки пользователя для swimlane
   */
  static async getUserSwimlaneSettings(boardId: string, swimlaneId: string, userId: string): Promise<BoardSwimlaneUserSettings | null> {
    try {
      const [settings] = await db
        .select()
        .from(boardSwimlaneUserSettings)
        .where(and(
          eq(boardSwimlaneUserSettings.boardId, boardId),
          eq(boardSwimlaneUserSettings.swimlaneId, swimlaneId),
          eq(boardSwimlaneUserSettings.userId, userId)
        ))
        .limit(1);

      return settings || null;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'getUserSwimlaneSettings');
      throw error;
    }
  }

  /**
   * Обновить настройки пользователя для swimlane
   */
  static async updateUserSwimlaneSettings(
    boardId: string,
    swimlaneId: string,
    userId: string,
    settings: Partial<NewBoardSwimlaneUserSettings>
  ): Promise<BoardSwimlaneUserSettings> {
    try {
      const existingSettings = await this.getUserSwimlaneSettings(boardId, swimlaneId, userId);

      if (existingSettings) {
        const [updatedSettings] = await db
          .update(boardSwimlaneUserSettings)
          .set({ ...settings, updatedAt: new Date() })
          .where(eq(boardSwimlaneUserSettings.id, existingSettings.id))
          .returning();

        return updatedSettings;
      } else {
        const [newSettings] = await db
          .insert(boardSwimlaneUserSettings)
          .values({
            boardId,
            swimlaneId,
            userId,
            ...settings
          })
          .returning();

        return newSettings;
      }

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'updateUserSwimlaneSettings');
      throw error;
    }
  }

  /**
   * Создать группу в swimlane
   */
  static async createSwimlaneGroup(data: {
    swimlaneId: string;
    name: string;
    value?: string;
    color?: string;
    order: number;
    settings?: any;
  }): Promise<BoardSwimlaneGroup> {
    try {
      const [newGroup] = await db
        .insert(boardSwimlaneGroup)
        .values({
          swimlaneId: data.swimlaneId,
          name: data.name,
          value: data.value,
          color: data.color,
          order: data.order,
          settings: data.settings || {
            showCount: true,
            showProgress: true,
            showStoryPoints: false
          }
        })
        .returning();

      LoggerService.logUserAction('swimlane-group-created', 'system', {
        groupId: newGroup.id,
        swimlaneId: data.swimlaneId,
        name: newGroup.name
      });

      return newGroup;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'createSwimlaneGroup');
      throw error;
    }
  }

  /**
   * Получить группы swimlane
   */
  static async getSwimlaneGroups(swimlaneId: string): Promise<BoardSwimlaneGroup[]> {
    try {
      const groups = await db
        .select()
        .from(boardSwimlaneGroup)
        .where(and(eq(boardSwimlaneGroup.swimlaneId, swimlaneId), eq(boardSwimlaneGroup.isVisible, true)))
        .orderBy(asc(boardSwimlaneGroup.order));

      return groups;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'getSwimlaneGroups');
      throw error;
    }
  }

  /**
   * Обновить группу swimlane
   */
  static async updateSwimlaneGroup(groupId: string, data: Partial<NewBoardSwimlaneGroup>): Promise<BoardSwimlaneGroup> {
    try {
      const [updatedGroup] = await db
        .update(boardSwimlaneGroup)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(boardSwimlaneGroup.id, groupId))
        .returning();

      LoggerService.logUserAction('swimlane-group-updated', 'system', {
        groupId,
        changes: data
      });

      return updatedGroup;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'updateSwimlaneGroup');
      throw error;
    }
  }

  /**
   * Удалить группу swimlane
   */
  static async deleteSwimlaneGroup(groupId: string): Promise<boolean> {
    try {
      await db.delete(boardSwimlaneGroup).where(eq(boardSwimlaneGroup.id, groupId));

      LoggerService.logUserAction('swimlane-group-deleted', 'system', { groupId });

      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'deleteSwimlaneGroup');
      throw error;
    }
  }

  /**
   * Получить статистику swimlane
   */
  static async getSwimlaneStats(swimlaneId: string): Promise<{
    totalIssues: number;
    issuesByGroup: Array<{ groupId: string; count: number; name: string }>;
    completedIssues: number;
    inProgressIssues: number;
  }> {
    try {
      const swimlane = await this.getSwimlaneById(swimlaneId);
      if (!swimlane) {
        throw new Error('Swimlane not found');
      }

      // Получаем все задачи проекта доски
      const issues = await db
        .select()
        .from(issue)
        .where(eq(issue.projectId, swimlane.boardId));

      const totalIssues = issues.length;
      const completedIssues = issues.filter(i => i.status === 'DONE').length;
      const inProgressIssues = issues.filter(i => i.status === 'IN_PROGRESS').length;

      // Получаем группы swimlane
      const groups = await this.getSwimlaneGroups(swimlaneId);
      const issuesByGroup = groups.map(group => {
        let count = 0;
        
        // Подсчитываем задачи для каждой группы в зависимости от типа swimlane
        if (swimlane.type === 'assignee') {
          count = issues.filter(i => i.assigneeId === group.value).length;
        } else if (swimlane.type === 'epic') {
          count = issues.filter(i => i.epicId === group.value).length;
        } else if (swimlane.type === 'priority') {
          count = issues.filter(i => i.priority === group.value).length;
        } else if (swimlane.type === 'component') {
          count = issues.filter(i => i.componentId === group.value).length;
        } else if (swimlane.type === 'fixVersion') {
          count = issues.filter(i => i.fixVersionId === group.value).length;
        }

        return {
          groupId: group.id,
          count,
          name: group.name
        };
      });

      return {
        totalIssues,
        issuesByGroup,
        completedIssues,
        inProgressIssues
      };

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'getSwimlaneStats');
      throw error;
    }
  }

  /**
   * Автоматически создать группы для swimlane на основе данных
   */
  static async autoCreateSwimlaneGroups(swimlaneId: string): Promise<BoardSwimlaneGroup[]> {
    try {
      const swimlane = await this.getSwimlaneById(swimlaneId);
      if (!swimlane) {
        throw new Error('Swimlane not found');
      }

      // Получаем все задачи проекта
      const issues = await db
        .select()
        .from(issue)
        .where(eq(issue.projectId, swimlane.boardId));

      const groups: NewBoardSwimlaneGroup[] = [];
      const existingGroups = await this.getSwimlaneGroups(swimlaneId);
      const existingValues = existingGroups.map(g => g.value);

      if (swimlane.type === 'assignee') {
        // Группируем по исполнителям
        const assignees = [...new Set(issues.map(i => i.assigneeId).filter(Boolean))];
        for (const assigneeId of assignees) {
          if (!existingValues.includes(assigneeId)) {
            groups.push({
              swimlaneId,
              name: `Assignee ${assigneeId}`,
              value: assigneeId,
              order: groups.length,
              color: this.getRandomColor()
            });
          }
        }
      } else if (swimlane.type === 'epic') {
        // Группируем по эпикам
        const epics = [...new Set(issues.map(i => i.epicId).filter(Boolean))];
        for (const epicId of epics) {
          if (!existingValues.includes(epicId)) {
            groups.push({
              swimlaneId,
              name: `Epic ${epicId}`,
              value: epicId,
              order: groups.length,
              color: this.getRandomColor()
            });
          }
        }
      } else if (swimlane.type === 'priority') {
        // Группируем по приоритетам
        const priorities = [...new Set(issues.map(i => i.priority).filter(Boolean))];
        for (const priority of priorities) {
          if (!existingValues.includes(priority)) {
            groups.push({
              swimlaneId,
              name: priority,
              value: priority,
              order: groups.length,
              color: this.getPriorityColor(priority)
            });
          }
        }
      }

      if (groups.length > 0) {
        const createdGroups = await db.insert(boardSwimlaneGroup).values(groups).returning();
        
        LoggerService.logUserAction('swimlane-groups-auto-created', 'system', {
          swimlaneId,
          count: createdGroups.length
        });

        return createdGroups;
      }

      return [];

    } catch (error) {
      LoggerService.logError(error as Error, 'swimlane-service', 'autoCreateSwimlaneGroups');
      throw error;
    }
  }

  /**
   * Получить случайный цвет для группы
   */
  private static getRandomColor(): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Получить цвет для приоритета
   */
  private static getPriorityColor(priority: string): string {
    const priorityColors: Record<string, string> = {
      'LOW': '#10b981',
      'MEDIUM': '#f59e0b',
      'HIGH': '#ef4444',
      'CRITICAL': '#dc2626'
    };
    return priorityColors[priority] || '#6b7280';
  }
}
