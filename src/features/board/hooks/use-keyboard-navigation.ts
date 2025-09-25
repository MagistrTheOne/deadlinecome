import { useEffect, useCallback } from "react";
import { Issue } from "@/lib/types";

interface KeyboardNavigationProps {
  selectedIssue: Issue | null;
  onSelectIssue: (issue: Issue) => void;
  onMoveIssue: (issueId: string, direction: "left" | "right") => void;
  issues: Issue[];
}

export function useKeyboardNavigation({
  selectedIssue,
  onSelectIssue,
  onMoveIssue,
  issues,
}: KeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!selectedIssue) return;

      const { key, ctrlKey, metaKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      switch (key) {
        case "ArrowLeft":
          if (isModifierPressed) {
            event.preventDefault();
            onMoveIssue(selectedIssue.id, "left");
          }
          break;
        case "ArrowRight":
          if (isModifierPressed) {
            event.preventDefault();
            onMoveIssue(selectedIssue.id, "right");
          }
          break;
        case "ArrowUp":
        case "ArrowDown":
          if (isModifierPressed) {
            event.preventDefault();
            const currentIndex = issues.findIndex(issue => issue.id === selectedIssue.id);
            const direction = key === "ArrowUp" ? -1 : 1;
            const nextIssue = issues[currentIndex + direction];
            if (nextIssue) {
              onSelectIssue(nextIssue);
            }
          }
          break;
        case "Enter":
        case " ":
          if (!isModifierPressed) {
            event.preventDefault();
            // Could trigger edit mode or details view
          }
          break;
      }
    },
    [selectedIssue, onSelectIssue, onMoveIssue, issues]
  );

  useEffect(() => {
    if (selectedIssue) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedIssue, handleKeyDown]);
}
