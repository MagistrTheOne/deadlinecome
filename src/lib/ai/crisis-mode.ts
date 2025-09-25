"use client";

export interface CrisisAlert {
  id: string;
  type: "burnout" | "deadline" | "technical" | "team" | "quality" | "security";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  affectedUsers: string[];
  detectedAt: Date;
  resolved: boolean;
  resolutionActions: string[];
  escalated: boolean;
}

export interface CrisisResponse {
  id: string;
  alertId: string;
  type: "immediate" | "short_term" | "long_term";
  actions: CrisisAction[];
  priority: "urgent" | "high" | "medium" | "low";
  estimatedTime: number; // в часах
  assignedTo: string[];
  status: "pending" | "in_progress" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}

export interface CrisisAction {
  id: string;
  title: string;
  description: string;
  type: "support" | "resource" | "process" | "communication" | "technical";
  urgency: "immediate" | "urgent" | "important" | "normal";
  estimatedTime: number; // в минутах
  completed: boolean;
  assignedTo?: string;
  completedAt?: Date;
}

export interface CrisisSupportMessage {
  id: string;
  userId: string;
  type: "motivation" | "guidance" | "resource" | "escalation" | "relief";
  content: string;
  tone: "urgent" | "supportive" | "encouraging" | "calm" | "energetic";
  priority: "critical" | "high" | "medium" | "low";
  sentAt: Date;
  delivered: boolean;
}

export interface CrisisMetrics {
  activeCrises: number;
  resolvedCrises: number;
  averageResolutionTime: number; // в часах
  teamStressLevel: number; // 0-1
  productivityImpact: number; // 0-1
  supportMessagesSent: number;
  escalationRate: number; // 0-1
}

export class CrisisMode {
  private static activeAlerts: CrisisAlert[] = [];
  private static crisisResponses: CrisisResponse[] = [];
  private static supportMessages: CrisisSupportMessage[] = [];
  private static crisisModeActive: boolean = false;
  private static lastCrisisCheck: Date = new Date();

  /**
   * Активирует режим кризиса
   */
  static activateCrisisMode(): void {
    this.crisisModeActive = true;
    console.log("🚨 РЕЖИМ КРИЗИСА АКТИВИРОВАН");
    
    // Отправляем уведомления всем участникам
    this.sendCrisisNotifications();
  }

  /**
   * Деактивирует режим кризиса
   */
  static deactivateCrisisMode(): void {
    this.crisisModeActive = false;
    console.log("✅ Режим кризиса деактивирован");
  }

  /**
   * Проверяет кризисные ситуации
   */
  static detectCrisisSituations(data: {
    teamStress: number;
    productivity: number;
    deadlinePressure: number;
    bugCount: number;
    teamMood: string;
    workload: number;
    userActivity: any[];
  }): CrisisAlert[] {
    const newAlerts: CrisisAlert[] = [];

    // Проверяем выгорание команды
    if (data.teamStress > 0.9 || data.teamMood === "stressed") {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: "burnout",
        severity: "critical",
        title: "Критический уровень стресса команды",
        description: "Обнаружены признаки массового выгорания в команде",
        affectedUsers: data.userActivity.map(u => u.userId),
        detectedAt: new Date(),
        resolved: false,
        resolutionActions: [],
        escalated: false
      });
    }

    // Проверяем давление дедлайнов
    if (data.deadlinePressure > 0.8) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: "deadline",
        severity: "high",
        title: "Критическое давление дедлайнов",
        description: "Высокий риск срыва сроков проекта",
        affectedUsers: data.userActivity.map(u => u.userId),
        detectedAt: new Date(),
        resolved: false,
        resolutionActions: [],
        escalated: false
      });
    }

    // Проверяем технические проблемы
    if (data.bugCount > 10) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: "technical",
        severity: "high",
        title: "Критическое количество багов",
        description: "Обнаружено аномально высокое количество багов",
        affectedUsers: data.userActivity.map(u => u.userId),
        detectedAt: new Date(),
        resolved: false,
        resolutionActions: [],
        escalated: false
      });
    }

    // Проверяем падение продуктивности
    if (data.productivity < 0.3) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: "quality",
        severity: "medium",
        title: "Критическое падение продуктивности",
        description: "Продуктивность команды упала ниже критического уровня",
        affectedUsers: data.userActivity.map(u => u.userId),
        detectedAt: new Date(),
        resolved: false,
        resolutionActions: [],
        escalated: false
      });
    }

    // Проверяем перегрузку
    if (data.workload > 0.95) {
      newAlerts.push({
        id: crypto.randomUUID(),
        type: "team",
        severity: "high",
        title: "Критическая перегрузка команды",
        description: "Команда работает на пределе возможностей",
        affectedUsers: data.userActivity.map(u => u.userId),
        detectedAt: new Date(),
        resolved: false,
        resolutionActions: [],
        escalated: false
      });
    }

    // Добавляем новые алерты
    this.activeAlerts.push(...newAlerts);

    // Если есть критические алерты, активируем режим кризиса
    if (newAlerts.some(alert => alert.severity === "critical")) {
      this.activateCrisisMode();
    }

    return newAlerts;
  }

  /**
   * Создает план реагирования на кризис
   */
  static createCrisisResponse(alertId: string): CrisisResponse {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (!alert) throw new Error("Alert not found");

    const actions: CrisisAction[] = [];

    switch (alert.type) {
      case "burnout":
        actions.push(
          {
            id: crypto.randomUUID(),
            title: "Немедленная поддержка команды",
            description: "Отправить сообщения поддержки всем участникам",
            type: "support",
            urgency: "immediate",
            estimatedTime: 15,
            completed: false
          },
          {
            id: crypto.randomUUID(),
            title: "Снижение нагрузки",
            description: "Перераспределить задачи и снизить давление",
            type: "process",
            urgency: "urgent",
            estimatedTime: 60,
            completed: false
          },
          {
            id: crypto.randomUUID(),
            title: "Организация отдыха",
            description: "Запланировать время для восстановления команды",
            type: "process",
            urgency: "important",
            estimatedTime: 30,
            completed: false
          }
        );
        break;

      case "deadline":
        actions.push(
          {
            id: crypto.randomUUID(),
            title: "Приоритизация задач",
            description: "Пересмотреть приоритеты и убрать несущественные задачи",
            type: "process",
            urgency: "immediate",
            estimatedTime: 45,
            completed: false
          },
          {
            id: crypto.randomUUID(),
            title: "Привлечение дополнительных ресурсов",
            description: "Найти дополнительных разработчиков или консультантов",
            type: "resource",
            urgency: "urgent",
            estimatedTime: 120,
            completed: false
          },
          {
            id: crypto.randomUUID(),
            title: "Коммуникация с заказчиком",
            description: "Обсудить возможность корректировки сроков",
            type: "communication",
            urgency: "urgent",
            estimatedTime: 30,
            completed: false
          }
        );
        break;

      case "technical":
        actions.push(
          {
            id: crypto.randomUUID(),
            title: "Экстренное исправление багов",
            description: "Сосредоточиться на исправлении критических багов",
            type: "technical",
            urgency: "immediate",
            estimatedTime: 180,
            completed: false
          },
          {
            id: crypto.randomUUID(),
            title: "Усиление тестирования",
            description: "Внедрить дополнительные проверки качества",
            type: "process",
            urgency: "urgent",
            estimatedTime: 90,
            completed: false
          }
        );
        break;

      case "team":
        actions.push(
          {
            id: crypto.randomUUID(),
            title: "Перераспределение нагрузки",
            description: "Равномерно распределить задачи между участниками",
            type: "process",
            urgency: "immediate",
            estimatedTime: 60,
            completed: false
          },
          {
            id: crypto.randomUUID(),
            title: "Привлечение дополнительной команды",
            description: "Найти временных разработчиков для помощи",
            type: "resource",
            urgency: "urgent",
            estimatedTime: 240,
            completed: false
          }
        );
        break;
    }

    const response: CrisisResponse = {
      id: crypto.randomUUID(),
      alertId,
      type: "immediate",
      actions,
      priority: alert.severity === "critical" ? "urgent" : "high",
      estimatedTime: actions.reduce((sum, action) => sum + action.estimatedTime, 0) / 60,
      assignedTo: alert.affectedUsers,
      status: "pending",
      createdAt: new Date()
    };

    this.crisisResponses.push(response);
    return response;
  }

  /**
   * Отправляет сообщения поддержки в кризисной ситуации
   */
  static sendCrisisSupportMessages(alertId: string): CrisisSupportMessage[] {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (!alert) return [];

    const messages: CrisisSupportMessage[] = [];

    alert.affectedUsers.forEach(userId => {
      let message: CrisisSupportMessage;

      switch (alert.type) {
        case "burnout":
          message = {
            id: crypto.randomUUID(),
            userId,
            type: "motivation",
            content: "🚨 КРИЗИСНАЯ ПОДДЕРЖКА: Я вижу, что вы перегружены. Сейчас самое время сделать перерыв и пересмотреть приоритеты. Вы не одиноки - вся команда здесь, чтобы поддержать друг друга! 💪",
            tone: "supportive",
            priority: "critical",
            sentAt: new Date(),
            delivered: false
          };
          break;

        case "deadline":
          message = {
            id: crypto.randomUUID(),
            userId,
            type: "guidance",
            content: "⏰ ДЕДЛАЙН КРИЗИС: Понимаю давление дедлайна. Давайте сосредоточимся на самом важном и уберем лишнее. Я помогу приоритизировать задачи и найти дополнительные ресурсы! 🎯",
            tone: "encouraging",
            priority: "high",
            sentAt: new Date(),
            delivered: false
          };
          break;

        case "technical":
          message = {
            id: crypto.randomUUID(),
            userId,
            type: "guidance",
            content: "🐛 ТЕХНИЧЕСКИЙ КРИЗИС: Много багов - это нормально в разработке. Давайте систематически их исправим. Я помогу найти корень проблем и улучшить процесс тестирования! 🔧",
            tone: "calm",
            priority: "high",
            sentAt: new Date(),
            delivered: false
          };
          break;

        case "team":
          message = {
            id: crypto.randomUUID(),
            userId,
            type: "relief",
            content: "👥 КОМАНДНЫЙ КРИЗИС: Команда перегружена, но мы справимся! Давайте перераспределим задачи и привлечем дополнительную помощь. Вместе мы сильнее! 🤝",
            tone: "energetic",
            priority: "high",
            sentAt: new Date(),
            delivered: false
          };
          break;

        default:
          message = {
            id: crypto.randomUUID(),
            userId,
            type: "motivation",
            content: "🚨 КРИЗИСНАЯ СИТУАЦИЯ: Обнаружена проблема, требующая внимания. Я здесь, чтобы помочь и поддержать команду. Мы справимся! 💪",
            tone: "supportive",
            priority: "medium",
            sentAt: new Date(),
            delivered: false
          };
      }

      messages.push(message);
    });

    this.supportMessages.push(...messages);
    return messages;
  }

  /**
   * Отправляет уведомления о кризисе
   */
  private static sendCrisisNotifications(): void {
    const notification: CrisisSupportMessage = {
      id: crypto.randomUUID(),
      userId: "all",
      type: "escalation",
      content: "🚨 АКТИВИРОВАН РЕЖИМ КРИЗИСА! Василий переходит в режим максимальной поддержки. Все ресурсы направлены на помощь команде. Ожидайте повышенного внимания и поддержки! 💪🤖",
      tone: "urgent",
      priority: "critical",
      sentAt: new Date(),
      delivered: false
    };

    this.supportMessages.push(notification);
  }

  /**
   * Выполняет действие кризисного реагирования
   */
  static executeCrisisAction(responseId: string, actionId: string, assignedTo: string): boolean {
    const response = this.crisisResponses.find(r => r.id === responseId);
    if (!response) return false;

    const action = response.actions.find(a => a.id === actionId);
    if (!action) return false;

    action.assignedTo = assignedTo;
    action.completed = true;
    action.completedAt = new Date();

    // Проверяем, все ли действия завершены
    const allCompleted = response.actions.every(a => a.completed);
    if (allCompleted) {
      response.status = "completed";
      response.completedAt = new Date();

      // Отмечаем алерт как решенный
      const alert = this.activeAlerts.find(a => a.id === response.alertId);
      if (alert) {
        alert.resolved = true;
        alert.resolutionActions = response.actions.map(a => a.title);
      }
    } else {
      response.status = "in_progress";
    }

    return true;
  }

  /**
   * Эскалирует кризисную ситуацию
   */
  static escalateCrisis(alertId: string): boolean {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.escalated = true;
    alert.severity = "critical";

    // Отправляем эскалационное сообщение
    const escalationMessage: CrisisSupportMessage = {
      id: crypto.randomUUID(),
      userId: "management",
      type: "escalation",
      content: `🚨 ЭСКАЛАЦИЯ КРИЗИСА: ${alert.title}. Требуется вмешательство руководства. Ситуация: ${alert.description}`,
      tone: "urgent",
      priority: "critical",
      sentAt: new Date(),
      delivered: false
    };

    this.supportMessages.push(escalationMessage);
    return true;
  }

  /**
   * Получает активные кризисные ситуации
   */
  static getActiveCrises(): CrisisAlert[] {
    return this.activeAlerts.filter(alert => !alert.resolved);
  }

  /**
   * Получает все кризисные ответы
   */
  static getCrisisResponses(): CrisisResponse[] {
    return [...this.crisisResponses];
  }

  /**
   * Получает сообщения поддержки
   */
  static getSupportMessages(): CrisisSupportMessage[] {
    return [...this.supportMessages];
  }

  /**
   * Получает метрики кризиса
   */
  static getCrisisMetrics(): CrisisMetrics {
    const activeCrises = this.activeAlerts.filter(alert => !alert.resolved).length;
    const resolvedCrises = this.activeAlerts.filter(alert => alert.resolved).length;
    
    const completedResponses = this.crisisResponses.filter(r => r.status === "completed");
    const averageResolutionTime = completedResponses.length > 0 ? 
      completedResponses.reduce((sum, r) => {
        if (r.completedAt) {
          return sum + (r.completedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60);
        }
        return sum;
      }, 0) / completedResponses.length : 0;

    const escalatedCrises = this.activeAlerts.filter(alert => alert.escalated).length;
    const escalationRate = this.activeAlerts.length > 0 ? escalatedCrises / this.activeAlerts.length : 0;

    return {
      activeCrises,
      resolvedCrises,
      averageResolutionTime,
      teamStressLevel: 0.7, // TODO: Calculate from actual data
      productivityImpact: 0.3, // TODO: Calculate from actual data
      supportMessagesSent: this.supportMessages.length,
      escalationRate
    };
  }

  /**
   * Проверяет, активен ли режим кризиса
   */
  static isCrisisModeActive(): boolean {
    return this.crisisModeActive;
  }

  /**
   * Получает рекомендации по предотвращению кризисов
   */
  static getCrisisPreventionRecommendations(): string[] {
    const recommendations = [
      "Регулярно мониторьте уровень стресса команды",
      "Планируйте буферное время для непредвиденных задач",
      "Внедрите автоматическое тестирование для предотвращения багов",
      "Организуйте регулярные ретроспективы для выявления проблем",
      "Создайте культуру открытого общения о проблемах",
      "Планируйте обучение команды для повышения эффективности",
      "Внедрите систему раннего предупреждения о рисках",
      "Обеспечьте баланс между работой и отдыхом"
    ];

    return recommendations;
  }
}
