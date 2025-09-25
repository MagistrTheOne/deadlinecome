"use client";

import { RealtimeManager } from "@/lib/realtime";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error" | "crisis";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  actions?: Array<{
    label: string;
    action: string;
    variant: "default" | "destructive" | "outline";
  }>;
  userId?: string;
  source: "system" | "ai" | "team" | "project";
}

export interface NotificationSettings {
  userId: string;
  email: boolean;
  push: boolean;
  sound: boolean;
  types: {
    info: boolean;
    success: boolean;
    warning: boolean;
    error: boolean;
    crisis: boolean;
  };
}

export class NotificationManager {
  private static notifications: Notification[] = [];
  private static settings: Map<string, NotificationSettings> = new Map();
  private static listeners: Set<(notifications: Notification[]) => void> = new Set();

  /**
   * Добавляет новое уведомление
   */
  static addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): Notification {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification); // Добавляем в начало
    
    // Ограничиваем количество уведомлений
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Сохраняем в localStorage
    this.saveToStorage();

    // Уведомляем слушателей
    this.notifyListeners();

    // Отправляем реалтайм событие
    RealtimeManager.emit("notification", {
      notification: newNotification,
      action: "created"
    });

    // Воспроизводим звук если включен
    if (this.shouldPlaySound(newNotification)) {
      this.playNotificationSound(newNotification.type);
    }

    return newNotification;
  }

  /**
   * Отмечает уведомление как прочитанное
   */
  static markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Отмечает все уведомления как прочитанные
   */
  static markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Удаляет уведомление
   */
  static removeNotification(notificationId: string): boolean {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.saveToStorage();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Получает все уведомления
   */
  static getNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Получает непрочитанные уведомления
   */
  static getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Получает уведомления по типу
   */
  static getNotificationsByType(type: Notification["type"]): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  /**
   * Подписывается на изменения уведомлений
   */
  static subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    
    // Возвращаем функцию отписки
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Уведомляет всех слушателей
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        console.error("Ошибка в слушателе уведомлений:", error);
      }
    });
  }

  /**
   * Сохраняет уведомления в localStorage
   */
  private static saveToStorage(): void {
    try {
      localStorage.setItem("notifications", JSON.stringify(this.notifications));
    } catch (error) {
      console.error("Ошибка сохранения уведомлений:", error);
    }
  }

  /**
   * Загружает уведомления из localStorage
   */
  static loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error("Ошибка загрузки уведомлений:", error);
    }
  }

  /**
   * Проверяет, нужно ли воспроизводить звук
   */
  private static shouldPlaySound(notification: Notification): boolean {
    // Проверяем настройки пользователя
    const settings = this.settings.get(notification.userId || "default");
    if (settings && !settings.sound) return false;

    // Не воспроизводим звук для информационных уведомлений
    if (notification.type === "info") return false;

    return true;
  }

  /**
   * Воспроизводит звук уведомления
   */
  private static playNotificationSound(type: Notification["type"]): void {
    try {
      // Создаем аудио контекст для генерации звука
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Разные частоты для разных типов уведомлений
      const frequencies = {
        success: 800,
        warning: 600,
        error: 400,
        crisis: 200
      } as const;

      // Проверяем, что тип есть в списке частот, иначе используем 500 Гц
      const freq = frequencies[type as keyof typeof frequencies] ?? 500;
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Ошибка воспроизведения звука:", error);
    }
  }

  /**
   * Создает системное уведомление
   */
  static createSystemNotification(
    type: Notification["type"],
    title: string,
    message: string,
    persistent: boolean = false
  ): Notification {
    return this.addNotification({
      type,
      title,
      message,
      persistent,
      source: "system"
    });
  }

  /**
   * Создает AI уведомление
   */
  static createAINotification(
    type: Notification["type"],
    title: string,
    message: string,
    actions?: Notification["actions"]
  ): Notification {
    return this.addNotification({
      type,
      title,
      message,
      persistent: type === "crisis",
      source: "ai",
      actions
    });
  }

  /**
   * Создает командное уведомление
   */
  static createTeamNotification(
    type: Notification["type"],
    title: string,
    message: string,
    userId?: string
  ): Notification {
    return this.addNotification({
      type,
      title,
      message,
      persistent: false,
      source: "team",
      userId
    });
  }

  /**
   * Получает статистику уведомлений
   */
  static getNotificationStats(): {
    total: number;
    unread: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    this.notifications.forEach(notification => {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
      bySource[notification.source] = (bySource[notification.source] || 0) + 1;
    });

    return {
      total: this.notifications.length,
      unread: this.getUnreadNotifications().length,
      byType,
      bySource
    };
  }

  /**
   * Очищает старые уведомления
   */
  static cleanupOldNotifications(daysOld: number = 7): void {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const initialLength = this.notifications.length;
    
    this.notifications = this.notifications.filter(n => 
      n.timestamp > cutoffDate || n.persistent
    );
    
    if (this.notifications.length !== initialLength) {
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Настраивает параметры уведомлений для пользователя
   */
  static setUserSettings(userId: string, settings: Partial<NotificationSettings>): void {
    const currentSettings = this.settings.get(userId) || {
      userId,
      email: true,
      push: true,
      sound: true,
      types: {
        info: true,
        success: true,
        warning: true,
        error: true,
        crisis: true
      }
    };

    this.settings.set(userId, { ...currentSettings, ...settings });
  }

  /**
   * Получает настройки пользователя
   */
  static getUserSettings(userId: string): NotificationSettings | null {
    return this.settings.get(userId) || null;
  }
}
