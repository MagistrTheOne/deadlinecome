import { eq, and, desc, asc, sql, or, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { 
  boardRole,
  boardUserRole,
  boardPermission,
  boardPermissionHistory,
  boardAccessGroup,
  boardAccessGroupMember,
  boardPermissionTemplate,
  type BoardRole,
  type NewBoardRole,
  type BoardUserRole,
  type NewBoardUserRole,
  type BoardPermission,
  type NewBoardPermission,
  type BoardAccessGroup,
  type NewBoardAccessGroup
} from '@/lib/db/schema-permissions';
import { LoggerService } from '@/lib/logger';

export class PermissionService {
  /**
   * Проверить разрешение пользователя на действие
   */
  static async checkPermission(
    boardId: string,
    userId: string,
    action: string,
    resource: string,
    resourceId?: string
  ): Promise<boolean> {
    try {
      // Получаем все роли пользователя на доске
      const userRoles = await this.getUserBoardRoles(boardId, userId);
      
      // Проверяем разрешения через роли
      for (const userRole of userRoles) {
        const role = await this.getRoleById(userRole.roleId);
        if (role && this.hasRolePermission(role, action, resource)) {
          return true;
        }
      }

      // Проверяем прямые разрешения
      const directPermissions = await this.getUserDirectPermissions(boardId, userId);
      for (const permission of directPermissions) {
        if (permission.action === action && 
            permission.resource === resource && 
            (!resourceId || permission.resourceId === resourceId) &&
            permission.isAllowed) {
          return true;
        }
      }

      // Проверяем разрешения через группы
      const groupPermissions = await this.getUserGroupPermissions(boardId, userId);
      for (const permission of groupPermissions) {
        if (permission.action === action && 
            permission.resource === resource && 
            (!resourceId || permission.resourceId === resourceId) &&
            permission.isAllowed) {
          return true;
        }
      }

      return false;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'checkPermission');
      return false;
    }
  }

  /**
   * Получить роли пользователя на доске
   */
  static async getUserBoardRoles(boardId: string, userId: string): Promise<BoardUserRole[]> {
    try {
      const userRoles = await db
        .select()
        .from(boardUserRole)
        .where(and(
          eq(boardUserRole.boardId, boardId),
          eq(boardUserRole.userId, userId),
          eq(boardUserRole.isActive, true)
        ));

      return userRoles;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'getUserBoardRoles');
      throw error;
    }
  }

  /**
   * Получить роль по ID
   */
  static async getRoleById(roleId: string): Promise<BoardRole | null> {
    try {
      const [role] = await db
        .select()
        .from(boardRole)
        .where(eq(boardRole.id, roleId))
        .limit(1);

      return role || null;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'getRoleById');
      throw error;
    }
  }

  /**
   * Проверить разрешение роли
   */
  private static hasRolePermission(role: BoardRole, action: string, resource: string): boolean {
    if (!role.permissions) return false;

    const permissions = role.permissions as any;
    
    // Проверяем общие разрешения
    if (action === 'view' && permissions.view) return true;
    if (action === 'edit' && permissions.edit) return true;
    if (action === 'delete' && permissions.delete) return true;
    if (action === 'manageUsers' && permissions.manageUsers) return true;
    if (action === 'manageColumns' && permissions.manageColumns) return true;
    if (action === 'manageSwimlanes' && permissions.manageSwimlanes) return true;
    if (action === 'manageFilters' && permissions.manageFilters) return true;
    if (action === 'manageSettings' && permissions.manageSettings) return true;

    // Проверяем разрешения для задач
    if (resource === 'issue') {
      if (action === 'create' && permissions.createIssues) return true;
      if (action === 'edit' && permissions.editIssues) return true;
      if (action === 'delete' && permissions.deleteIssues) return true;
      if (action === 'assign' && permissions.assignIssues) return true;
      if (action === 'comment' && permissions.commentIssues) return true;
      if (action === 'attach' && permissions.attachFiles) return true;
      if (action === 'vote' && permissions.voteIssues) return true;
      if (action === 'watch' && permissions.watchIssues) return true;
    }

    // Проверяем кастомные разрешения
    if (permissions.customPermissions) {
      for (const customPermission of permissions.customPermissions) {
        if (customPermission.action === action && customPermission.allowed) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Получить прямые разрешения пользователя
   */
  static async getUserDirectPermissions(boardId: string, userId: string): Promise<BoardPermission[]> {
    try {
      const permissions = await db
        .select()
        .from(boardPermission)
        .where(and(
          eq(boardPermission.boardId, boardId),
          eq(boardPermission.userId, userId)
        ));

      return permissions;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'getUserDirectPermissions');
      throw error;
    }
  }

  /**
   * Получить разрешения пользователя через группы
   */
  static async getUserGroupPermissions(boardId: string, userId: string): Promise<BoardPermission[]> {
    try {
      // Получаем группы, в которых состоит пользователь
      const userGroups = await db
        .select({ groupId: boardAccessGroupMember.groupId })
        .from(boardAccessGroupMember)
        .innerJoin(boardAccessGroup, eq(boardAccessGroupMember.groupId, boardAccessGroup.id))
        .where(and(
          eq(boardAccessGroup.boardId, boardId),
          eq(boardAccessGroupMember.userId, userId),
          eq(boardAccessGroupMember.isActive, true),
          eq(boardAccessGroup.isActive, true)
        ));

      if (userGroups.length === 0) return [];

      const groupIds = userGroups.map(ug => ug.groupId);
      
      // Получаем разрешения групп
      const permissions = await db
        .select()
        .from(boardPermission)
        .where(and(
          eq(boardPermission.boardId, boardId),
          inArray(boardPermission.roleId, groupIds)
        ));

      return permissions;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'getUserGroupPermissions');
      throw error;
    }
  }

  /**
   * Создать роль для доски
   */
  static async createBoardRole(data: {
    boardId: string;
    name: string;
    description?: string;
    permissions: any;
    color?: string;
    createdById: string;
  }): Promise<BoardRole> {
    try {
      const [newRole] = await db
        .insert(boardRole)
        .values({
          boardId: data.boardId,
          name: data.name,
          description: data.description,
          permissions: data.permissions,
          color: data.color,
          createdById: data.createdById
        })
        .returning();

      LoggerService.logUserAction('board-role-created', data.createdById, {
        roleId: newRole.id,
        boardId: data.boardId,
        name: newRole.name
      });

      return newRole;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'createBoardRole');
      throw error;
    }
  }

  /**
   * Назначить роль пользователю
   */
  static async assignRoleToUser(data: {
    boardId: string;
    userId: string;
    roleId: string;
    assignedById: string;
    expiresAt?: Date;
    metadata?: any;
  }): Promise<BoardUserRole> {
    try {
      const [userRole] = await db
        .insert(boardUserRole)
        .values({
          boardId: data.boardId,
          userId: data.userId,
          roleId: data.roleId,
          assignedById: data.assignedById,
          expiresAt: data.expiresAt,
          metadata: data.metadata
        })
        .returning();

      // Логируем назначение роли
      await this.logPermissionChange(data.boardId, data.assignedById, 'role_assigned', {
        userId: data.userId,
        roleId: data.roleId,
        expiresAt: data.expiresAt
      });

      LoggerService.logUserAction('board-role-assigned', data.assignedById, {
        boardId: data.boardId,
        userId: data.userId,
        roleId: data.roleId
      });

      return userRole;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'assignRoleToUser');
      throw error;
    }
  }

  /**
   * Отозвать роль у пользователя
   */
  static async revokeUserRole(boardId: string, userId: string, roleId: string, revokedById: string): Promise<boolean> {
    try {
      await db
        .update(boardUserRole)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(
          eq(boardUserRole.boardId, boardId),
          eq(boardUserRole.userId, userId),
          eq(boardUserRole.roleId, roleId)
        ));

      // Логируем отзыв роли
      await this.logPermissionChange(boardId, revokedById, 'role_revoked', {
        userId,
        roleId
      });

      LoggerService.logUserAction('board-role-revoked', revokedById, {
        boardId,
        userId,
        roleId
      });

      return true;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'revokeUserRole');
      throw error;
    }
  }

  /**
   * Создать прямое разрешение
   */
  static async createDirectPermission(data: {
    boardId: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    isAllowed: boolean;
    conditions?: any;
    expiresAt?: Date;
    createdById: string;
  }): Promise<BoardPermission> {
    try {
      const [permission] = await db
        .insert(boardPermission)
        .values({
          boardId: data.boardId,
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          isAllowed: data.isAllowed,
          conditions: data.conditions,
          expiresAt: data.expiresAt,
          createdById: data.createdById
        })
        .returning();

      // Логируем создание разрешения
      await this.logPermissionChange(data.boardId, data.createdById, 'permission_created', {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        isAllowed: data.isAllowed
      });

      return permission;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'createDirectPermission');
      throw error;
    }
  }

  /**
   * Создать группу доступа
   */
  static async createAccessGroup(data: {
    boardId: string;
    name: string;
    description?: string;
    type: string;
    permissions: any;
    createdById: string;
  }): Promise<BoardAccessGroup> {
    try {
      const [newGroup] = await db
        .insert(boardAccessGroup)
        .values({
          boardId: data.boardId,
          name: data.name,
          description: data.description,
          type: data.type,
          permissions: data.permissions,
          createdById: data.createdById
        })
        .returning();

      LoggerService.logUserAction('board-access-group-created', data.createdById, {
        groupId: newGroup.id,
        boardId: data.boardId,
        name: newGroup.name
      });

      return newGroup;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'createAccessGroup');
      throw error;
    }
  }

  /**
   * Добавить пользователя в группу доступа
   */
  static async addUserToAccessGroup(data: {
    groupId: string;
    userId: string;
    addedById: string;
  }): Promise<BoardAccessGroupMember> {
    try {
      const [member] = await db
        .insert(boardAccessGroupMember)
        .values({
          groupId: data.groupId,
          userId: data.userId,
          addedById: data.addedById
        })
        .returning();

      LoggerService.logUserAction('board-access-group-member-added', data.addedById, {
        groupId: data.groupId,
        userId: data.userId
      });

      return member;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'addUserToAccessGroup');
      throw error;
    }
  }

  /**
   * Получить всех пользователей доски с их ролями
   */
  static async getBoardUsers(boardId: string): Promise<Array<{
    userId: string;
    roles: BoardRole[];
    permissions: BoardPermission[];
    groups: BoardAccessGroup[];
  }>> {
    try {
      // Получаем всех пользователей с ролями
      const userRoles = await db
        .select({
          userId: boardUserRole.userId,
          roleId: boardUserRole.roleId,
          role: boardRole
        })
        .from(boardUserRole)
        .innerJoin(boardRole, eq(boardUserRole.roleId, boardRole.id))
        .where(and(
          eq(boardUserRole.boardId, boardId),
          eq(boardUserRole.isActive, true)
        ));

      // Группируем по пользователям
      const usersMap = new Map<string, {
        userId: string;
        roles: BoardRole[];
        permissions: BoardPermission[];
        groups: BoardAccessGroup[];
      }>();

      for (const userRole of userRoles) {
        if (!usersMap.has(userRole.userId)) {
          usersMap.set(userRole.userId, {
            userId: userRole.userId,
            roles: [],
            permissions: [],
            groups: []
          });
        }
        usersMap.get(userRole.userId)!.roles.push(userRole.role);
      }

      // Получаем прямые разрешения
      const directPermissions = await db
        .select()
        .from(boardPermission)
        .where(eq(boardPermission.boardId, boardId));

      for (const permission of directPermissions) {
        if (permission.userId && usersMap.has(permission.userId)) {
          usersMap.get(permission.userId)!.permissions.push(permission);
        }
      }

      return Array.from(usersMap.values());

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'getBoardUsers');
      throw error;
    }
  }

  /**
   * Логировать изменение разрешений
   */
  private static async logPermissionChange(
    boardId: string,
    userId: string,
    action: string,
    details: any
  ): Promise<void> {
    try {
      await db.insert(boardPermissionHistory).values({
        boardId,
        userId,
        action,
        details
      });

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'logPermissionChange');
    }
  }

  /**
   * Получить историю разрешений доски
   */
  static async getBoardPermissionHistory(boardId: string, limit: number = 50): Promise<BoardPermissionHistory[]> {
    try {
      const history = await db
        .select()
        .from(boardPermissionHistory)
        .where(eq(boardPermissionHistory.boardId, boardId))
        .orderBy(desc(boardPermissionHistory.createdAt))
        .limit(limit);

      return history;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'getBoardPermissionHistory');
      throw error;
    }
  }

  /**
   * Создать стандартные роли для доски
   */
  static async createDefaultBoardRoles(boardId: string, createdById: string): Promise<BoardRole[]> {
    try {
      const defaultRoles = [
        {
          name: 'Administrator',
          description: 'Full access to board and all features',
          permissions: {
            view: true,
            edit: true,
            delete: true,
            manageUsers: true,
            manageColumns: true,
            manageSwimlanes: true,
            manageFilters: true,
            manageSettings: true,
            export: true,
            import: true,
            createIssues: true,
            editIssues: true,
            deleteIssues: true,
            assignIssues: true,
            commentIssues: true,
            attachFiles: true,
            voteIssues: true,
            watchIssues: true
          },
          color: '#dc2626',
          isSystem: true
        },
        {
          name: 'Editor',
          description: 'Can edit board content and issues',
          permissions: {
            view: true,
            edit: true,
            delete: false,
            manageUsers: false,
            manageColumns: true,
            manageSwimlanes: true,
            manageFilters: true,
            manageSettings: false,
            export: true,
            import: false,
            createIssues: true,
            editIssues: true,
            deleteIssues: true,
            assignIssues: true,
            commentIssues: true,
            attachFiles: true,
            voteIssues: true,
            watchIssues: true
          },
          color: '#2563eb',
          isSystem: true
        },
        {
          name: 'Viewer',
          description: 'Can only view board content',
          permissions: {
            view: true,
            edit: false,
            delete: false,
            manageUsers: false,
            manageColumns: false,
            manageSwimlanes: false,
            manageFilters: false,
            manageSettings: false,
            export: false,
            import: false,
            createIssues: false,
            editIssues: false,
            deleteIssues: false,
            assignIssues: false,
            commentIssues: true,
            attachFiles: false,
            voteIssues: true,
            watchIssues: true
          },
          color: '#16a34a',
          isSystem: true
        }
      ];

      const createdRoles: BoardRole[] = [];
      
      for (const roleData of defaultRoles) {
        const [role] = await db
          .insert(boardRole)
          .values({
            boardId,
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions,
            color: roleData.color,
            isSystem: roleData.isSystem,
            createdById
          })
          .returning();

        createdRoles.push(role);
      }

      LoggerService.logUserAction('board-default-roles-created', createdById, {
        boardId,
        rolesCount: createdRoles.length
      });

      return createdRoles;

    } catch (error) {
      LoggerService.logError(error as Error, 'permission-service', 'createDefaultBoardRoles');
      throw error;
    }
  }
}
