import { useState, useCallback } from "react";
import { Issue } from "@/lib/types";
import { arrayMove } from "@dnd-kit/sortable";

interface OptimisticDndState {
  items: Issue[];
  isLoading: boolean;
  error: string | null;
}

export function useOptimisticDnd(initial: Issue[]) {
  const [state, setState] = useState<OptimisticDndState>({
    items: initial,
    isLoading: false,
    error: null,
  });

  const move = useCallback(async (
    id: string,
    toStatus: Issue["status"],
    toIndex: number,
    updateFn: (issues: Issue[]) => Promise<void>
  ) => {
    const previousItems = state.items;
    const src = previousItems.findIndex((i) => i.id === id);

    if (src === -1) return;

    // Optimistic update
    const draft = [...previousItems];
    const moved = { ...draft[src], status: toStatus };
    draft.splice(src, 1);
    const dstIdx = draft.findIndex((i) => i.status === toStatus && i.order >= toIndex);
    draft.splice(dstIdx === -1 ? draft.length : dstIdx, 0, moved);
    const optimisticItems = draft.map((i, idx) => ({ ...i, order: idx }));

    setState({ items: optimisticItems, isLoading: true, error: null });

    try {
      await updateFn(optimisticItems);
      setState({ items: optimisticItems, isLoading: false, error: null });
    } catch (error) {
      // Rollback on error
      setState({
        items: previousItems,
        isLoading: false,
        error: error instanceof Error ? error.message : "Update failed",
      });
    }
  }, [state.items]);

  const reorder = useCallback(async (
    status: Issue["status"],
    from: number,
    to: number,
    updateFn: (issues: Issue[]) => Promise<void>
  ) => {
    const previousItems = state.items;
    const col = previousItems.filter((i) => i.status === status);
    const others = previousItems.filter((i) => i.status !== status);
    const reordered = arrayMove(col, from, to).map((i, idx) => ({ ...i, order: idx }));
    const optimisticItems = [...others, ...reordered];

    setState({ items: optimisticItems, isLoading: true, error: null });

    try {
      await updateFn(optimisticItems);
      setState({ items: optimisticItems, isLoading: false, error: null });
    } catch (error) {
      // Rollback on error
      setState({
        items: previousItems,
        isLoading: false,
        error: error instanceof Error ? error.message : "Reorder failed",
      });
    }
  }, [state.items]);

  const updateItems = useCallback((newItems: Issue[]) => {
    setState(prev => ({ ...prev, items: newItems, isLoading: false, error: null }));
  }, []);

  return {
    ...state,
    move,
    reorder,
    updateItems,
  };
}
