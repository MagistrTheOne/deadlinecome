"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Target,
  Zap,
  Brain,
  Activity,
  RefreshCw
} from "lucide-react";

interface ProjectStatus {
  id: string;
  projectId: string;
  status: "ON_TRACK" | "AT_RISK" | "BEHIND" | "BLOCKED" | "COMPLETED";
  healthScore: number;
  progress: number;
  aiAnalysis: string;
  recommendations: string;
  lastAnalyzed: string;
}

interface VasilyAction {
  id: string;
  actionType: "TASK_ASSIGNED" | "DEADLINE_ALERT" | "STATUS_UPDATE" | "RECOMMENDATION" | "AUTO_CREATE_TASK";
  description: string;
  targetUserId?: string;
  metadata?: string;
  executed: boolean;
  createdAt: string;
}

interface VasilyProjectManagerProps {
  projectId: string;
  workspaceId: string;
}

export function VasilyProjectManager({ projectId, workspaceId }: VasilyProjectManagerProps) {
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [actions, setActions] = useState<VasilyAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);

  useEffect(() => {
    loadProjectStatus();
  }, [projectId]);

  const loadProjectStatus = async () => {
    try {
      const response = await fetch(`/api/vasily/project-status?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setActions(data.recentActions || []);
      } else {
        // Fallback демо-данные
        setStatus({
          id: "demo-status",
          projectId,
          status: "AT_RISK",
          healthScore: 75,
          progress: 45,
          aiAnalysis: JSON.stringify({
            totalTasks: 6,
            completedTasks: 1,
            inProgressTasks: 2,
            todoTasks: 2,
            blockedTasks: 1,
            teamSize: 5,
            lastAnalyzed: new Date().toISOString(),
          }),
          recommendations: JSON.stringify([
            "Разблокировать задачу оптимизации производительности",
            "Перераспределить ресурсы на высокоприоритетные задачи",
            "Провести ретроспективу по блокерам",
          ]),
          lastAnalyzed: new Date().toISOString(),
        });
        setActions([
          {
            id: "demo-action-1",
            actionType: "TASK_ASSIGNED",
            description: "Василий назначил задачу 'Реализовать систему ролей' на TEAM_LEAD",
            targetUserId: "user-2",
            metadata: JSON.stringify({
              taskId: "issue-1",
              taskTitle: "Реализовать систему ролей",
              assigneeRole: "TEAM_LEAD",
              reasoning: "Назначен как TEAM_LEAD с опытом 7 лет",
            }),
            executed: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "demo-action-2",
            actionType: "STATUS_UPDATE",
            description: "Василий обновил статус проекта: AT_RISK",
            metadata: JSON.stringify({
              previousStatus: "ON_TRACK",
              newStatus: "AT_RISK",
              reason: "Обнаружена заблокированная задача высокого приоритета",
            }),
            executed: true,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "demo-action-3",
            actionType: "RECOMMENDATION",
            description: "Василий рекомендует разблокировать задачу оптимизации",
            metadata: JSON.stringify({
              recommendation: "Разблокировать задачу оптимизации производительности",
              priority: "HIGH",
              impact: "Улучшит общую производительность системы",
            }),
            executed: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading project status:", error);
      // Fallback демо-данные при ошибке
      setStatus({
        id: "demo-status",
        projectId,
        status: "AT_RISK",
        healthScore: 75,
        progress: 45,
        aiAnalysis: JSON.stringify({
          totalTasks: 6,
          completedTasks: 1,
          inProgressTasks: 2,
          todoTasks: 2,
          blockedTasks: 1,
          teamSize: 5,
          lastAnalyzed: new Date().toISOString(),
        }),
        recommendations: JSON.stringify([
          "Разблокировать задачу оптимизации производительности",
          "Перераспределить ресурсы на высокоприоритетные задачи",
        ]),
        lastAnalyzed: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeProject = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/vasily/project-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          action: "analyze",
        }),
      });

      if (response.ok) {
        await loadProjectStatus();
      }
    } catch (error) {
      console.error("Error analyzing project:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const autoAssignTasks = async () => {
    setAutoAssigning(true);
    try {
      const response = await fetch("/api/vasily/auto-assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Показываем уведомление об успехе
        console.log(data.message);
        await loadProjectStatus();
      }
    } catch (error) {
      console.error("Error auto-assigning tasks:", error);
    } finally {
      setAutoAssigning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ON_TRACK":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "AT_RISK":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case "BEHIND":
        return <Clock className="h-5 w-5 text-orange-400" />;
      case "BLOCKED":
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Activity className="h-5 w-5 text-white/60" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ON_TRACK":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "AT_RISK":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "BEHIND":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "BLOCKED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "COMPLETED":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ON_TRACK":
        return "В графике";
      case "AT_RISK":
        return "Под угрозой";
      case "BEHIND":
        return "Отстает";
      case "BLOCKED":
        return "Заблокирован";
      case "COMPLETED":
        return "Завершен";
      default:
        return "Неизвестно";
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "TASK_ASSIGNED":
        return <Users className="h-4 w-4 text-blue-400" />;
      case "DEADLINE_ALERT":
        return <Clock className="h-4 w-4 text-red-400" />;
      case "STATUS_UPDATE":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "RECOMMENDATION":
        return <Brain className="h-4 w-4 text-purple-400" />;
      case "AUTO_CREATE_TASK":
        return <Zap className="h-4 w-4 text-yellow-400" />;
      default:
        return <Activity className="h-4 w-4 text-white/60" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Status Card */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Василий - AI Project Manager
              </CardTitle>
              <CardDescription className="text-white/60">
                Умное управление проектом и автоматизация
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={analyzeProject}
                disabled={analyzing}
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
              >
                {analyzing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                Анализ
              </Button>
              <Button
                onClick={autoAssignTasks}
                disabled={autoAssigning}
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
              >
                {autoAssigning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Автоназначение
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {status ? (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-black/30 border border-white/10">
                  {getStatusIcon(status.status)}
                  <div>
                    <div className="text-white font-medium">Статус проекта</div>
                    <Badge className={getStatusColor(status.status)}>
                      {getStatusText(status.status)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-black/30 border border-white/10">
                  <Target className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Прогресс</div>
                    <div className="text-white text-lg font-bold">{status.progress}%</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-black/30 border border-white/10">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Здоровье</div>
                    <div className="text-white text-lg font-bold">{status.healthScore}/100</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-white text-sm">
                  <span>Прогресс проекта</span>
                  <span>{status.progress}%</span>
                </div>
                <Progress value={status.progress} className="h-2" />
              </div>

              {/* Health Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-white text-sm">
                  <span>Здоровье проекта</span>
                  <span>{status.healthScore}/100</span>
                </div>
                <Progress value={status.healthScore} className="h-2" />
              </div>

              {/* Recommendations */}
              {status.recommendations && (
                <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Рекомендации Василия
                  </h4>
                  <div className="space-y-2">
                    {JSON.parse(status.recommendations).map((rec: string, index: number) => (
                      <div key={index} className="text-white/70 text-sm flex items-start gap-2">
                        <span className="text-white/40">•</span>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Василий еще не анализировал этот проект</p>
              <Button
                onClick={analyzeProject}
                disabled={analyzing}
                className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
              >
                {analyzing ? "Анализирую..." : "Начать анализ"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Actions */}
      {actions.length > 0 && (
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Последние действия Василия
            </CardTitle>
            <CardDescription className="text-white/60">
              Автоматические действия и уведомления
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-black/30 border border-white/10"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(action.actionType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{action.description}</p>
                    <p className="text-white/60 text-xs mt-1">
                      {new Date(action.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {action.executed && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Выполнено
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
