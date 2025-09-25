import { Project } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { seedProjects } from "../seed";

// In-memory storage
let projects: Project[] = [...seedProjects];

export interface IProjectsRepo {
  findById(id: string): Promise<Project | null>;
  findByWorkspace(workspaceId: string): Promise<Project[]>;
  create(project: Omit<Project, "id">): Promise<Project>;
  update(id: string, updates: Partial<Project>): Promise<Project | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryProjectsRepo implements IProjectsRepo {
  async findById(id: string): Promise<Project | null> {
    return projects.find((project) => project.id === id) || null;
  }

  async findByWorkspace(workspaceId: string): Promise<Project[]> {
    return projects.filter((project) => project.workspaceId === workspaceId);
  }

  async create(projectData: Omit<Project, "id">): Promise<Project> {
    const newProject: Project = {
      ...projectData,
      id: generateId(),
    };

    projects.push(newProject);
    return newProject;
  }

  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    const projectIndex = projects.findIndex((project) => project.id === id);
    if (projectIndex === -1) return null;

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
    };

    return projects[projectIndex];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = projects.length;
    projects = projects.filter((project) => project.id !== id);
    return projects.length < initialLength;
  }
}

export const projectsRepo = new InMemoryProjectsRepo();
