"use client";

import { useSession } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { ActivityChart } from "@/components/ui/activity-chart";
import { QuickActions } from "@/components/ui/quick-actions";
import { AdvancedFeatures } from "@/components/ui/advanced-features";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { SmartAssignment } from "@/components/ui/smart-assignment";
import { PredictiveAnalytics } from "@/components/ui/predictive-analytics";
import { EnhancedAnalytics } from "@/components/ui/enhanced-analytics";
import { AISmartWorkflows } from "@/components/ui/ai-smart-workflows";
import { RealtimeAnalyticsDashboard } from "@/components/ui/realtime-analytics-dashboard";
import { AdvancedAutomationRules } from "@/components/ui/advanced-automation-rules";
import { RealTimeCollaboration } from "@/components/ui/real-time-collaboration";
import { Plus, Users, FolderOpen, BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Не авторизован</h1>
          <p className="text-gray-400 mb-4">
            Войдите в систему, чтобы получить доступ к панели управления
          </p>
          <Button asChild>
            <Link href="/sign-in">Войти</Link>
          </Button>
        </div>
      </div>
    );
  }

  const user = session.user;

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Добро пожаловать, {user.name}!
        </h1>
        <p className="text-gray-400">
          Вот обзор ваших проектов и активности
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Workspaces Card */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 hover:bg-black/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Рабочие пространства
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-white/60">
              У вас пока нет рабочих пространств
            </p>
            <Button className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30" size="sm" asChild>
              <Link href="/workspaces">
                <Plus className="mr-2 h-4 w-4" />
                Создать
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 hover:bg-black/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Проекты
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-white/60">
              Активных проектов
            </p>
            <Button className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30" size="sm" asChild>
              <Link href="/projects">
                <Plus className="mr-2 h-4 w-4" />
                Создать проект
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 hover:bg-black/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Участники команды
            </CardTitle>
            <Users className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1</div>
            <p className="text-xs text-white/60">
              Вы единственный участник
            </p>
            <Button className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30" size="sm" asChild>
              <Link href="/team">
                <Users className="mr-2 h-4 w-4" />
                Управление командой
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 hover:bg-black/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Мои задачи
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-white/60">
              Задач назначено на вас
            </p>
            <Button className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30" size="sm" asChild>
              <Link href="/tasks">
                <TrendingUp className="mr-2 h-4 w-4" />
                Посмотреть
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed />
        <ActivityChart />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <QuickActions />
      </div>

      {/* Advanced Features */}
      <div className="mt-8">
        <AdvancedFeatures />
      </div>

      {/* AI Smart Workflows */}
      <div className="mt-8">
        <AISmartWorkflows />
      </div>

      {/* Advanced Automation Rules */}
      <div className="mt-8">
        <AdvancedAutomationRules />
      </div>

      {/* Smart Assignment */}
      <div className="mt-8">
        <SmartAssignment />
      </div>

      {/* Real-time Analytics Dashboard */}
      <div className="mt-8">
        <RealtimeAnalyticsDashboard />
      </div>

      {/* Enhanced Analytics */}
      <div className="mt-8">
        <EnhancedAnalytics />
      </div>

      {/* Predictive Analytics */}
      <div className="mt-8">
        <PredictiveAnalytics />
      </div>

      {/* Real-time Collaboration */}
      <div className="mt-8">
        <RealTimeCollaboration />
      </div>

      {/* AI Assistant - Василий */}
      <AIAssistant workspaceId="default" />
    </DashboardLayout>
  );
}
