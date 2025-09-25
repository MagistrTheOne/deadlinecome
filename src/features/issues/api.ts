import { Issue } from "@/lib/types";
import {
  getIssuesByProject,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  reorderIssues,
} from "./actions";

export const issuesApi = {
  getByProject: getIssuesByProject,
  getById: getIssueById,
  create: createIssue,
  update: updateIssue,
  delete: deleteIssue,
  reorder: reorderIssues,
};
