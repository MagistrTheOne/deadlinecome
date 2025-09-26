"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Users,
  Code,
  GitBranch,
  BarChart3,
  Activity,
  Brain,
  Shield,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionData {
  sprint: {
    velocity: number;
    predictedVelocity: number;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
    factors: string[];
  };
  project: {
    completionDate: Date;
    predictedCompletionDate: Date;
    onTimeProbability: number;
    budgetOverrunRisk: number;
    qualityScore: number;
  };
  team: {
    burnoutRisk: number;
    productivityTrend: 'increasing' | 'stable' | 'decreasing';
    collaborationScore: number;
    skillGapAnalysis: string[];
  };
  code: {
    bugPrediction: number;
    technicalDebt: number;
    maintainabilityScore: number;
    refactoringPriority: string[];
  };
}

interface PredictiveAnalyticsProps {
  workspaceId?: string;
  projectId?: string;
  className?: string;
}

export function PredictiveAnalytics({
  workspaceId,
  projectId,
  className
}: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sprint' | 'project' | 'team' | 'code'>('overview');

  // Mock predictive data - in real app, this would come from ML models
  useEffect(() => {
    const loadPredictions = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPredictions: PredictionData = {
        sprint: {
          velocity: 21,
          predictedVelocity: 18,
          confidence: 0.78,
          riskLevel: 'medium',
          factors: [
            'Недостаток тестирования',
            'Высокая нагрузка на команду',
            'Технический долг',
            'Отсутствие ретроспективы'
          ]
        },
        project: {
          completionDate: new Date('2024-12-15'),
          predictedCompletionDate: new Date('2024-12-20'),
          onTimeProbability: 0.65,
          budgetOverrunRisk: 0.25,
          qualityScore: 7.8
        },
        team: {
          burnoutRisk: 0.35,
          productivityTrend: 'stable',
          collaborationScore: 8.2,
          skillGapAnalysis: [
            'Недостаток опыта в DevOps',
            'Необходимы навыки машинного обучения',
            'Требуется углубление в архитектуру'
          ]
        },
        code: {
          bugPrediction: 12,
          technicalDebt: 0.42,
          maintainabilityScore: 6.5,
          refactoringPriority: [
            'Модуляризация компонентов',
            'Оптимизация запросов к БД',
            'Улучшение обработки ошибок',
            'Рефакторинг legacy кода'
          ]
        }
      };

      setPredictions(mockPredictions);
      setIsLoading(false);
    };

    loadPredictions();
  }, [workspaceId, projectId]);

  const getRiskColor = (risk: number) => {
    if (risk < 0.3) return 'text-green-500';
    if (risk < 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskIcon = (risk: number) => {
    if (risk < 0.3) return <CheckCircle className="h-4 w-4" />;
    if (risk < 0.7) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getConfidenceBadge = (confidence: number) => {
    const color = confidence > 0.8 ? 'bg-green-500' :
                  confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <Badge className={cn("text-white", color)}>
        {(confidence * 100).toFixed(0)}% уверенность
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 animate-pulse" />
            <CardTitle>AI Predictive Analytics</CardTitle>
          </div>
          <CardDescription>
            Анализируем данные проекта с помощью машинного обучения...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!predictions) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Нет данных для анализа</h3>
          <p className="text-muted-foreground">
            Недостаточно данных для предиктивного анализа. Продолжайте работу над проектом.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'sprint', label: 'Спринт', icon: <Target className="h-4 w-4" /> },
    { id: 'project', label: 'Проект', icon: <Code className="h-4 w-4" /> },
    { id: 'team', label: 'Команда', icon: <Users className="h-4 w-4" /> },
    { id: 'code', label: 'Код', icon: <GitBranch className="h-4 w-4" /> }
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            <div>
              <CardTitle>AI Predictive Analytics</CardTitle>
              <CardDescription>
                Предиктивные модели для анализа рисков и оптимизации процессов
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
              <Activity className="h-3 w-3 mr-1" />
              Активно
            </Badge>
            <Button size="sm" variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Обновить анализ
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sprint Velocity */}
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <Badge variant="outline">
                    {predictions.sprint.riskLevel === 'low' ? 'Низкий' :
                     predictions.sprint.riskLevel === 'medium' ? 'Средний' : 'Высокий'} риск
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {predictions.sprint.predictedVelocity}
                </div>
                <p className="text-sm text-muted-foreground">
                  Прогноз скорости спринта
                </p>
                <div className="mt-2">
                  {getConfidenceBadge(predictions.sprint.confidence)}
                </div>
              </CardContent>
            </Card>

            {/* Project Timeline */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span className="text-sm">
                    {(predictions.project.onTimeProbability * 100).toFixed(0)}% вероятность
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {predictions.project.predictedCompletionDate.toLocaleDateString('ru-RU', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <p className="text-sm text-muted-foreground">
                  Ожидаемая дата завершения
                </p>
              </CardContent>
            </Card>

            {/* Team Health */}
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  <span className={cn("text-sm", getRiskColor(predictions.team.burnoutRisk))}>
                    {(predictions.team.burnoutRisk * 100).toFixed(0)}% риск выгорания
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {predictions.team.collaborationScore}/10
                </div>
                <p className="text-sm text-muted-foreground">
                  Уровень сотрудничества
                </p>
              </CardContent>
            </Card>

            {/* Code Quality */}
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">
                    {predictions.code.bugPrediction} багов ожидается
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {predictions.code.maintainabilityScore}/10
                </div>
                <p className="text-sm text-muted-foreground">
                  Оценка поддерживаемости
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'sprint' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Анализ спринта</h3>
              {getConfidenceBadge(predictions.sprint.confidence)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Скорость команды</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Текущая скорость</span>
                    <Badge>{predictions.sprint.velocity} SP</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Прогноз на следующий спринт</span>
                    <Badge variant="outline">{predictions.sprint.predictedVelocity} SP</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Доверие к прогнозу</span>
                      <span>{(predictions.sprint.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={predictions.sprint.confidence * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Факторы риска</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions.sprint.factors.map((factor, index) => (
                      <div key={index} className="flex items-start gap-2">
                        {getRiskIcon(predictions.sprint.riskLevel === 'high' ? 0.8 : 0.5)}
                        <span className="text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === 'project' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Общий анализ проекта</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Сроки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Плановая дата</p>
                    <p className="font-medium">
                      {predictions.project.completionDate.toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Прогноз</p>
                    <p className="font-medium text-orange-600">
                      {predictions.project.predictedCompletionDate.toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Вероятность соблюдения сроков</span>
                      <span>{(predictions.project.onTimeProbability * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={predictions.project.onTimeProbability * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Бюджет
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Риск превышения бюджета</p>
                    <p className={cn("font-medium", getRiskColor(predictions.project.budgetOverrunRisk))}>
                      {(predictions.project.budgetOverrunRisk * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Уровень риска</span>
                      <span>{predictions.project.budgetOverrunRisk < 0.3 ? 'Низкий' :
                             predictions.project.budgetOverrunRisk < 0.7 ? 'Средний' : 'Высокий'}</span>
                    </div>
                    <Progress value={predictions.project.budgetOverrunRisk * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Качество
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Общая оценка качества</p>
                    <p className="text-2xl font-bold">
                      {predictions.project.qualityScore}/10
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Качество кода</span>
                      <span>{predictions.project.qualityScore > 8 ? 'Отлично' :
                             predictions.project.qualityScore > 6 ? 'Хорошо' : 'Требует улучшения'}</span>
                    </div>
                    <Progress value={predictions.project.qualityScore * 10} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === 'team' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Анализ команды</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Здоровье команды</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Риск выгорания</span>
                    <Badge className={cn(
                      predictions.team.burnoutRisk < 0.3 ? "bg-green-500" :
                      predictions.team.burnoutRisk < 0.7 ? "bg-yellow-500" : "bg-red-500"
                    )}>
                      {(predictions.team.burnoutRisk * 100).toFixed(0)}%
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Продуктивность</span>
                    <Badge variant="outline">
                      {predictions.team.productivityTrend === 'increasing' ? 'Растет' :
                       predictions.team.productivityTrend === 'stable' ? 'Стабильна' : 'Падает'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Уровень сотрудничества</span>
                      <span>{predictions.team.collaborationScore}/10</span>
                    </div>
                    <Progress value={predictions.team.collaborationScore * 10} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Анализ навыков</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Рекомендуемые улучшения:</p>
                    {predictions.team.skillGapAnalysis.map((gap, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">{gap}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === 'code' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Анализ кода</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Метрики качества</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Прогноз багов</span>
                    <Badge variant="outline">{predictions.code.bugPrediction} шт.</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Технический долг</span>
                    <Badge className={cn(
                      predictions.code.technicalDebt < 0.3 ? "bg-green-500" :
                      predictions.code.technicalDebt < 0.7 ? "bg-yellow-500" : "bg-red-500"
                    )}>
                      {(predictions.code.technicalDebt * 100).toFixed(0)}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Поддерживаемость</span>
                      <span>{predictions.code.maintainabilityScore}/10</span>
                    </div>
                    <Progress value={predictions.code.maintainabilityScore * 10} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Рекомендации по рефакторингу</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Приоритетные задачи:</p>
                    {predictions.code.refactoringPriority.map((task, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-purple-500 mt-0.5" />
                        <span className="text-sm">{task}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Brain className="h-4 w-4" />
              <AlertTitle>AI Insights</AlertTitle>
              <AlertDescription>
                На основе анализа кода, система рекомендует провести рефакторинг наиболее проблемных областей.
                Это поможет снизить технический долг и улучшить поддерживаемость проекта.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
