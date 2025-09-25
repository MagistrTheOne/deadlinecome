"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Zap, 
  Users, 
  Clock, 
  Target, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Activity,
  TrendingUp,
  GitBranch,
  MessageSquare,
  Calendar,
  X
} from "lucide-react";

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  executions: number;
  successRate: number;
  lastRun: Date;
  category: "git" | "time" | "status" | "assignment";
}

interface SmartAssignment {
  id: string;
  taskTitle: string;
  suggestedAssignee: string;
  confidence: number;
  reasoning: string;
  skills: string[];
  workload: number;
  status: "pending" | "accepted" | "rejected";
}

interface AutoTask {
  id: string;
  title: string;
  source: "commit" | "pr" | "issue" | "calendar";
  description: string;
  priority: "low" | "medium" | "high";
  estimatedHours: number;
  createdAt: Date;
  status: "created" | "assigned" | "in_progress";
}

export function AISmartWorkflows() {
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]);
  const [smartAssignments, setSmartAssignments] = useState<SmartAssignment[]>([]);
  const [autoTasks, setAutoTasks] = useState<AutoTask[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadWorkflowRules();
    loadSmartAssignments();
    loadAutoTasks();
  }, []);

  const loadWorkflowRules = () => {
    const mockRules: WorkflowRule[] = [
      {
        id: "1",
        name: "Автосоздание задач из коммитов",
        description: "Создает задачи автоматически при коммитах с определенными ключевыми словами",
        trigger: "Git commit с 'fix:', 'feat:', 'bug:'",
        action: "Создать задачу с соответствующим типом",
        isActive: true,
        executions: 47,
        successRate: 94,
        lastRun: new Date(Date.now() - 1000 * 60 * 15),
        category: "git"
      },
      {
        id: "2", 
        name: "Умное назначение исполнителей",
        description: "Анализирует навыки и загрузку команды для оптимального назначения",
        trigger: "Новая задача создана",
        action: "Предложить исполнителя на основе AI-анализа",
        isActive: true,
        executions: 23,
        successRate: 87,
        lastRun: new Date(Date.now() - 1000 * 60 * 5),
        category: "assignment"
      },
      {
        id: "3",
        name: "Автоматическое обновление статусов",
        description: "Обновляет статус задач при изменении статуса PR или issue",
        trigger: "PR merged или issue closed",
        action: "Обновить статус связанной задачи",
        isActive: true,
        executions: 156,
        successRate: 98,
        lastRun: new Date(Date.now() - 1000 * 60 * 2),
        category: "status"
      },
      {
        id: "4",
        name: "Напоминания о дедлайнах",
        description: "Отправляет уведомления за 24 часа до дедлайна",
        trigger: "Задача с дедлайном",
        action: "Отправить напоминание исполнителю",
        isActive: false,
        executions: 8,
        successRate: 100,
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2),
        category: "time"
      }
    ];
    
    setWorkflowRules(mockRules);
  };

  const loadSmartAssignments = () => {
    const mockAssignments: SmartAssignment[] = [
      {
        id: "1",
        taskTitle: "Исправить баг в авторизации",
        suggestedAssignee: "Алексей Петров",
        confidence: 92,
        reasoning: "Высокий опыт с React и TypeScript, недавно работал с auth модулем",
        skills: ["React", "TypeScript", "Auth"],
        workload: 65,
        status: "pending"
      },
      {
        id: "2",
        taskTitle: "Оптимизировать API запросы",
        suggestedAssignee: "Мария Сидорова", 
        confidence: 88,
        reasoning: "Специалист по backend, знает PostgreSQL и Node.js",
        skills: ["Node.js", "PostgreSQL", "API"],
        workload: 45,
        status: "accepted"
      },
      {
        id: "3",
        taskTitle: "Добавить unit тесты",
        suggestedAssignee: "Анна Волкова",
        confidence: 95,
        reasoning: "QA инженер с опытом автоматизации тестирования",
        skills: ["Testing", "Jest", "Automation"],
        workload: 30,
        status: "rejected"
      }
    ];
    
    setSmartAssignments(mockAssignments);
  };

  const loadAutoTasks = () => {
    const mockTasks: AutoTask[] = [
      {
        id: "1",
        title: "Исправить баг с валидацией email",
        source: "commit",
        description: "Автоматически создано из коммита: fix: исправить валидацию email в форме регистрации",
        priority: "high",
        estimatedHours: 4,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        status: "assigned"
      },
      {
        id: "2",
        title: "Добавить новую функцию экспорта данных",
        source: "pr",
        description: "Создано из PR #123: feat: добавить экспорт в Excel формат",
        priority: "medium",
        estimatedHours: 8,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: "created"
      },
      {
        id: "3",
        title: "Обновить документацию API",
        source: "issue",
        description: "Создано из issue #45: обновить Swagger документацию",
        priority: "low",
        estimatedHours: 2,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        status: "in_progress"
      }
    ];
    
    setAutoTasks(mockTasks);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "git":
        return <GitBranch className="h-4 w-4" />;
      case "time":
        return <Clock className="h-4 w-4" />;
      case "status":
        return <Target className="h-4 w-4" />;
      case "assignment":
        return <Users className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "git":
        return "bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30";
      case "time":
        return "bg-analytics-cyan/20 text-analytics-cyan border-analytics-cyan/30";
      case "status":
        return "bg-analytics-violet/20 text-analytics-violet border-analytics-violet/30";
      case "assignment":
        return "bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30";
      default:
        return "bg-glass-medium text-white border-white/20";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "commit":
        return <GitBranch className="h-4 w-4" />;
      case "pr":
        return <GitBranch className="h-4 w-4" />;
      case "issue":
        return <MessageSquare className="h-4 w-4" />;
      case "calendar":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-analytics-rose/20 text-analytics-rose border-analytics-rose/30";
      case "medium":
        return "bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30";
      case "low":
        return "bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30";
      default:
        return "bg-glass-medium text-white border-white/20";
    }
  };

  const toggleWorkflow = (ruleId: string) => {
    setWorkflowRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const acceptAssignment = (assignmentId: string) => {
    setSmartAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId ? { ...assignment, status: "accepted" } : assignment
      )
    );
  };

  const rejectAssignment = (assignmentId: string) => {
    setSmartAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId ? { ...assignment, status: "rejected" } : assignment
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            AI-Powered Smart Workflows
          </h2>
          <p className="text-white/70">
            Автоматизация процессов с помощью искусственного интеллекта
          </p>
        </div>
        <Button 
          className="bg-analytics-violet hover:bg-analytics-violet/80 text-white"
          onClick={() => setIsAnalyzing(!isAnalyzing)}
        >
          <Brain className="h-4 w-4 mr-2" />
          {isAnalyzing ? "Остановить анализ" : "Запустить анализ"}
        </Button>
      </div>

      {/* Workflow Rules */}
      <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-analytics-cyan" />
            Правила автоматизации
          </CardTitle>
          <CardDescription className="text-white/60">
            Настроенные правила для автоматического выполнения действий
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {workflowRules.map((rule) => (
              <div 
                key={rule.id} 
                className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(rule.category)}>
                      {getCategoryIcon(rule.category)}
                    </Badge>
                    <h4 className="text-white font-medium">{rule.name}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWorkflow(rule.id)}
                    className={`p-1 h-auto ${
                      rule.isActive 
                        ? 'text-analytics-emerald hover:bg-analytics-emerald/10' 
                        : 'text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
                
                <p className="text-white/70 text-sm mb-3">{rule.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/60">Триггер:</span>
                    <span className="text-white/80">{rule.trigger}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/60">Действие:</span>
                    <span className="text-white/80">{rule.action}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-white/60">
                      Выполнений: <span className="text-white">{rule.executions}</span>
                    </span>
                    <span className="text-white/60">
                      Успешность: <span className="text-analytics-emerald">{rule.successRate}%</span>
                    </span>
                  </div>
                  <span className="text-white/60">
                    {rule.lastRun.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Assignments */}
      <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-analytics-amber" />
            Умные назначения
          </CardTitle>
          <CardDescription className="text-white/60">
            AI предлагает оптимальных исполнителей на основе анализа навыков и загрузки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {smartAssignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{assignment.taskTitle}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white/60 text-sm">Предложен:</span>
                      <span className="text-white font-medium">{assignment.suggestedAssignee}</span>
                      <Badge className="bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30">
                        {assignment.confidence}% уверенности
                      </Badge>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{assignment.reasoning}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-white/60 text-xs">Навыки:</span>
                      {assignment.skills.map((skill, index) => (
                        <Badge key={index} className="bg-glass-light text-white/80 border-white/20 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-xs">Загрузка:</span>
                      <Progress value={assignment.workload} className="flex-1 h-2" />
                      <span className="text-white/60 text-xs">{assignment.workload}%</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {assignment.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => acceptAssignment(assignment.id)}
                          className="bg-analytics-emerald hover:bg-analytics-emerald/80 text-white"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Принять
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectAssignment(assignment.id)}
                          className="border-analytics-rose/30 text-analytics-rose hover:bg-analytics-rose/10"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Отклонить
                        </Button>
                      </>
                    )}
                    {assignment.status === "accepted" && (
                      <Badge className="bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Принято
                      </Badge>
                    )}
                    {assignment.status === "rejected" && (
                      <Badge className="bg-analytics-rose/20 text-analytics-rose border-analytics-rose/30">
                        <X className="h-3 w-3 mr-1" />
                        Отклонено
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-generated Tasks */}
      <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-analytics-violet" />
            Автоматически созданные задачи
          </CardTitle>
          <CardDescription className="text-white/60">
            Задачи, созданные автоматически на основе активности в репозитории
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {autoTasks.map((task) => (
              <div 
                key={task.id} 
                className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-medium">{task.title}</h4>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority === "high" ? "Высокий" : 
                         task.priority === "medium" ? "Средний" : "Низкий"} приоритет
                      </Badge>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <div className="flex items-center gap-1">
                        {getSourceIcon(task.source)}
                        <span>Источник: {task.source}</span>
                      </div>
                      <span>~{task.estimatedHours}ч</span>
                      <span>{task.createdAt.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Badge className={
                      task.status === "created" ? "bg-analytics-cyan/20 text-analytics-cyan border-analytics-cyan/30" :
                      task.status === "assigned" ? "bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30" :
                      "bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30"
                    }>
                      {task.status === "created" ? "Создана" :
                       task.status === "assigned" ? "Назначена" : "В работе"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
