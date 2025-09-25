"use server";

import { revalidatePath } from "next/cache";
import { Issue } from "@/lib/types";
import { dataContainer } from "@/data/repositories";

export async function getIssuesByProject(projectId: string): Promise<Issue[]> {
  return await dataContainer.issues.findByProject(projectId);
}

export async function getIssueById(id: string): Promise<Issue | null> {
  return await dataContainer.issues.findById(id);
}

export async function createIssue(
  issueData: Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "order">
): Promise<Issue> {
  const newIssue = await dataContainer.issues.create(issueData);
  revalidatePath(`/w/${issueData.projectId.split("-")[0]}/projects/${issueData.projectId}`);
  return newIssue;
}

export async function updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | null> {
  const updatedIssue = await dataContainer.issues.update(id, updates);
  if (updatedIssue) {
    revalidatePath(`/w/${updatedIssue.projectId}/projects/${updatedIssue.projectId}`);
  }
  return updatedIssue;
}

export async function deleteIssue(id: string): Promise<boolean> {
  const issue = await dataContainer.issues.findById(id);
  const deleted = await dataContainer.issues.delete(id);
  if (deleted && issue) {
    revalidatePath(`/w/${issue.projectId}/projects/${issue.projectId}`);
  }
  return deleted;
}

export async function reorderIssues(projectId: string, issues: Issue[]): Promise<void> {
  await dataContainer.issues.reorder(projectId, issues);
  revalidatePath(`/w/${projectId}/projects/${projectId}`);
}
