interface TeamMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  channel: string;
  type: "text" | "emoji" | "reaction";
  timestamp: Date;
  mood: {
    sentiment: "positive" | "neutral" | "negative";
    confidence: number;
    emotions: string[];
  };
}

interface UserMood {
  userId: string;
  userName: string;
  currentMood: string;
  stressLevel: number;
  energyLevel: number;
  productivityLevel: number;
  lastUpdated: Date;
  trend: "improving" | "stable" | "declining";
}

interface TeamMoodReport {
  overallMood: string;
  stressLevel: number;
  productivityLevel: number;
  teamCohesion: number;
  userMoods: UserMood[];
  recommendations: string[];
  alerts: string[];
  lastUpdated: Date;
}

export class TeamMoodMonitor {
  private static messages: TeamMessage[] = [];
  private static userMoods: Map<string, UserMood> = new Map();

  static addMessage(data: {
    userId: string;
    userName: string;
    content: string;
    channel: string;
    type?: "text" | "emoji" | "reaction";
  }): TeamMessage {
    const message: TeamMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      type: data.type || "text",
      timestamp: new Date(),
      mood: this.analyzeMood(data.content)
    };

    this.messages.push(message);
    this.updateUserMood(data.userId, data.userName, message.mood);
    
    return message;
  }

  static getTeamMoodReport(): TeamMoodReport {
    const userMoods = Array.from(this.userMoods.values());
    const recentMessages = this.messages.filter(
      msg => Date.now() - msg.timestamp.getTime() < 24 * 60 * 60 * 1000 // последние 24 часа
    );

    // Анализируем общее настроение команды
    const positiveMessages = recentMessages.filter(msg => msg.mood.sentiment === "positive").length;
    const negativeMessages = recentMessages.filter(msg => msg.mood.sentiment === "negative").length;
    const totalMessages = recentMessages.length;

    let overallMood = "neutral";
    if (totalMessages > 0) {
      const positiveRatio = positiveMessages / totalMessages;
      if (positiveRatio > 0.6) overallMood = "positive";
      else if (positiveRatio < 0.3) overallMood = "negative";
    }

    // Вычисляем средние показатели
    const avgStressLevel = userMoods.length > 0 
      ? userMoods.reduce((sum, user) => sum + user.stressLevel, 0) / userMoods.length 
      : 0.5;
    
    const avgProductivityLevel = userMoods.length > 0
      ? userMoods.reduce((sum, user) => sum + user.productivityLevel, 0) / userMoods.length
      : 0.7;

    const teamCohesion = this.calculateTeamCohesion(userMoods);

    // Генерируем рекомендации
    const recommendations = this.generateRecommendations(overallMood, avgStressLevel, teamCohesion);
    
    // Генерируем предупреждения
    const alerts = this.generateAlerts(avgStressLevel, teamCohesion, userMoods);

    return {
      overallMood,
      stressLevel: avgStressLevel,
      productivityLevel: avgProductivityLevel,
      teamCohesion,
      userMoods,
      recommendations,
      alerts,
      lastUpdated: new Date()
    };
  }

  static getMoodStats(): {
    totalMessages: number;
    positiveMessages: number;
    negativeMessages: number;
    neutralMessages: number;
    activeUsers: number;
    avgConfidence: number;
  } {
    const recentMessages = this.messages.filter(
      msg => Date.now() - msg.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // последние 7 дней
    );

    const positiveMessages = recentMessages.filter(msg => msg.mood.sentiment === "positive").length;
    const negativeMessages = recentMessages.filter(msg => msg.mood.sentiment === "negative").length;
    const neutralMessages = recentMessages.filter(msg => msg.mood.sentiment === "neutral").length;
    
    const activeUsers = new Set(recentMessages.map(msg => msg.userId)).size;
    const avgConfidence = recentMessages.length > 0
      ? recentMessages.reduce((sum, msg) => sum + msg.mood.confidence, 0) / recentMessages.length
      : 0;

    return {
      totalMessages: recentMessages.length,
      positiveMessages,
      negativeMessages,
      neutralMessages,
      activeUsers,
      avgConfidence
    };
  }

  static getUserMood(userId: string): UserMood | null {
    return this.userMoods.get(userId) || null;
  }

  static getUserMoodHistory(userId: string, days: number = 7): UserMood[] {
    // В реальной реализации здесь была бы история изменений настроения
    // Для демо возвращаем текущее состояние
    const userMood = this.userMoods.get(userId);
    return userMood ? [userMood] : [];
  }

  private static analyzeMood(content: string): TeamMessage["mood"] {
    // Простой анализ настроения на основе ключевых слов
    const positiveWords = ["отлично", "хорошо", "успех", "победа", "завершили", "спасибо", "молодцы"];
    const negativeWords = ["проблема", "ошибка", "не работает", "сложно", "стресс", "устал", "плохо"];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;

    let sentiment: "positive" | "neutral" | "negative" = "neutral";
    let confidence = 0.5;

    if (positiveCount > negativeCount) {
      sentiment = "positive";
      confidence = Math.min(0.9, 0.5 + positiveCount * 0.1);
    } else if (negativeCount > positiveCount) {
      sentiment = "negative";
      confidence = Math.min(0.9, 0.5 + negativeCount * 0.1);
    }

    const emotions: string[] = [];
    if (sentiment === "positive") emotions.push("радость", "удовлетворение");
    if (sentiment === "negative") emotions.push("стресс", "фрустрация");
    if (content.includes("?")) emotions.push("неопределенность");

    return {
      sentiment,
      confidence,
      emotions
    };
  }

  private static updateUserMood(userId: string, userName: string, messageMood: TeamMessage["mood"]): void {
    const existingMood = this.userMoods.get(userId);
    
    if (!existingMood) {
      // Создаем новое настроение пользователя
      const newMood: UserMood = {
        userId,
        userName,
        currentMood: messageMood.sentiment,
        stressLevel: messageMood.sentiment === "negative" ? 0.7 : 0.3,
        energyLevel: messageMood.sentiment === "positive" ? 0.8 : 0.5,
        productivityLevel: messageMood.sentiment === "positive" ? 0.8 : 0.6,
        lastUpdated: new Date(),
        trend: "stable"
      };
      this.userMoods.set(userId, newMood);
    } else {
      // Обновляем существующее настроение
      existingMood.currentMood = messageMood.sentiment;
      existingMood.stressLevel = messageMood.sentiment === "negative" ? 0.7 : 0.3;
      existingMood.energyLevel = messageMood.sentiment === "positive" ? 0.8 : 0.5;
      existingMood.productivityLevel = messageMood.sentiment === "positive" ? 0.8 : 0.6;
      existingMood.lastUpdated = new Date();
    }
  }

  private static calculateTeamCohesion(userMoods: UserMood[]): number {
    if (userMoods.length === 0) return 0.5;
    
    // Простой расчет сплоченности на основе настроения команды
    const positiveUsers = userMoods.filter(user => user.currentMood === "positive").length;
    const totalUsers = userMoods.length;
    
    return positiveUsers / totalUsers;
  }

  private static generateRecommendations(overallMood: string, stressLevel: number, teamCohesion: number): string[] {
    const recommendations: string[] = [];

    if (overallMood === "negative") {
      recommendations.push("Провести командную ретроспективу для выявления проблем");
      recommendations.push("Организовать неформальную встречу команды");
    }

    if (stressLevel > 0.7) {
      recommendations.push("Внедрить дополнительные перерывы в рабочем процессе");
      recommendations.push("Предложить ресурсы для управления стрессом");
    }

    if (teamCohesion < 0.6) {
      recommendations.push("Провести командное мероприятие");
      recommendations.push("Создать больше возможностей для неформального общения");
    }

    if (recommendations.length === 0) {
      recommendations.push("Команда работает хорошо, продолжайте в том же духе!");
    }

    return recommendations;
  }

  private static generateAlerts(stressLevel: number, teamCohesion: number, userMoods: UserMood[]): string[] {
    const alerts: string[] = [];

    if (stressLevel > 0.8) {
      alerts.push("Высокий уровень стресса в команде - требуется внимание");
    }

    if (teamCohesion < 0.4) {
      alerts.push("Низкая сплоченность команды - рекомендуется вмешательство");
    }

    const stressedUsers = userMoods.filter(user => user.stressLevel > 0.8).length;
    if (stressedUsers > userMoods.length * 0.5) {
      alerts.push("Более половины команды испытывает высокий стресс");
    }

    return alerts;
  }
}