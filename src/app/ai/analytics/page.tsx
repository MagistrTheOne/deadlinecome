"use client";

import dynamic from "next/dynamic";
import { AIPageSkeleton } from "@/components/ui/loading-skeleton";

// Динамический импорт для code-splitting
const AIAnalyticsPageClient = dynamic(() => import("@/components/features/ai/analytics-page-client"), {
  ssr: false,
  loading: () => <AIPageSkeleton />
});

export default function AIAnalyticsPage() {
  return <AIAnalyticsPageClient />;
}
