"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Play,
  Pause,
  Settings
} from "lucide-react";

interface LiveMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  color: string;
  icon: any;
  unit: string;
  lastUpdate: Date;
}

interface TeamActivity {
  id: string;
  user: string;
  action: string;
  project: string;
  timestamp: Date;
  type: "task" | "commit" | "comment" | "status";
}

interface ProjectHealth {
  id: string;
  name: string;
  health: number;
  velocity: number;
  bugs: number;
  completed: number;
  total: number;
  trend: "up" | "down" | "stable";
}

export function RealtimeAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<LiveMetric[]>([]);
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([]);
  const [projectHealth, setProjectHealth] = useState<ProjectHealth[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadInitialData();
    
    if (isLive) {
      startLiveUpdates();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive]);

  const loadInitialData = () => {
    // Mock live metrics
    const mockMetrics: LiveMetric[] = [
      {
        id: "1",
        name: "Активные пользователи",
        value: 24,
        change: 3,
        trend: "up",
        color: "analytics-emerald",
        icon: Users,
        unit: "чел.",
        lastUpdate: new Date()
      },
      {
        id: "2",
        name: "Задач в работе",
        value: 156,
        change: -8,
        trend: "down",
        color: "analytics-cyan",
        icon: Activity,
        unit: "шт.",
        lastUpdate: new Date()
      },
      {
        id: "3",
        name: "Скорость разработки",
        value: 87,
        change: 12,
        trend: "up",
        color: "analytics-violet",
        icon: TrendingUp,
        unit: "%",
        lastUpdate: new Date()
      },
      {
        id: "4",
        name: "Время отклика",
        value: 245,
        change: -15,
        trend: "up",
        color: "analytics-amber",
        icon: Clock,
        unit: "мс",
        lastUpdate: new Date()
      }
    ];

    // Mock team activity
    const mockActivity: TeamActivity[] = [
      {
        id: "1",
        user: "Алексей Петров",
        action: "Создал задачу 'Исправить баг авторизации'",
        project: "DeadLine App",
        timestamp: new Date(Date.now() - 1000 * 30),
        type: "task"
      },
      {
        id: "2",
        user: "Мария Сидорова",
        action: "Закоммитила изменения в API",
        project: "Backend Services",
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        type: "commit"
      },
      {
        id: "3",
        user: "Дмитрий Козлов",
        action: "Добавил комментарий к задаче #123",
        project: "Frontend Components",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: "comment"
      },
      {
        id: "4",
        user: "Анна Волкова",
        action: "Изменила статус задачи на 'Готово'",
        project: "QA Testing",
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
        type: "status"
      }
    ];

    // Mock project health
    const mockProjectHealth: ProjectHealth[] = [
      {
        id: "1",
        name: "DeadLine App",
        health: 92,
        velocity: 78,
        bugs: 3,
        completed: 45,
        total: 67,
        trend: "up"
      },
      {
        id: "2",
        name: "Backend Services",
        health: 87,
        velocity: 82,
        bugs: 1,
        completed: 23,
        total: 34,
        trend: "stable"
      },
      {
        id: "3",
        name: "Mobile App",
        health: 76,
        velocity: 65,
        bugs: 7,
        completed: 12,
        total: 28,
        trend: "down"
      }
    ];

    setMetrics(mockMetrics);
    setTeamActivity(mockActivity);
    setProjectHealth(mockProjectHealth);
  };

  const startLiveUpdates = () => {
    intervalRef.current = setInterval(() => {
      updateMetrics();
      updateActivity();
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds
  };

  const updateMetrics = () => {
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.value + (Math.random() - 0.5) * 10,
      change: (Math.random() - 0.5) * 20,
      trend: Math.random() > 0.5 ? "up" : "down",
      lastUpdate: new Date()
    })));
  };

  const updateActivity = () => {
    const newActivity: TeamActivity = {
      id: Date.now().toString(),
      user: ["Алексей Петров", "Мария Сидорова", "Дмитрий Козлов", "Анна Волкова"][Math.floor(Math.random() * 4)],
      action: [
        "Создал новую задачу",
        "Обновил статус задачи",
        "Добавил комментарий",
        "Закоммитил изменения",
        "Завершил задачу"
      ][Math.floor(Math.random() * 5)],
      project: ["DeadLine App", "Backend Services", "Frontend Components", "QA Testing"][Math.floor(Math.random() * 4)],
      timestamp: new Date(),
      type: ["task", "commit", "comment", "status"][Math.floor(Math.random() * 4)] as any
    };

    setTeamActivity(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-analytics-emerald" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-analytics-rose" />;
      default:
        return <Activity className="h-4 w-4 text-analytics-cyan" />;
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      "analytics-emerald": "bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30",
      "analytics-cyan": "bg-analytics-cyan/20 text-analytics-cyan border-analytics-cyan/30",
      "analytics-violet": "bg-analytics-violet/20 text-analytics-violet border-analytics-violet/30",
      "analytics-amber": "bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30",
    };
    return colorMap[color] || "bg-glass-medium text-white border-white/20";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task":
        return <Activity className="h-4 w-4 text-analytics-emerald" />;
      case "commit":
        return <Zap className="h-4 w-4 text-analytics-cyan" />;
      case "comment":
        return <BarChart3 className="h-4 w-4 text-analytics-violet" />;
      case "status":
        return <Clock className="h-4 w-4 text-analytics-amber" />;
      default:
        return <Activity className="h-4 w-4 text-white" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return "только что";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
    return `${Math.floor(seconds / 3600)} ч назад`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Real-time Analytics Dashboard
          </h2>
          <p className="text-white/70">
            Живые метрики и активность команды в реальном времени
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-analytics-emerald' : 'bg-analytics-rose'}`}></div>
            <span className="text-white/80 text-sm">
              {isConnected ? 'Подключено' : 'Отключено'}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className={`border-white/20 text-white hover:bg-white/10 ${
              isLive ? 'bg-analytics-emerald/10 border-analytics-emerald/30' : ''
            }`}
          >
            {isLive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isLive ? 'Пауза' : 'Запуск'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLastUpdate(new Date())}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card 
            key={metric.id} 
            className="bg-glass-dark backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-105"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${getColorClasses(metric.color)}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm font-medium ${
                    metric.trend === "up" ? "text-analytics-emerald" : 
                    metric.trend === "down" ? "text-analytics-rose" : "text-analytics-cyan"
                  }`}>
                    {metric.change > 0 ? "+" : ""}{metric.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg">{metric.name}</h3>
                <div className="text-3xl font-bold text-white">
                  {metric.value.toFixed(0)}{metric.unit}
                </div>
                <p className="text-white/60 text-xs">
                  Обновлено: {formatTimeAgo(metric.lastUpdate)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Activity Feed */}
      <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-analytics-cyan" />
            Живая активность команды
          </CardTitle>
          <CardDescription className="text-white/60">
            Последние действия участников в реальном времени
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {teamActivity.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg hover:border-white/20 transition-all duration-300"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{activity.user}</span>
                    <Badge className="bg-glass-light text-white/80 border-white/20 text-xs">
                      {activity.project}
                    </Badge>
                  </div>
                  <p className="text-white/70 text-sm">{activity.action}</p>
                  <p className="text-white/60 text-xs mt-1">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Health */}
      <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChart className="h-5 w-5 text-analytics-violet" />
            Здоровье проектов
          </CardTitle>
          <CardDescription className="text-white/60">
            Общее состояние и прогресс по проектам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projectHealth.map((project) => (
              <div 
                key={project.id} 
                className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">{project.name}</h4>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(project.trend)}
                    <span className="text-white/60 text-xs">
                      {project.health}% здоровья
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/80 text-sm">Прогресс</span>
                      <span className="text-white text-sm">
                        {project.completed}/{project.total}
                      </span>
                    </div>
                    <Progress value={(project.completed / project.total) * 100} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-white/60">Скорость:</span>
                      <span className="text-white ml-1">{project.velocity}%</span>
                    </div>
                    <div>
                      <span className="text-white/60">Баги:</span>
                      <span className="text-analytics-rose ml-1">{project.bugs}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <div className="text-center">
        <p className="text-white/60 text-sm">
          Последнее обновление: {lastUpdate.toLocaleTimeString()}
        </p>
        {isLive && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-analytics-emerald rounded-full animate-pulse"></div>
            <span className="text-analytics-emerald text-sm">Live обновления активны</span>
          </div>
        )}
      </div>
    </div>
  );
}
