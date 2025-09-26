"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Award, 
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  FolderOpen,
  BarChart3,
  RefreshCw,
  Settings,
  Edit
} from "lucide-react";
import { SlideInAnimation, GlowEffect, HoverGlow } from "./premium-animations";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: {
    name: string;
    level: "junior" | "middle" | "senior" | "lead";
    department: string;
    skills: string[];
  };
  stats: {
    completedTasks: number;
    totalTasks: number;
    productivity: number;
    streak: number;
    rating: number;
    hoursWorked: number;
  };
  currentTasks: Array<{
    id: string;
    title: string;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate?: string;
    project: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: Date;
    project?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: Date;
  }>;
  teamMood: {
    personal: string;
    stress: number;
    energy: number;
    satisfaction: number;
  };
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fallback demo данные
  const demoProfile: UserProfile = {
    id: "user-1",
    name: "MagistrTheOne",
    email: "maxonyushko71@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
    role: {
      name: "Full-Stack Developer & AI Engineer",
      level: "lead",
      department: "AI Development",
      skills: ["React", "Next.js", "TypeScript", "AI/ML", "Node.js", "Python"]
    },
    stats: {
      completedTasks: 47,
      totalTasks: 52,
      productivity: 87,
      streak: 12,
      rating: 4.9,
      hoursWorked: 156
    },
    currentTasks: [
      {
        id: "task-1",
        title: "Реализовать AI-ассистента Василия",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        project: "DeadLine"
      },
      {
        id: "task-2",
        title: "Настроить WebSocket для real-time",
        status: "DONE",
        priority: "HIGH",
        project: "DeadLine"
      },
      {
        id: "task-3",
        title: "Создать систему ролей",
        status: "DONE",
        priority: "MEDIUM",
        project: "DeadLine"
      },
      {
        id: "task-4",
        title: "Оптимизировать производительность",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        project: "DeadLine"
      }
    ],
    recentActivity: [
      {
        id: "activity-1",
        action: "Завершил задачу 'Настроить WebSocket'",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        project: "DeadLine"
      },
      {
        id: "activity-2",
        action: "Добавил комментарий к задаче 'AI-ассистент'",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        project: "DeadLine"
      },
      {
        id: "activity-3",
        action: "Создал новый проект 'DeadLine'",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        project: "DeadLine"
      }
    ],
    achievements: [
      {
        id: "ach-1",
        title: "AI Pioneer",
        description: "Создал первую AI-команду разработки",
        icon: "🤖",
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ach-2",
        title: "Productivity Master",
        description: "12 дней подряд высокой продуктивности",
        icon: "⚡",
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ach-3",
        title: "Team Player",
        description: "Помог 5+ участникам команды",
        icon: "👥",
        earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      }
    ],
    teamMood: {
      personal: "excited",
      stress: 25,
      energy: 85,
      satisfaction: 92
    }
  };

  useEffect(() => {
    fetchUserProfile();
    
    // Обновляем данные каждые 30 секунд
    const interval = setInterval(() => {
      fetchUserProfile();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Получаем профиль пользователя через API
      const response = await fetch('/api/user/profile?userId=user-1');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        // Fallback на demo данные
        setProfile(demoProfile);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      setProfile(demoProfile);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "IN_PROGRESS":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "DONE":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "BLOCKED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "TODO":
        return "К выполнению";
      case "IN_PROGRESS":
        return "В работе";
      case "DONE":
        return "Выполнено";
      case "BLOCKED":
        return "Заблокировано";
      default:
        return "Неизвестно";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "URGENT":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "excited":
        return "🚀";
      case "happy":
        return "😊";
      case "focused":
        return "🎯";
      case "tired":
        return "😴";
      default:
        return "😐";
    }
  };

  if (loading && !profile) {
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

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Основная информация профиля */}
      <SlideInAnimation direction="up" delay={0}>
        <GlowEffect intensity="medium" color="blue">
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20 animate-glow-pulse">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Мой профиль
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchUserProfile}
                className="text-white/60 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-white/60">
            Обновлено: {lastUpdated.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Аватар и основная информация */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border-2 border-white/20">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="bg-white/10 text-white text-xl">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
              <p className="text-white/60 mb-2">{profile.email}</p>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-white/10 text-white border-white/20">
                  {profile.role.name}
                </Badge>
                <Badge className="bg-white/10 text-white border-white/20">
                  {profile.role.level.toUpperCase()}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.role.skills.map((skill, index) => (
                  <Badge key={index} className="bg-white/5 text-white/80 border-white/10 text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-white">{profile.stats.completedTasks}</div>
              <div className="text-xs text-white/60">Задач выполнено</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-white">{profile.stats.productivity}%</div>
              <div className="text-xs text-white/60">Продуктивность</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-white">{profile.stats.streak}</div>
              <div className="text-xs text-white/60">Дней подряд</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-white">{profile.stats.rating}</div>
              <div className="text-xs text-white/60">Рейтинг</div>
            </div>
          </div>

          {/* Прогресс задач */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Прогресс задач</span>
              <span className="text-white/60 text-sm">
                {profile.stats.completedTasks}/{profile.stats.totalTasks}
              </span>
            </div>
            <Progress 
              value={(profile.stats.completedTasks / profile.stats.totalTasks) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
          </Card>
        </GlowEffect>
      </SlideInAnimation>

      {/* Текущие задачи */}
      <SlideInAnimation direction="up" delay={200}>
        <HoverGlow>
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Текущие задачи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profile.currentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium">{task.title}</h4>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                    <span className="text-white/60 text-sm">{task.project}</span>
                    {task.dueDate && (
                      <span className="text-white/60 text-sm">
                        • {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
          </Card>
        </HoverGlow>
      </SlideInAnimation>

      {/* Настроение и состояние */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Мое состояние
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getMoodIcon(profile.teamMood.personal)}</span>
              <div>
                <div className="text-white font-medium capitalize">{profile.teamMood.personal}</div>
                <div className="text-white/60 text-sm">Настроение</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Стресс</span>
                  <span className="text-white">{profile.teamMood.stress}%</span>
                </div>
                <Progress value={profile.teamMood.stress} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Энергия</span>
                  <span className="text-white">{profile.teamMood.energy}%</span>
                </div>
                <Progress value={profile.teamMood.energy} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Удовлетворенность</span>
                  <span className="text-white">{profile.teamMood.satisfaction}%</span>
                </div>
                <Progress value={profile.teamMood.satisfaction} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5" />
              Достижения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{achievement.title}</div>
                    <div className="text-white/60 text-xs">{achievement.description}</div>
                    <div className="text-white/40 text-xs">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Последняя активность */}
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Последняя активность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profile.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-white text-sm">{activity.action}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/60 text-xs">
                      {activity.timestamp.toLocaleString()}
                    </span>
                    {activity.project && (
                      <>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60 text-xs">{activity.project}</span>
                      </>
                    )}
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
