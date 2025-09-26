"use client";

import { BoardManager } from '@/components/ui/board-manager';

export default function BoardsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <BoardManager />
      </div>
    </div>
  );
}