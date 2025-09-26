"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
  Bot, 
  MessageSquare, 
  Users, 
  Settings, 
  Play, 
  Pause, 
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
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'busy' | 'idle' | 'offline';
  currentTask?: string;
  mood: 'happy' | 'focused' | 'stressed' | 'tired';
  efficiency: number;
  lastActive: Date;
  capabilities: string[];
  personality: {
    communicationStyle: string;
    workingHours: string;
    collaborationStyle: string;
  };
}

interface AITask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedTo?: string;
  estimatedTime: number;
  actualTime?: number;
  dependencies: string[];
}

export default function AICommandCenter() {
  const [selectedAI, setSelectedAI] = useState<string>('ai-vasily');
  const [aiAgents, setAIAgents] = useState<AIAgent[]>([]);
  const [aiTasks, setAITasks] = useState<AITask[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    from: 'user' | 'ai';
    message: string;
    timestamp: Date;
    aiId?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAIAgents();
    fetchAITasks();
  }, []);

  const initializeAIAgents = () => {
    const agents: AIAgent[] = [
      {
        id: 'ai-vasily',
        name: 'Василий',
        role: 'AI Team Lead',
        status: 'active',
        currentTask: 'Планирование спринта',
        mood: 'focused',
        efficiency: 95,
        lastActive: new Date(),
        capabilities: ['Project Management', 'Strategy', 'Team Coordination'],
        personality: {
          communicationStyle: 'Direct and inspiring',
          workingHours: '24/7',
          collaborationStyle: 'Collaborative'
        }
      },
      {
        id: 'ai-vladimir',
        name: 'Владимир',
        role: 'AI Code Reviewer',
        status: 'busy',
        currentTask: 'Code review PR-123',
        mood: 'focused',
        efficiency: 88,
        lastActive: new Date(Date.now() - 300000),
        capabilities: ['Code Quality', 'Architecture', 'Security'],
        personality: {
          communicationStyle: 'Detailed and constructive',
          workingHours: '9:00-18:00',
          collaborationStyle: 'Methodical'
        }
      },
      {
        id: 'ai-olga',
        name: 'Ольга',
        role: 'AI Security Expert',
        status: 'active',
        currentTask: 'Security audit',
        mood: 'focused',
        efficiency: 92,
        lastActive: new Date(Date.now() - 60000),
        capabilities: ['Security', 'Compliance', 'Risk Assessment'],
        personality: {
          communicationStyle: 'Cautious and warning',
          workingHours: '24/7',
          collaborationStyle: 'Protective'
        }
      },
      {
        id: 'ai-pavel',
        name: 'Павел',
        role: 'AI Performance Engineer',
        status: 'idle',
        currentTask: undefined,
        mood: 'happy',
        efficiency: 90,
        lastActive: new Date(Date.now() - 120000),
        capabilities: ['Performance', 'Optimization', 'Monitoring'],
        personality: {
          communicationStyle: 'Technical and systematic',
          workingHours: '9:00-17:00',
          collaborationStyle: 'Methodical'
        }
      }
    ];
    setAIAgents(agents);
    setLoading(false);
  };

  const fetchAITasks = async () => {
    // В реальном приложении здесь был бы API вызов
    const tasks: AITask[] = [
      {
        id: 'task-1',
        title: 'Code Review PR-123',
        description: 'Провести детальный review кода для PR-123',
        priority: 'high',
        status: 'in_progress',
        assignedTo: 'ai-vladimir',
        estimatedTime: 2,
        dependencies: []
      },
      {
        id: 'task-2',
        title: 'Security Audit',
        description: 'Провести аудит безопасности проекта',
        priority: 'urgent',
        status: 'pending',
        assignedTo: 'ai-olga',
        estimatedTime: 4,
        dependencies: []
      },
      {
        id: 'task-3',
        title: 'Performance Optimization',
        description: 'Оптимизировать производительность API',
        priority: 'medium',
        status: 'pending',
        assignedTo: 'ai-pavel',
        estimatedTime: 3,
        dependencies: ['task-1']
      }
    ];
    setAITasks(tasks);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'idle': return 'bg-blue-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'busy': return 'Занят';
      case 'idle': return 'Свободен';
      case 'offline': return 'Офлайн';
      default: return 'Неизвестно';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'focused': return '🤔';
      case 'stressed': return '😰';
      case 'tired': return '😴';
      default: return '😐';
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      from: 'user' as const,
      message: chatMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    // Симуляция ответа AI
    setTimeout(() => {
      const aiResponse = {
        id: `msg-${Date.now() + 1}`,
        from: 'ai' as const,
        message: `Понял, ${chatMessage}. Обрабатываю запрос...`,
        timestamp: new Date(),
        aiId: selectedAI
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const assignTask = (taskId: string, aiId: string) => {
    setAITasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, assignedTo: aiId, status: 'in_progress' } : task
    ));
  };

  const selectedAgent = aiAgents.find(agent => agent.id === selectedAI);

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardContent className="p-8 text-center">
          <div className="text-white/70">Загрузка AI Command Center...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Command Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Центр управления AI-командой. Переключайтесь между AI, назначайте задачи и общайтесь с ними.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Agents Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                AI Команда
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedAI === agent.id 
                      ? 'bg-blue-600/20 border border-blue-500/50' 
                      : 'bg-gray-800/50 border border-gray-600/50 hover:bg-gray-700/50'
                  }`}
                  onClick={() => setSelectedAI(agent.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                      <span className="text-white font-medium">{agent.name}</span>
                    </div>
                    <span className="text-white/70 text-sm">{getMoodEmoji(agent.mood)}</span>
                  </div>
                  
                  <div className="text-white/70 text-sm mb-1">{agent.role}</div>
                  <div className="text-white/60 text-xs mb-2">
                    {agent.currentTask || 'Свободен'}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-green-500" />
                      <span className="text-white/70 text-xs">{agent.efficiency}%</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getStatusText(agent.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Status Overview */}
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Статус Команды
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {aiAgents.filter(a => a.status === 'active').length}
                  </div>
                  <div className="text-white/70 text-sm">Активных</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {aiAgents.filter(a => a.status === 'busy').length}
                  </div>
                  <div className="text-white/70 text-sm">Занятых</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {aiAgents.filter(a => a.status === 'idle').length}
                  </div>
                  <div className="text-white/70 text-sm">Свободных</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.round(aiAgents.reduce((sum, a) => sum + a.efficiency, 0) / aiAgents.length)}
                  </div>
                  <div className="text-white/70 text-sm">Средняя эффективность</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selected AI Info */}
          {selectedAgent && (
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {selectedAgent.name} - {selectedAgent.role}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-white/70 text-sm mb-1">Статус</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedAgent.status)}`} />
                      <span className="text-white">{getStatusText(selectedAgent.status)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-white/70 text-sm mb-1">Настроение</div>
                    <div className="text-white">{getMoodEmoji(selectedAgent.mood)} {selectedAgent.mood}</div>
                  </div>
                  <div>
                    <div className="text-white/70 text-sm mb-1">Эффективность</div>
                    <div className="text-white">{selectedAgent.efficiency}%</div>
                  </div>
                </div>

                <div>
                  <div className="text-white/70 text-sm mb-2">Текущая задача</div>
                  <div className="text-white">
                    {selectedAgent.currentTask || 'Нет активных задач'}
                  </div>
                </div>

                <div>
                  <div className="text-white/70 text-sm mb-2">Возможности</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.capabilities.map((capability, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-white/70 text-sm mb-2">Стиль коммуникации</div>
                  <div className="text-white text-sm">{selectedAgent.personality.communicationStyle}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Interface */}
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Чат с {selectedAgent?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat History */}
              <div className="h-64 overflow-y-auto bg-gray-900/50 rounded-lg p-4 space-y-3">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-white/70 py-8">
                    Начните общение с {selectedAgent?.name}
                  </div>
                ) : (
                  chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.from === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={`Напишите сообщение ${selectedAgent?.name}...`}
                  className="bg-gray-800 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task Assignment */}
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Назначение Задач
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium">{task.title}</div>
                      <Badge 
                        variant={
                          task.priority === 'urgent' ? 'destructive' :
                          task.priority === 'high' ? 'default' :
                          task.priority === 'medium' ? 'secondary' : 'outline'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="text-white/70 text-sm mb-2">{task.description}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-white/60 text-xs">
                        {task.assignedTo ? `Назначено: ${aiAgents.find(a => a.id === task.assignedTo)?.name}` : 'Не назначено'}
                      </div>
                      {!task.assignedTo && (
                        <Button
                          size="sm"
                          onClick={() => assignTask(task.id, selectedAI)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Назначить {selectedAgent?.name}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
