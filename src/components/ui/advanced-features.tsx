"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Brain, 
  Zap, 
  Shield, 
  GitBranch, 
  Bot, 
  BarChart3, 
  Clock, 
  Users,
  Target,
  MessageSquare,
  FileText,
  Calendar,
  Bell,
  Settings,
  Star,
  TrendingUp,
  Eye,
  Lock,
  Globe,
  Smartphone,
  X
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "ai" | "automation" | "security" | "analytics" | "collaboration" | "mobile";
  status: "available" | "coming_soon" | "beta";
  enabled?: boolean;
}

const advancedFeatures: Feature[] = [
  // AI Features
  {
    id: "ai-task-suggestions",
    title: "AI Предложения задач",
    description: "Искусственный интеллект анализирует ваши проекты и предлагает новые задачи",
    icon: <Brain className="h-5 w-5" />,
    category: "ai",
    status: "available",
    enabled: true
  },
  {
    id: "ai-time-estimation",
    title: "AI Оценка времени",
    description: "Автоматическая оценка времени выполнения задач на основе истории",
    icon: <Clock className="h-5 w-5" />,
    category: "ai",
    status: "available",
    enabled: true
  },
  {
    id: "ai-priority-optimization",
    title: "AI Оптимизация приоритетов",
    description: "Умная расстановка приоритетов задач для максимальной эффективности",
    icon: <Target className="h-5 w-5" />,
    category: "ai",
    status: "available",
    enabled: true
  },

  // Automation
  {
    id: "auto-assign-tasks",
    title: "Автоназначение задач",
    description: "Автоматическое назначение задач на основе загрузки и навыков",
    icon: <Users className="h-5 w-5" />,
    category: "automation",
    status: "available",
    enabled: false
  },
  {
    id: "smart-notifications",
    title: "Умные уведомления",
    description: "Интеллектуальные уведомления только о важных событиях",
    icon: <Bell className="h-5 w-5" />,
    category: "automation",
    status: "available",
    enabled: true
  },
  {
    id: "auto-deadline-adjustment",
    title: "Автокоррекция дедлайнов",
    description: "Автоматическая корректировка сроков при изменении приоритетов",
    icon: <Calendar className="h-5 w-5" />,
    category: "automation",
    status: "beta"
  },

  // Security
  {
    id: "advanced-permissions",
    title: "Расширенные права доступа",
    description: "Детальная настройка прав доступа для каждого участника",
    icon: <Shield className="h-5 w-5" />,
    category: "security",
    status: "available",
    enabled: false
  },
  {
    id: "audit-log",
    title: "Журнал аудита",
    description: "Полная история всех действий в системе",
    icon: <FileText className="h-5 w-5" />,
    category: "security",
    status: "available",
    enabled: true
  },
  {
    id: "sso-integration",
    title: "SSO интеграция",
    description: "Единый вход через корпоративные системы",
    icon: <Lock className="h-5 w-5" />,
    category: "security",
    status: "coming_soon"
  },

  // Analytics
  {
    id: "predictive-analytics",
    title: "Предиктивная аналитика",
    description: "Прогнозирование рисков и задержек в проектах",
    icon: <TrendingUp className="h-5 w-5" />,
    category: "analytics",
    status: "coming_soon"
  },
  {
    id: "team-performance-insights",
    title: "Анализ производительности",
    description: "Детальная аналитика работы команды и индивидуальных показателей",
    icon: <BarChart3 className="h-5 w-5" />,
    category: "analytics",
    status: "beta"
  },
  {
    id: "burndown-predictions",
    title: "Прогноз Burndown",
    description: "Предсказание завершения спринтов на основе текущего темпа",
    icon: <Target className="h-5 w-5" />,
    category: "analytics",
    status: "coming_soon"
  },

  // Collaboration
  {
    id: "real-time-collaboration",
    title: "Реальное время",
    description: "Совместная работа в реальном времени с live-обновлениями",
    icon: <MessageSquare className="h-5 w-5" />,
    category: "collaboration",
    status: "available",
    enabled: true
  },
  {
    id: "video-integration",
    title: "Видео интеграция",
    description: "Встроенные видеозвонки прямо в задачах",
    icon: <Globe className="h-5 w-5" />,
    category: "collaboration",
    status: "coming_soon"
  },
  {
    id: "smart-mentions",
    title: "Умные упоминания",
    description: "Автоматические упоминания экспертов по темам",
    icon: <Users className="h-5 w-5" />,
    category: "collaboration",
    status: "beta"
  },

  // Mobile
  {
    id: "offline-mode",
    title: "Офлайн режим",
    description: "Работа без интернета с синхронизацией при подключении",
    icon: <Smartphone className="h-5 w-5" />,
    category: "mobile",
    status: "coming_soon"
  },
  {
    id: "mobile-optimization",
    title: "Мобильная оптимизация",
    description: "Полнофункциональное мобильное приложение",
    icon: <Smartphone className="h-5 w-5" />,
    category: "mobile",
    status: "beta"
  }
];

export function AdvancedFeatures() {
  const [features, setFeatures] = useState<Feature[]>(advancedFeatures);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const categories = [
    { id: "all", name: "Все", icon: <Star className="h-4 w-4" /> },
    { id: "ai", name: "ИИ", icon: <Brain className="h-4 w-4" /> },
    { id: "automation", name: "Автоматизация", icon: <Zap className="h-4 w-4" /> },
    { id: "security", name: "Безопасность", icon: <Shield className="h-4 w-4" /> },
    { id: "analytics", name: "Аналитика", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "collaboration", name: "Сотрудничество", icon: <Users className="h-4 w-4" /> },
    { id: "mobile", name: "Мобильные", icon: <Smartphone className="h-4 w-4" /> }
  ];

  const filteredFeatures = selectedCategory === "all" 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-black/50 text-white border-white/30";
      case "beta":
        return "bg-black/50 text-white border-white/30";
      case "coming_soon":
        return "bg-black/50 text-white border-white/30";
      default:
        return "bg-black/50 text-white border-white/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Доступно";
      case "beta":
        return "Бета";
      case "coming_soon":
        return "Скоро";
      default:
        return "Неизвестно";
    }
  };

  return (
    <>
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Продвинутые функции DeadLine
        </CardTitle>
        <CardDescription className="text-white/60">
          Инновационные возможности для повышения продуктивности
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={
                selectedCategory === category.id
                  ? "bg-white/10 text-white border-white/20"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }
            >
              {category.icon}
              <span className="ml-2">{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature) => (
            <Card key={feature.id} className="bg-black/30 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-white/80">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-white">
                        {feature.title}
                      </CardTitle>
                      <Badge className={getStatusColor(feature.status)}>
                        {getStatusText(feature.status)}
                      </Badge>
                    </div>
                  </div>
                  {feature.status === "available" && (
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={() => toggleFeature(feature.id)}
                      className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-white/20"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-white/70">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              <p>💡 <strong>Совет:</strong> Включите бета-функции для раннего доступа к новым возможностям</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
            >
              <Eye className="mr-2 h-4 w-4" />
              Предварительный просмотр
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Preview Dialog */}
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Предварительный просмотр функций
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Ознакомьтесь с новыми функциями, которые скоро появятся в DeadLine
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Features Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              ИИ-функции
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Умные предложения задач</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm">
                    ИИ анализирует ваши проекты и автоматически предлагает новые задачи на основе контекста и истории.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Автоматическая оценка времени</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm">
                    ИИ оценивает время выполнения задач на основе предыдущего опыта и сложности.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Automation Features Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Автоматизация
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Автоназначение задач</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm">
                    Система автоматически назначает задачи на основе загрузки команды и экспертизы.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Умные уведомления</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm">
                    Персонализированные уведомления в зависимости от ваших предпочтений и активности.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Security Features Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Безопасность
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Журнал аудита</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm">
                    Полное отслеживание всех действий пользователей для обеспечения безопасности.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">SSO интеграция</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm">
                    Единый вход через корпоративные системы аутентификации.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={() => setIsPreviewOpen(false)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
          >
            <X className="mr-2 h-4 w-4" />
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
