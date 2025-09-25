"use client";

import { useSession } from "@/lib/auth-client";
import { ResponsiveDashboardLayout } from "@/components/layout/responsive-dashboard-layout";
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
import { Plus, Users, FolderOpen, BarChart3, TrendingUp, Clock, CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ResponsiveDashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Не авторизован</h1>
          <p className="text-white/60 mb-4">
            Войдите в систему, чтобы получить доступ к панели управления
          </p>
          <Button asChild className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20">
            <Link href="/sign-in">Войти</Link>
          </Button>
        </div>
      </div>
    );
  }

  const user = session.user;

  return (
    <ResponsiveDashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Добро пожаловать, {user.name}!
          </h1>
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </div>
        <p className="text-white/70 text-sm sm:text-base">
          Вот обзор ваших проектов и активности
        </p>
      </div>

      {/* Stats Cards - Адаптивная сетка */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-6 sm:mb-8">
        {/* Workspaces Card */}
        <Card className="bg-black/40 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-black/60 hover:shadow-2xl hover:shadow-white/10 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Рабочие пространства
            </CardTitle>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors backdrop-blur-sm">
              <FolderOpen className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <p className="text-xs text-white/70 mb-4">
              У вас пока нет рабочих пространств
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white"
            >
              <Link href="/workspaces">
                <Plus className="mr-2 h-4 w-4" />
                Создать
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card className="bg-black/40 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-black/60 hover:shadow-2xl hover:shadow-white/10 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Проекты
            </CardTitle>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors backdrop-blur-sm">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <p className="text-xs text-white/70 mb-4">
              Активных проектов
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white"
            >
              <Link href="/projects">
                <Plus className="mr-2 h-4 w-4" />
                Создать проект
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card className="bg-black/40 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-black/60 hover:shadow-2xl hover:shadow-white/10 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Участники команды
            </CardTitle>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors backdrop-blur-sm">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">1</div>
            <p className="text-xs text-white/70 mb-4">
              Вы единственный участник
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white"
            >
              <Link href="/team">
                <Users className="mr-2 h-4 w-4" />
                Управление командой
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="bg-black/40 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-black/60 hover:shadow-2xl hover:shadow-white/10 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Мои задачи
            </CardTitle>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <p className="text-xs text-white/70 mb-4">
              Задач назначено на вас
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white"
            >
              <Link href="/tasks">
                <TrendingUp className="mr-2 h-4 w-4" />
                Посмотреть
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Status Section */}
      <div className="mb-6 sm:mb-8">
        <AIStatus />
      </div>

      {/* Activity Section - Адаптивная сетка */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
        <ActivityFeed />
        <ActivityChart />
      </div>

      {/* Quick Actions */}
      <div className="mt-6 sm:mt-8">
        <QuickActions />
      </div>

      {/* Advanced Features */}
      <div className="mt-6 sm:mt-8">
        <AdvancedFeatures />
      </div>

      {/* AI Smart Workflows */}
      <div className="mt-6 sm:mt-8">
        <AISmartWorkflows />
      </div>

      {/* Advanced Automation Rules */}
      <div className="mt-6 sm:mt-8">
        <AdvancedAutomationRules />
      </div>

      {/* Enhanced Collaboration */}
      <div className="mt-6 sm:mt-8">
        <EnhancedCollaboration />
      </div>

      {/* Smart Sprint Planning */}
      <div className="mt-6 sm:mt-8">
        <SmartSprintPlanning />
      </div>

      {/* Smart Assignment */}
      <div className="mt-6 sm:mt-8">
        <SmartAssignment />
      </div>

      {/* Real-time Analytics Dashboard */}
      <div className="mt-6 sm:mt-8">
        <RealtimeAnalyticsDashboard />
      </div>

      {/* Enhanced Analytics */}
      <div className="mt-6 sm:mt-8">
        <EnhancedAnalytics />
      </div>

      {/* Predictive Analytics */}
      <div className="mt-6 sm:mt-8">
        <PredictiveAnalytics />
      </div>

      {/* Real-time Collaboration */}
      <div className="mt-6 sm:mt-8">
        <RealTimeCollaboration />
      </div>

      {/* AI Assistant - Василий */}
      <AIAssistant workspaceId="default" />

      {/* Перетаскиваемый чат Василия */}
      <DraggableVasilyChat />
    </ResponsiveDashboardLayout>
  );
}
