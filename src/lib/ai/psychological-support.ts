interface SupportMessage {
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

interface Crisis {
  id: string;
  userId: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedUsers: string[];
  detectedAt: Date;
  status: "active" | "resolved" | "monitoring";
  recommendations: string[];
}

interface SupportData {
  messages: SupportMessage[];
  activeCrises: Crisis[];
  recommendations: string[];
  teamMood: {
    overall: string;
    stress: string;
    energy: string;
    cohesion: number;
  };
}

export class PsychologicalSupport {
  private static messages: SupportMessage[] = [
    {
      id: "msg-1",
      type: "motivation",
      content: "Команда работает отлично! Продолжайте в том же духе!",
      tone: "energetic",
      priority: "medium",
      context: "Общая мотивация команды",
      timestamp: new Date(),
      delivered: true
    },
    {
      id: "msg-2",
      type: "advice",
      content: "Рекомендую сделать перерыв каждые 2 часа для поддержания продуктивности",
      tone: "professional",
      priority: "low",
      context: "Совет по рабочему процессу",
      timestamp: new Date(Date.now() - 3600000),
      delivered: true
    },
    {
      id: "msg-3",
      type: "celebration",
      content: "Поздравляем с успешным завершением спринта! Отличная работа команды!",
      tone: "energetic",
      priority: "medium",
      context: "Завершение спринта",
      timestamp: new Date(Date.now() - 7200000),
      delivered: true
    }
  ];

  private static crises: Crisis[] = [];

  private static recommendations: string[] = [
    "Провести командное мероприятие для укрепления связей",
    "Внедрить систему peer-to-peer поддержки",
    "Добавить больше времени для неформального общения",
    "Создать каналы для обмена опытом и знаниями",
    "Внедрить систему обратной связи между участниками команды"
  ];

  static getSupportMessages(): SupportMessage[] {
    return this.messages.filter(msg => msg.delivered);
  }

  static getActiveCrises(): Crisis[] {
    return this.crises.filter(crisis => crisis.status === "active");
  }

  static getRecommendations(): string[] {
    return this.recommendations;
  }

  static getSupportData(): SupportData {
    return {
      messages: this.getSupportMessages(),
      activeCrises: this.getActiveCrises(),
      recommendations: this.getRecommendations(),
      teamMood: {
        overall: "positive",
        stress: "low",
        energy: "high",
        cohesion: 0.85
      }
    };
  }

  static addSupportMessage(data: {
    type: SupportMessage["type"];
    content: string;
    tone: SupportMessage["tone"];
    priority: SupportMessage["priority"];
    targetUser?: string;
    context: string;
  }): SupportMessage {
    const message: SupportMessage = {
      id: `msg-${Date.now()}`,
      ...data,
      timestamp: new Date(),
      delivered: false
    };

    this.messages.push(message);
    return message;
  }

  static detectCrisis(data: {
    userId: string;
    severity: Crisis["severity"];
    description: string;
    affectedUsers: string[];
  }): Crisis {
    const crisis: Crisis = {
      id: `crisis-${Date.now()}`,
      ...data,
      detectedAt: new Date(),
      status: "active",
      recommendations: this.generateCrisisRecommendations(data.severity)
    };

    this.crises.push(crisis);
    return crisis;
  }

  private static generateCrisisRecommendations(severity: Crisis["severity"]): string[] {
    switch (severity) {
      case "critical":
        return [
          "Немедленно связаться с HR отделом",
          "Организовать индивидуальную встречу с затронутыми участниками",
          "Внедрить дополнительные меры поддержки"
        ];
      case "high":
        return [
          "Провести командную ретроспективу",
          "Увеличить частоту check-in встреч",
          "Предложить дополнительные ресурсы поддержки"
        ];
      case "medium":
        return [
          "Мониторить ситуацию более внимательно",
          "Провести неформальную встречу команды",
          "Предложить дополнительные инструменты коммуникации"
        ];
      case "low":
        return [
          "Продолжить обычное наблюдение",
          "Убедиться в доступности поддержки"
        ];
      default:
        return [];
    }
  }

  static resolveCrisis(crisisId: string): boolean {
    const crisis = this.crises.find(c => c.id === crisisId);
    if (crisis) {
      crisis.status = "resolved";
      return true;
    }
    return false;
  }

  static getTeamMoodAnalysis(): {
    overallMood: string;
    stressLevel: number;
    productivityLevel: number;
    teamCohesion: number;
    recommendations: string[];
    alerts: string[];
  } {
    const activeCrises = this.getActiveCrises();
    const criticalCrises = activeCrises.filter(c => c.severity === "critical");
    
    let stressLevel = 0.3;
    let productivityLevel = 0.8;
    let teamCohesion = 0.85;
    let overallMood = "positive";
    const alerts: string[] = [];

    if (criticalCrises.length > 0) {
      stressLevel = 0.9;
      productivityLevel = 0.4;
      teamCohesion = 0.3;
      overallMood = "critical";
      alerts.push("Обнаружены критические проблемы в команде");
    } else if (activeCrises.length > 0) {
      stressLevel = 0.6;
      productivityLevel = 0.6;
      teamCohesion = 0.6;
      overallMood = "concerned";
      alerts.push("Требуется внимание к состоянию команды");
    }

    return {
      overallMood,
      stressLevel,
      productivityLevel,
      teamCohesion,
      recommendations: this.getRecommendations(),
      alerts
    };
  }
}