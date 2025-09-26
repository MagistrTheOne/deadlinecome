"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Palette,
  Layers
} from "lucide-react";
import dynamic from "next/dynamic";
import { AIDashboardSkeleton } from "@/components/ui/loading-skeleton";

// Динамический импорт AIDesignSystem для code-splitting
const AIDesignSystem = dynamic(() => import("@/components/ui/ai-design-system"), {
  ssr: false,
  loading: () => <AIDashboardSkeleton />
});

export default function AIDesignPageClient() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Дизайн-система</h1>
                <p className="text-white/60 text-sm">Создание дизайн-систем и компонентов</p>
              </div>
            </div>

            <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              PRO
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AIDesignSystem />
      </div>
    </div>
  );
}
