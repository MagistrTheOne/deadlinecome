import { eq, and, desc, asc, sql, like, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { 
  boardFilter,
  boardFilterFavorite,
  boardFilterHistory,
  boardFilterTemplate,
  boardSavedSearch,
  boardJqlValidation,
  type BoardFilter,
  type NewBoardFilter,
  type BoardFilterFavorite,
  type NewBoardFilterFavorite,
  type BoardFilterTemplate,
  type NewBoardFilterTemplate,
  type BoardSavedSearch,
  type NewBoardSavedSearch
} from '@/lib/db/schema-filters';
import { issue } from '@/lib/db/schema';
import { LoggerService } from '@/lib/logger';

export class FilterService {
  /**
   * Создать фильтр для доски
   */
  static async createBoardFilter(data: {
    boardId: string;
    name: string;
    description?: string;
    jql: string;
    isQuickFilter?: boolean;
    isPublic?: boolean;
    createdById: string;
    settings?: any;
  }): Promise<BoardFilter> {
    try {
      // Валидируем JQL
      const validation = await this.validateJql(data.jql);
      if (!validation.isValid) {
        throw new Error(`Invalid JQL: ${validation.errorMessage}`);
      }

      // Получаем текущие фильтры для определения порядка
      const existingFilters = await this.getBoardFilters(data.boardId);
      const maxOrder = existingFilters.length > 0 
        ? Math.max(...existingFilters.map(f => f.order)) 
        : 0;

      const [newFilter] = await db
        .insert(boardFilter)
        .values({
          boardId: data.boardId,
          name: data.name,
          description: data.description,
          jql: data.jql,
          isQuickFilter: data.isQuickFilter || false,
          isPublic: data.isPublic || false,
          createdById: data.createdById,
          order: maxOrder + 1,
          settings: data.settings || {
            showCount: true,
            showProgress: true,
            autoRefresh: false
          }
        })
        .returning();

      LoggerService.logUserAction('board-filter-created', data.createdById, {
        filterId: newFilter.id,
        boardId: data.boardId,
        name: newFilter.name,
        jql: newFilter.jql
      });

      return newFilter;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'createBoardFilter');
      throw error;
    }
  }

  /**
   * Получить фильтры доски
   */
  static async getBoardFilters(boardId: string, userId?: string): Promise<BoardFilter[]> {
    try {
      let query = db
        .select()
        .from(boardFilter)
        .where(and(eq(boardFilter.boardId, boardId), eq(boardFilter.isActive, true)));

      // Если указан пользователь, показываем публичные + пользовательские
      if (userId) {
        query = query.where(or(
          eq(boardFilter.isPublic, true),
          eq(boardFilter.createdById, userId)
        ));
      }

      const filters = await query.orderBy(asc(boardFilter.order));
      return filters;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'getBoardFilters');
      throw error;
    }
  }

  /**
   * Получить быстрые фильтры доски
   */
  static async getBoardQuickFilters(boardId: string): Promise<BoardFilter[]> {
    try {
      const quickFilters = await db
        .select()
        .from(boardFilter)
        .where(and(
          eq(boardFilter.boardId, boardId),
          eq(boardFilter.isQuickFilter, true),
          eq(boardFilter.isActive, true)
        ))
        .orderBy(asc(boardFilter.order));

      return quickFilters;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'getBoardQuickFilters');
      throw error;
    }
  }

  /**
   * Получить фильтр по ID
   */
  static async getFilterById(filterId: string): Promise<BoardFilter | null> {
    try {
      const [filter] = await db
        .select()
        .from(boardFilter)
        .where(eq(boardFilter.id, filterId))
        .limit(1);

      return filter || null;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'getFilterById');
      throw error;
    }
  }

  /**
   * Обновить фильтр
   */
  static async updateFilter(filterId: string, data: Partial<NewBoardFilter>, userId: string): Promise<BoardFilter> {
    try {
      // Если обновляется JQL, валидируем его
      if (data.jql) {
        const validation = await this.validateJql(data.jql);
        if (!validation.isValid) {
          throw new Error(`Invalid JQL: ${validation.errorMessage}`);
        }
      }

      const [updatedFilter] = await db
        .update(boardFilter)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(boardFilter.id, filterId))
        .returning();

      LoggerService.logUserAction('board-filter-updated', userId, {
        filterId,
        changes: data
      });

      return updatedFilter;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'updateFilter');
      throw error;
    }
  }

  /**
   * Удалить фильтр
   */
  static async deleteFilter(filterId: string, userId: string): Promise<boolean> {
    try {
      await db.delete(boardFilter).where(eq(boardFilter.id, filterId));

      LoggerService.logUserAction('board-filter-deleted', userId, { filterId });

      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'deleteFilter');
      throw error;
    }
  }

  /**
   * Применить фильтр и получить результаты
   */
  static async applyFilter(filterId: string, userId: string, projectId: string): Promise<{
    issues: any[];
    totalCount: number;
    executionTime: number;
  }> {
    const startTime = Date.now();

    try {
      const filter = await this.getFilterById(filterId);
      if (!filter) {
        throw new Error('Filter not found');
      }

      // Парсим JQL и применяем к задачам
      const issues = await this.executeJqlFilter(filter.jql, projectId);
      const executionTime = Date.now() - startTime;

      // Логируем использование фильтра
      await this.logFilterUsage(filterId, userId, {
        resultCount: issues.length,
        executionTime
      });

      LoggerService.logUserAction('board-filter-applied', userId, {
        filterId,
        resultCount: issues.length,
        executionTime
      });

      return {
        issues,
        totalCount: issues.length,
        executionTime
      };

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'applyFilter');
      throw error;
    }
  }

  /**
   * Валидировать JQL запрос
   */
  static async validateJql(jql: string): Promise<{
    isValid: boolean;
    errorMessage?: string;
    suggestions?: Array<{
      type: string;
      suggestion: string;
      description: string;
    }>;
  }> {
    try {
      // Проверяем кэш валидации
      const [cachedValidation] = await db
        .select()
        .from(boardJqlValidation)
        .where(eq(boardJqlValidation.jql, jql))
        .orderBy(desc(boardJqlValidation.validatedAt))
        .limit(1);

      if (cachedValidation) {
        return {
          isValid: cachedValidation.isValid,
          errorMessage: cachedValidation.errorMessage || undefined,
          suggestions: cachedValidation.suggestions || undefined
        };
      }

      // Простая валидация JQL (в реальном проекте здесь был бы полноценный JQL парсер)
      const isValid = this.isValidJqlSyntax(jql);
      const errorMessage = isValid ? undefined : 'Invalid JQL syntax';
      const suggestions = isValid ? undefined : this.getJqlSuggestions(jql);

      // Сохраняем результат валидации
      await db.insert(boardJqlValidation).values({
        jql,
        isValid,
        errorMessage,
        suggestions
      });

      return {
        isValid,
        errorMessage,
        suggestions
      };

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'validateJql');
      return {
        isValid: false,
        errorMessage: 'Validation error'
      };
    }
  }

  /**
   * Выполнить JQL фильтр
   */
  private static async executeJqlFilter(jql: string, projectId: string): Promise<any[]> {
    try {
      // Простая реализация JQL фильтрации
      // В реальном проекте здесь был бы полноценный JQL движок
      
      let query = db.select().from(issue).where(eq(issue.projectId, projectId));

      // Парсим простые JQL запросы
      if (jql.includes('assignee = currentUser()')) {
        // Фильтр по текущему пользователю
        // query = query.where(eq(issue.assigneeId, currentUserId));
      }

      if (jql.includes('status = "TODO"')) {
        query = query.where(eq(issue.status, 'TODO'));
      }

      if (jql.includes('status = "IN_PROGRESS"')) {
        query = query.where(eq(issue.status, 'IN_PROGRESS'));
      }

      if (jql.includes('status = "DONE"')) {
        query = query.where(eq(issue.status, 'DONE'));
      }

      if (jql.includes('updated >= -7d')) {
        // Задачи, обновленные за последние 7 дней
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.where(sql`${issue.updatedAt} >= ${sevenDaysAgo}`);
      }

      const issues = await query;
      return issues;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'executeJqlFilter');
      throw error;
    }
  }

  /**
   * Проверить синтаксис JQL
   */
  private static isValidJqlSyntax(jql: string): boolean {
    // Простая проверка синтаксиса
    const validFields = ['assignee', 'status', 'priority', 'created', 'updated', 'dueDate', 'project'];
    const validOperators = ['=', '!=', '>', '<', '>=', '<=', '~', '!~', 'in', 'not in'];
    
    // Проверяем наличие основных элементов
    if (!jql.trim()) return false;
    
    // Проверяем на наличие недопустимых символов
    if (jql.includes(';') || jql.includes('--')) return false;
    
    return true;
  }

  /**
   * Получить предложения для JQL
   */
  private static getJqlSuggestions(jql: string): Array<{
    type: string;
    suggestion: string;
    description: string;
  }> {
    const suggestions = [];
    
    if (!jql.includes('assignee')) {
      suggestions.push({
        type: 'field',
        suggestion: 'assignee',
        description: 'Filter by assignee'
      });
    }
    
    if (!jql.includes('status')) {
      suggestions.push({
        type: 'field',
        suggestion: 'status',
        description: 'Filter by status'
      });
    }
    
    return suggestions;
  }

  /**
   * Логировать использование фильтра
   */
  private static async logFilterUsage(filterId: string, userId: string, details: any): Promise<void> {
    try {
      await db.insert(boardFilterHistory).values({
        filterId,
        userId,
        action: 'applied',
        details
      });

      // Увеличиваем счетчик использования
      await db
        .update(boardFilter)
        .set({ usageCount: sql`${boardFilter.usageCount} + 1` })
        .where(eq(boardFilter.id, filterId));

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'logFilterUsage');
    }
  }

  /**
   * Добавить фильтр в избранное
   */
  static async addFilterToFavorites(filterId: string, userId: string): Promise<boolean> {
    try {
      await db.insert(boardFilterFavorite).values({ filterId, userId });
      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'addFilterToFavorites');
      throw error;
    }
  }

  /**
   * Удалить фильтр из избранного
   */
  static async removeFilterFromFavorites(filterId: string, userId: string): Promise<boolean> {
    try {
      await db
        .delete(boardFilterFavorite)
        .where(and(eq(boardFilterFavorite.filterId, filterId), eq(boardFilterFavorite.userId, userId)));

      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'removeFilterFromFavorites');
      throw error;
    }
  }

  /**
   * Получить избранные фильтры пользователя
   */
  static async getUserFavoriteFilters(userId: string): Promise<BoardFilter[]> {
    try {
      const favoriteFilters = await db
        .select({ boardFilter })
        .from(boardFilterFavorite)
        .innerJoin(boardFilter, eq(boardFilterFavorite.filterId, boardFilter.id))
        .where(eq(boardFilterFavorite.userId, userId))
        .orderBy(asc(boardFilterFavorite.order));

      return favoriteFilters.map(ff => ff.boardFilter);

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'getUserFavoriteFilters');
      throw error;
    }
  }

  /**
   * Получить шаблоны фильтров
   */
  static async getFilterTemplates(category?: string): Promise<BoardFilterTemplate[]> {
    try {
      let query = db.select().from(boardFilterTemplate).where(eq(boardFilterTemplate.isPublic, true));
      
      if (category) {
        query = query.where(and(
          eq(boardFilterTemplate.isPublic, true),
          eq(boardFilterTemplate.category, category)
        ));
      }

      const templates = await query.orderBy(desc(boardFilterTemplate.usageCount));
      return templates;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'getFilterTemplates');
      throw error;
    }
  }

  /**
   * Создать шаблон фильтра
   */
  static async createFilterTemplate(data: {
    name: string;
    description?: string;
    category: string;
    jql: string;
    createdById: string;
    isPublic?: boolean;
    settings?: any;
  }): Promise<BoardFilterTemplate> {
    try {
      const [newTemplate] = await db
        .insert(boardFilterTemplate)
        .values({
          name: data.name,
          description: data.description,
          category: data.category,
          jql: data.jql,
          createdById: data.createdById,
          isPublic: data.isPublic || false,
          settings: data.settings || {}
        })
        .returning();

      return newTemplate;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'createFilterTemplate');
      throw error;
    }
  }

  /**
   * Сохранить поисковый запрос
   */
  static async saveSearch(data: {
    boardId: string;
    userId: string;
    name: string;
    jql: string;
    isDefault?: boolean;
    settings?: any;
  }): Promise<BoardSavedSearch> {
    try {
      const [savedSearch] = await db
        .insert(boardSavedSearch)
        .values({
          boardId: data.boardId,
          userId: data.userId,
          name: data.name,
          jql: data.jql,
          isDefault: data.isDefault || false,
          settings: data.settings || {}
        })
        .returning();

      return savedSearch;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'saveSearch');
      throw error;
    }
  }

  /**
   * Получить сохраненные поиски пользователя
   */
  static async getUserSavedSearches(boardId: string, userId: string): Promise<BoardSavedSearch[]> {
    try {
      const savedSearches = await db
        .select()
        .from(boardSavedSearch)
        .where(and(
          eq(boardSavedSearch.boardId, boardId),
          eq(boardSavedSearch.userId, userId)
        ))
        .orderBy(desc(boardSavedSearch.updatedAt));

      return savedSearches;

    } catch (error) {
      LoggerService.logError(error as Error, 'filter-service', 'getUserSavedSearches');
      throw error;
    }
  }
}
