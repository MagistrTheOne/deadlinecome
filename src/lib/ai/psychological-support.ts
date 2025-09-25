"use client";

export interface SupportMessage {
  id: string;
  type: "motivation" | "encouragement" | "advice" | "celebration" | "warning" | "support";
  content: string;
  tone: "friendly" | "professional" | "caring" | "energetic" | "calm";
  priority: "low" | "medium" | "high" | "urgent";
  targetUser?: string;
  context: string;
  timestamp: Date;
  delivered: boolean;
}

export interface UserProfile {
  userId: string;
  userName: string;
  personality: "introvert" | "extrovert" | "ambivert";
  workStyle: "morning" | "evening" | "flexible";
  stressLevel: number; // 0-1
  motivationLevel: number; // 0-1
  preferredSupport: "direct" | "subtle" | "group" | "individual";
  lastSupport: Date;
  supportHistory: SupportMessage[];
}

export interface CrisisSituation {
  id: string;
  type: "burnout" | "conflict" | "deadline_pressure" | "technical_blocker" | "team_dysfunction";
  severity: "low" | "medium" | "high" | "critical";
  affectedUsers: string[];
  description: string;
  detectedAt: Date;
  resolved: boolean;
  resolutionActions: string[];
}

export class PsychologicalSupport {
  private static userProfiles: Map<string, UserProfile> = new Map();
  private static supportMessages: SupportMessage[] = [];
  private static crisisSituations: CrisisSituation[] = [];
  private static lastSupportCheck: Date = new Date();

  /**
   * Инициализирует профиль пользователя
   */
  static initializeUserProfile(userId: string, userName: string): UserProfile {
    const profile: UserProfile = {
      userId,
      userName,
      personality: "ambivert",
      workStyle: "flexible",
      stressLevel: 0.3,
      motivationLevel: 0.7,
      preferredSupport: "subtle",
      lastSupport: new Date(),
      supportHistory: []
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Обновляет профиль пользователя на основе активности
   */
  static updateUserProfile(userId: string, updates: Partial<UserProfile>): void {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      Object.assign(profile, updates);
      this.userProfiles.set(userId, profile);
    }
  }

  /**
   * Анализирует ситуацию и генерирует поддержку
   */
  static analyzeAndSupport(
    userId: string, 
    context: {
      mood: string;
      stressLevel: number;
      workload: number;
      recentActivity: string[];
      teamInteraction: number;
    }
  ): SupportMessage[] {
    const profile = this.userProfiles.get(userId) || this.initializeUserProfile(userId, "Пользователь");
    const supportMessages: SupportMessage[] = [];

    // Анализируем уровень стресса
    if (context.stressLevel > 0.8) {
      supportMessages.push(this.generateStressSupport(profile, context));
    }

    // Анализируем мотивацию
    if (context.mood === "frustrated" || context.mood === "tired") {
      supportMessages.push(this.generateMotivationSupport(profile, context));
    }

    // Анализируем достижения
    if (context.recentActivity.some(activity => 
      activity.includes("completed") || activity.includes("success") || activity.includes("done")
    )) {
      supportMessages.push(this.generateCelebrationSupport(profile, context));
    }

    // Анализируем командное взаимодействие
    if (context.teamInteraction < 0.3) {
      supportMessages.push(this.generateTeamSupport(profile, context));
    }

    // Проверяем на кризисные ситуации
    const crisis = this.detectCrisisSituation(userId, context);
    if (crisis) {
      supportMessages.push(this.generateCrisisSupport(profile, crisis));
    }

    // Сохраняем сообщения поддержки
    this.supportMessages.push(...supportMessages);
    profile.supportHistory.push(...supportMessages);
    profile.lastSupport = new Date();

    return supportMessages;
  }

  /**
   * Генерирует поддержку при стрессе
   */
  private static generateStressSupport(profile: UserProfile, context: any): SupportMessage {
    const stressMessages = [
      {
        content: "Понимаю, что сейчас непросто. Давайте разберем задачи по приоритетам и сделаем перерыв.",
        tone: "caring" as const,
        type: "support" as const
      },
      {
        content: "Стресс - это нормально в нашей работе. Помните: вы справлялись с трудностями раньше, справитесь и сейчас! 💪",
        tone: "energetic" as const,
        type: "encouragement" as const
      },
      {
        content: "Предлагаю технику 'помидора': 25 минут работы, 5 минут отдыха. Это поможет сохранить фокус.",
        tone: "professional" as const,
        type: "advice" as const
      }
    ];

    const message = stressMessages[Math.floor(Math.random() * stressMessages.length)];
    
    return {
      id: crypto.randomUUID(),
      ...message,
      priority: "high",
      targetUser: profile.userId,
      context: "Высокий уровень стресса",
      timestamp: new Date(),
      delivered: false
    };
  }

  /**
   * Генерирует мотивационную поддержку
   */
  private static generateMotivationSupport(profile: UserProfile, context: any): SupportMessage {
    const motivationMessages = [
      {
        content: "Каждый код, который вы пишете, делает мир лучше. Вы создаете что-то важное! 🚀",
        tone: "energetic" as const,
        type: "motivation" as const
      },
      {
        content: "Помните: даже самые опытные разработчики сталкиваются с трудностями. Это часть роста!",
        tone: "friendly" as const,
        type: "encouragement" as const
      },
      {
        content: "Давайте поставим маленькую цель и достигнем её. Маленькие победы ведут к большим успехам!",
        tone: "caring" as const,
        type: "motivation" as const
      }
    ];

    const message = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
    
    return {
      id: crypto.randomUUID(),
      ...message,
      priority: "medium",
      targetUser: profile.userId,
      context: "Низкая мотивация",
      timestamp: new Date(),
      delivered: false
    };
  }

  /**
   * Генерирует поддержку для празднования достижений
   */
  private static generateCelebrationSupport(profile: UserProfile, context: any): SupportMessage {
    const celebrationMessages = [
      {
        content: "Отличная работа! 🎉 Ваши усилия не остались незамеченными. Продолжайте в том же духе!",
        tone: "energetic" as const,
        type: "celebration" as const
      },
      {
        content: "Поздравляю с успешным завершением! Это показывает ваш профессионализм и упорство.",
        tone: "professional" as const,
        type: "celebration" as const
      },
      {
        content: "Вы молодец! Каждое достижение - это шаг к мастерству. Гордитесь собой! 🌟",
        tone: "friendly" as const,
        type: "celebration" as const
      }
    ];

    const message = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
    
    return {
      id: crypto.randomUUID(),
      ...message,
      priority: "medium",
      targetUser: profile.userId,
      context: "Достижение",
      timestamp: new Date(),
      delivered: false
    };
  }

  /**
   * Генерирует поддержку для командной работы
   */
  private static generateTeamSupport(profile: UserProfile, context: any): SupportMessage {
    const teamMessages = [
      {
        content: "Команда - это сила! Не стесняйтесь обращаться за помощью. Мы все здесь, чтобы поддерживать друг друга.",
        tone: "friendly" as const,
        type: "support" as const
      },
      {
        content: "Коллективный разум всегда сильнее индивидуального. Давайте обсудим задачу вместе!",
        tone: "professional" as const,
        type: "advice" as const
      },
      {
        content: "Помните: нет глупых вопросов. Лучше спросить сейчас, чем потратить часы на поиск решения.",
        tone: "caring" as const,
        type: "encouragement" as const
      }
    ];

    const message = teamMessages[Math.floor(Math.random() * teamMessages.length)];
    
    return {
      id: crypto.randomUUID(),
      ...message,
      priority: "low",
      targetUser: profile.userId,
      context: "Низкое командное взаимодействие",
      timestamp: new Date(),
      delivered: false
    };
  }

  /**
   * Обнаруживает кризисные ситуации
   */
  private static detectCrisisSituation(userId: string, context: any): CrisisSituation | null {
    // Проверяем на выгорание
    if (context.stressLevel > 0.9 && context.workload > 0.8) {
      return {
        id: crypto.randomUUID(),
        type: "burnout",
        severity: "critical",
        affectedUsers: [userId],
        description: "Высокий риск выгорания",
        detectedAt: new Date(),
        resolved: false,
        resolutionActions: []
      };
    }

    // Проверяем на технические блокеры
    if (context.recentActivity.some((activity: any) =>
      activity.includes("stuck") || activity.includes("blocked") || activity.includes("error")
    )) {
      return {
        id: crypto.randomUUID(),
        type: "technical_blocker",
        severity: "high",
        affectedUsers: [userId],
        description: "Технические трудности",
        detectedAt: new Date(),
        resolved: false,
        resolutionActions: []
      };
    }

    return null;
  }

  /**
   * Генерирует поддержку в кризисной ситуации
   */
  private static generateCrisisSupport(profile: UserProfile, crisis: CrisisSituation): SupportMessage {
    const crisisMessages: Record<string, any> = {
      burnout: {
        content: "🚨 ВНИМАНИЕ: Обнаружены признаки выгорания. Немедленно сделайте перерыв и обратитесь за помощью!",
        tone: "urgent" as const,
        type: "warning" as const,
        priority: "urgent" as const
      },
      technical_blocker: {
        content: "Вижу, что вы столкнулись с техническими трудностями. Давайте найдем решение вместе!",
        tone: "supportive" as const,
        type: "support" as const,
        priority: "high" as const
      }
    };

    const message = crisisMessages[crisis.type] || crisisMessages.technical_blocker;
    
    return {
      id: crypto.randomUUID(),
      ...message,
      targetUser: profile.userId,
      context: `Кризисная ситуация: ${crisis.type}`,
      timestamp: new Date(),
      delivered: false
    };
  }

  /**
   * Генерирует ежедневные мотивационные сообщения
   */
  static generateDailyMotivation(): SupportMessage[] {
    const dailyMessages = [
      {
        content: "Доброе утро! 🌅 Сегодня отличный день для создания чего-то удивительного!",
        tone: "energetic" as const,
        type: "motivation" as const
      },
      {
        content: "Помните: каждый баг - это возможность стать лучше. Каждая ошибка - это урок!",
        tone: "friendly" as const,
        type: "encouragement" as const
      },
      {
        content: "Сегодня мы не просто пишем код, мы строим будущее! 💻✨",
        tone: "energetic" as const,
        type: "motivation" as const
      },
      {
        content: "Ваша работа важна. Каждая строка кода делает чью-то жизнь лучше!",
        tone: "caring" as const,
        type: "motivation" as const
      }
    ];

    const message = dailyMessages[Math.floor(Math.random() * dailyMessages.length)];
    
    return [{
      id: crypto.randomUUID(),
      ...message,
      priority: "low",
      context: "Ежедневная мотивация",
      timestamp: new Date(),
      delivered: false
    }];
  }

  /**
   * Получает рекомендации по улучшению командной атмосферы
   */
  static getTeamAtmosphereRecommendations(): string[] {
    const recommendations = [
      "Организуйте еженедельные ретроспективы для обсуждения проблем",
      "Введите систему взаимной поддержки между участниками команды",
      "Создайте канал для неформального общения",
      "Проводите командные мероприятия для укрепления связей",
      "Внедрите систему наставничества для новых участников",
      "Создайте культуру открытого общения и обратной связи",
      "Организуйте совместные обучающие сессии",
      "Введите систему признания достижений команды"
    ];

    return recommendations;
  }

  /**
   * Получает статистику поддержки
   */
  static getSupportStats(): {
    totalMessages: number;
    messagesByType: Record<string, number>;
    messagesByPriority: Record<string, number>;
    activeCrises: number;
    resolvedCrises: number;
    averageResponseTime: number;
  } {
    const messagesByType: Record<string, number> = {};
    const messagesByPriority: Record<string, number> = {};
    
    this.supportMessages.forEach(message => {
      messagesByType[message.type] = (messagesByType[message.type] || 0) + 1;
      messagesByPriority[message.priority] = (messagesByPriority[message.priority] || 0) + 1;
    });

    const activeCrises = this.crisisSituations.filter(crisis => !crisis.resolved).length;
    const resolvedCrises = this.crisisSituations.filter(crisis => crisis.resolved).length;

    return {
      totalMessages: this.supportMessages.length,
      messagesByType,
      messagesByPriority,
      activeCrises,
      resolvedCrises,
      averageResponseTime: 0 // TODO: Implement response time tracking
    };
  }

  /**
   * Получает профили всех пользователей
   */
  static getAllUserProfiles(): UserProfile[] {
    return Array.from(this.userProfiles.values());
  }

  /**
   * Получает активные кризисные ситуации
   */
  static getActiveCrises(): CrisisSituation[] {
    return this.crisisSituations.filter(crisis => !crisis.resolved);
  }

  /**
   * Разрешает кризисную ситуацию
   */
  static resolveCrisis(crisisId: string, resolutionActions: string[]): boolean {
    const crisis = this.crisisSituations.find(c => c.id === crisisId);
    if (crisis) {
      crisis.resolved = true;
      crisis.resolutionActions = resolutionActions;
      return true;
    }
    return false;
  }
}
