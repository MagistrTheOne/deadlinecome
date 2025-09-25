"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MessageSquare, 
  Edit3, 
  Eye, 
  Clock,
  Zap,
  Globe,
  Bell,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  currentActivity: string;
  lastSeen: Date;
  isTyping?: boolean;
}

interface LiveActivity {
  id: string;
  type: "task_edit" | "comment_add" | "status_change" | "file_upload";
  user: string;
  description: string;
  timestamp: Date;
  target?: string;
}

interface CollaborationSession {
  id: string;
  title: string;
  participants: number;
  isActive: boolean;
  lastActivity: Date;
}

export function RealTimeCollaboration() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Симуляция real-time данных
    loadOnlineUsers();
    loadLiveActivities();
    loadActiveSessions();
    
    // Симуляция обновлений в реальном времени
    const interval = setInterval(() => {
      updateLiveActivities();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadOnlineUsers = () => {
    const mockUsers: OnlineUser[] = [
      {
        id: "1",
        name: "Алексей Петров",
        role: "Frontend Developer",
        currentActivity: "Редактирует компонент авторизации",
        lastSeen: new Date(),
        isTyping: true
      },
      {
        id: "2",
        name: "Мария Сидорова", 
        role: "Backend Developer",
        currentActivity: "Просматривает API документацию",
        lastSeen: new Date(Date.now() - 1000 * 60 * 2),
        isTyping: false
      },
      {
        id: "3",
        name: "Дмитрий Козлов",
        role: "Full-stack Developer", 
        currentActivity: "Комментирует задачу #123",
        lastSeen: new Date(Date.now() - 1000 * 30),
        isTyping: true
      },
      {
        id: "4",
        name: "Анна Волкова",
        role: "QA Engineer",
        currentActivity: "Тестирует новую функциональность",
        lastSeen: new Date(Date.now() - 1000 * 60 * 5),
        isTyping: false
      }
    ];
    
    setOnlineUsers(mockUsers);
  };

  const loadLiveActivities = () => {
    const mockActivities: LiveActivity[] = [
      {
        id: "1",
        type: "task_edit",
        user: "Алексей Петров",
        description: "обновил задачу 'Создать компонент авторизации'",
        timestamp: new Date(Date.now() - 1000 * 30),
        target: "TASK-123"
      },
      {
        id: "2",
        type: "comment_add",
        user: "Дмитрий Козлов",
        description: "добавил комментарий к задаче 'Настроить API'",
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        target: "TASK-124"
      },
      {
        id: "3",
        type: "status_change",
        user: "Мария Сидорова",
        description: "изменил статус задачи 'Интеграция с БД' на 'В работе'",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        target: "TASK-125"
      }
    ];
    
    setLiveActivities(mockActivities);
  };

  const loadActiveSessions = () => {
    const mockSessions: CollaborationSession[] = [
      {
        id: "1",
        title: "Планирование спринта #15",
        participants: 4,
        isActive: true,
        lastActivity: new Date(Date.now() - 1000 * 60 * 10)
      },
      {
        id: "2", 
        title: "Code Review - Auth Module",
        participants: 2,
        isActive: true,
        lastActivity: new Date(Date.now() - 1000 * 60 * 5)
      },
      {
        id: "3",
        title: "Обсуждение архитектуры API",
        participants: 3,
        isActive: false,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2)
      }
    ];
    
    setActiveSessions(mockSessions);
  };

  const updateLiveActivities = () => {
    // Проверяем, что есть онлайн пользователи
    if (onlineUsers.length === 0) return;
    
    // Симуляция новых активностей
    const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
    const newActivity: LiveActivity = {
      id: Date.now().toString(),
      type: "task_edit",
      user: randomUser?.name || "Неизвестный пользователь",
      description: "обновил задачу",
      timestamp: new Date()
    };
    
    setLiveActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_edit":
        return <Edit3 className="h-4 w-4 text-white" />;
      case "comment_add":
        return <MessageSquare className="h-4 w-4 text-white" />;
      case "status_change":
        return <CheckCircle className="h-4 w-4 text-white" />;
      case "file_upload":
        return <Globe className="h-4 w-4 text-white" />;
      default:
        return <Zap className="h-4 w-4 text-white" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task_edit":
        return "bg-black/50 text-white border-white/30";
      case "comment_add":
        return "bg-black/50 text-white border-white/30";
      case "status_change":
        return "bg-black/50 text-white border-white/30";
      case "file_upload":
        return "bg-black/50 text-white border-white/30";
      default:
        return "bg-black/50 text-white border-white/30";
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return "только что";
    if (minutes === 1) return "1 мин назад";
    return `${minutes} мин назад`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Real-time коллаборация
          </CardTitle>
          <CardDescription className="text-white/60">
            Живые обновления и совместная работа в реальном времени
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-white' : 'bg-white/30'}`}></div>
              <span className="text-white">
                {isConnected ? 'Подключено' : 'Отключено'}
              </span>
            </div>
            <Badge className="bg-black/50 text-white border-white/30">
              <Zap className="mr-1 h-3 w-3" />
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Online Users */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Онлайн участники ({onlineUsers.length})
          </CardTitle>
          <CardDescription className="text-white/60">
            Кто сейчас работает в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg">
                <div className="relative">
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-black text-white text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border border-black"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{user.name}</span>
                    {user.isTyping && (
                      <Badge className="bg-black/50 text-white border-white/30 text-xs">
                        <Edit3 className="mr-1 h-2 w-2" />
                        печатает
                      </Badge>
                    )}
                  </div>
                  <p className="text-white/60 text-xs">{user.role}</p>
                  <p className="text-white/70 text-xs">{user.currentActivity}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-white/60 text-xs">
                    {formatTimeAgo(user.lastSeen)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Activities */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Живая активность
          </CardTitle>
          <CardDescription className="text-white/60">
            Последние действия участников команды
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {liveActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{activity.user}</span>
                    <Badge className={getActivityColor(activity.type)}>
                      {activity.type === "task_edit" ? "Редактирование" :
                       activity.type === "comment_add" ? "Комментарий" :
                       activity.type === "status_change" ? "Изменение статуса" :
                       activity.type === "file_upload" ? "Загрузка файла" : "Активность"}
                    </Badge>
                  </div>
                  <p className="text-white/70 text-sm">{activity.description}</p>
                  {activity.target && (
                    <p className="text-white/60 text-xs mt-1">#{activity.target}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-white/60 text-xs">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Активные сессии
          </CardTitle>
          <CardDescription className="text-white/60">
            Текущие совместные работы и обсуждения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${session.isActive ? 'bg-white' : 'bg-white/30'}`}></div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{session.title}</h4>
                    <p className="text-white/60 text-xs">
                      {session.participants} участников • {formatTimeAgo(session.lastActivity)}
                    </p>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white border border-white/20 hover:border-white/30"
                >
                  {session.isActive ? "Присоединиться" : "Просмотреть"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
