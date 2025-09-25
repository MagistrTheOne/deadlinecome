"use client";

export interface RealtimeEvent {
  id: string;
  type: "status_change" | "notification" | "activity" | "crisis" | "team_update";
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface RealtimeSubscription {
  id: string;
  type: string;
  callback: (event: RealtimeEvent) => void;
  userId?: string;
}

export class RealtimeManager {
  private static subscriptions: Map<string, RealtimeSubscription> = new Map();
  private static isConnected: boolean = false;
  private static reconnectAttempts: number = 0;
  private static maxReconnectAttempts: number = 5;
  private static reconnectDelay: number = 1000;
  private static pollInterval: number = 5000; // 5 секунд
  private static pollTimer: NodeJS.Timeout | null = null;

  /**
   * Подключается к реалтайм системе
   */
  static connect(): void {
    if (this.isConnected) return;

    console.log("🔄 Подключение к реалтайм системе...");
    this.isConnected = true;
    this.startPolling();
  }

  /**
   * Отключается от реалтайм системы
   */
  static disconnect(): void {
    console.log("🔌 Отключение от реалтайм системы...");
    this.isConnected = false;
    this.stopPolling();
  }

  /**
   * Подписывается на события
   */
  static subscribe(
    type: string, 
    callback: (event: RealtimeEvent) => void, 
    userId?: string
  ): string {
    const subscriptionId = crypto.randomUUID();
    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      type,
      callback,
      userId
    };

    this.subscriptions.set(subscriptionId, subscription);
    console.log(`📡 Подписка на события типа: ${type}`);

    // Если это первая подписка, подключаемся
    if (this.subscriptions.size === 1) {
      this.connect();
    }

    return subscriptionId;
  }

  /**
   * Отписывается от событий
   */
  static unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      this.subscriptions.delete(subscriptionId);
      console.log(`📡 Отписка от событий типа: ${subscription.type}`);

      // Если подписок больше нет, отключаемся
      if (this.subscriptions.size === 0) {
        this.disconnect();
      }
    }
  }

  /**
   * Отправляет событие
   */
  static emit(type: string, data: any, userId?: string): void {
    const event: RealtimeEvent = {
      id: crypto.randomUUID(),
      type: type as any,
      data,
      timestamp: new Date(),
      userId
    };

    this.notifySubscribers(event);
  }

  /**
   * Уведомляет подписчиков о событии
   */
  private static notifySubscribers(event: RealtimeEvent): void {
    this.subscriptions.forEach((subscription) => {
      if (subscription.type === event.type || subscription.type === "*") {
        // Проверяем, предназначено ли событие для конкретного пользователя
        if (!event.userId || !subscription.userId || event.userId === subscription.userId) {
          try {
            subscription.callback(event);
          } catch (error) {
            console.error("Ошибка в callback подписки:", error);
          }
        }
      }
    });
  }

  /**
   * Запускает polling для получения обновлений
   */
  private static startPolling(): void {
    if (this.pollTimer) return;

    this.pollTimer = setInterval(async () => {
      try {
        await this.fetchUpdates();
      } catch (error) {
        console.error("Ошибка получения обновлений:", error);
        this.handleConnectionError();
      }
    }, this.pollInterval);
  }

  /**
   * Останавливает polling
   */
  private static stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Получает обновления с сервера
   */
  private static async fetchUpdates(): Promise<void> {
    const response = await fetch('/api/realtime/updates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updates = await response.json();
    
    if (updates.events && Array.isArray(updates.events)) {
      updates.events.forEach((event: any) => {
        const realtimeEvent: RealtimeEvent = {
          ...event,
          timestamp: new Date(event.timestamp)
        };
        this.notifySubscribers(realtimeEvent);
      });
    }

    // Сбрасываем счетчик попыток переподключения при успешном запросе
    this.reconnectAttempts = 0;
  }

  /**
   * Обрабатывает ошибки подключения
   */
  private static handleConnectionError(): void {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Превышено максимальное количество попыток переподключения");
      this.disconnect();
      return;
    }

    console.log(`🔄 Попытка переподключения ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      if (this.isConnected) {
        this.startPolling();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Получает статус подключения
   */
  static getConnectionStatus(): {
    connected: boolean;
    subscriptions: number;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      subscriptions: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Отправляет событие на сервер
   */
  static async sendEvent(type: string, data: any, userId?: string): Promise<void> {
    try {
      const response = await fetch('/api/realtime/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          userId,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Ошибка отправки события:", error);
    }
  }

  /**
   * Получает историю событий
   */
  static async getEventHistory(limit: number = 50): Promise<RealtimeEvent[]> {
    try {
      const response = await fetch(`/api/realtime/history?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.events.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));
    } catch (error) {
      console.error("Ошибка получения истории событий:", error);
      return [];
    }
  }
}
