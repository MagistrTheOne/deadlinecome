"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Brain, 
  Target, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  currentLoad: number;
  maxLoad: number;
  skills: string[];
  availability: "available" | "busy" | "overloaded";
}

interface Task {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedHours: number;
  requiredSkills: string[];
  complexity: "low" | "medium" | "high";
}

export function SmartAssignment() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Алексей Петров",
      role: "Frontend Developer",
      currentLoad: 25,
      maxLoad: 40,
      skills: ["React", "TypeScript", "UI/UX"],
      availability: "available"
    },
    {
      id: "2", 
      name: "Мария Сидорова",
      role: "Backend Developer",
      currentLoad: 35,
      maxLoad: 40,
      skills: ["Node.js", "PostgreSQL", "API"],
      availability: "busy"
    },
    {
      id: "3",
      name: "Дмитрий Козлов",
      role: "Full-stack Developer",
      currentLoad: 15,
      maxLoad: 40,
      skills: ["React", "Node.js", "DevOps"],
      availability: "available"
    },
    {
      id: "4",
      name: "Анна Волкова",
      role: "QA Engineer",
      currentLoad: 45,
      maxLoad: 40,
      skills: ["Testing", "Automation", "Bug Tracking"],
      availability: "overloaded"
    }
  ];

  const pendingTasks: Task[] = [
    {
      id: "1",
      title: "Создать компонент авторизации",
      priority: "HIGH",
      estimatedHours: 8,
      requiredSkills: ["React", "TypeScript"],
      complexity: "medium"
    },
    {
      id: "2",
      title: "Настроить API для пользователей",
      priority: "URGENT",
      estimatedHours: 12,
      requiredSkills: ["Node.js", "PostgreSQL"],
      complexity: "high"
    },
    {
      id: "3",
      title: "Добавить тесты для компонентов",
      priority: "MEDIUM",
      estimatedHours: 6,
      requiredSkills: ["Testing", "React"],
      complexity: "low"
    }
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-black/50 text-white border-white/30";
      case "busy":
        return "bg-black/50 text-white border-white/30";
      case "overloaded":
        return "bg-black/50 text-white border-white/30";
      default:
        return "bg-black/50 text-white border-white/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-black/50 text-white border-white/30";
      case "HIGH":
        return "bg-black/50 text-white border-white/30";
      case "MEDIUM":
        return "bg-black/50 text-white border-white/30";
      case "LOW":
        return "bg-black/50 text-white border-white/30";
      default:
        return "bg-black/50 text-white border-white/30";
    }
  };

  const handleSmartAssignment = async () => {
    setIsAnalyzing(true);
    
    // Симуляция AI анализа
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newAssignments = [
      {
        taskId: "1",
        taskTitle: "Создать компонент авторизации",
        assigneeId: "1",
        assigneeName: "Алексей Петров",
        reason: "Идеальное соответствие навыков (React, TypeScript), низкая загрузка",
        confidence: 95
      },
      {
        taskId: "2", 
        taskTitle: "Настроить API для пользователей",
        assigneeId: "2",
        assigneeName: "Мария Сидорова",
        reason: "Экспертиза в Node.js и PostgreSQL, несмотря на высокую загрузку",
        confidence: 88
      },
      {
        taskId: "3",
        taskTitle: "Добавить тесты для компонентов", 
        assigneeId: "3",
        assigneeName: "Дмитрий Козлов",
        reason: "Опыт в тестировании и React, минимальная загрузка",
        confidence: 92
      }
    ];
    
    setAssignments(newAssignments);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Команда и загрузка
          </CardTitle>
          <CardDescription className="text-white/60">
            Текущее состояние команды и доступность для новых задач
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{member.name}</h4>
                    <p className="text-white/60 text-sm">{member.role}</p>
                  </div>
                  <Badge className={getAvailabilityColor(member.availability)}>
                    {member.availability === "available" ? "Доступен" : 
                     member.availability === "busy" ? "Занят" : "Перегружен"}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Загрузка</span>
                    <span className="text-white">{member.currentLoad}/{member.maxLoad}ч</span>
                  </div>
                  <Progress 
                    value={(member.currentLoad / member.maxLoad) * 100} 
                    className="h-2"
                  />
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.skills.map((skill) => (
                      <Badge key={skill} className="bg-black/50 text-white border-white/30 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Задачи для назначения
          </CardTitle>
          <CardDescription className="text-white/60">
            Задачи, ожидающие назначения исполнителей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{task.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className="bg-black/50 text-white border-white/30">
                      {task.estimatedHours}ч
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {task.requiredSkills.map((skill) => (
                    <Badge key={skill} className="bg-black/50 text-white border-white/30 text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Assignment */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Умное назначение задач
          </CardTitle>
          <CardDescription className="text-white/60">
            AI анализирует навыки, загрузку и приоритеты для оптимального распределения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleSmartAssignment}
              disabled={isAnalyzing}
              className="w-full bg-black hover:bg-black/80 text-white border border-white/20 hover:border-white/30"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-pulse" />
                  AI анализирует команду...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Запустить умное назначение
                </>
              )}
            </Button>

            {assignments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Рекомендации AI
                </h4>
                {assignments.map((assignment, index) => (
                  <div key={index} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="text-white font-medium">{assignment.taskTitle}</h5>
                        <p className="text-white/60 text-sm">→ {assignment.assigneeName}</p>
                      </div>
                      <Badge className="bg-black/50 text-white border-white/30">
                        {assignment.confidence}% уверенности
                      </Badge>
                    </div>
                    <p className="text-white/70 text-sm">{assignment.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
