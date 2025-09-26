import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { issue, project } from "@/lib/db/schema";
import { Issue } from "@/lib/types";
import { generateId, generateKey } from "@/lib/utils";

export interface IIssuesRepo {
  findById(id: string): Promise<any | null>;
  findByProject(projectId: string): Promise<any[]>;
  findByStatus(status: any): Promise<any[]>;
  create(issue: any): Promise<any>;
  update(id: string, updates: any): Promise<any | null>;
  delete(id: string): Promise<boolean>;
  reorder(projectId: string, issues: any[]): Promise<void>;
}

export class DrizzleIssuesRepo implements IIssuesRepo {
  async findById(id: string): Promise<any | null> {
    const result = await db.select().from(issue).where(eq(issue.id, id)).limit(1);
    return result[0] || null;
  }

  async findByProject(projectId: string): Promise<any[]> {
    return await db.select().from(issue).where(eq(issue.projectId, projectId)).orderBy(issue.order);
  }

  async findByStatus(status: any): Promise<any[]> {
    return await db.select().from(issue).where(eq(issue.status, status));
  }

  async create(issueData: any): Promise<any> {
    const id = generateId();
    const projectIssues = await this.findByProject(issueData.projectId);
    const maxOrder = projectIssues.length > 0 ? Math.max(...projectIssues.map(i => i.order.getTime())) : Date.now();

    // Получаем ключ проекта из базы данных
    const projectResult = await db.select().from(project).where(eq(project.id, issueData.projectId)).limit(1);
    const projectKey = projectResult[0]?.key || "NEW";

    const newIssue = {
      id,
      key: generateKey(projectKey),
      ...issueData,
      order: new Date(maxOrder + 1),
    };

    await db.insert(issue).values(newIssue);
    return newIssue;
  }

  async update(id: string, updates: any): Promise<any | null> {
    await db.update(issue).set(updates).where(eq(issue.id, id));
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(issue).where(eq(issue.id, id));
    return result.length > 0;
  }

  async reorder(projectId: string, reorderedIssues: any[]): Promise<void> {
    // Update order for all issues in the project
    for (const issueData of reorderedIssues) {
      await db.update(issue)
        .set({ order: issueData.order })
        .where(eq(issue.id, issueData.id));
    }
  }
}

export const issuesRepo = new DrizzleIssuesRepo();
