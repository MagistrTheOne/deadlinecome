"use client";

import dynamic from "next/dynamic";
import { AIPageSkeleton } from "@/components/ui/loading-skeleton";

// Динамический импорт для code-splitting
const AIDesignPageClient = dynamic(() => import("@/components/features/ai/design-page-client"), {
  ssr: false,
  loading: () => <AIPageSkeleton />
});

export default function AIDesignPage() {
  return <AIDesignPageClient />;
}
