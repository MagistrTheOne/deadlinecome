"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Brain, 
  Eye, 
  Palette, 
  Trophy, 
  Users, 
  Code, 
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  ChevronDown,
  Star,
  TrendingUp,
  Activity,
  Target,
  Shield,
  Sparkles
} from "lucide-react";

// Импорты всех компонентов
import { UserProfile } from "@/components/ui/user-profile";
import { RoleManagement } from "@/components/ui/role-management";
import { VasilyProjectManager } from "@/components/ui/vasily-project-manager";
import { RealTimeTodo } from "@/components/ui/real-time-todo";
import BugTracker from "@/components/ui/bug-tracker";
import AICodeReviewDashboard from "@/components/ui/ai-code-review-dashboard";
import AILearningDashboard from "@/components/ui/ai-learning-dashboard";
import AIMarketplaceDashboard from "@/components/ui/ai-marketplace-dashboard";
import IndustryTemplatesDashboard from "@/components/ui/industry-templates-dashboard";
import GlobalTeamsDashboard from "@/components/ui/global-teams-dashboard";
import AICommandCenter from "@/components/ui/ai-command-center";
import AITaskManager from "@/components/ui/ai-task-manager";
import AIPersonalityCustomizer from "@/components/ui/ai-personality-customizer";
import GamificationDashboard from "@/components/ui/gamification-dashboard";
import AICodeGenerator from "@/components/ui/ai-code-generator";
import AIProjectPredictor from "@/components/ui/ai-project-predictor";
import AIDesignSystem from "@/components/ui/ai-design-system";
import { CompactChat } from "@/components/ui/compact-chat";
import { EnhancedNavigation } from "@/components/ui/enhanced-navigation";

interface DashboardSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  category: 'core' | 'ai' | 'premium' | 'analytics';
  description: string;
  isNew?: boolean;
  isPro?: boolean;
}

export default function PremiumDashboardV2() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);

  const dashboardSections: DashboardSection[] = [
    {
      id: "overview",
      title: "Обзор",
      icon: <BarChart3 className="h-5 w-5" />,
      component: <OverviewSection />,
      category: 'core',
      description: "Общая статистика и ключевые метрики"
    },
    {
      id: "user-profile",
      title: "Профиль пользователя",
      icon: <Users className="h-5 w-5" />,
      component: <UserProfile />,
      category: 'core',
      description: "Управление профилем и настройками"
    },
    {
      id: "role-management",
      title: "Управление ролями",
      icon: <Shield className="h-5 w-5" />,
      component: <RoleManagement workspaceId="demo-workspace" projectId="demo-project" />,
      category: 'core',
      description: "Настройка ролей и разрешений"
    },
    {
      id: "vasily-manager",
      title: "Василий - AI Менеджер",
      icon: <Brain className="h-5 w-5" />,
      component: <VasilyProjectManager projectId="demo-project" workspaceId="demo-workspace" />,
      category: 'ai',
      description: "AI-ассистент для управления проектами"
    },
    {
      id: "real-time-todo",
      title: "Real-time задачи",
      icon: <Activity className="h-5 w-5" />,
      component: <RealTimeTodo projectId="demo-project" workspaceId="demo-workspace" />,
      category: 'core',
      description: "Живые обновления задач"
    },
    {
      id: "bug-tracker",
      title: "Трекер багов",
      icon: <Target className="h-5 w-5" />,
      component: <BugTracker />,
      category: 'core',
      description: "Отслеживание и управление багами"
    },
    {
      id: "ai-code-review",
      title: "AI Code Review",
      icon: <Code className="h-5 w-5" />,
      component: <AICodeReviewDashboard />,
      category: 'ai',
      description: "Автоматический анализ кода"
    },
    {
      id: "ai-learning",
      title: "AI Обучение",
      icon: <Brain className="h-5 w-5" />,
      component: <AILearningDashboard />,
      category: 'ai',
      description: "Система обучения AI"
    },
    {
      id: "ai-marketplace",
      title: "AI Маркетплейс",
      icon: <Sparkles className="h-5 w-5" />,
      component: <AIMarketplaceDashboard />,
      category: 'ai',
      description: "Магазин AI-специалистов",
      isPro: true
    },
    {
      id: "industry-templates",
      title: "Отраслевые шаблоны",
      icon: <Palette className="h-5 w-5" />,
      component: <IndustryTemplatesDashboard />,
      category: 'premium',
      description: "Готовые решения для отраслей",
      isPro: true
    },
    {
      id: "global-teams",
      title: "Глобальные команды",
      icon: <Users className="h-5 w-5" />,
      component: <GlobalTeamsDashboard />,
      category: 'premium',
      description: "Мультиязычная поддержка",
      isPro: true
    },
    {
      id: "ai-command-center",
      title: "AI Командный центр",
      icon: <Brain className="h-5 w-5" />,
      component: <AICommandCenter />,
      category: 'ai',
      description: "Управление AI-командой"
    },
    {
      id: "ai-task-manager",
      title: "AI Менеджер задач",
      icon: <Target className="h-5 w-5" />,
      component: <AITaskManager />,
      category: 'ai',
      description: "Автоматическое управление задачами"
    },
    {
      id: "ai-personality",
      title: "Настройка AI",
      icon: <Settings className="h-5 w-5" />,
      component: <AIPersonalityCustomizer />,
      category: 'ai',
      description: "Кастомизация AI-персонажей"
    },
    {
      id: "gamification",
      title: "Геймификация",
      icon: <Trophy className="h-5 w-5" />,
      component: <GamificationDashboard />,
      category: 'premium',
      description: "Система достижений и мотивации",
      isNew: true
    },
    {
      id: "ai-code-generator",
      title: "AI Генератор кода",
      icon: <Code className="h-5 w-5" />,
      component: <AICodeGenerator />,
      category: 'premium',
      description: "Генерация кода с помощью ИИ",
      isNew: true
    },
    {
      id: "ai-project-predictor",
      title: "AI Предсказатель",
      icon: <Eye className="h-5 w-5" />,
      component: <AIProjectPredictor />,
      category: 'premium',
      description: "Предсказание успеха проектов",
      isNew: true
    },
    {
      id: "ai-design-system",
      title: "AI Дизайн-система",
      icon: <Palette className="h-5 w-5" />,
      component: <AIDesignSystem />,
      category: 'premium',
      description: "Автоматическая генерация дизайна",
      isNew: true
    }
  ];

  const filteredSections = dashboardSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-white/10 text-white border-white/20';
      case 'ai': return 'bg-white/10 text-white border-white/20';
      case 'premium': return 'bg-white/10 text-white border-white/20';
      case 'analytics': return 'bg-white/10 text-white border-white/20';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DeadLine</h1>
                <p className="text-xs text-white/60">V2.0 Premium</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Поиск по функциям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-black/90 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Навигация</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full justify-start text-left h-auto p-4 ${
                    activeSection === section.id
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{section.title}</span>
                        {section.isNew && (
                          <Badge className="bg-white/10 text-white border-white/20 text-xs">
                            NEW
                          </Badge>
                        )}
                        {section.isPro && (
                          <Badge className="bg-white/10 text-white border-white/20 text-xs">
                            PRO
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-1 truncate">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">Premium Features</span>
                </div>
                <p className="text-xs text-white/60 mb-3">
                  Разблокируйте все возможности DeadLine V2.0
                </p>
                <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {dashboardSections.find(s => s.id === activeSection)?.title}
                  </h2>
                  <p className="text-white/60">
                    {dashboardSections.find(s => s.id === activeSection)?.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(dashboardSections.find(s => s.id === activeSection)?.category || 'core')}>
                    {dashboardSections.find(s => s.id === activeSection)?.category?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Section Content */}
            <div className="bg-black/50 backdrop-blur-xl rounded-xl border border-white/20 p-6 shadow-2xl">
              {dashboardSections.find(s => s.id === activeSection)?.component}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Navigation */}
      <EnhancedNavigation
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        onChatToggle={() => setChatOpen(!chatOpen)}
        onChatMinimize={() => setChatMinimized(!chatMinimized)}
      />

      {/* Compact Chat */}
      <CompactChat
        isOpen={chatOpen && !chatMinimized}
        onToggle={() => setChatOpen(!chatOpen)}
        onMinimize={() => setChatMinimized(true)}
      />
    </div>
  );
}

// Компонент обзора
function OverviewSection() {
  const [stats, setStats] = useState({
    totalProjects: 12,
    activeTasks: 47,
    teamMembers: 8,
    aiAssistants: 5,
    productivity: 87,
    satisfaction: 92
  });

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Проекты</p>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Активные задачи</p>
                <p className="text-2xl font-bold text-white">{stats.activeTasks}</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Продуктивность</p>
                <p className="text-2xl font-bold text-white">{stats.productivity}%</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-white" />
            Последняя активность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Завершена задача", project: "DeadLine V2.0", time: "2 мин назад" },
              { action: "Добавлен новый AI-ассистент", project: "AI Team", time: "15 мин назад" },
              { action: "Обновлен профиль", project: "User Settings", time: "1 час назад" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">{item.action}</p>
                  <p className="text-white/60 text-sm">{item.project}</p>
                </div>
                <span className="text-white/40 text-sm">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
