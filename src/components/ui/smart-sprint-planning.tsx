"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Calendar, 
  Target, 
  Users, 
  Clock, 
  Zap,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Settings,
  Lightbulb,
  Activity,
  PieChart,
  LineChart,
  Star,
  Award,
  Timer
} from "lucide-react";

interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number; // days
  capacity: number; // story points
  velocity: number; // story points per day
  status: "planning" | "active" | "completed";
  goals: string[];
  tasks: SprintTask[];
  teamCapacity: TeamCapacity[];
}

interface SprintTask {
  id: string;
  title: string;
  description: string;
  storyPoints: number;
  priority: "low" | "medium" | "high" | "critical";
  type: "feature" | "bug" | "improvement" | "technical";
  assignee?: string;
  estimatedHours: number;
  actualHours?: number;
  status: "backlog" | "planned" | "in_progress" | "done";
  dependencies: string[];
  tags: string[];
  aiSuggestion?: {
    confidence: number;
    reasoning: string;
    suggestedAssignee: string;
  };
}

interface TeamCapacity {
  userId: string;
  name: string;
  role: string;
  availability: number; // percentage
  skills: string[];
  currentLoad: number; // story points
  maxCapacity: number; // story points
  vacationDays: Date[];
}

interface AISuggestion {
  id: string;
  type: "task_distribution" | "sprint_goals" | "capacity_optimization" | "risk_assessment";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high";
  recommendations: string[];
}

export function SmartSprintPlanning() {
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [availableTasks, setAvailableTasks] = useState<SprintTask[]>([]);
  const [teamCapacity, setTeamCapacity] = useState<TeamCapacity[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [newSprintDuration, setNewSprintDuration] = useState(14);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock sprint data
    const mockSprint: Sprint = {
      id: "1",
      name: "Sprint 15 - AI Features",
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      duration: 14,
      capacity: 100,
      velocity: 7.1,
      status: "planning",
      goals: [
        "Завершить AI-автоматизацию",
        "Добавить предиктивную аналитику",
        "Улучшить UX коллаборации"
      ],
      tasks: [],
      teamCapacity: []
    };

    // Mock available tasks
    const mockTasks: SprintTask[] = [
      {
        id: "1",
        title: "Реализовать AI-автоназначение задач",
        description: "Создать систему автоматического назначения задач на основе навыков и загрузки команды",
        storyPoints: 8,
        priority: "high",
        type: "feature",
        estimatedHours: 16,
        status: "backlog",
        dependencies: [],
        tags: ["AI", "Automation", "Backend"],
        aiSuggestion: {
          confidence: 92,
          reasoning: "Требует опыт в AI и backend разработке",
          suggestedAssignee: "Мария Сидорова"
        }
      },
      {
        id: "2",
        title: "Добавить предиктивную аналитику",
        description: "Создать дашборд с прогнозами и трендами",
        storyPoints: 13,
        priority: "high",
        type: "feature",
        estimatedHours: 26,
        status: "backlog",
        dependencies: ["1"],
        tags: ["Analytics", "Frontend", "Charts"],
        aiSuggestion: {
          confidence: 88,
          reasoning: "Нужны навыки в аналитике и визуализации данных",
          suggestedAssignee: "Алексей Петров"
        }
      },
      {
        id: "3",
        title: "Исправить баг с drag-and-drop",
        description: "Исправить проблему с перетаскиванием задач на мобильных устройствах",
        storyPoints: 3,
        priority: "medium",
        type: "bug",
        estimatedHours: 6,
        status: "backlog",
        dependencies: [],
        tags: ["Bug", "Mobile", "Frontend"],
        aiSuggestion: {
          confidence: 95,
          reasoning: "Быстрое исправление, подходит для любого frontend разработчика",
          suggestedAssignee: "Дмитрий Козлов"
        }
      },
      {
        id: "4",
        title: "Оптимизировать производительность",
        description: "Улучшить скорость загрузки и отзывчивость интерфейса",
        storyPoints: 5,
        priority: "medium",
        type: "improvement",
        estimatedHours: 10,
        status: "backlog",
        dependencies: [],
        tags: ["Performance", "Optimization", "Frontend"],
        aiSuggestion: {
          confidence: 85,
          reasoning: "Требует опыт в оптимизации производительности",
          suggestedAssignee: "Алексей Петров"
        }
      }
    ];

    // Mock team capacity
    const mockTeamCapacity: TeamCapacity[] = [
      {
        userId: "1",
        name: "Алексей Петров",
        role: "Frontend Developer",
        availability: 100,
        skills: ["React", "TypeScript", "UI/UX", "Performance"],
        currentLoad: 0,
        maxCapacity: 25,
        vacationDays: []
      },
      {
        userId: "2",
        name: "Мария Сидорова",
        role: "Backend Developer",
        availability: 80,
        skills: ["Node.js", "PostgreSQL", "AI/ML", "API"],
        currentLoad: 0,
        maxCapacity: 20,
        vacationDays: [new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)]
      },
      {
        userId: "3",
        name: "Дмитрий Козлов",
        role: "Full-stack Developer",
        availability: 100,
        skills: ["React", "Node.js", "DevOps", "Mobile"],
        currentLoad: 0,
        maxCapacity: 30,
        vacationDays: []
      },
      {
        userId: "4",
        name: "Анна Волкова",
        role: "QA Engineer",
        availability: 90,
        skills: ["Testing", "Automation", "Bug Tracking", "Mobile Testing"],
        currentLoad: 0,
        maxCapacity: 15,
        vacationDays: []
      }
    ];

    setCurrentSprint(mockSprint);
    setAvailableTasks(mockTasks);
    setTeamCapacity(mockTeamCapacity);
  };

  const generateAISuggestions = async () => {
    setIsAnalyzing(true);
    
    // Симуляция AI анализа
    setTimeout(() => {
      const suggestions: AISuggestion[] = [
        {
          id: "1",
          type: "task_distribution",
          title: "Оптимальное распределение задач",
          description: "AI предлагает оптимальное распределение задач по команде",
          confidence: 89,
          impact: "high",
          recommendations: [
            "Назначить задачу 'AI-автоназначение' на Марию (92% совпадение навыков)",
            "Поручить 'Предиктивную аналитику' Алексею (88% совпадение)",
            "Дмитрий может взять баг с drag-and-drop (95% уверенности)"
          ]
        },
        {
          id: "2",
          type: "capacity_optimization",
          title: "Оптимизация загрузки команды",
          description: "Анализ показывает возможности для улучшения распределения нагрузки",
          confidence: 76,
          impact: "medium",
          recommendations: [
            "Дмитрий может взять дополнительные задачи (загрузка 0%)",
            "Учесть отпуск Марии на 7-й день спринта",
            "Анна может помочь с тестированием frontend задач"
          ]
        },
        {
          id: "3",
          type: "risk_assessment",
          title: "Оценка рисков спринта",
          description: "Потенциальные риски и рекомендации по их минимизации",
          confidence: 82,
          impact: "high",
          recommendations: [
            "Задача 'Предиктивная аналитика' зависит от AI-автоназначения",
            "Рекомендуется начать с задач без зависимостей",
            "Добавить буферное время для сложных задач"
          ]
        }
      ];
      
      setAISuggestions(suggestions);
      setIsAnalyzing(false);
    }, 2000);
  };

  const addTaskToSprint = (taskId: string) => {
    const task = availableTasks.find(t => t.id === taskId);
    if (!task || !currentSprint) return;

    const updatedTask = { ...task, status: "planned" as const };
    
    setCurrentSprint(prev => prev ? {
      ...prev,
      tasks: [...prev.tasks, updatedTask]
    } : null);

    setAvailableTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const removeTaskFromSprint = (taskId: string) => {
    const task = currentSprint?.tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, status: "backlog" as const };
    
    setAvailableTasks(prev => [updatedTask, ...prev]);
    
    setCurrentSprint(prev => prev ? {
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    } : null);
  };

  const createSprint = () => {
    if (!newSprintName.trim()) return;

    const newSprint: Sprint = {
      id: Date.now().toString(),
      name: newSprintName,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * newSprintDuration),
      duration: newSprintDuration,
      capacity: 100,
      velocity: 7.1,
      status: "planning",
      goals: [],
      tasks: [],
      teamCapacity: teamCapacity
    };

    setCurrentSprint(newSprint);
    setNewSprintName("");
    setShowCreateSprint(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-analytics-rose/20 text-analytics-rose border-analytics-rose/30";
      case "high":
        return "bg-analytics-orange/20 text-analytics-orange border-analytics-orange/30";
      case "medium":
        return "bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30";
      case "low":
        return "bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30";
      default:
        return "bg-glass-medium text-white border-white/20";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-analytics-violet/20 text-analytics-violet border-analytics-violet/30";
      case "bug":
        return "bg-analytics-rose/20 text-analytics-rose border-analytics-rose/30";
      case "improvement":
        return "bg-analytics-cyan/20 text-analytics-cyan border-analytics-cyan/30";
      case "technical":
        return "bg-analytics-indigo/20 text-analytics-indigo border-analytics-indigo/30";
      default:
        return "bg-glass-medium text-white border-white/20";
    }
  };

  const getSprintProgress = () => {
    if (!currentSprint) return 0;
    const totalPoints = currentSprint.tasks.reduce((sum, task) => sum + task.storyPoints, 0);
    return (totalPoints / currentSprint.capacity) * 100;
  };

  const getTeamUtilization = () => {
    const totalCapacity = teamCapacity.reduce((sum, member) => sum + member.maxCapacity, 0);
    const totalLoad = teamCapacity.reduce((sum, member) => sum + member.currentLoad, 0);
    return (totalLoad / totalCapacity) * 100;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Smart Sprint Planning
          </h2>
          <p className="text-white/70">
            AI-помощник для планирования спринтов и распределения задач
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={generateAISuggestions}
            disabled={isAnalyzing}
            className="bg-analytics-violet hover:bg-analytics-violet/80 text-white"
          >
            <Brain className="h-4 w-4 mr-2" />
            {isAnalyzing ? "Анализирую..." : "AI-анализ"}
          </Button>
          
          <Button
            onClick={() => setShowCreateSprint(true)}
            className="bg-analytics-emerald hover:bg-analytics-emerald/80 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Новый спринт
          </Button>
        </div>
      </div>

      {/* Current Sprint Overview */}
      {currentSprint && (
        <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-analytics-cyan" />
              {currentSprint.name}
            </CardTitle>
            <CardDescription className="text-white/60">
              {currentSprint.startDate.toLocaleDateString()} - {currentSprint.endDate.toLocaleDateString()} 
              ({currentSprint.duration} дней)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Прогресс спринта</span>
                  <span className="text-white font-medium">{getSprintProgress().toFixed(0)}%</span>
                </div>
                <Progress value={getSprintProgress()} className="h-2" />
                <div className="text-white/60 text-xs">
                  {currentSprint.tasks.reduce((sum, task) => sum + task.storyPoints, 0)} / {currentSprint.capacity} SP
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Загрузка команды</span>
                  <span className="text-white font-medium">{getTeamUtilization().toFixed(0)}%</span>
                </div>
                <Progress value={getTeamUtilization()} className="h-2" />
                <div className="text-white/60 text-xs">
                  {teamCapacity.reduce((sum, member) => sum + member.currentLoad, 0)} / {teamCapacity.reduce((sum, member) => sum + member.maxCapacity, 0)} SP
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Скорость команды</span>
                  <span className="text-white font-medium">{currentSprint.velocity} SP/день</span>
                </div>
                <div className="text-white/60 text-xs">
                  Прогноз: {Math.round(currentSprint.velocity * currentSprint.duration)} SP
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Задач в спринте</span>
                  <span className="text-white font-medium">{currentSprint.tasks.length}</span>
                </div>
                <div className="text-white/60 text-xs">
                  Доступно: {availableTasks.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-analytics-amber" />
              AI Рекомендации
            </CardTitle>
            <CardDescription className="text-white/60">
              Предложения по оптимизации планирования спринта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{suggestion.title}</h4>
                      <p className="text-white/70 text-sm mb-2">{suggestion.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30">
                          {suggestion.confidence}% уверенности
                        </Badge>
                        <Badge className={
                          suggestion.impact === "high" ? "bg-analytics-rose/20 text-analytics-rose border-analytics-rose/30" :
                          suggestion.impact === "medium" ? "bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30" :
                          "bg-analytics-emerald/20 text-analytics-emerald border-analytics-emerald/30"
                        }>
                          {suggestion.impact === "high" ? "Высокий" : 
                           suggestion.impact === "medium" ? "Средний" : "Низкий"} приоритет
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-white font-medium text-sm">Рекомендации:</h5>
                    <ul className="space-y-1">
                      {suggestion.recommendations.map((rec, index) => (
                        <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-analytics-emerald" />
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
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Available Tasks */}
        <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-analytics-violet" />
              Доступные задачи
            </CardTitle>
            <CardDescription className="text-white/60">
              Задачи из бэклога для добавления в спринт
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {availableTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{task.title}</h4>
                      <p className="text-white/70 text-sm mb-2">{task.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === "critical" ? "Критический" :
                           task.priority === "high" ? "Высокий" :
                           task.priority === "medium" ? "Средний" : "Низкий"}
                        </Badge>
                        <Badge className={getTypeColor(task.type)}>
                          {task.type === "feature" ? "Фича" :
                           task.type === "bug" ? "Баг" :
                           task.type === "improvement" ? "Улучшение" : "Техническое"}
                        </Badge>
                        <Badge className="bg-analytics-cyan/20 text-analytics-cyan border-analytics-cyan/30">
                          {task.storyPoints} SP
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {task.aiSuggestion && (
                    <div className="bg-analytics-violet/10 border border-analytics-violet/20 rounded p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-3 w-3 text-analytics-violet" />
                        <span className="text-analytics-violet text-xs font-medium">AI Предложение</span>
                        <Badge className="bg-analytics-violet/20 text-analytics-violet border-analytics-violet/30 text-xs">
                          {task.aiSuggestion.confidence}%
                        </Badge>
                      </div>
                      <p className="text-white/70 text-xs mb-1">{task.aiSuggestion.reasoning}</p>
                      <p className="text-white/80 text-xs">
                        Рекомендуется: <span className="text-analytics-cyan">{task.aiSuggestion.suggestedAssignee}</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-white/60 text-xs">
                      ~{task.estimatedHours}ч • {task.tags.join(", ")}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addTaskToSprint(task.id)}
                      className="bg-analytics-emerald hover:bg-analytics-emerald/80 text-white"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Добавить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sprint Tasks */}
        <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-analytics-emerald" />
              Задачи в спринте
            </CardTitle>
            <CardDescription className="text-white/60">
              {currentSprint?.tasks.length || 0} задач • {currentSprint?.tasks.reduce((sum, task) => sum + task.storyPoints, 0) || 0} SP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentSprint?.tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{task.title}</h4>
                      <p className="text-white/70 text-sm mb-2">{task.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === "critical" ? "Критический" :
                           task.priority === "high" ? "Высокий" :
                           task.priority === "medium" ? "Средний" : "Низкий"}
                        </Badge>
                        <Badge className="bg-analytics-cyan/20 text-analytics-cyan border-analytics-cyan/30">
                          {task.storyPoints} SP
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-white/60 text-xs">
                      ~{task.estimatedHours}ч • {task.tags.join(", ")}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeTaskFromSprint(task.id)}
                      className="border-analytics-rose/30 text-analytics-rose hover:bg-analytics-rose/10"
                    >
                      <Minus className="h-3 w-3 mr-1" />
                      Убрать
                    </Button>
                  </div>
                </div>
              ))}
              
              {(!currentSprint?.tasks || currentSprint.tasks.length === 0) && (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-white/40" />
                  <p className="text-white/60">Нет задач в спринте</p>
                  <p className="text-white/50 text-sm">Добавьте задачи из бэклога</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Sprint Modal */}
      {showCreateSprint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="bg-glass-dark backdrop-blur-sm border-white/20 max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-white">Создать новый спринт</CardTitle>
              <CardDescription className="text-white/60">
                Настройте параметры нового спринта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">Название спринта</label>
                <Input
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  placeholder="Sprint 16 - New Features"
                  className="bg-glass-medium border-white/20 text-white placeholder-white/50"
                />
              </div>
              
              <div>
                <label className="text-white/80 text-sm mb-2 block">Длительность (дни)</label>
                <Select value={newSprintDuration.toString()} onValueChange={(value) => setNewSprintDuration(parseInt(value))}>
                  <SelectTrigger className="bg-glass-medium border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem value="7">1 неделя</SelectItem>
                    <SelectItem value="14">2 недели</SelectItem>
                    <SelectItem value="21">3 недели</SelectItem>
                    <SelectItem value="30">1 месяц</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={createSprint}
                  disabled={!newSprintName.trim()}
                  className="bg-analytics-violet hover:bg-analytics-violet/80 text-white flex-1"
                >
                  Создать спринт
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateSprint(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
