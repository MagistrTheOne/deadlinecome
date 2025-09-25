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
import { useDndBoard } from "../hooks/use-dnd-board";
import { Column } from "./column";
import { IssueCard } from "@/features/issues/components/issue-card";
import { IssueDrawer } from "@/features/issues/components/issue-drawer";
import { CreateIssueDialog } from "@/features/issues/components/create-issue-dialog";
import { issuesApi } from "@/features/issues/api";
import { toast } from "sonner";

export function Board({ issues }: { issues: Issue[] }) {
  const { items, move, reorder, updateItems } = useDndBoard(issues);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const handleDragOver = (event: DragOverEvent) => {
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
        // Move to different column
        const newItems = arrayMove(items, activeIndex, overIndex);
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          status: index <= overIndex && index > activeIndex ? overIssue.status : item.status,
          order: index,
        }));
        updateItems(updatedItems);
      } else {
        // Reorder within the same column
        reorder(activeIssue.status, activeIndex, overIndex);
      }
    } else {
      // Dropping over a column
      const overStatus = overId as Issue["status"];
      if (activeIssue.status !== overStatus) {
        move(activeId as string, overStatus, 0);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveIssue(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) {
      setActiveIssue(null);
      return;
    }

    const activeIssue = items.find((item) => item.id === activeId);
    if (!activeIssue) {
      setActiveIssue(null);
      return;
    }

    // Save changes to server
    try {
      issuesApi.reorder(activeIssue.projectId, items);
      toast.success("Board updated successfully");
    } catch (error) {
      toast.error("Failed to update board");
    }

    setActiveIssue(null);
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

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-6 h-full">
          {columns.map((status) => (
            <Column
              key={status}
              title={status}
              items={items.filter((item) => item.status === status)}
              onCreateIssue={handleCreateIssue}
              onIssueClick={handleIssueClick}
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
