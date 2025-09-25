import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { issue } from "@/lib/db/schema";
import { Issue } from "@/lib/types";
import { generateId, generateKey } from "@/lib/utils";

export interface IIssuesRepo {
  findById(id: string): Promise<Issue | null>;
  findByProject(projectId: string): Promise<Issue[]>;
  findByStatus(status: Issue["status"]): Promise<Issue[]>;
  create(issue: Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "order">): Promise<Issue>;
  update(id: string, updates: Partial<Omit<Issue, "id" | "createdAt" | "updatedAt">>): Promise<Issue | null>;
  delete(id: string): Promise<boolean>;
  reorder(projectId: string, issues: Issue[]): Promise<void>;
}

export class DrizzleIssuesRepo implements IIssuesRepo {
  async findById(id: string): Promise<Issue | null> {
    const result = await db.select().from(issue).where(eq(issue.id, id)).limit(1);
    return result[0] || null;
  }

  async findByProject(projectId: string): Promise<Issue[]> {
    return await db.select().from(issue).where(eq(issue.projectId, projectId)).orderBy(issue.order);
  }

  async findByStatus(status: Issue["status"]): Promise<Issue[]> {
    return await db.select().from(issue).where(eq(issue.status, status));
  }

  async create(issueData: Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "order">): Promise<Issue> {
    const id = generateId();
    const projectIssues = await this.findByProject(issueData.projectId);
    const maxOrder = projectIssues.length > 0 ? Math.max(...projectIssues.map(i => i.order.getTime())) : Date.now();

    const newIssue = {
      id,
      key: generateKey(issueData.projectId.split("-")[1] || "NEW"),
      ...issueData,
      order: new Date(maxOrder + 1),
    };

    await db.insert(issue).values(newIssue);
    return newIssue;
  }

  async update(id: string, updates: Partial<Omit<Issue, "id" | "createdAt" | "updatedAt">>): Promise<Issue | null> {
    await db.update(issue).set(updates).where(eq(issue.id, id));
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(issue).where(eq(issue.id, id));
    return result.rowCount > 0;
  }

  async reorder(projectId: string, reorderedIssues: Issue[]): Promise<void> {
    // Update order for all issues in the project
    for (const issueData of reorderedIssues) {
      await db.update(issue)
        .set({ order: issueData.order })
        .where(eq(issue.id, issueData.id));
    }
  }
}

export const issuesRepo = new DrizzleIssuesRepo();
