"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  RotateCcw,
  Zap,
  Brain,
  Shield,
  Code,
  BarChart3,
  FileText,
  Globe,
  TrendingUp,
  Activity,
  Target,
  Calendar
} from 'lucide-react';

interface AITask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  assignedTo?: string;
  estimatedTime: number; // hours
  actualTime?: number;
  dependencies: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  progress: number; // 0-100
}

interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'busy' | 'idle' | 'offline';
  currentWorkload: number; // 0-100
  capabilities: string[];
}

export default function AITaskManager() {
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assignedTo: '',
    estimatedTime: 1,
    dueDate: ''
  });
  const [showNewTask, setShowNewTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterAgent, setFilterAgent] = useState('ALL');

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // Инициализируем AI агентов
    const aiAgents: AIAgent[] = [
      {
        id: 'ai-vasily',
        name: 'Василий',
        role: 'AI Team Lead',
        status: 'active',
        currentWorkload: 75,
        capabilities: ['Project Management', 'Strategy', 'Team Coordination']
      },
      {
        id: 'ai-vladimir',
        name: 'Владимир',
        role: 'AI Code Reviewer',
        status: 'busy',
        currentWorkload: 90,
        capabilities: ['Code Quality', 'Architecture', 'Security']
      },
      {
        id: 'ai-olga',
        name: 'Ольга',
        role: 'AI Security Expert',
        status: 'active',
        currentWorkload: 60,
        capabilities: ['Security', 'Compliance', 'Risk Assessment']
      },
      {
        id: 'ai-pavel',
        name: 'Павел',
        role: 'AI Performance Engineer',
        status: 'idle',
        currentWorkload: 30,
        capabilities: ['Performance', 'Optimization', 'Monitoring']
      }
    ];
    setAgents(aiAgents);

    // Инициализируем задачи
    const initialTasks: AITask[] = [
      {
        id: 'task-1',
        title: 'Code Review PR-123',
        description: 'Провести детальный review кода для PR-123, проверить архитектуру и безопасность',
        priority: 'high',
        status: 'in_progress',
        assignedTo: 'ai-vladimir',
        estimatedTime: 2,
        actualTime: 1.5,
        dependencies: [],
        tags: ['code-review', 'architecture'],
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 1800000),
        progress: 75
      },
      {
        id: 'task-2',
        title: 'Security Audit',
        description: 'Провести комплексный аудит безопасности проекта',
        priority: 'urgent',
        status: 'pending',
        assignedTo: 'ai-olga',
        estimatedTime: 4,
        dependencies: [],
        tags: ['security', 'audit'],
        createdAt: new Date(Date.now() - 7200000),
        updatedAt: new Date(Date.now() - 7200000),
        progress: 0
      },
      {
        id: 'task-3',
        title: 'Performance Optimization',
        description: 'Оптимизировать производительность API endpoints',
        priority: 'medium',
        status: 'pending',
        assignedTo: 'ai-pavel',
        estimatedTime: 3,
        dependencies: ['task-1'],
        tags: ['performance', 'optimization'],
        createdAt: new Date(Date.now() - 10800000),
        updatedAt: new Date(Date.now() - 10800000),
        progress: 0
      },
      {
        id: 'task-4',
        title: 'Documentation Update',
        description: 'Обновить техническую документацию проекта',
        priority: 'low',
        status: 'completed',
        assignedTo: 'ai-vasily',
        estimatedTime: 2,
        actualTime: 1.8,
        dependencies: [],
        tags: ['documentation'],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3600000),
        progress: 100
      }
    ];
    setTasks(initialTasks);
  };

  const createTask = () => {
    if (!newTask.title.trim()) return;

    const task: AITask = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'pending',
      assignedTo: newTask.assignedTo || undefined,
      estimatedTime: newTask.estimatedTime,
      dependencies: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      progress: 0
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      estimatedTime: 1,
      dueDate: ''
    });
    setShowNewTask(false);
  };

  const updateTaskStatus = (taskId: string, status: AITask['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status, updatedAt: new Date(), progress: status === 'completed' ? 100 : task.progress }
        : task
    ));
  };

  const assignTask = (taskId: string, agentId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, assignedTo: agentId, status: 'in_progress', updatedAt: new Date() }
        : task
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in_progress': return 'text-blue-500';
      case 'blocked': return 'text-red-500';
      case 'cancelled': return 'text-gray-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'blocked': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'ALL' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'ALL' || task.priority === filterPriority;
    const agentMatch = filterAgent === 'ALL' || task.assignedTo === filterAgent;
    return statusMatch && priorityMatch && agentMatch;
  });

  const getAgentName = (agentId?: string) => {
    if (!agentId) return 'Не назначено';
    return agents.find(a => a.id === agentId)?.name || 'Неизвестно';
  };

  const getAgentWorkload = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.currentWorkload || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckSquare className="h-6 w-6" />
            AI Task Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Управление задачами AI-команды. Назначайте, отслеживайте и контролируйте выполнение задач.
          </p>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-white/70 text-sm">Ожидают</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </div>
                <div className="text-white/70 text-sm">В работе</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-white/70 text-sm">Завершены</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.status === 'blocked').length}
                </div>
                <div className="text-white/70 text-sm">Заблокированы</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Фильтры и Действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидают</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="completed">Завершены</SelectItem>
                <SelectItem value="blocked">Заблокированы</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Все приоритеты</SelectItem>
                <SelectItem value="urgent">Критический</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="AI Агент" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Все агенты</SelectItem>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => setShowNewTask(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Новая задача
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Task Modal */}
      {showNewTask && (
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Создать новую задачу
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Название задачи"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <Textarea
              placeholder="Описание задачи"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select 
                value={newTask.priority} 
                onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="urgent">Критический</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={newTask.assignedTo} 
                onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Назначить AI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Не назначать</SelectItem>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Время (часы)"
                value={newTask.estimatedTime}
                onChange={(e) => setNewTask(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 1 }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createTask} className="bg-green-600 hover:bg-green-700">
                Создать
              </Button>
              <Button 
                onClick={() => setShowNewTask(false)}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-medium">{task.title}</h3>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{task.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {getAgentName(task.assignedTo)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.estimatedTime}ч
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {task.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="text-sm capitalize">{task.status}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-white/70 mb-1">
                  <span>Прогресс</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {task.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Начать
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <Button
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Завершить
                  </Button>
                )}
                {task.status === 'blocked' && (
                  <Button
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Возобновить
                  </Button>
                )}
                {!task.assignedTo && (
                  <Select onValueChange={(value) => assignTask(task.id, value)}>
                    <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Назначить" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardContent className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Задачи не найдены</h3>
            <p className="text-white/70">Попробуйте изменить фильтры или создать новую задачу</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
