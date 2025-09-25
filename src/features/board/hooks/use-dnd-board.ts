"use client";

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { Issue } from "@/lib/types";

export function useDndBoard(initial: Issue[]) {
  const [items, setItems] = useState<Issue[]>(initial);

  function move(id: string, toStatus: Issue["status"], toIndex: number) {
    setItems((prev) => {
      const src = prev.findIndex((i) => i.id === id);
      if (src === -1) return prev;
      const draft = [...prev];
      const moved = { ...draft[src], status: toStatus };
      draft.splice(src, 1);
      const dstIdx = draft.findIndex((i) => i.status === toStatus && i.order >= toIndex);
      draft.splice(dstIdx === -1 ? draft.length : dstIdx, 0, moved);
      return draft.map((i, idx) => ({ ...i, order: idx }));
    });
  }

  function reorder(status: Issue["status"], from: number, to: number) {
    setItems((prev) => {
      const col = prev.filter((i) => i.status === status);
      const others = prev.filter((i) => i.status !== status);
      const reordered = arrayMove(col, from, to).map((i, idx) => ({ ...i, order: idx }));
      return [...others, ...reordered];
    });
  }

  function updateItems(newItems: Issue[]) {
    setItems(newItems);
  }

  return { items, move, reorder, updateItems, setItems };
}
