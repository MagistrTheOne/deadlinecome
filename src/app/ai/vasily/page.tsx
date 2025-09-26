"use client";

import dynamic from "next/dynamic";
import { AIPageSkeleton } from "@/components/ui/loading-skeleton";

// Динамический импорт для code-splitting
const VasilyPageClient = dynamic(() => import("@/components/features/ai/vasily-page-client"), {
  ssr: false,
  loading: () => <AIPageSkeleton />
});

export default function VasilyPage() {
  return <VasilyPageClient />;
}
