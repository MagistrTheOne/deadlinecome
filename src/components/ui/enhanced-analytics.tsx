"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  Brain,
  BarChart3,
  Calendar,
  Users,
  Zap,
  Activity,
  PieChart,
  LineChart
} from "lucide-react";

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  color: string;
  icon: any;
  description: string;
}

interface TeamPerformance {
  velocity: number;
  accuracy: number;
  satisfaction: number;
  productivity: number;
  trends: {
    velocity: "up" | "down" | "stable";
    accuracy: "up" | "down" | "stable";
    satisfaction: "up" | "down" | "stable";
    productivity: "up" | "down" | "stable";
  };
}

export function EnhancedAnalytics() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    loadTeamPerformance();
  }, []);

  const loadMetrics = () => {
    const mockMetrics: MetricCard[] = [
      {
        id: "1",
        title: "Скорость разработки",
        value: "+24%",
        change: 24,
        trend: "up",
        color: "analytics-emerald",
        icon: TrendingUp,
        description: "За последний месяц"
      },
      {
        id: "2",
        title: "Точность оценок",
        value: "87%",
        change: 5,
        trend: "up",
        color: "analytics-cyan",
        icon: Target,
        description: "Соответствие планам"
      },
      {
        id: "3",
        title: "Соблюдение дедлайнов",
        value: "92%",
        change: -2,
        trend: "down",
        color: "analytics-violet",
        icon: Calendar,
        description: "Вовремя выполнено"
      },
      {
        id: "4",
        title: "Удовлетворенность команды",
        value: "8.4",
        change: 0.3,
        trend: "up",
        color: "analytics-amber",
        icon: Users,
        description: "Из 10 баллов"
      },
      {
        id: "5",
        title: "AI-автоматизация",
        value: "156",
        change: 12,
        trend: "up",
        color: "analytics-rose",
        icon: Brain,
        description: "Задач автоматизировано"
      },
      {
        id: "6",
        title: "Активность команды",
        value: "94%",
        change: 3,
        trend: "up",
        color: "analytics-indigo",
        icon: Activity,
        description: "Ежедневная активность"
      }
    ];
    
    setMetrics(mockMetrics);
  };

  const loadTeamPerformance = () => {
    const mockPerformance: TeamPerformance = {
      velocity: 78,
      accuracy: 87,
      satisfaction: 84,
      productivity: 92,
      trends: {
        velocity: "up",
        accuracy: "up", 
        satisfaction: "up",
        productivity: "stable"
      }
    };
    
    setTeamPerformance(mockPerformance);
    setIsLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-analytics-emerald" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-analytics-rose" />;
      default:
        return <Target className="h-4 w-4 text-analytics-cyan" />;
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      "analytics-emerald": "bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30",
      "analytics-cyan": "bg-analytics-cyan/20 text-analytics-cyan border-analytics-cyan/30",
      "analytics-violet": "bg-analytics-violet/20 text-analytics-violet border-analytics-violet/30",
      "analytics-amber": "bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30",
      "analytics-rose": "bg-analytics-rose/20 text-analytics-rose border-analytics-rose/30",
      "analytics-indigo": "bg-analytics-indigo/20 text-analytics-indigo border-analytics-indigo/30",
    };
    return colorMap[color] || "bg-glass-medium text-white border-white/20";
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return "bg-analytics-emerald";
    if (value >= 70) return "bg-analytics-cyan";
    if (value >= 50) return "bg-analytics-amber";
    return "bg-analytics-rose";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-glass-dark backdrop-blur-sm border-white/10 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {metric.change > 0 ? "+" : ""}{metric.change}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg">{metric.title}</h3>
                <div className="text-3xl font-bold text-white">{metric.value}</div>
                <p className="text-white/60 text-sm">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Performance Overview */}
      {teamPerformance && (
        <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-analytics-cyan" />
              Производительность команды
            </CardTitle>
            <CardDescription className="text-white/60">
              Ключевые показатели эффективности и тренды развития
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">Скорость (Velocity)</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-semibold">{teamPerformance.velocity}%</span>
                    {getTrendIcon(teamPerformance.trends.velocity)}
                  </div>
                </div>
                <Progress 
                  value={teamPerformance.velocity} 
                  className="h-2"
                />
                <div className={`h-2 rounded-full ${getProgressColor(teamPerformance.velocity)}`}></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">Точность оценок</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-semibold">{teamPerformance.accuracy}%</span>
                    {getTrendIcon(teamPerformance.trends.accuracy)}
                  </div>
                </div>
                <Progress 
                  value={teamPerformance.accuracy} 
                  className="h-2"
                />
                <div className={`h-2 rounded-full ${getProgressColor(teamPerformance.accuracy)}`}></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">Удовлетворенность</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-semibold">{teamPerformance.satisfaction}%</span>
                    {getTrendIcon(teamPerformance.trends.satisfaction)}
                  </div>
                </div>
                <Progress 
                  value={teamPerformance.satisfaction} 
                  className="h-2"
                />
                <div className={`h-2 rounded-full ${getProgressColor(teamPerformance.satisfaction)}`}></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">Продуктивность</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-semibold">{teamPerformance.productivity}%</span>
                    {getTrendIcon(teamPerformance.trends.productivity)}
                  </div>
                </div>
                <Progress 
                  value={teamPerformance.productivity} 
                  className="h-2"
                />
                <div className={`h-2 rounded-full ${getProgressColor(teamPerformance.productivity)}`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-analytics-amber" />
            Быстрые действия
          </CardTitle>
          <CardDescription className="text-white/60">
            Часто используемые функции аналитики
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="border-analytics-emerald/30 text-analytics-emerald hover:bg-analytics-emerald/10 hover:border-analytics-emerald/50"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Детальный отчет
            </Button>
            <Button 
              variant="outline" 
              className="border-analytics-cyan/30 text-analytics-cyan hover:bg-analytics-cyan/10 hover:border-analytics-cyan/50"
            >
              <LineChart className="h-4 w-4 mr-2" />
              Тренды
            </Button>
            <Button 
              variant="outline" 
              className="border-analytics-violet/30 text-analytics-violet hover:bg-analytics-violet/10 hover:border-analytics-violet/50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Экспорт данных
            </Button>
            <Button 
              variant="outline" 
              className="border-analytics-rose/30 text-analytics-rose hover:bg-analytics-rose/10 hover:border-analytics-rose/50"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI-анализ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
