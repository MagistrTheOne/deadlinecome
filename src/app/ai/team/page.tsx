"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Bot, 
  User,
  Plus,
  Settings,
  MessageSquare,
  Zap,
  Brain,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface AITeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  avatar?: string;
  capabilities: string[];
  currentTask?: string;
  performance: number;
}

export default function AITeamPage() {
  const [aiTeam, setAiTeam] = useState<AITeamMember[]>([
    {
      id: 'vasily',
      name: 'Василий',
      role: 'AI Менеджер проектов',
      status: 'online',
      capabilities: ['Анализ проектов', 'Оптимизация процессов', 'Предсказание рисков'],
      currentTask: 'Анализ метрик проекта DeadLine',
      performance: 95
    },
    {
      id: 'alex',
      name: 'Алекс',
      role: 'AI Разработчик',
      status: 'online',
      capabilities: ['Генерация кода', 'Code Review', 'Рефакторинг'],
      currentTask: 'Оптимизация производительности',
      performance: 88
    },
    {
      id: 'sophia',
      name: 'София',
      role: 'AI Дизайнер',
      status: 'busy',
      capabilities: ['UI/UX дизайн', 'Создание компонентов', 'Адаптивность'],
      currentTask: 'Создание дизайн-системы',
      performance: 92
    },
    {
      id: 'max',
      name: 'Макс',
      role: 'AI Аналитик',
      status: 'offline',
      capabilities: ['Анализ данных', 'Отчеты', 'Прогнозирование'],
      currentTask: undefined,
      performance: 87
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'busy': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Онлайн';
      case 'busy': return 'Занят';
      case 'offline': return 'Офлайн';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Команда</h1>
                <p className="text-white/60 text-sm">Управление AI-ассистентами</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Bot className="h-3 w-3 mr-1" />
                {aiTeam.filter(member => member.status === 'online').length} онлайн
              </Badge>
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Plus className="h-4 w-4 mr-2" />
                Добавить AI
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* AI Team Members */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {aiTeam.map((member) => (
                <Card key={member.id} className="bg-black/50 backdrop-blur-sm border border-white/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-white/10 text-white">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white font-semibold">{member.name}</h3>
                          <p className="text-white/60 text-sm">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}></div>
                        <span className="text-white/80 text-sm">{getStatusText(member.status)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Capabilities */}
                    <div>
                      <p className="text-white/60 text-sm mb-2">Возможности:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.capabilities.map((capability, index) => (
                          <Badge key={index} className="bg-white/10 text-white border-white/20 text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Current Task */}
                    {member.currentTask && (
                      <div>
                        <p className="text-white/60 text-sm mb-1">Текущая задача:</p>
                        <p className="text-white text-sm">{member.currentTask}</p>
                      </div>
                    )}

                    {/* Performance */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60 text-sm">Производительность</span>
                        <span className="text-white text-sm">{member.performance}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2 transition-all duration-300"
                          style={{ width: `${member.performance}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1 text-white/60 hover:text-white">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Чат
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 text-white/60 hover:text-white">
                        <Settings className="h-4 w-4 mr-1" />
                        Настройки
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Team Stats */}
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Статистика команды</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Всего AI</span>
                  <span className="text-white font-semibold">{aiTeam.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Онлайн</span>
                  <span className="text-green-400 font-semibold">
                    {aiTeam.filter(member => member.status === 'online').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Заняты</span>
                  <span className="text-yellow-400 font-semibold">
                    {aiTeam.filter(member => member.status === 'busy').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Средняя производительность</span>
                  <span className="text-white font-semibold">
                    {Math.round(aiTeam.reduce((acc, member) => acc + member.performance, 0) / aiTeam.length)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить AI
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Zap className="h-4 w-4 mr-2" />
                  Настроить задачи
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Brain className="h-4 w-4 mr-2" />
                  Обучить команду
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Последняя активность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Василий завершил анализ проекта</p>
                    <p className="text-white/60 text-xs">2 минуты назад</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">София начала работу над дизайном</p>
                    <p className="text-white/60 text-xs">15 минут назад</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Алекс оптимизировал код</p>
                    <p className="text-white/60 text-xs">1 час назад</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
