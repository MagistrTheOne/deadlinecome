"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Brain,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw
} from "lucide-react";
import dynamic from "next/dynamic";
import { AIDashboardSkeleton } from "@/components/ui/loading-skeleton";

// Динамический импорт AITeamDashboard для code-splitting
const AITeamDashboard = dynamic(() => import("@/components/ui/ai-team-dashboard"), {
  ssr: false,
  loading: () => <AIDashboardSkeleton />
});

export default function AIAnalyticsPageClient() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Аналитика</h1>
                <p className="text-white/60 text-sm">Анализ работы AI-команды</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Обновить
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AITeamDashboard />
      </div>
    </div>
  );
}
