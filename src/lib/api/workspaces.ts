import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workspace, workspaceMember } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
}

export class WorkspaceService {
  static async getWorkspaces(userId: string): Promise<Workspace[]> {
    try {
      const userWorkspaces = await db
        .select({
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          description: workspace.description,
          ownerId: workspace.ownerId,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        })
        .from(workspace)
        .innerJoin(workspaceMember, eq(workspace.id, workspaceMember.workspaceId))
        .where(eq(workspaceMember.userId, userId));

      // Добавляем количество участников для каждого рабочего пространства
      const workspacesWithMemberCount = await Promise.all(
        userWorkspaces.map(async (ws) => {
          const memberCount = await db
            .select({ count: workspaceMember.id })
            .from(workspaceMember)
            .where(eq(workspaceMember.workspaceId, ws.id));

          return {
            ...ws,
            memberCount: memberCount.length,
          };
        })
      );

      return workspacesWithMemberCount;
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      return [];
    }
  }

  static async createWorkspace(data: CreateWorkspaceData, userId: string): Promise<Workspace> {
    try {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const newWorkspace = await db
        .insert(workspace)
        .values({
          id: crypto.randomUUID(),
          name: data.name,
          slug: slug,
          description: data.description,
          ownerId: userId,
        })
        .returning();

      // Добавляем создателя как участника с ролью OWNER
      await db.insert(workspaceMember).values({
        id: crypto.randomUUID(),
        workspaceId: newWorkspace[0].id,
        userId: userId,
        role: "OWNER",
      });

      return {
        ...newWorkspace[0],
        memberCount: 1,
      };
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw new Error("Не удалось создать рабочее пространство");
    }
  }

  static async getWorkspaceById(workspaceId: string, userId: string): Promise<Workspace | null> {
    try {
      const ws = await db
        .select()
        .from(workspace)
        .where(eq(workspace.id, workspaceId))
        .limit(1);

      if (ws.length === 0) {
        return null;
      }

      // Проверяем, является ли пользователь участником рабочего пространства
      const membership = await db
        .select()
        .from(workspaceMember)
        .where(
          eq(workspaceMember.workspaceId, workspaceId) &&
          eq(workspaceMember.userId, userId)
        )
        .limit(1);

      if (membership.length === 0) {
        return null;
      }

      const memberCount = await db
        .select({ count: workspaceMember.id })
        .from(workspaceMember)
        .where(eq(workspaceMember.workspaceId, workspaceId));

      return {
        ...ws[0],
        memberCount: memberCount.length,
      };
    } catch (error) {
      console.error("Error fetching workspace:", error);
      return null;
    }
  }
}
