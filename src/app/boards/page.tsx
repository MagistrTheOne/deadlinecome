"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Bot,
  Plus,
  Settings,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain,
  User,
  Activity
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  assignee?: string;
  assigneeType: 'human' | 'ai';
  dueDate?: string;
  createdBy: string;
  createdAt: Date;
}

export default function BoardsPage() {
  const [activeTab, setActiveTab] = useState('human');

  const humanTasks: Task[] = [
    {
      id: '1',
      title: 'Создать дизайн-систему',
      description: 'Разработать единую дизайн-систему для всех компонентов',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignee: 'Иван Петров',
      assigneeType: 'human',
      dueDate: '2025-10-15',
      createdBy: 'MagistrTheOne',
      createdAt: new Date('2025-09-25')
    },
    {
      id: '2',
      title: 'Написать документацию API',
      description: 'Создать подробную документацию для всех API endpoints',
      priority: 'MEDIUM',
      status: 'TODO',
      assignee: 'Анна Смирнова',
      assigneeType: 'human',
      dueDate: '2025-10-20',
      createdBy: 'MagistrTheOne',
      createdAt: new Date('2025-09-26')
    }
  ];

  const aiTasks: Task[] = [
    {
      id: '3',
      title: 'Оптимизировать производительность',
      description: 'Проанализировать и оптимизировать медленные запросы',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignee: 'Василий AI',
      assigneeType: 'ai',
      dueDate: '2025-10-10',
      createdBy: 'MagistrTheOne',
      createdAt: new Date('2025-09-27')
    },
    {
      id: '4',
      title: 'Создать автоматические тесты',
      description: 'Написать unit и integration тесты для критических компонентов',
      priority: 'MEDIUM',
      status: 'TODO',
      assignee: 'Алекс AI',
      assigneeType: 'ai',
      dueDate: '2025-10-12',
      createdBy: 'MagistrTheOne',
      createdAt: new Date('2025-09-28')
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'BLOCKED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'TODO': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DONE': return 'Выполнено';
      case 'IN_PROGRESS': return 'В работе';
      case 'BLOCKED': return 'Заблокировано';
      case 'TODO': return 'К выполнению';
      default: return 'Неизвестно';
    }
  };

  const handleTaskAssignment = (taskId: string, assigneeType: 'human' | 'ai') => {
    // Логика назначения задач
    console.log(`Task ${taskId} assigned to ${assigneeType}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Доски задач</h1>
                <p className="text-white/60 text-sm">Управление задачами для команд</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Plus className="h-4 w-4 mr-2" />
                Новая задача
              </Button>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
            <TabsTrigger value="human" className="data-[state=active]:bg-white/20">
              <User className="h-4 w-4 mr-2" />
              Человеческая команда
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-white/20">
              <Bot className="h-4 w-4 mr-2" />
              AI команда
            </TabsTrigger>
          </TabsList>

          {/* Human Team Board */}
          <TabsContent value="human" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* TODO Column */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    К выполнению
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {humanTasks.filter(task => task.status === 'TODO').map((task) => (
                    <div key={task.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">Создано: {task.createdBy}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleTaskAssignment(task.id, 'human')}
                          className="text-white/60 hover:text-white text-xs"
                        >
                          Назначить
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* IN_PROGRESS Column */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    В работе
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {humanTasks.filter(task => task.status === 'IN_PROGRESS').map((task) => (
                    <div key={task.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">Исполнитель: {task.assignee}</span>
                        <Button size="sm" variant="ghost" className="text-white/60 hover:text-white text-xs">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* DONE Column */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Выполнено
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {humanTasks.filter(task => task.status === 'DONE').map((task) => (
                    <div key={task.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">Исполнитель: {task.assignee}</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          ✓
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* BLOCKED Column */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Заблокировано
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {humanTasks.filter(task => task.status === 'BLOCKED').map((task) => (
                    <div key={task.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">Исполнитель: {task.assignee}</span>
                        <Button size="sm" variant="ghost" className="text-white/60 hover:text-white text-xs">
                          Разблокировать
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Team Board */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* TODO Column */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Задачи
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiTasks.filter(task => task.status === 'TODO').map((task) => (
                    <div key={task.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">AI: {task.assignee}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleTaskAssignment(task.id, 'ai')}
                          className="text-white/60 hover:text-white text-xs"
                        >
                          Назначить AI
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* IN_PROGRESS Column */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    AI Работает
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiTasks.filter(task => task.status === 'IN_PROGRESS').map((task) => (
                    <div key={task.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">AI: {task.assignee}</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-400 text-xs">Работает</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* DONE Column */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    AI Завершил
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiTasks.filter(task => task.status === 'DONE').map((task) => (
                    <div key={task.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">AI: {task.assignee}</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          ✓ AI
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* BLOCKED Column */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    AI Заблокировано
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiTasks.filter(task => task.status === 'BLOCKED').map((task) => (
                    <div key={task.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">AI: {task.assignee}</span>
                        <Button size="sm" variant="ghost" className="text-white/60 hover:text-white text-xs">
                          Передать человеку
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
