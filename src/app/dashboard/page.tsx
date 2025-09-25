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
import { EnhancedCollaboration } from "@/components/ui/enhanced-collaboration";
import { SmartSprintPlanning } from "@/components/ui/smart-sprint-planning";
import { RealTimeCollaboration } from "@/components/ui/real-time-collaboration";
import { AIStatus } from "@/components/ui/ai-status";
import { DraggableVasilyChat } from "@/components/ui/draggable-vasily-chat";
import { AIWelcomeSystem } from "@/components/ui/ai-welcome-system";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PsychologicalSupportPanel } from "@/components/ui/psychological-support-panel";
import { RoleManagement } from "@/components/ui/role-management";
import { VasilyProjectManager } from "@/components/ui/vasily-project-manager";
import { RealTimeTodo } from "@/components/ui/real-time-todo";
import { WebSocketStats } from "@/components/ui/websocket-stats";
import AITeamDashboard from "@/components/ui/ai-team-dashboard";
import BugTracker from "@/components/ui/bug-tracker";
import AICodeReviewDashboard from "@/components/ui/ai-code-review-dashboard";
import { Plus, Users, FolderOpen, BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <LoadingScreen message="Загружаем ваш dashboard..." />;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Не авторизован</h1>
          <p className="text-white/60 mb-4">
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
        <p className="text-white/70">
          Вот обзор ваших проектов и активности
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Workspaces Card */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200 hover:bg-black/70 hover:shadow-lg hover:shadow-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Рабочие пространства
            </CardTitle>
            <div className="p-2 bg-white/10 rounded-lg">
              <FolderOpen className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <p className="text-xs text-white/70 mb-4">
              У вас пока нет рабочих пространств
            </p>
            <Button variant="glass" size="sm" asChild>
              <Link href="/workspaces">
                <Plus className="mr-2 h-4 w-4" />
                Создать
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200 hover:bg-black/70 hover:shadow-lg hover:shadow-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Проекты
            </CardTitle>
            <div className="p-2 bg-white/10 rounded-lg">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <p className="text-xs text-white/70 mb-4">
              Активных проектов
            </p>
            <Button variant="glass" size="sm" asChild>
              <Link href="/projects">
                <Plus className="mr-2 h-4 w-4" />
                Создать проект
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200 hover:bg-black/70 hover:shadow-lg hover:shadow-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Участники команды
            </CardTitle>
            <div className="p-2 bg-white/10 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">1</div>
            <p className="text-xs text-white/70 mb-4">
              Вы единственный участник
            </p>
            <Button variant="glass" size="sm" asChild>
              <Link href="/team">
                <Users className="mr-2 h-4 w-4" />
                Управление командой
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200 hover:bg-black/70 hover:shadow-lg hover:shadow-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Мои задачи
            </CardTitle>
            <div className="p-2 bg-white/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <p className="text-xs text-white/70 mb-4">
              Задач назначено на вас
            </p>
            <Button variant="glass" size="sm" asChild>
              <Link href="/tasks">
                <TrendingUp className="mr-2 h-4 w-4" />
                Посмотреть
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Status Section */}
      <div className="mb-8">
        <AIStatus />
      </div>

      {/* Role Management */}
      <div className="mb-8">
        <RoleManagement workspaceId="demo-workspace" />
      </div>

      {/* Vasily Project Manager */}
      <div className="mb-8">
        <VasilyProjectManager projectId="demo-project" workspaceId="demo-workspace" />
      </div>

      {/* Real-time TODO */}
      <div className="mb-8">
        <RealTimeTodo projectId="demo-project" workspaceId="demo-workspace" />
      </div>

      {/* WebSocket Stats */}
      <div className="mb-8">
        <WebSocketStats />
      </div>


      {/* Activity Section */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
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

      {/* Enhanced Collaboration */}
      <div className="mt-8">
        <EnhancedCollaboration />
      </div>

      {/* Smart Sprint Planning */}
      <div className="mt-8">
        <SmartSprintPlanning />
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

      {/* Перетаскиваемый чат Василия (GigaChat) */}
      <DraggableVasilyChat />

      {/* AI Welcome System */}
      <AIWelcomeSystem user={session.user} />

      {/* Психологическая поддержка */}
      <div className="mt-8">
        <PsychologicalSupportPanel />
      </div>

      {/* AI Development Team */}
      <div className="mt-8">
        <AITeamDashboard />
      </div>

      {/* Bug Tracker */}
      <div className="mt-8">
        <BugTracker />
      </div>

      {/* AI Code Review Dashboard */}
      <div className="mt-8">
        <AICodeReviewDashboard />
      </div>

    </DashboardLayout>
  );
}
