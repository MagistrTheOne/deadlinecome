import { db } from "@/lib/db";
import { issue, project, workspaceMember } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export interface Task {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";
  type: "BUG" | "TASK" | "STORY" | "EPIC";
  projectId: string;
  assigneeId?: string;
  reporterId: string;
  order: Date;
  createdAt: Date;
  updatedAt: Date;
  estimatedHours?: number;
  actualHours?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";
  type: "BUG" | "TASK" | "STORY" | "EPIC";
  projectId: string;
  assigneeId?: string;
  estimatedHours?: number;
}

export class TaskService {
  static async getTasks(projectId: string, userId: string): Promise<Task[]> {
    try {
      // Проверяем доступ к проекту через рабочее пространство
      const projectData = await db
        .select({ workspaceId: project.workspaceId })
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

      if (projectData.length === 0) {
        return [];
      }

      const membership = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, projectData[0].workspaceId),
            eq(workspaceMember.userId, userId)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        return [];
      }

      const tasks = await db
        .select()
        .from(issue)
        .where(eq(issue.projectId, projectId))
        .orderBy(issue.order);

      return tasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }

  static async createTask(data: CreateTaskData, reporterId: string): Promise<Task> {
    try {
      // Проверяем доступ к проекту
      const projectData = await db
        .select({ workspaceId: project.workspaceId })
        .from(project)
        .where(eq(project.id, data.projectId))
        .limit(1);

      if (projectData.length === 0) {
        throw new Error("Проект не найден");
      }

      const membership = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, projectData[0].workspaceId),
            eq(workspaceMember.userId, reporterId)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        throw new Error("У вас нет доступа к этому проекту");
      }

      // Генерируем ключ задачи
      const projectKey = await db
        .select({ key: project.key })
        .from(project)
        .where(eq(project.id, data.projectId))
        .limit(1);

      const taskCount = await db
        .select({ count: issue.id })
        .from(issue)
        .where(eq(issue.projectId, data.projectId));

      const taskKey = `${projectKey[0].key}-${taskCount.length + 1}`;

      const newTask = await db
        .insert(issue)
        .values({
          id: crypto.randomUUID(),
          key: taskKey,
          title: data.title,
          description: data.description,
          status: "TODO",
          priority: data.priority,
          type: data.type,
          projectId: data.projectId,
          assigneeId: data.assigneeId,
          reporterId: reporterId,
          estimatedHours: data.estimatedHours,
        })
        .returning();

      return newTask[0];
    } catch (error) {
      console.error("Error creating task:", error);
      throw new Error("Не удалось создать задачу");
    }
  }

  static async updateTaskStatus(taskId: string, status: Task["status"], userId: string): Promise<Task | null> {
    try {
      // Проверяем доступ к задаче
      const taskData = await db
        .select({ projectId: issue.projectId })
        .from(issue)
        .where(eq(issue.id, taskId))
        .limit(1);

      if (taskData.length === 0) {
        return null;
      }

      const projectData = await db
        .select({ workspaceId: project.workspaceId })
        .from(project)
        .where(eq(project.id, taskData[0].projectId))
        .limit(1);

      const membership = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, projectData[0].workspaceId),
            eq(workspaceMember.userId, userId)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        return null;
      }

      const updatedTask = await db
        .update(issue)
        .set({ 
          status: status,
          updatedAt: new Date()
        })
        .where(eq(issue.id, taskId))
        .returning();

      return updatedTask[0];
    } catch (error) {
      console.error("Error updating task status:", error);
      return null;
    }
  }

  static async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    try {
      const task = await db
        .select()
        .from(issue)
        .where(eq(issue.id, taskId))
        .limit(1);

      if (task.length === 0) {
        return null;
      }

      // Проверяем доступ через проект
      const projectData = await db
        .select({ workspaceId: project.workspaceId })
        .from(project)
        .where(eq(project.id, task[0].projectId))
        .limit(1);

      const membership = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, projectData[0].workspaceId),
            eq(workspaceMember.userId, userId)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        return null;
      }

      return task[0];
    } catch (error) {
      console.error("Error fetching task:", error);
      return null;
    }
  }
}
