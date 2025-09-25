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
  Users
} from "lucide-react";

interface Prediction {
  id: string;
  type: "deadline_risk" | "team_burnout" | "budget_overrun" | "quality_issue";
  title: string;
  description: string;
  probability: number;
  impact: "low" | "medium" | "high" | "critical";
  timeframe: string;
  recommendations: string[];
}

interface TeamHealth {
  overall: number;
  workload: number;
  satisfaction: number;
  productivity: number;
  trends: {
    workload: "increasing" | "stable" | "decreasing";
    satisfaction: "increasing" | "stable" | "decreasing";
    productivity: "increasing" | "stable" | "decreasing";
  };
}

export function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [teamHealth, setTeamHealth] = useState<TeamHealth | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Загружаем данные при монтировании
    loadPredictions();
    loadTeamHealth();
  }, []);

  const loadPredictions = async () => {
    // Симуляция загрузки данных
    const mockPredictions: Prediction[] = [
      {
        id: "1",
        type: "deadline_risk",
        title: "Риск срыва дедлайна проекта 'DeadLine App'",
        description: "На основе текущей скорости разработки и оставшихся задач, вероятность срыва дедлайна составляет 75%",
        probability: 75,
        impact: "high",
        timeframe: "2 недели",
        recommendations: [
          "Добавить дополнительного разработчика",
          "Приоритизировать критические функции",
          "Рассмотреть возможность переноса дедлайна"
        ]
      },
      {
        id: "2",
        type: "team_burnout",
        title: "Риск выгорания команды",
        description: "Высокая загрузка команды в течение последних 3 недель может привести к снижению продуктивности",
        probability: 60,
        impact: "medium",
        timeframe: "1 месяц",
        recommendations: [
          "Снизить интенсивность работы",
          "Добавить дни отдыха",
          "Провести ретроспективу команды"
        ]
      },
      {
        id: "3",
        type: "quality_issue",
        title: "Потенциальные проблемы с качеством",
        description: "Увеличение количества багов в последних релизах указывает на возможные проблемы с тестированием",
        probability: 45,
        impact: "medium",
        timeframe: "3 недели",
        recommendations: [
          "Усилить процесс тестирования",
          "Добавить автоматизированные тесты",
          "Провести код-ревью"
        ]
      }
    ];
    
    setPredictions(mockPredictions);
  };

  const loadTeamHealth = async () => {
    const mockTeamHealth: TeamHealth = {
      overall: 78,
      workload: 85,
      satisfaction: 72,
      productivity: 88,
      trends: {
        workload: "increasing",
        satisfaction: "decreasing", 
        productivity: "stable"
      }
    };
    
    setTeamHealth(mockTeamHealth);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "bg-analytics-rose/20 text-analytics-rose border-analytics-rose/30 backdrop-blur-sm";
      case "high":
        return "bg-analytics-orange/20 text-analytics-orange border-analytics-orange/30 backdrop-blur-sm";
      case "medium":
        return "bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30 backdrop-blur-sm";
      case "low":
        return "bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30 backdrop-blur-sm";
      default:
        return "bg-glass-medium text-white border-white/20 backdrop-blur-sm";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-analytics-emerald" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-analytics-rose" />;
      default:
        return <Target className="h-4 w-4 text-analytics-cyan" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-analytics-rose";
    if (probability >= 40) return "text-analytics-amber";
    return "text-analytics-emerald";
  };

  return (
    <div className="space-y-6">
      {/* Team Health Overview */}
      {teamHealth && (
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Здоровье команды
            </CardTitle>
            <CardDescription className="text-white/60">
              Общий показатель здоровья команды и тренды
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Общее здоровье</span>
                  <span className="text-white font-medium">{teamHealth.overall}%</span>
                </div>
                <Progress value={teamHealth.overall} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Загрузка</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">{teamHealth.workload}%</span>
                    {getTrendIcon(teamHealth.trends.workload)}
                  </div>
                </div>
                <Progress value={teamHealth.workload} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Удовлетворенность</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">{teamHealth.satisfaction}%</span>
                    {getTrendIcon(teamHealth.trends.satisfaction)}
                  </div>
                </div>
                <Progress value={teamHealth.satisfaction} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Продуктивность</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">{teamHealth.productivity}%</span>
                    {getTrendIcon(teamHealth.trends.productivity)}
                  </div>
                </div>
                <Progress value={teamHealth.productivity} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Predictions */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Предиктивная аналитика
          </CardTitle>
          <CardDescription className="text-white/60">
            AI предсказывает потенциальные проблемы и риски на основе исторических данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{prediction.title}</h4>
                    <p className="text-white/70 text-sm mb-2">{prediction.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getImpactColor(prediction.impact)}>
                        {prediction.impact === "critical" ? "Критический" :
                         prediction.impact === "high" ? "Высокий" :
                         prediction.impact === "medium" ? "Средний" : "Низкий"} риск
                      </Badge>
                      <Badge className="bg-black/50 text-white border-white/30">
                        <Clock className="mr-1 h-3 w-3" />
                        {prediction.timeframe}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getProbabilityColor(prediction.probability)}`}>
                      {prediction.probability}%
                    </div>
                    <div className="text-white/60 text-xs">вероятность</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="text-white font-medium text-sm">Рекомендации:</h5>
                  <ul className="space-y-1">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Тренды производительности
          </CardTitle>
          <CardDescription className="text-white/60">
            Анализ трендов и прогнозы на основе исторических данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-glass-dark backdrop-blur-sm border border-analytics-emerald/20 rounded-lg p-4 hover:border-analytics-emerald/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-analytics-emerald" />
                <span className="text-white font-medium">Скорость разработки</span>
              </div>
              <div className="text-2xl font-bold text-analytics-emerald mb-1">+12%</div>
              <div className="text-white/60 text-sm">за последний месяц</div>
            </div>
            
            <div className="bg-glass-dark backdrop-blur-sm border border-analytics-cyan/20 rounded-lg p-4 hover:border-analytics-cyan/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-analytics-cyan" />
                <span className="text-white font-medium">Точность оценок</span>
              </div>
              <div className="text-2xl font-bold text-analytics-cyan mb-1">87%</div>
              <div className="text-white/60 text-sm">соответствие планам</div>
            </div>
            
            <div className="bg-glass-dark backdrop-blur-sm border border-analytics-violet/20 rounded-lg p-4 hover:border-analytics-violet/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-analytics-violet" />
                <span className="text-white font-medium">Соблюдение дедлайнов</span>
              </div>
              <div className="text-2xl font-bold text-analytics-violet mb-1">92%</div>
              <div className="text-white/60 text-sm">вовремя выполнено</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
