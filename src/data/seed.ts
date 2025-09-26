import { Workspace, Member, Project, Issue } from "@/lib/types";
import { generateId, generateKey } from "@/lib/utils";

// Helper function to generate consistent UUID for seed data
function generateSeedId(prefix: string, index: number): string {
  // Create consistent UUIDs for seed data
  const seed = `${prefix}-${index}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert hash to UUID-like format
  const hashStr = Math.abs(hash).toString(16).padStart(32, '0');
  return `${hashStr.slice(0, 8)}-${hashStr.slice(8, 12)}-${hashStr.slice(12, 16)}-${hashStr.slice(16, 20)}-${hashStr.slice(20, 32)}`;
}

// Seed data
// NOTE: Для демонстрации используются простые строковые ID
// В продакшене все ID должны быть UUID (generateId())
export const seedWorkspaces: Workspace[] = [
  {
    id: "demo-workspace",
    name: "Demo Workspace",
    slug: "demo",
  },
  {
    id: "personal-workspace",
    name: "Personal Projects",
    slug: "personal",
  },
];

export const seedMembers: Member[] = [
  {
    id: "demo-owner",
    userId: "demo-user",
    workspaceId: "demo-workspace",
    role: "OWNER",
  },
  {
    id: "demo-admin",
    userId: "demo-admin",
    workspaceId: "demo-workspace",
    role: "ADMIN",
  },
  {
    id: "demo-member",
    userId: "demo-member",
    workspaceId: "demo-workspace",
    role: "MEMBER",
  },
];

export const seedProjects: Project[] = [
  {
    id: "demo-project-web",
    key: "WEB",
    name: "Website Redesign",
    workspaceId: "demo-workspace",
    leadId: "demo-user",
    description: "Complete redesign of company website with modern UI/UX",
  },
  {
    id: "demo-project-api",
    key: "API",
    name: "API Development",
    workspaceId: "demo-workspace",
    leadId: "demo-admin",
    description: "RESTful API for mobile applications",
  },
  {
    id: "demo-project-mob",
    key: "MOB",
    name: "Mobile App",
    workspaceId: "demo-workspace",
    leadId: "demo-member",
    description: "Native mobile application for iOS and Android",
  },
];

export const seedIssues: Issue[] = [
  // Website Redesign issues
  {
    id: "demo-issue-web-1",
    projectId: "demo-project-web",
    key: "WEB-1",
    title: "Create wireframes for homepage",
    description: "Design wireframes for the new homepage layout",
    type: "TASK",
    status: "DONE",
    priority: "HIGH",
    assigneeId: "demo-user",
    reporterId: "demo-user",
    labels: ["design", "ui/ux"],
    storyPoints: 5,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-02T14:30:00Z",
    order: 0,
  },
  {
    id: generateSeedId("issue", 2),
    projectId: generateSeedId("project", 1),
    key: "WEB-2",
    title: "Implement responsive navigation",
    description: "Create responsive navigation component with mobile menu",
    type: "TASK",
    status: "IN_REVIEW",
    priority: "MEDIUM",
    assigneeId: "demo-member-1",
    reporterId: "demo-user",
    labels: ["frontend", "react"],
    storyPoints: 8,
    createdAt: "2024-01-02T09:00:00Z",
    updatedAt: "2024-01-03T16:45:00Z",
    order: 1,
  },
  {
    id: "demo-issue-3",
    projectId: "demo-project-1",
    key: "WEB-3",
    title: "Setup CI/CD pipeline",
    description: "Configure automated deployment pipeline",
    type: "TASK",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeId: "demo-member-2",
    reporterId: "demo-user",
    labels: ["devops", "deployment"],
    storyPoints: 13,
    createdAt: "2024-01-03T11:00:00Z",
    updatedAt: "2024-01-04T13:15:00Z",
    order: 2,
  },
  {
    id: "demo-issue-4",
    projectId: "demo-project-1",
    key: "WEB-4",
    title: "Fix layout bug on mobile",
    description: "Header overlaps content on mobile devices",
    type: "BUG",
    status: "TODO",
    priority: "CRITICAL",
    assigneeId: "demo-member-1",
    reporterId: "demo-user",
    labels: ["bug", "mobile", "urgent"],
    storyPoints: 3,
    createdAt: "2024-01-04T14:00:00Z",
    updatedAt: "2024-01-04T14:00:00Z",
    order: 3,
  },

  // API Development issues
  {
    id: "demo-issue-5",
    projectId: "demo-project-2",
    key: "API-1",
    title: "Design API endpoints",
    description: "Document all required API endpoints and data structures",
    type: "TASK",
    status: "DONE",
    priority: "HIGH",
    assigneeId: "demo-member-1",
    reporterId: "demo-member-1",
    labels: ["api", "documentation"],
    storyPoints: 8,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-02T12:00:00Z",
    order: 0,
  },
  {
    id: "demo-issue-6",
    projectId: "demo-project-2",
    key: "API-2",
    title: "Implement authentication middleware",
    description: "JWT authentication middleware for API routes",
    type: "TASK",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeId: "demo-member-1",
    reporterId: "demo-member-1",
    labels: ["api", "security", "auth"],
    storyPoints: 13,
    createdAt: "2024-01-02T13:00:00Z",
    updatedAt: "2024-01-04T10:30:00Z",
    order: 1,
  },
  {
    id: "demo-issue-7",
    projectId: "demo-project-2",
    key: "API-3",
    title: "Add rate limiting",
    description: "Implement rate limiting for API endpoints",
    type: "TASK",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "demo-member-2",
    reporterId: "demo-member-1",
    labels: ["api", "security"],
    storyPoints: 5,
    createdAt: "2024-01-04T15:00:00Z",
    updatedAt: "2024-01-04T15:00:00Z",
    order: 2,
  },

  // Mobile App issues
  {
    id: "demo-issue-8",
    projectId: "demo-project-3",
    key: "MOB-1",
    title: "Setup React Native project",
    description: "Initialize new React Native project with navigation",
    type: "TASK",
    status: "DONE",
    priority: "HIGH",
    assigneeId: "demo-member-2",
    reporterId: "demo-member-2",
    labels: ["mobile", "react-native", "setup"],
    storyPoints: 8,
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T17:00:00Z",
    order: 0,
  },
  {
    id: "demo-issue-9",
    projectId: "demo-project-3",
    key: "MOB-2",
    title: "Implement user onboarding flow",
    description: "Create multi-step onboarding flow for new users",
    type: "STORY",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeId: "demo-member-2",
    reporterId: "demo-member-2",
    labels: ["mobile", "onboarding", "ui/ux"],
    storyPoints: 21,
    createdAt: "2024-01-02T10:00:00Z",
    updatedAt: "2024-01-04T11:00:00Z",
    order: 1,
  },
  {
    id: "demo-issue-10",
    projectId: "demo-project-3",
    key: "MOB-3",
    title: "App crashes on Android 12",
    description: "Application crashes immediately on Android 12 devices",
    type: "BUG",
    status: "TODO",
    priority: "CRITICAL",
    assigneeId: "demo-member-2",
    reporterId: "demo-user",
    labels: ["bug", "android", "crash", "urgent"],
    storyPoints: 8,
    createdAt: "2024-01-04T16:00:00Z",
    updatedAt: "2024-01-04T16:00:00Z",
    order: 2,
  },
];

// Helper functions to get seed data
export function getWorkspaceById(id: string): Workspace | undefined {
  return seedWorkspaces.find((w) => w.id === id);
}

export function getProjectById(id: string): Project | undefined {
  return seedProjects.find((p) => p.id === id);
}

export function getIssuesByProject(projectId: string): Issue[] {
  return seedIssues
    .filter((issue) => issue.projectId === projectId)
    .sort((a, b) => a.order - b.order);
}

export function getIssuesByStatus(status: Issue["status"]): Issue[] {
  return seedIssues.filter((issue) => issue.status === status);
}
