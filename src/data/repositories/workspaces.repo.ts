import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspace } from "@/lib/db/schema";
import { Workspace } from "@/lib/types";
import { generateId } from "@/lib/utils";

export interface IWorkspacesRepo {
  findById(id: string): Promise<Workspace | null>;
  findBySlug(slug: string): Promise<Workspace | null>;
  findByOwnerId(ownerId: string): Promise<Workspace[]>;
  findAll(): Promise<Workspace[]>;
  create(workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">): Promise<Workspace>;
  update(id: string, updates: Partial<Omit<Workspace, "id" | "createdAt" | "updatedAt">>): Promise<Workspace | null>;
  delete(id: string): Promise<boolean>;
}

export class DrizzleWorkspacesRepo implements IWorkspacesRepo {
  async findById(id: string): Promise<Workspace | null> {
    const result = await db.select().from(workspace).where(eq(workspace.id, id)).limit(1);
    return result[0] || null;
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const result = await db.select().from(workspace).where(eq(workspace.slug, slug)).limit(1);
    return result[0] || null;
  }

  async findByOwnerId(ownerId: string): Promise<Workspace[]> {
    return await db.select().from(workspace).where(eq(workspace.ownerId, ownerId));
  }

  async findAll(): Promise<Workspace[]> {
    return await db.select().from(workspace);
  }

  async create(workspaceData: any): Promise<any> {
    const id = generateId();
    const newWorkspace = {
      id,
      ...workspaceData,
    };

    await db.insert(workspace).values(newWorkspace);
    return newWorkspace;
  }

  async update(id: string, updates: any): Promise<any | null> {
    await db.update(workspace).set(updates).where(eq(workspace.id, id));
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(workspace).where(eq(workspace.id, id));
    return result.length > 0;
  }
}

export const workspacesRepo = new DrizzleWorkspacesRepo();
