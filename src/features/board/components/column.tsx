"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Issue } from "@/lib/types";
import { StatusColors } from "@/lib/types";
import { IssueCard } from "@/features/issues/components/issue-card";
import { CreateIssueDialog } from "@/features/issues/components/create-issue-dialog";

interface ColumnProps {
  title: Issue["status"];
  items: Issue[];
  onCreateIssue: (issueData: Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "order">) => void;
  onIssueClick: (issue: Issue) => void;
}

export function Column({ title, items, onCreateIssue, onIssueClick }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: title,
  });

  return (
    <div className={`flex flex-col h-full min-w-[300px] ${StatusColors[title]} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide">
          {title.replace("_", " ")} ({items.length})
        </h3>
        <CreateIssueDialog
          projectId="demo-project-1"
          onCreate={onCreateIssue}
          trigger={
            <button className="text-muted-foreground hover:text-foreground text-sm">
              + Add
            </button>
          }
        />
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 overflow-y-auto"
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onIssueClick(issue)}
              className="bg-card"
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
