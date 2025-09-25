"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  AlertCircle,
  Zap,
  Settings,
  Trash2
} from "lucide-react";
import { NotificationManager, Notification } from "@/lib/notifications";
import { RealtimeManager } from "@/lib/realtime";

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Загружаем уведомления из localStorage
    NotificationManager.loadFromStorage();
    setNotifications(NotificationManager.getNotifications());
    setUnreadCount(NotificationManager.getUnreadNotifications().length);

    // Подписываемся на изменения
    const unsubscribe = NotificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(NotificationManager.getUnreadNotifications().length);
    });

    // Очищаем старые уведомления
    NotificationManager.cleanupOldNotifications();

    // Подписываемся на реалтайм уведомления
    const realtimeSubscriptionId = RealtimeManager.subscribe("notification", (event) => {
      if (event.data.notification) {
        setNotifications(NotificationManager.getNotifications());
        setUnreadCount(NotificationManager.getUnreadNotifications().length);
      }
    });

    return () => {
      unsubscribe();
      RealtimeManager.unsubscribe(realtimeSubscriptionId);
    };
  }, []);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "crisis":
        return <Zap className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-green-500/20 bg-green-500/10";
      case "warning":
        return "border-yellow-500/20 bg-yellow-500/10";
      case "error":
        return "border-red-500/20 bg-red-500/10";
      case "crisis":
        return "border-red-500/30 bg-red-500/20";
      default:
        return "border-blue-500/20 bg-blue-500/10";
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    NotificationManager.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    NotificationManager.markAllAsRead();
  };

  const handleRemoveNotification = (notificationId: string) => {
    NotificationManager.removeNotification(notificationId);
  };

  const handleAction = (action: string, notificationId: string) => {
    // Обрабатываем действия уведомлений
    console.log(`Выполняем действие: ${action} для уведомления: ${notificationId}`);
    
    // Здесь можно добавить логику для различных действий
    switch (action) {
      case "view":
        // Переход к соответствующей странице
        break;
      case "dismiss":
        handleRemoveNotification(notificationId);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      {/* Кнопка уведомлений */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-white/60 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Панель уведомлений */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-h-96 overflow-hidden z-50">
          <Card className="bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Уведомления</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-white/60 hover:text-white text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Прочитать все
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {unreadCount > 0 && (
                <CardDescription className="text-white/60">
                  {unreadCount} непрочитанных уведомлений
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="h-12 w-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/60">Нет уведомлений</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                          !notification.read ? "bg-white/5" : "bg-transparent"
                        } hover:bg-white/5 transition-colors`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? "text-white" : "text-white/70"
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveNotification(notification.id)}
                                  className="h-6 w-6 p-0 text-white/40 hover:text-white/60"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-white/60 text-xs mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-white/40 text-xs">
                                {notification.timestamp.toLocaleTimeString()}
                              </span>
                              <div className="flex items-center gap-1">
                                {notification.actions?.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant={action.variant === "destructive" ? "destructive" : "outline"}
                                    size="sm"
                                    onClick={() => handleAction(action.action, notification.id)}
                                    className="h-6 text-xs px-2"
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="h-6 text-xs px-2 text-white/60 hover:text-white"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
