"use client";

import dynamic from "next/dynamic";
import { AIPageSkeleton } from "@/components/ui/loading-skeleton";

// Динамический импорт для code-splitting
const AITeamPageClient = dynamic(() => import("@/components/features/ai/team-page-client"), {
  ssr: false,
  loading: () => <AIPageSkeleton />
});

export default function AITeamPage() {
  return <AITeamPageClient />;
}
