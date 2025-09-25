import { Issue } from "@/lib/types";

export type CreateIssueData = Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "order">;
export type UpdateIssueData = Partial<Issue>;
