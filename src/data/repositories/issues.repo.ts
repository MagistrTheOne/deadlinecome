import { Issue } from "@/lib/types";
import { generateId, generateKey } from "@/lib/utils";
import { seedIssues } from "../seed";

// In-memory storage
let issues: Issue[] = [...seedIssues];

export interface IIssuesRepo {
  findById(id: string): Promise<Issue | null>;
  findByProject(projectId: string): Promise<Issue[]>;
  findByStatus(status: Issue["status"]): Promise<Issue[]>;
  create(issue: Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "order">): Promise<Issue>;
  update(id: string, updates: Partial<Issue>): Promise<Issue | null>;
  delete(id: string): Promise<boolean>;
  reorder(projectId: string, issues: Issue[]): Promise<void>;
}

export class InMemoryIssuesRepo implements IIssuesRepo {
  async findById(id: string): Promise<Issue | null> {
    return issues.find((issue) => issue.id === id) || null;
  }

  async findByProject(projectId: string): Promise<Issue[]> {
    return issues
      .filter((issue) => issue.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async findByStatus(status: Issue["status"]): Promise<Issue[]> {
    return issues.filter((issue) => issue.status === status);
  }

  async create(issueData: Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "order">): Promise<Issue> {
    const now = new Date().toISOString();
    const projectIssues = await this.findByProject(issueData.projectId);
    const maxOrder = projectIssues.length > 0 ? Math.max(...projectIssues.map(i => i.order)) : 0;

    const newIssue: Issue = {
      ...issueData,
      id: generateId(),
      key: generateKey(issueData.projectId.split("-")[1] || "NEW"),
      createdAt: now,
      updatedAt: now,
      order: maxOrder + 1,
    };

    issues.push(newIssue);
    return newIssue;
  }

  async update(id: string, updates: Partial<Issue>): Promise<Issue | null> {
    const issueIndex = issues.findIndex((issue) => issue.id === id);
    if (issueIndex === -1) return null;

    issues[issueIndex] = {
      ...issues[issueIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return issues[issueIndex];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = issues.length;
    issues = issues.filter((issue) => issue.id !== id);
    return issues.length < initialLength;
  }

  async reorder(projectId: string, reorderedIssues: Issue[]): Promise<void> {
    // Update order for all issues in the project
    const projectIssueIds = new Set(reorderedIssues.map(i => i.id));

    issues = issues.map((issue) => {
      if (issue.projectId === projectId) {
        const reorderedIssue = reorderedIssues.find(ri => ri.id === issue.id);
        if (reorderedIssue) {
          return {
            ...reorderedIssue,
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return issue;
    });
  }
}

export const issuesRepo = new InMemoryIssuesRepo();
