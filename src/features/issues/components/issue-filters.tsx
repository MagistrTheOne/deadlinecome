"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Issue } from "@/lib/types";
import { useFiltersStore } from "../stores/filters-store";

interface IssueFiltersProps {
  availableLabels?: string[];
  availableAssignees?: { id: string; name: string }[];
  availableProjects?: { id: string; name: string }[];
}

export function IssueFilters({
  availableLabels = [],
  availableAssignees = [],
  availableProjects = []
}: IssueFiltersProps) {
  const {
    filters,
    setStatusFilter,
    setAssigneeFilter,
    setLabelFilter,
    setProjectFilter,
    setPriorityFilter,
    setTypeFilter,
    setSearchQuery,
    clearAllFilters,
    hasActiveFilters,
  } = useFiltersStore();

  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions: Issue["status"][] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
  const priorityOptions: Issue["priority"][] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const typeOptions: Issue["type"][] = ["TASK", "BUG", "STORY"];

  const handleStatusToggle = (status: Issue["status"], checked: boolean) => {
    const newStatuses = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    setStatusFilter(newStatuses);
  };

  const handleAssigneeToggle = (assigneeId: string, checked: boolean) => {
    const newAssignees = checked
      ? [...filters.assigneeIds, assigneeId]
      : filters.assigneeIds.filter(id => id !== assigneeId);
    setAssigneeFilter(newAssignees);
  };

  const handleLabelToggle = (label: string, checked: boolean) => {
    const newLabels = checked
      ? [...filters.labels, label]
      : filters.labels.filter(l => l !== label);
    setLabelFilter(newLabels);
  };

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    const newProjects = checked
      ? [...filters.projectIds, projectId]
      : filters.projectIds.filter(id => id !== projectId);
    setProjectFilter(newProjects);
  };

  const handlePriorityToggle = (priority: Issue["priority"], checked: boolean) => {
    const newPriorities = checked
      ? [...filters.priorities, priority]
      : filters.priorities.filter(p => p !== priority);
    setPriorityFilter(newPriorities);
  };

  const handleTypeToggle = (type: Issue["type"], checked: boolean) => {
    const newTypes = checked
      ? [...filters.types, type]
      : filters.types.filter(t => t !== type);
    setTypeFilter(newTypes);
  };

  const removeStatusFilter = (status: Issue["status"]) => {
    setStatusFilter(filters.status.filter(s => s !== status));
  };

  const removeAssigneeFilter = (assigneeId: string) => {
    setAssigneeFilter(filters.assigneeIds.filter(id => id !== assigneeId));
  };

  const removeLabelFilter = (label: string) => {
    setLabelFilter(filters.labels.filter(l => l !== label));
  };

  const removeProjectFilter = (projectId: string) => {
    setProjectFilter(filters.projectIds.filter(id => id !== projectId));
  };

  const removePriorityFilter = (priority: Issue["priority"]) => {
    setPriorityFilter(filters.priorities.filter(p => p !== priority));
  };

  const removeTypeFilter = (type: Issue["type"]) => {
    setTypeFilter(filters.types.filter(t => t !== type));
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры задач
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Активны
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Очистить
              </Button>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.status.map(status => (
              <Badge key={status} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => removeStatusFilter(status)}>
                Статус: {status} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.assigneeIds.map(assigneeId => {
              const assignee = availableAssignees.find(a => a.id === assigneeId);
              return (
                <Badge key={assigneeId} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => removeAssigneeFilter(assigneeId)}>
                  Исполнитель: {assignee?.name || assigneeId} <X className="h-3 w-3 ml-1" />
                </Badge>
              );
            })}
            {filters.labels.map(label => (
              <Badge key={label} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => removeLabelFilter(label)}>
                Метка: {label} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.projectIds.map(projectId => {
              const project = availableProjects.find(p => p.id === projectId);
              return (
                <Badge key={projectId} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => removeProjectFilter(projectId)}>
                  Проект: {project?.name || projectId} <X className="h-3 w-3 ml-1" />
                </Badge>
              );
            })}
            {filters.priorities.map(priority => (
              <Badge key={priority} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => removePriorityFilter(priority)}>
                Приоритет: {priority} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.types.map(type => (
              <Badge key={type} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => removeTypeFilter(type)}>
                Тип: {type} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск задач..."
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div>
                <h4 className="font-medium mb-3">Статус</h4>
                <div className="space-y-2">
                  {statusOptions.map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.status.includes(status)}
                        onCheckedChange={(checked) => handleStatusToggle(status, checked as boolean)}
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {status.replace("_", " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <h4 className="font-medium mb-3">Приоритет</h4>
                <div className="space-y-2">
                  {priorityOptions.map(priority => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={filters.priorities.includes(priority)}
                        onCheckedChange={(checked) => handlePriorityToggle(priority, checked as boolean)}
                      />
                      <label
                        htmlFor={`priority-${priority}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {priority}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <h4 className="font-medium mb-3">Тип</h4>
                <div className="space-y-2">
                  {typeOptions.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.types.includes(type)}
                        onCheckedChange={(checked) => handleTypeToggle(type, checked as boolean)}
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignee Filter */}
              {availableAssignees.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Исполнитель</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableAssignees.map(assignee => (
                      <div key={assignee.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`assignee-${assignee.id}`}
                          checked={filters.assigneeIds.includes(assignee.id)}
                          onCheckedChange={(checked) => handleAssigneeToggle(assignee.id, checked as boolean)}
                        />
                        <label
                          htmlFor={`assignee-${assignee.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {assignee.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Label Filter */}
              {availableLabels.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Метки</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableLabels.map(label => (
                      <div key={label} className="flex items-center space-x-2">
                        <Checkbox
                          id={`label-${label}`}
                          checked={filters.labels.includes(label)}
                          onCheckedChange={(checked) => handleLabelToggle(label, checked as boolean)}
                        />
                        <label
                          htmlFor={`label-${label}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Filter */}
              {availableProjects.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Проект</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableProjects.map(project => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`project-${project.id}`}
                          checked={filters.projectIds.includes(project.id)}
                          onCheckedChange={(checked) => handleProjectToggle(project.id, checked as boolean)}
                        />
                        <label
                          htmlFor={`project-${project.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {project.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
