"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Issue } from "@/lib/types";
import { useOptimisticDnd } from "../hooks/use-optimistic-dnd";
import { useKeyboardNavigation } from "../hooks/use-keyboard-navigation";
import { useFilteredIssues } from "../../issues/hooks/use-filtered-issues";
import { IssueFilters } from "../../issues/components/issue-filters";
import { Column } from "./column";
import { IssueCard } from "@/features/issues/components/issue-card";
import { IssueDrawer } from "@/features/issues/components/issue-drawer";
import { CreateIssueDialog } from "@/features/issues/components/create-issue-dialog";
import { issuesApi } from "@/features/issues/api";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";
import { seedMembers } from "@/data/seed";

export function Board({ issues }: { issues: Issue[] }) {
  const filteredIssues = useFilteredIssues(issues);
  const { items, move, reorder, updateItems, isLoading, error } = useOptimisticDnd(filteredIssues);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mock current user permissions
  const currentMember = seedMembers.find(m => m.userId === "demo-user") || seedMembers[0];
  const { hasPermission } = usePermissions(currentMember);

  // Keyboard navigation
  const handleMoveIssue = async (issueId: string, direction: "left" | "right") => {
    const issue = items.find(i => i.id === issueId);
    if (!issue) return;

    const columns: Issue["status"][] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
    const currentIndex = columns.indexOf(issue.status);
    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < columns.length) {
      const newStatus = columns[newIndex];
      await move(issueId, newStatus, 0, async (updatedIssues) => {
        await issuesApi.reorder(issue.projectId, updatedIssues);
      });
      toast.success(`Issue moved to ${newStatus.replace("_", " ")}`);
    }
  };

  useKeyboardNavigation({
    selectedIssue,
    onSelectIssue: setSelectedIssue,
    onMoveIssue: handleMoveIssue,
    issues,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = items.find((item) => item.id === active.id);
    setActiveIssue(issue || null);
  };

  const handleDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeIssue = items.find((item) => item.id === activeId);
    const overIssue = items.find((item) => item.id === overId);

    if (!activeIssue) return;

    // If dropping over another issue, determine the target position
    if (overIssue) {
      const activeIndex = items.findIndex((item) => item.id === activeId);
      const overIndex = items.findIndex((item) => item.id === overId);

      if (activeIssue.status !== overIssue.status) {
        // Move to different column - optimistic update
        await move(activeId as string, overIssue.status, overIndex, async (updatedIssues) => {
          await issuesApi.reorder(activeIssue.projectId, updatedIssues);
        });
      } else {
        // Reorder within the same column - optimistic update
        const columnItems = items.filter(item => item.status === activeIssue.status);
        const activeColumnIndex = columnItems.findIndex(item => item.id === activeId);
        const overColumnIndex = columnItems.findIndex(item => item.id === overId);

        await reorder(activeIssue.status, activeColumnIndex, overColumnIndex, async (updatedIssues) => {
          await issuesApi.reorder(activeIssue.projectId, updatedIssues);
        });
      }
    } else {
      // Dropping over a column
      const overStatus = overId as Issue["status"];
      if (activeIssue.status !== overStatus) {
        await move(activeId as string, overStatus, 0, async (updatedIssues) => {
          await issuesApi.reorder(activeIssue.projectId, updatedIssues);
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null);

    // Error handling is done in the optimistic update hooks
    if (error) {
      toast.error(`Update failed: ${error}`);
    }
  };

  const handleCreateIssue = async (
    issueData: Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "order">
  ) => {
    try {
      const newIssue = await issuesApi.create(issueData);
      updateItems([...items, newIssue]);
      toast.success("Issue created successfully");
    } catch (error) {
      toast.error("Failed to create issue");
    }
  };

  const handleUpdateIssue = async (updates: Partial<Issue>) => {
    if (!selectedIssue) return;

    try {
      const updatedIssue = await issuesApi.update(selectedIssue.id, updates);
      if (updatedIssue) {
        updateItems(items.map(item => item.id === selectedIssue.id ? updatedIssue : item));
        setSelectedIssue(updatedIssue);
        toast.success("Issue updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update issue");
    }
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setDrawerOpen(true);
  };

  const columns: Issue["status"][] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

  // Prepare filter data
  const allLabels = Array.from(new Set(issues.flatMap(issue => issue.labels)));
  const allAssignees = Array.from(new Set(issues.map(issue => issue.assigneeId).filter(Boolean)))
    .map(assigneeId => ({
      id: assigneeId!,
      name: assigneeId === "demo-user" ? "Demo User" : `User ${assigneeId!.slice(-4)}`,
    }));
  const allProjects = Array.from(new Set(issues.map(issue => issue.projectId)))
    .map(projectId => ({
      id: projectId,
      name: `Project ${projectId.slice(-4)}`,
    }));

  return (
    <>
      <IssueFilters
        availableLabels={allLabels}
        availableAssignees={allAssignees}
        availableProjects={allProjects}
      />

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="mb-4 text-sm text-muted-foreground">
        <p>Используйте клавиатурные сокращения:</p>
        <ul className="mt-1 space-y-1">
          <li>• Ctrl+←/→ - перемещение задач между колонками</li>
          <li>• Ctrl+↑/↓ - навигация между задачами</li>
          <li>• Enter/Space - открытие деталей задачи</li>
        </ul>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className={`grid grid-cols-4 gap-6 h-full ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
          role="region"
          aria-label="Kanban board"
        >
          {columns.map((status) => (
            <Column
              key={status}
              title={status}
              items={items.filter((item) => item.status === status)}
              onCreateIssue={handleCreateIssue}
              onIssueClick={handleIssueClick}
              canCreateIssue={hasPermission("create_issue")}
              selectedIssueId={selectedIssue?.id}
              draggedIssueId={activeIssue?.id}
            />
          ))}
        </div>

        <DragOverlay>
          {activeIssue ? (
            <IssueCard issue={activeIssue} className="rotate-3 opacity-90" />
          ) : null}
        </DragOverlay>
      </DndContext>

      <IssueDrawer
        issue={selectedIssue}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={handleUpdateIssue}
      />
    </>
  );
}
