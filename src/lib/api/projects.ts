import { db } from "@/lib/db";
import { project, workspace, workspaceMember } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export interface Project {
  id: string;
  key: string;
  name: string;
  description?: string;
  workspaceId: string;
  leadId?: string;
  createdAt: Date;
  updatedAt: Date;
  issueCount: number;
}

export interface CreateProjectData {
  key: string;
  name: string;
  description?: string;
  workspaceId: string;
  leadId?: string;
}

export class ProjectService {
  static async getProjects(workspaceId: string, userId: string): Promise<Project[]> {
    try {
      // Проверяем, является ли пользователь участником рабочего пространства
      const membership = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, workspaceId),
            eq(workspaceMember.userId, userId)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        return [];
      }

      const projects = await db
        .select()
        .from(project)
        .where(eq(project.workspaceId, workspaceId));

      // Добавляем количество задач для каждого проекта
      const projectsWithIssueCount = await Promise.all(
        projects.map(async (proj) => {
          // В реальном приложении здесь будет подсчет задач
          return {
            ...proj,
            issueCount: 0, // Пока заглушка
          };
        })
      );

      return projectsWithIssueCount as any;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }

  static async createProject(data: CreateProjectData, userId: string): Promise<Project> {
    try {
      // Проверяем, является ли пользователь участником рабочего пространства
      const membership = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, data.workspaceId),
            eq(workspaceMember.userId, userId)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        throw new Error("У вас нет доступа к этому рабочему пространству");
      }

      const newProject = await db
        .insert(project)
        .values({
          id: crypto.randomUUID(),
          key: data.key,
          name: data.name,
          description: data.description,
          workspaceId: data.workspaceId,
          leadId: data.leadId,
        })
        .returning();

      return {
        ...newProject[0],
        issueCount: 0,
      } as any;
    } catch (error) {
      console.error("Error creating project:", error);
      throw new Error("Не удалось создать проект");
    }
  }

  static async getProjectById(projectId: string, userId: string): Promise<Project | null> {
    try {
      const proj = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

      if (proj.length === 0) {
        return null;
      }

      // Проверяем доступ через рабочее пространство
      const membership = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, proj[0].workspaceId),
            eq(workspaceMember.userId, userId)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        return null;
      }

      return {
        ...proj[0],
        issueCount: 0, // Пока заглушка
      } as any;
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  }
}
