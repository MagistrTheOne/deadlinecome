import { useMemo } from "react";
import { Issue } from "@/lib/types";
import { useFiltersStore } from "../stores/filters-store";

export function useFilteredIssues(issues: Issue[]) {
  const { filters } = useFiltersStore();

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(issue.status)) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeIds.length > 0) {
        if (!issue.assigneeId || !filters.assigneeIds.includes(issue.assigneeId)) {
          return false;
        }
      }

      // Labels filter
      if (filters.labels.length > 0) {
        const hasMatchingLabel = filters.labels.some(filterLabel =>
          issue.labels.some(issueLabel =>
            issueLabel.toLowerCase().includes(filterLabel.toLowerCase())
          )
        );
        if (!hasMatchingLabel) {
          return false;
        }
      }

      // Project filter
      if (filters.projectIds.length > 0 && !filters.projectIds.includes(issue.projectId)) {
        return false;
      }

      // Priority filter
      if (filters.priorities.length > 0 && !filters.priorities.includes(issue.priority)) {
        return false;
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(issue.type)) {
        return false;
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(query);
        const matchesDescription = issue.description?.toLowerCase().includes(query);
        const matchesKey = issue.key.toLowerCase().includes(query);
        const matchesLabels = issue.labels.some(label => label.toLowerCase().includes(query));

        if (!matchesTitle && !matchesDescription && !matchesKey && !matchesLabels) {
          return false;
        }
      }

      return true;
    });
  }, [issues, filters]);

  return filteredIssues;
}
