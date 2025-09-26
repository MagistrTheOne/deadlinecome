import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { 
  board, 
  boardColumn, 
  boardUserSettings, 
  boardTemplate, 
  boardFavorite, 
  boardHistory,
  type Board,
  type NewBoard,
  type BoardColumn,
  type NewBoardColumn,
  type BoardUserSettings,
  type NewBoardUserSettings
} from '@/lib/db/schema-boards';
import { issue } from '@/lib/db/schema';
import { LoggerService } from '@/lib/logger';

export class BoardService {
  /**
   * Создать новую доску
   */
  static async createBoard(data: {
    name: string;
    description?: string;
    type: 'kanban' | 'scrum' | 'custom';
    workspaceId: string;
    projectId?: string;
    createdById: string;
    templateId?: string;
  }): Promise<Board> {
    try {
      let boardData: NewBoard = {
        name: data.name,
        description: data.description,
        type: data.type,
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        createdById: data.createdById,
        settings: {
          columns: [],
          filters: [],
          quickFilters: []
        }
      };

      // Если указан шаблон, используем его
      if (data.templateId) {
        const template = await db.select().from(boardTemplate).where(eq(boardTemplate.id, data.templateId)).limit(1);
        if (template[0]) {
          boardData.settings = template[0].template;
        }
      } else {
        // Создаем стандартные колонки в зависимости от типа
        if (data.type === 'kanban') {
          boardData.settings = {
            columns: [
              { id: 'todo', name: 'To Do', status: 'TODO', color: '#6b7280', order: 0, isDone: false, isWip: false },
              { id: 'in-progress', name: 'In Progress', status: 'IN_PROGRESS', color: '#3b82f6', order: 1, isDone: false, isWip: true, wipLimit: 5 },
              { id: 'done', name: 'Done', status: 'DONE', color: '#10b981', order: 2, isDone: true, isWip: false }
            ],
            filters: [],
            quickFilters: [
              { id: 'my-issues', name: 'My Issues', jql: 'assignee = currentUser()' },
              { id: 'recent', name: 'Recently Updated', jql: 'updated >= -7d' }
            ]
          };
        } else if (data.type === 'scrum') {
          boardData.settings = {
            columns: [
              { id: 'backlog', name: 'Backlog', status: 'BACKLOG', color: '#6b7280', order: 0, isDone: false, isWip: false },
              { id: 'sprint', name: 'Sprint', status: 'SPRINT', color: '#3b82f6', order: 1, isDone: false, isWip: true, wipLimit: 10 },
              { id: 'in-progress', name: 'In Progress', status: 'IN_PROGRESS', color: '#f59e0b', order: 2, isDone: false, isWip: true, wipLimit: 3 },
              { id: 'done', name: 'Done', status: 'DONE', color: '#10b981', order: 3, isDone: true, isWip: false }
            ],
            filters: [],
            quickFilters: [
              { id: 'sprint-backlog', name: 'Sprint Backlog', jql: 'sprint in openSprints()' },
              { id: 'my-issues', name: 'My Issues', jql: 'assignee = currentUser()' }
            ],
            swimlanes: [
              { id: 'epic', name: 'Epic', type: 'epic' },
              { id: 'assignee', name: 'Assignee', type: 'assignee' }
            ]
          };
        }
      }

      const [newBoard] = await db.insert(board).values(boardData).returning();

      // Создаем колонки для доски
      if (newBoard.settings?.columns) {
        const columns: NewBoardColumn[] = newBoard.settings.columns.map(col => ({
          boardId: newBoard.id,
          name: col.name,
          status: col.status,
          color: col.color,
          order: col.order,
          isDone: col.isDone,
          isWip: col.isWip,
          wipLimit: col.wipLimit
        }));

        await db.insert(boardColumn).values(columns);
      }

      // Логируем создание
      LoggerService.logUserAction('board-created', data.createdById, {
        boardId: newBoard.id,
        name: newBoard.name,
        type: newBoard.type
      });

      return newBoard;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'createBoard');
      throw error;
    }
  }

  /**
   * Получить доски пользователя
   */
  static async getUserBoards(userId: string, workspaceId?: string): Promise<Board[]> {
    try {
      let query = db.select().from(board).where(eq(board.createdById, userId));
      
      if (workspaceId) {
        query = query.where(and(eq(board.createdById, userId), eq(board.workspaceId, workspaceId)));
      }

      const boards = await query.orderBy(desc(board.createdAt));
      return boards;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'getUserBoards');
      throw error;
    }
  }

  /**
   * Получить доску по ID
   */
  static async getBoardById(boardId: string): Promise<Board | null> {
    try {
      const [boardData] = await db.select().from(board).where(eq(board.id, boardId)).limit(1);
      return boardData || null;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'getBoardById');
      throw error;
    }
  }

  /**
   * Обновить доску
   */
  static async updateBoard(boardId: string, data: Partial<NewBoard>, userId: string): Promise<Board> {
    try {
      const [updatedBoard] = await db
        .update(board)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(board.id, boardId))
        .returning();

      // Логируем изменения
      LoggerService.logUserAction('board-updated', userId, {
        boardId,
        changes: data
      });

      return updatedBoard;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'updateBoard');
      throw error;
    }
  }

  /**
   * Удалить доску
   */
  static async deleteBoard(boardId: string, userId: string): Promise<boolean> {
    try {
      await db.delete(board).where(eq(board.id, boardId));

      // Логируем удаление
      LoggerService.logUserAction('board-deleted', userId, { boardId });

      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'deleteBoard');
      throw error;
    }
  }

  /**
   * Архивировать доску
   */
  static async archiveBoard(boardId: string, userId: string): Promise<Board> {
    try {
      const [archivedBoard] = await db
        .update(board)
        .set({ isArchived: true, updatedAt: new Date() })
        .where(eq(board.id, boardId))
        .returning();

      // Логируем архивирование
      LoggerService.logUserAction('board-archived', userId, { boardId });

      return archivedBoard;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'archiveBoard');
      throw error;
    }
  }

  /**
   * Восстановить доску из архива
   */
  static async restoreBoard(boardId: string, userId: string): Promise<Board> {
    try {
      const [restoredBoard] = await db
        .update(board)
        .set({ isArchived: false, updatedAt: new Date() })
        .where(eq(board.id, boardId))
        .returning();

      // Логируем восстановление
      LoggerService.logUserAction('board-restored', userId, { boardId });

      return restoredBoard;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'restoreBoard');
      throw error;
    }
  }

  /**
   * Получить колонки доски
   */
  static async getBoardColumns(boardId: string): Promise<BoardColumn[]> {
    try {
      const columns = await db
        .select()
        .from(boardColumn)
        .where(eq(boardColumn.boardId, boardId))
        .orderBy(asc(boardColumn.order));

      return columns;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'getBoardColumns');
      throw error;
    }
  }

  /**
   * Создать колонку доски
   */
  static async createBoardColumn(data: {
    boardId: string;
    name: string;
    status: string;
    color?: string;
    order: number;
    isDone?: boolean;
    isWip?: boolean;
    wipLimit?: number;
  }): Promise<BoardColumn> {
    try {
      const [newColumn] = await db
        .insert(boardColumn)
        .values({
          boardId: data.boardId,
          name: data.name,
          status: data.status,
          color: data.color,
          order: data.order,
          isDone: data.isDone || false,
          isWip: data.isWip || false,
          wipLimit: data.wipLimit || null
        })
        .returning();

      LoggerService.logUserAction('board-column-created', 'system', {
        columnId: newColumn.id,
        boardId: data.boardId,
        name: newColumn.name
      });

      return newColumn;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'createBoardColumn');
      throw error;
    }
  }

  /**
   * Получить колонку по ID
   */
  static async getBoardColumnById(columnId: string): Promise<BoardColumn | null> {
    try {
      const [column] = await db
        .select()
        .from(boardColumn)
        .where(eq(boardColumn.id, columnId))
        .limit(1);

      return column || null;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'getBoardColumnById');
      throw error;
    }
  }

  /**
   * Обновить колонку доски
   */
  static async updateBoardColumn(columnId: string, data: Partial<NewBoardColumn>): Promise<BoardColumn> {
    try {
      const [updatedColumn] = await db
        .update(boardColumn)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(boardColumn.id, columnId))
        .returning();

      LoggerService.logUserAction('board-column-updated', 'system', {
        columnId,
        changes: data
      });

      return updatedColumn;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'updateBoardColumn');
      throw error;
    }
  }

  /**
   * Удалить колонку доски
   */
  static async deleteBoardColumn(columnId: string): Promise<boolean> {
    try {
      await db.delete(boardColumn).where(eq(boardColumn.id, columnId));

      LoggerService.logUserAction('board-column-deleted', 'system', { columnId });

      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'deleteBoardColumn');
      throw error;
    }
  }

  /**
   * Переупорядочить колонки доски
   */
  static async reorderBoardColumns(boardId: string, columnOrders: Array<{ columnId: string; order: number }>): Promise<boolean> {
    try {
      for (const { columnId, order } of columnOrders) {
        await db
          .update(boardColumn)
          .set({ order, updatedAt: new Date() })
          .where(and(eq(boardColumn.id, columnId), eq(boardColumn.boardId, boardId)));
      }

      LoggerService.logUserAction('board-columns-reordered', 'system', {
        boardId,
        columnOrders
      });

      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'reorderBoardColumns');
      throw error;
    }
  }

  /**
   * Получить настройки пользователя для доски
   */
  static async getUserBoardSettings(boardId: string, userId: string): Promise<BoardUserSettings | null> {
    try {
      const [settings] = await db
        .select()
        .from(boardUserSettings)
        .where(and(eq(boardUserSettings.boardId, boardId), eq(boardUserSettings.userId, userId)))
        .limit(1);

      return settings || null;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'getUserBoardSettings');
      throw error;
    }
  }

  /**
   * Обновить настройки пользователя для доски
   */
  static async updateUserBoardSettings(
    boardId: string, 
    userId: string, 
    settings: Partial<NewBoardUserSettings>
  ): Promise<BoardUserSettings> {
    try {
      const existingSettings = await this.getUserBoardSettings(boardId, userId);

      if (existingSettings) {
        const [updatedSettings] = await db
          .update(boardUserSettings)
          .set({ ...settings, updatedAt: new Date() })
          .where(eq(boardUserSettings.id, existingSettings.id))
          .returning();

        return updatedSettings;
      } else {
        const [newSettings] = await db
          .insert(boardUserSettings)
          .values({
            boardId,
            userId,
            ...settings
          })
          .returning();

        return newSettings;
      }

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'updateUserBoardSettings');
      throw error;
    }
  }

  /**
   * Добавить доску в избранное
   */
  static async addToFavorites(boardId: string, userId: string): Promise<boolean> {
    try {
      await db.insert(boardFavorite).values({ boardId, userId });
      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'addToFavorites');
      throw error;
    }
  }

  /**
   * Удалить доску из избранного
   */
  static async removeFromFavorites(boardId: string, userId: string): Promise<boolean> {
    try {
      await db
        .delete(boardFavorite)
        .where(and(eq(boardFavorite.boardId, boardId), eq(boardFavorite.userId, userId)));

      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'removeFromFavorites');
      throw error;
    }
  }

  /**
   * Получить избранные доски пользователя
   */
  static async getUserFavoriteBoards(userId: string): Promise<Board[]> {
    try {
      const favoriteBoards = await db
        .select({ board })
        .from(boardFavorite)
        .innerJoin(board, eq(boardFavorite.boardId, board.id))
        .where(eq(boardFavorite.userId, userId))
        .orderBy(desc(board.updatedAt));

      return favoriteBoards.map(fb => fb.board);

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'getUserFavoriteBoards');
      throw error;
    }
  }

  /**
   * Получить шаблоны досок
   */
  static async getBoardTemplates(type?: string): Promise<BoardTemplate[]> {
    try {
      let query = db.select().from(boardTemplate).where(eq(boardTemplate.isPublic, true));
      
      if (type) {
        query = query.where(and(eq(boardTemplate.isPublic, true), eq(boardTemplate.type, type)));
      }

      const templates = await query.orderBy(desc(boardTemplate.usageCount));
      return templates;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'getBoardTemplates');
      throw error;
    }
  }

  /**
   * Создать шаблон доски
   */
  static async createBoardTemplate(data: {
    name: string;
    description?: string;
    type: string;
    template: any;
    createdById: string;
    isPublic?: boolean;
  }): Promise<BoardTemplate> {
    try {
      const [newTemplate] = await db
        .insert(boardTemplate)
        .values({
          name: data.name,
          description: data.description,
          type: data.type,
          template: data.template,
          createdById: data.createdById,
          isPublic: data.isPublic || false
        })
        .returning();

      return newTemplate;

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'createBoardTemplate');
      throw error;
    }
  }

  /**
   * Получить статистику доски
   */
  static async getBoardStats(boardId: string): Promise<{
    totalIssues: number;
    issuesByColumn: Array<{ columnId: string; count: number }>;
    completedIssues: number;
    inProgressIssues: number;
    overdueIssues: number;
  }> {
    try {
      // Получаем все задачи проекта доски
      const boardData = await this.getBoardById(boardId);
      if (!boardData?.projectId) {
        throw new Error('Board project not found');
      }

      const issues = await db
        .select()
        .from(issue)
        .where(eq(issue.projectId, boardData.projectId));

      const totalIssues = issues.length;
      const completedIssues = issues.filter(i => i.status === 'DONE').length;
      const inProgressIssues = issues.filter(i => i.status === 'IN_PROGRESS').length;
      const overdueIssues = issues.filter(i => 
        i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'DONE'
      ).length;

      // Получаем колонки доски
      const columns = await this.getBoardColumns(boardId);
      const issuesByColumn = columns.map(column => ({
        columnId: column.id,
        count: issues.filter(i => i.status === column.status).length
      }));

      return {
        totalIssues,
        issuesByColumn,
        completedIssues,
        inProgressIssues,
        overdueIssues
      };

    } catch (error) {
      LoggerService.logError(error as Error, 'board-service', 'getBoardStats');
      throw error;
    }
  }
}
