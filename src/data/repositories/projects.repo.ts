import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { Project } from "@/lib/types";
import { generateId } from "@/lib/utils";

export interface IProjectsRepo {
  findById(id: string): Promise<Project | null>;
  findByWorkspace(workspaceId: string): Promise<Project[]>;
  create(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project>;
  update(id: string, updates: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>): Promise<Project | null>;
  delete(id: string): Promise<boolean>;
}

export class DrizzleProjectsRepo implements IProjectsRepo {
  async findById(id: string): Promise<Project | null> {
    const result = await db.select().from(project).where(eq(project.id, id)).limit(1);
    if (!result[0]) return null;

    const item = result[0];
    return {
      ...item,
      description: item.description ?? undefined,
      leadId: item.leadId ?? undefined,
    };
  }

  async findByWorkspace(workspaceId: string): Promise<Project[]> {
    const result = await db.select().from(project).where(eq(project.workspaceId, workspaceId));
    return result.map(item => ({
      ...item,
      description: item.description ?? undefined,
      leadId: item.leadId ?? undefined,
    }));
  }

  async create(projectData: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const id = generateId();
    const newProject = {
      id,
      key: projectData.key,
      name: projectData.name,
      description: projectData.description ?? null,
      workspaceId: projectData.workspaceId,
      leadId: projectData.leadId ?? null,
    };

    await db.insert(project).values(newProject);
    return {
      ...newProject,
      description: newProject.description ?? undefined,
      leadId: newProject.leadId ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Project;
  }

  async update(id: string, updates: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>): Promise<Project | null> {
    const updateData: any = { ...updates };
    if (updates.description !== undefined) {
      updateData.description = updates.description ?? null;
    }
    if (updates.leadId !== undefined) {
      updateData.leadId = updates.leadId ?? null;
    }

    await db.update(project).set(updateData).where(eq(project.id, id));
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(project).where(eq(project.id, id));
    return (result as any).rowCount > 0;
  }
}

export const projectsRepo = new DrizzleProjectsRepo();
