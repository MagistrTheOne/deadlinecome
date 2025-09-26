"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  MessageCircle, 
  Users, 
  Activity, 
  Brain, 
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";

interface AITeamMember {
  id: string;
  name: string;
  role: string;
  specialization: string;
  personality: {
    traits: string[];
    communication: string;
    expertise: string[];
  };
  skills: string[];
  isActive: boolean;
  lastActive: string;
}

interface AIChat {
  member: AITeamMember;
  messages: Array<{
    id: string;
    sender: "user" | "ai";
    message: string;
    timestamp: string;
  }>;
}

export default function AITeamDashboard() {
  const [aiTeam, setAiTeam] = useState<AITeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<AITeamMember | null>(null);
  const [chats, setChats] = useState<AIChat[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "ALL",
    specialization: "ALL"
  });

  // Fallback demo data
  const demoAITeam: AITeamMember[] = [
    {
      id: "ai-vasily",
      name: "Василий",
      role: "AI_CTO",
      specialization: "Техническая стратегия и архитектура",
      personality: {
        traits: ["Аналитический", "Стратегический", "Лидерский"],
        communication: "Профессиональный, но дружелюбный",
        expertise: ["Архитектура", "Технологии", "Команда"]
      },
      skills: ["Техническая архитектура", "Выбор технологий", "Управление командой", "Стратегическое планирование", "Code Review", "Mentoring"],
      isActive: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: "ai-anna",
      name: "Анна",
      role: "AI_HR",
      specialization: "Поиск и анализ кандидатов",
      personality: {
        traits: ["Коммуникабельная", "Аналитическая", "Эмпатичная"],
        communication: "Теплая и профессиональная",
        expertise: ["Рекрутинг", "Анализ резюме", "Интервью"]
      },
      skills: ["Парсинг HH.ru", "Анализ резюме", "Проведение интервью", "Оценка кандидатов", "Onboarding", "Team Building"],
      isActive: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: "ai-dmitry",
      name: "Дмитрий",
      role: "AI_PM",
      specialization: "Управление проектами и планирование",
      personality: {
        traits: ["Организованный", "Детальный", "Мотивирующий"],
        communication: "Четкая и структурированная",
        expertise: ["Планирование", "Управление ресурсами", "Методологии"]
      },
      skills: ["Sprint Planning", "Resource Management", "Risk Assessment", "Stakeholder Communication", "Agile Methodologies", "Project Analytics"],
      isActive: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: "ai-elena",
      name: "Елена",
      role: "AI_QA",
      specialization: "Контроль качества и тестирование",
      personality: {
        traits: ["Внимательная", "Критическая", "Системная"],
        communication: "Точная и конструктивная",
        expertise: ["Тестирование", "Качество", "Автоматизация"]
      },
      skills: ["Manual Testing", "Automated Testing", "Bug Analysis", "Test Case Generation", "Quality Metrics", "Performance Testing"],
      isActive: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: "ai-sergey",
      name: "Сергей",
      role: "AI_DEVOPS",
      specialization: "Инфраструктура и автоматизация",
      personality: {
        traits: ["Технический", "Надежный", "Инновационный"],
        communication: "Техническая и практичная",
        expertise: ["Инфраструктура", "Автоматизация", "Мониторинг"]
      },
      skills: ["CI/CD", "Containerization", "Cloud Infrastructure", "Monitoring", "Security", "Automation"],
      isActive: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: "ai-maria",
      name: "Мария",
      role: "AI_DESIGNER",
      specialization: "UI/UX дизайн и пользовательский опыт",
      personality: {
        traits: ["Креативная", "Пользовательская", "Детальная"],
        communication: "Визуальная и понятная",
        expertise: ["UI/UX", "Прототипирование", "Исследования"]
      },
      skills: ["UI Design", "UX Research", "Prototyping", "User Testing", "Design Systems", "Accessibility"],
      isActive: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: "ai-alexey",
      name: "Алексей",
      role: "AI_ANALYST",
      specialization: "Анализ данных и бизнес-метрики",
      personality: {
        traits: ["Аналитический", "Логический", "Предсказательный"],
        communication: "Данные и факты",
        expertise: ["Аналитика", "Метрики", "Предсказания"]
      },
      skills: ["Data Analysis", "Business Intelligence", "Predictive Analytics", "KPI Tracking", "Reporting", "Machine Learning"],
      isActive: true,
      lastActive: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    fetchAITeam();
  }, []);

  // Автоматическое обновление при изменении фильтров
  useEffect(() => {
    fetchAITeam();
  }, [filters.status, filters.specialization]);

  const fetchAITeam = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "ALL") {
        params.append("status", filters.status);
      }
      if (filters.specialization && filters.specialization !== "ALL") {
        params.append("specialization", filters.specialization);
      }
      
      const response = await fetch(`/api/ai-team?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAiTeam(data.team || []);
      } else {
        console.warn("API недоступен, используем fallback данные");
        setAiTeam(demoAITeam);
      }
    } catch (error) {
      console.error("Error fetching AI team:", error);
      setAiTeam(demoAITeam);
    } finally {
      setLoading(false);
    }
  };

  const startChat = (member: AITeamMember) => {
    setSelectedMember(member);
    
    // Проверяем, есть ли уже чат с этим участником
    const existingChat = chats.find(chat => chat.member.id === member.id);
    if (!existingChat) {
      const newChat: AIChat = {
        member,
        messages: [
          {
            id: `welcome_${Date.now()}`,
            sender: "ai",
            message: `Привет! Я ${member.name}, ${member.specialization}. Чем могу помочь?`,
            timestamp: new Date().toISOString(),
          }
        ],
      };
      setChats(prev => [...prev, newChat]);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedMember) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      sender: "user" as const,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Добавляем сообщение пользователя
    setChats(prev => prev.map(chat => 
      chat.member.id === selectedMember.id 
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ));

    setMessage("");

    try {
      // Отправляем сообщение AI
      const response = await fetch("/api/ai-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          memberId: selectedMember.id,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: `ai_${Date.now()}`,
          sender: "ai" as const,
          message: data.response,
          timestamp: new Date().toISOString(),
        };

        setChats(prev => prev.map(chat => 
          chat.member.id === selectedMember.id 
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        ));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      AI_CTO: "bg-purple-500",
      AI_HR: "bg-pink-500",
      AI_PM: "bg-blue-500",
      AI_QA: "bg-green-500",
      AI_DEVOPS: "bg-orange-500",
      AI_DESIGNER: "bg-indigo-500",
      AI_ANALYST: "bg-cyan-500",
    };
    return colors[role as keyof typeof colors] || "bg-gray-500";
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      AI_CTO: Brain,
      AI_HR: Users,
      AI_PM: TrendingUp,
      AI_QA: CheckCircle,
      AI_DEVOPS: Zap,
      AI_DESIGNER: Star,
      AI_ANALYST: Activity,
    };
    return icons[role as keyof typeof icons] || Bot;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentChat = chats.find(chat => chat.member.id === selectedMember?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Development Team</h2>
          <p className="text-gray-400">Виртуальная команда разработки с ИИ-специалистами</p>
        </div>
        <Badge variant="outline" className="text-green-400 border-green-400">
          <Bot className="w-4 h-4 mr-1" />
          {aiTeam.filter(member => member.isActive).length} активных
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-white/70 text-sm">Статус:</label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все</SelectItem>
              <SelectItem value="ACTIVE">Активные</SelectItem>
              <SelectItem value="IDLE">Свободные</SelectItem>
              <SelectItem value="BUSY">Занятые</SelectItem>
              <SelectItem value="OFFLINE">Офлайн</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-white/70 text-sm">Специализация:</label>
          <Select 
            value={filters.specialization} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, specialization: value }))}
          >
            <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все</SelectItem>
              <SelectItem value="Техническая стратегия и архитектура">Архитектура</SelectItem>
              <SelectItem value="Поиск и анализ кандидатов">HR</SelectItem>
              <SelectItem value="Тестирование и QA">QA</SelectItem>
              <SelectItem value="Дизайн и UX">Дизайн</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team">Команда</TabsTrigger>
          <TabsTrigger value="chat">Чат</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiTeam.map((member) => {
              const IconComponent = getRoleIcon(member.role);
              return (
                <Card key={member.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={getRoleColor(member.role)}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{member.name}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {member.specialization}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={member.isActive ? "default" : "secondary"}
                        className={member.isActive ? "bg-green-500" : "bg-gray-500"}
                      >
                        {member.isActive ? "Онлайн" : "Офлайн"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-300 mb-2">Навыки:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Личность:</p>
                      <p className="text-xs text-gray-400">{member.personality.communication}</p>
                    </div>
                    <Button 
                      onClick={() => startChat(member)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Начать чат
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          {selectedMember ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className={getRoleColor(selectedMember.role)}>
                        {getRoleIcon(selectedMember.role)({ className: "h-4 w-4 text-white" })}
                      </AvatarFallback>
                    </Avatar>
                    Чат с {selectedMember.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-96 overflow-y-auto space-y-4">
                  {currentChat?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <div className="p-4 border-t border-white/10">
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Напишите сообщение..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={!message.trim()}>
                      Отправить
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-300">Роль:</p>
                    <Badge className={getRoleColor(selectedMember.role)}>
                      {selectedMember.role.replace("AI_", "")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Специализация:</p>
                    <p className="text-sm text-gray-400">{selectedMember.specialization}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Черты характера:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMember.personality.traits.map((trait, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Статус:</p>
                    <Badge 
                      variant={selectedMember.isActive ? "default" : "secondary"}
                      className={selectedMember.isActive ? "bg-green-500" : "bg-gray-500"}
                    >
                      {selectedMember.isActive ? "Онлайн" : "Офлайн"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Выберите участника команды для начала чата</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Активность команды
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Онлайн:</span>
                    <span className="text-sm text-white">{aiTeam.filter(m => m.isActive).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Всего:</span>
                    <span className="text-sm text-white">{aiTeam.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Чат статистика
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Активных чатов:</span>
                    <span className="text-sm text-white">{chats.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Сообщений:</span>
                    <span className="text-sm text-white">
                      {chats.reduce((total, chat) => total + chat.messages.length, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Последняя активность
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiTeam
                    .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
                    .slice(0, 3)
                    .map((member) => (
                      <div key={member.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">{member.name}:</span>
                        <span className="text-sm text-white">
                          {new Date(member.lastActive).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
