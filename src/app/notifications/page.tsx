"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Filter,
  Trash2
} from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export default function NotificationsPage() {
  const { data: session, isPending } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Задача завершена",
      message: "Задача 'Настроить аутентификацию' была успешно завершена",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 минут назад
      read: false,
      action: {
        label: "Посмотреть",
        url: "/tasks"
      }
    },
    {
      id: "2",
      type: "warning",
      title: "Приближается дедлайн",
      message: "Дедлайн задачи 'Разработать компонент Sidebar' истекает через 2 часа",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 часа назад
      read: false,
      action: {
        label: "Открыть задачу",
        url: "/tasks"
      }
    },
    {
      id: "3",
      type: "info",
      title: "Новый участник команды",
      message: "Пользователь John Doe присоединился к проекту 'DeadLine App'",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 день назад
      read: true,
      action: {
        label: "Управление командой",
        url: "/team"
      }
    },
    {
      id: "4",
      type: "error",
      title: "Ошибка интеграции",
      message: "Не удалось синхронизировать данные с внешним API",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 дня назад
      read: true
    }
  ]);

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-500/5";
      case "warning":
        return "border-l-yellow-500 bg-yellow-500/5";
      case "error":
        return "border-l-red-500 bg-red-500/5";
      default:
        return "border-l-blue-500 bg-blue-500/5";
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} мин. назад`;
    } else if (hours < 24) {
      return `${hours} ч. назад`;
    } else {
      return `${days} дн. назад`;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Уведомления</h1>
          <p className="text-white/60">
            {unreadCount > 0 ? `${unreadCount} непрочитанных уведомлений` : "Все уведомления прочитаны"}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 flex items-center glassmorphism"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" />
              <rect x="9" y="3" width="2" height="14" rx="1" fill="currentColor" />
            </svg>
            Отметить все как прочитанные
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter === "all" 
            ? "bg-white/10 text-white border-white/20" 
            : "text-white/60 hover:text-white hover:bg-white/10"
          }
        >
          Все ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("unread")}
          className={filter === "unread" 
            ? "bg-white/10 text-white border-white/20" 
            : "text-white/60 hover:text-white hover:bg-white/10"
          }
        >
          Непрочитанные ({unreadCount})
        </Button>
        <Button
          variant={filter === "read" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("read")}
          className={filter === "read" 
            ? "bg-white/10 text-white border-white/20" 
            : "text-white/60 hover:text-white hover:bg-white/10"
          }
        >
          Прочитанные ({notifications.length - unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardContent className="py-12 text-center text-white/60">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {filter === "unread" ? "Нет непрочитанных уведомлений" : 
                 filter === "read" ? "Нет прочитанных уведомлений" : 
                 "Нет уведомлений"}
              </p>
              <p className="text-sm">
                {filter === "unread" ? "Все уведомления прочитаны" : 
                 "Здесь будут отображаться ваши уведомления"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 ${
                !notification.read ? 'ring-1 ring-white/20' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-white/80'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-white/60 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-white/50">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                              Новое
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-auto"
                            title="Отметить как прочитанное"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {notification.action && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                          >
                            {notification.action.label}
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-white/60 hover:text-red-400 hover:bg-red-500/10 p-1 h-auto"
                          title="Удалить уведомление"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
