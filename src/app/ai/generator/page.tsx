import dynamic from "next/dynamic";
import { AIPageSkeleton } from "@/components/ui/loading-skeleton";

// Динамический импорт для code-splitting
const AIGeneratorPageClient = dynamic(() => import("@/components/features/ai/generator-page-client"), {
  ssr: false,
  loading: () => <AIPageSkeleton />
});

export default function AIGeneratorPage() {
  return <AIGeneratorPageClient />;
}
