import { z } from "zod";

// Workspace schema
export const Workspace = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export type Workspace = z.infer<typeof Workspace>;

// Member schema
export const Member = z.object({
  id: z.string(),
  userId: z.string(),
  workspaceId: z.string(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
});

export type Member = z.infer<typeof Member>;

// Project schema
export const Project = z.object({
  id: z.string(),
  key: z.string().min(2).max(6),
  name: z.string(),
  workspaceId: z.string(),
  leadId: z.string().optional(),
  description: z.string().optional(),
});

export type Project = z.infer<typeof Project>;

// Issue schema
export const Issue = z.object({
  id: z.string(),
  projectId: z.string(),
  key: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["TASK", "BUG", "STORY"]),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  assigneeId: z.string().optional(),
  reporterId: z.string(),
  labels: z.array(z.string()),
  storyPoints: z.number().int().positive().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  order: z.number().int(),
});

export type Issue = z.infer<typeof Issue>;

// Status enum for columns
export const Status = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]);
export type Status = z.infer<typeof Status>;

// Priority enum with colors for UI
export const PriorityColors: Record<Issue["priority"], string> = {
  LOW: "text-blue-500",
  MEDIUM: "text-yellow-500",
  HIGH: "text-orange-500",
  CRITICAL: "text-red-500",
} as const;

// Issue type colors
export const TypeColors: Record<Issue["type"], string> = {
  TASK: "text-gray-500",
  BUG: "text-red-500",
  STORY: "text-green-500",
} as const;

// Status colors for columns
export const StatusColors: Record<Status, string> = {
  TODO: "bg-gray-800",
  IN_PROGRESS: "bg-blue-800",
  IN_REVIEW: "bg-yellow-800",
  DONE: "bg-green-800",
} as const;
