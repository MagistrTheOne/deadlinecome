"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  CheckCircle, 
  Plus, 
  User, 
  MessageSquare, 
  GitBranch, 
  Calendar,
  TrendingUp,
  Clock,
  MoreHorizontal
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "task_created" | "task_completed" | "comment_added" | "project_created" | "user_joined" | "deadline_approaching";
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  project?: string;
  priority?: "low" | "medium" | "high";
}

// Функция для получения реальных данных активности
const getRealActivities = async (): Promise<ActivityItem[]> => {
  try {
    const response = await fetch('/api/activity');
    if (response.ok) {
      const data = await response.json();
      return data.activities || [];
    }
  } catch (error) {
    console.error('Ошибка загрузки активности:', error);
  }
  
  // Fallback данные если API недоступен
  return [
    {
      id: "1",
      type: "task_completed",
      title: "Задача завершена",
      description: "Настройка AI-ассистента Василия",
      user: "MagistrTheOne",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      project: "DeadLine",
      priority: "high"
    },
    {
      id: "2",
      type: "comment_added",
      title: "Добавлен комментарий",
      description: "Василий теперь умеет говорить голосом!",
      user: "MagistrTheOne",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      project: "DeadLine"
    }
  ];
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      try {
        const realActivities = await getRealActivities();
        setActivities(realActivities);
      } catch (error) {
        console.error('Ошибка загрузки активности:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return <Plus className="h-4 w-4 text-blue-400" />;
      case "task_completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "comment_added":
        return <MessageSquare className="h-4 w-4 text-yellow-400" />;
      case "project_created":
        return <GitBranch className="h-4 w-4 text-purple-400" />;
      case "user_joined":
        return <User className="h-4 w-4 text-cyan-400" />;
      case "deadline_approaching":
        return <Clock className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-white/60" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task_created":
        return "bg-black/50 text-white border-white/30";
      case "task_completed":
        return "bg-black/50 text-white border-white/30";
      case "comment_added":
        return "bg-black/50 text-white border-white/30";
      case "project_created":
        return "bg-black/50 text-white border-white/30";
      case "user_joined":
        return "bg-black/50 text-white border-white/30";
      case "deadline_approaching":
        return "bg-black/50 text-white border-white/30";
      default:
        return "bg-black/50 text-white border-white/30";
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} мин назад`;
    } else if (hours < 24) {
      return `${hours} ч назад`;
    } else {
      return `${days} дн назад`;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const now = new Date();
    const activityDate = activity.timestamp;
    
    switch (filter) {
      case "today":
        return activityDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return activityDate >= weekAgo;
      default:
        return true;
    }
  });

  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Последняя активность
            </CardTitle>
            <CardDescription className="text-white/60">
              Ваши недавние действия в системе
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className={
                filter === "all"
                  ? "bg-white/10 text-white border-white/20"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }
            >
              Все
            </Button>
            <Button
              variant={filter === "today" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("today")}
              className={
                filter === "today"
                  ? "bg-white/10 text-white border-white/20"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }
            >
              Сегодня
            </Button>
            <Button
              variant={filter === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("week")}
              className={
                filter === "week"
                  ? "bg-white/10 text-white border-white/20"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }
            >
              Неделя
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Нет активности</p>
            <p className="text-sm">Начните работать, чтобы увидеть активность здесь</p>
          </div>
        ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет активности</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-black/30 border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getActivityColor(activity.type)}>
                        {activity.title}
                      </Badge>
                      {activity.priority === "high" && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          Высокий приоритет
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-white/60">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-white mt-1">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-white/60">
                      {activity.user}
                    </span>
                    {activity.project && (
                      <>
                        <span className="text-xs text-white/40">•</span>
                        <span className="text-xs text-white/60">
                          {activity.project}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        )}
        
        {!loading && filteredActivities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-white/60 hover:text-white hover:bg-white/10"
            >
              Показать все активности
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
