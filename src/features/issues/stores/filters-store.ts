import { create } from "zustand";
import { Issue } from "@/lib/types";

export interface IssueFilters {
  status: Issue["status"][];
  assigneeIds: string[];
  labels: string[];
  projectIds: string[];
  priorities: Issue["priority"][];
  types: Issue["type"][];
  searchQuery: string;
}

interface FiltersStore {
  filters: IssueFilters;
  setStatusFilter: (statuses: Issue["status"][]) => void;
  setAssigneeFilter: (assigneeIds: string[]) => void;
  setLabelFilter: (labels: string[]) => void;
  setProjectFilter: (projectIds: string[]) => void;
  setPriorityFilter: (priorities: Issue["priority"][]) => void;
  setTypeFilter: (types: Issue["type"][]) => void;
  setSearchQuery: (query: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

const initialFilters: IssueFilters = {
  status: [],
  assigneeIds: [],
  labels: [],
  projectIds: [],
  priorities: [],
  types: [],
  searchQuery: "",
};

export const useFiltersStore = create<FiltersStore>((set, get) => ({
  filters: initialFilters,

  setStatusFilter: (statuses) =>
    set((state) => ({
      filters: { ...state.filters, status: statuses },
    })),

  setAssigneeFilter: (assigneeIds) =>
    set((state) => ({
      filters: { ...state.filters, assigneeIds },
    })),

  setLabelFilter: (labels) =>
    set((state) => ({
      filters: { ...state.filters, labels },
    })),

  setProjectFilter: (projectIds) =>
    set((state) => ({
      filters: { ...state.filters, projectIds },
    })),

  setPriorityFilter: (priorities) =>
    set((state) => ({
      filters: { ...state.filters, priorities },
    })),

  setTypeFilter: (types) =>
    set((state) => ({
      filters: { ...state.filters, types },
    })),

  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  clearAllFilters: () =>
    set({ filters: initialFilters }),

  get hasActiveFilters() {
    const filters = get().filters;
    return (
      filters.status.length > 0 ||
      filters.assigneeIds.length > 0 ||
      filters.labels.length > 0 ||
      filters.projectIds.length > 0 ||
      filters.priorities.length > 0 ||
      filters.types.length > 0 ||
      filters.searchQuery.trim() !== ""
    );
  },
}));
