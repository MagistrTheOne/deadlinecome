import { Workspace } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { seedWorkspaces } from "../seed";

// In-memory storage
let workspaces: Workspace[] = [...seedWorkspaces];

export interface IWorkspacesRepo {
  findById(id: string): Promise<Workspace | null>;
  findBySlug(slug: string): Promise<Workspace | null>;
  findAll(): Promise<Workspace[]>;
  create(workspace: Omit<Workspace, "id">): Promise<Workspace>;
  update(id: string, updates: Partial<Workspace>): Promise<Workspace | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryWorkspacesRepo implements IWorkspacesRepo {
  async findById(id: string): Promise<Workspace | null> {
    return workspaces.find((workspace) => workspace.id === id) || null;
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    return workspaces.find((workspace) => workspace.slug === slug) || null;
  }

  async findAll(): Promise<Workspace[]> {
    return [...workspaces];
  }

  async create(workspaceData: Omit<Workspace, "id">): Promise<Workspace> {
    const newWorkspace: Workspace = {
      ...workspaceData,
      id: generateId(),
    };

    workspaces.push(newWorkspace);
    return newWorkspace;
  }

  async update(id: string, updates: Partial<Workspace>): Promise<Workspace | null> {
    const workspaceIndex = workspaces.findIndex((workspace) => workspace.id === id);
    if (workspaceIndex === -1) return null;

    workspaces[workspaceIndex] = {
      ...workspaces[workspaceIndex],
      ...updates,
    };

    return workspaces[workspaceIndex];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = workspaces.length;
    workspaces = workspaces.filter((workspace) => workspace.id !== id);
    return workspaces.length < initialLength;
  }
}

export const workspacesRepo = new InMemoryWorkspacesRepo();
