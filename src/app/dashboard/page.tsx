"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useHotkeys } from "@/lib/hotkeys";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { UserProfile } from "@/components/ui/user-profile";
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
import { Plus, Users, FolderOpen, BarChart3, TrendingUp, Clock, CheckCircle, Brain, Send, Minimize2, X, RefreshCw, FolderKanban, User, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import PremiumDashboardV2 from "@/components/ui/premium-dashboard-v2";

interface ChatMessage {
  id: string;
  from: 'user' | 'vasily';
  message: string;
  timestamp: Date;
  isTyping?: boolean;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      from: 'vasily',
      message: 'Привет! Я Василий, ваш AI-менеджер проектов. Чем могу помочь?',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Инициализируем горячие клавиши
  useHotkeys();

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      from: 'user',
      message: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = chatInput;
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/vasily/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          workspaceId: 'demo-workspace',
          projectId: 'demo-project'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const vasilyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          from: 'vasily',
          message: data.message,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, vasilyMessage]);
      } else {
        const vasilyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          from: 'vasily',
          message: "Извините, произошла ошибка. Попробуйте еще раз.",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, vasilyMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const vasilyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'vasily',
        message: "Извините, произошла ошибка. Попробуйте еще раз.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, vasilyMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setChatInput(suggestion);
  };

  const handleCommandClick = (command: string) => {
    setChatInput(command);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-task':
        // Переход к созданию новой задачи
        window.location.href = '/tasks?action=create';
        break;
      case 'invite-team':
        // Переход к управлению командой
        window.location.href = '/team?action=invite';
        break;
      case 'analytics':
        // Переход к аналитике
        window.location.href = '/analytics';
        break;
      case 'new-workspace':
        // Переход к созданию рабочего пространства
        window.location.href = '/workspaces?action=create';
        break;
      case 'new-project':
        // Переход к созданию проекта
        window.location.href = '/projects?action=create';
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

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

  // Используем стандартный Dashboard Layout с новыми фичами
  return (
    <DashboardLayout>
      <div className="flex h-screen bg-black">
        {/* Основной контент */}
        <div className="flex-1 flex flex-col">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Добро пожаловать, {session.user.name}!
            </h1>
            <p className="text-white/70">
              Вот обзор ваших проектов и активности
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Workspaces Card */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Рабочие пространства
                </CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <FolderOpen className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : (dashboardStats?.stats?.workspaces || 0)}
                </div>
                <p className="text-xs text-white/60 mb-4">
                  {loading ? 'Загрузка...' : 
                   (dashboardStats?.stats?.workspaces || 0) === 0 
                     ? 'У вас пока нет рабочих пространств' 
                     : 'Рабочих пространств'}
                </p>
                <Button 
                  onClick={() => handleQuickAction('new-workspace')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать
                </Button>
              </CardContent>
            </Card>

            {/* Projects Card */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Проекты
                </CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <FolderKanban className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : (dashboardStats?.stats?.projects || 0)}
                </div>
                <p className="text-xs text-white/60 mb-4">
                  {loading ? 'Загрузка...' : 'Активных проектов'}
                </p>
                <Button 
                  onClick={() => handleQuickAction('new-project')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать проект
                </Button>
              </CardContent>
            </Card>

            {/* Team Members Card */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Участники команды
                </CardTitle>
                <div className="p-2 bg-white/10 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">1</div>
                <p className="text-xs text-white/60 mb-4">
                  Вы единственный участник
                </p>
                <Button 
                  onClick={() => handleQuickAction('invite-team')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  Управление командой
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Compact Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Profile & Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Compact User Profile */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Мой профиль
                    </CardTitle>
                    <Badge className="bg-white/10 text-white border-white/20">
                      Обновлено: {new Date().toLocaleTimeString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="https://avatars.githubusercontent.com/u/12345678?v=4" />
                      <AvatarFallback className="bg-white/10 text-white">MT</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">MagistrTheOne</h3>
                      <p className="text-white/60 text-sm">maxonyushko71@gmail.com</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white/80 text-sm">Онлайн • Готов к работе!</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {loading ? '...' : (dashboardStats?.stats?.completedTasks || 0)}
                      </div>
                      <div className="text-xs text-white/60">Задач выполнено</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {loading ? '...' : `${dashboardStats?.stats?.productivity || 0}%`}
                      </div>
                      <div className="text-xs text-white/60">Продуктивность</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {loading ? '...' : (dashboardStats?.stats?.streak || 0)}
                      </div>
                      <div className="text-xs text-white/60">Дней подряд</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {loading ? '...' : (dashboardStats?.stats?.rating || 0)}
                      </div>
                      <div className="text-xs text-white/60">Рейтинг</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Tasks */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white">Текущие задачи</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-white/60 text-center">Загрузка задач...</div>
                    ) : dashboardStats?.currentTasks?.length > 0 ? (
                      dashboardStats.currentTasks.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{task.title}</p>
                            <p className="text-white/60 text-sm">
                              {task.priority} • {task.status}
                            </p>
                          </div>
                          <Badge className={`${
                            task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border-green-500/30'
                          }`}>
                            {task.priority}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/60 text-center">Нет текущих задач</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - AI Chat & Quick Actions */}
            <div className="space-y-6">
              {/* AI Chat */}
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Василий AI
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <div className="h-32 overflow-y-auto space-y-2">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-2 rounded-lg text-xs ${
                              message.from === 'user'
                                ? 'bg-white/10 text-white'
                                : 'bg-white/5 text-white/90'
                            }`}
                          >
                            {message.message}
                            <div className="text-white/50 text-xs mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white/5 p-2 rounded-lg text-xs text-white/60">
                            Василий печатает...
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-white/60 text-xs">Возможности:</p>
                      <ul className="text-white/60 text-xs space-y-1">
                        <li>• Помочь с проектами</li>
                        <li>• Ответить на вопросы</li>
                        <li>• Дать совет по задачам</li>
                        <li>• Просто поболтать!</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="text-white/60 text-xs">Команды:</p>
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommandClick('/joke')}
                          className="bg-white/10 text-white border-white/20 text-xs hover:bg-white/20"
                        >
                          /joke
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommandClick('/mood')}
                          className="bg-white/10 text-white border-white/20 text-xs hover:bg-white/20"
                        >
                          /mood
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommandClick('/help')}
                          className="bg-white/10 text-white border-white/20 text-xs hover:bg-white/20"
                        >
                          /help
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-white/60 text-xs">Предложения:</p>
                      <div className="space-y-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSuggestionClick('Расскажи о проектах')}
                          className="w-full justify-start text-white/60 hover:text-white text-xs"
                        >
                          Расскажи о проектах
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSuggestionClick('Покажи статистику')}
                          className="w-full justify-start text-white/60 hover:text-white text-xs"
                        >
                          Покажи статистику
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSuggestionClick('Помоги с задачами')}
                          className="w-full justify-start text-white/60 hover:text-white text-xs"
                        >
                          Помоги с задачами
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-white/40">
                      Последнее сообщение: {new Date().toLocaleTimeString()}
                    </div>

                    <div className="flex gap-2">
                      <Input 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Напиши Василию..." 
                        className="flex-1 bg-white/5 border-white/20 text-white placeholder-white/40"
                        disabled={isTyping}
                      />
                      <Button 
                        size="sm" 
                        onClick={sendMessage}
                        disabled={!chatInput.trim() || isTyping}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white">Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={() => handleQuickAction('new-task')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Новая задача
                  </Button>
                  <Button 
                    onClick={() => handleQuickAction('invite-team')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Пригласить команду
                  </Button>
                  <Button 
                    onClick={() => handleQuickAction('analytics')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Аналитика
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
