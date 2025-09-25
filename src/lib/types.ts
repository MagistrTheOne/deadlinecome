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

// Priority enum with enhanced styling for UI
export const PriorityStyles: Record<Issue["priority"], {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  LOW: {
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "📋",
  },
  MEDIUM: {
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: "⚡",
  },
  HIGH: {
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: "🔥",
  },
  CRITICAL: {
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: "🚨",
  },
} as const;

// Issue type colors with enhanced styling
export const TypeStyles: Record<Issue["type"], {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  TASK: {
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: "📝",
  },
  BUG: {
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: "🐛",
  },
  STORY: {
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: "📖",
  },
} as const;

// Legacy compatibility
export const PriorityColors: Record<Issue["priority"], string> = {
  LOW: "text-blue-500",
  MEDIUM: "text-yellow-500",
  HIGH: "text-orange-500",
  CRITICAL: "text-red-500",
} as const;

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

// Label colors for tags
export const LabelColors = [
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
  "bg-teal-100 text-teal-800 border-teal-200",
  "bg-cyan-100 text-cyan-800 border-cyan-200",
  "bg-lime-100 text-lime-800 border-lime-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-rose-100 text-rose-800 border-rose-200",
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-violet-100 text-violet-800 border-violet-200",
] as const;

export function getLabelColor(label: string): string {
  // Simple hash function to get consistent color for same labels
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LabelColors[Math.abs(hash) % LabelColors.length];
}
