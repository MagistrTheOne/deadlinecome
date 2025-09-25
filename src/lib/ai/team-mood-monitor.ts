"use client";

export interface TeamMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  channel: string;
  type: "text" | "emoji" | "reaction" | "mention";
}

export interface MoodAnalysis {
  userId: string;
  userName: string;
  mood: "happy" | "stressed" | "productive" | "tired" | "frustrated" | "excited" | "worried" | "neutral";
  confidence: number; // 0-1
  factors: string[];
  timestamp: Date;
  trend: "improving" | "stable" | "declining";
}

export interface TeamMoodReport {
  overallMood: string;
  averageConfidence: number;
  stressLevel: number; // 0-1
  productivityLevel: number; // 0-1
  teamCohesion: number; // 0-1
  individualMoods: MoodAnalysis[];
  recommendations: string[];
  alerts: string[];
  lastUpdate: Date;
}

export class TeamMoodMonitor {
  private static messages: TeamMessage[] = [];
  private static moodHistory: MoodAnalysis[] = [];
  private static lastAnalysis: Date = new Date();

  /**
   * Добавляет новое сообщение для анализа
   */
  static addMessage(message: Omit<TeamMessage, "id" | "timestamp">): TeamMessage {
    const newMessage: TeamMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    this.messages.push(newMessage);
    
    // Ограничиваем историю последними 1000 сообщений
    if (this.messages.length > 1000) {
      this.messages = this.messages.slice(-1000);
    }

    // Анализируем настроение в реальном времени
    this.analyzeMood(newMessage);

    return newMessage;
  }

  /**
   * Анализирует настроение на основе сообщения
   */
  private static analyzeMood(message: TeamMessage): void {
    const moodAnalysis = this.analyzeMessageContent(message);
    
    // Обновляем историю настроений
    this.moodHistory.push(moodAnalysis);
    
    // Ограничиваем историю последними 500 анализами
    if (this.moodHistory.length > 500) {
      this.moodHistory = this.moodHistory.slice(-500);
    }

    this.lastAnalysis = new Date();
  }

  /**
   * Анализирует содержание сообщения
   */
  private static analyzeMessageContent(message: TeamMessage): MoodAnalysis {
    const content = message.content.toLowerCase();
    const factors: string[] = [];
    let mood: MoodAnalysis["mood"] = "neutral";
    let confidence = 0.5;

    // Анализируем позитивные индикаторы
    const positiveWords = [
      "отлично", "хорошо", "супер", "круто", "замечательно", "прекрасно",
      "успех", "победа", "достижение", "прогресс", "работает", "готово",
      "спасибо", "благодарю", "помог", "решил", "исправил", "добавил"
    ];

    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    if (positiveCount > 0) {
      mood = "happy";
      confidence = Math.min(0.9, 0.5 + positiveCount * 0.1);
      factors.push("Позитивные слова");
    }

    // Анализируем негативные индикаторы
    const negativeWords = [
      "проблема", "ошибка", "баг", "не работает", "сломал", "не получается",
      "устал", "усталость", "стресс", "напряжение", "сложно", "трудно",
      "дедлайн", "срочно", "горящий", "критично", "важно", "срочно"
    ];

    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    if (negativeCount > 0) {
      if (negativeCount > 2) {
        mood = "stressed";
        confidence = Math.min(0.9, 0.6 + negativeCount * 0.1);
      } else {
        mood = "frustrated";
        confidence = Math.min(0.8, 0.5 + negativeCount * 0.15);
      }
      factors.push("Негативные слова");
    }

    // Анализируем эмодзи
    const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = content.match(emojiPattern) || [];
    
    if (emojis.length > 0) {
      const positiveEmojis = ["😊", "😄", "😁", "🤩", "🎉", "🚀", "✅", "👍", "💪", "🔥"];
      const negativeEmojis = ["😞", "😢", "😤", "😠", "😰", "😓", "😵", "💀", "🔥", "⚠️"];
      
      const positiveEmojiCount = emojis.filter(emoji => positiveEmojis.includes(emoji)).length;
      const negativeEmojiCount = emojis.filter(emoji => negativeEmojis.includes(emoji)).length;
      
      if (positiveEmojiCount > negativeEmojiCount) {
        mood = "excited";
        confidence = Math.min(0.9, confidence + 0.2);
        factors.push("Позитивные эмодзи");
      } else if (negativeEmojiCount > positiveEmojiCount) {
        mood = "worried";
        confidence = Math.min(0.9, confidence + 0.2);
        factors.push("Негативные эмодзи");
      }
    }

    // Анализируем длину сообщения
    if (content.length > 200) {
      if (mood === "neutral") {
        mood = "productive";
        confidence = 0.6;
        factors.push("Длинное сообщение");
      }
    }

    // Анализируем время отправки
    const hour = message.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      if (mood === "neutral") {
        mood = "tired";
        confidence = 0.7;
        factors.push("Позднее время");
      }
    }

    // Анализируем упоминания
    if (content.includes("@") || content.includes("упомянул")) {
      factors.push("Упоминания коллег");
    }

    // Анализируем вопросы
    if (content.includes("?") || content.includes("как") || content.includes("что")) {
      factors.push("Задает вопросы");
    }

    // Определяем тренд
    const recentMoods = this.moodHistory
      .filter(m => m.userId === message.userId)
      .slice(-5);
    
    let trend: MoodAnalysis["trend"] = "stable";
    if (recentMoods.length >= 3) {
      const recentMoodScores = recentMoods.map(m => this.getMoodScore(m.mood));
      const isImproving = recentMoodScores.every((score, index) => 
        index === 0 || score >= recentMoodScores[index - 1]
      );
      const isDeclining = recentMoodScores.every((score, index) => 
        index === 0 || score <= recentMoodScores[index - 1]
      );
      
      if (isImproving) trend = "improving";
      else if (isDeclining) trend = "declining";
    }

    return {
      userId: message.userId,
      userName: message.userName,
      mood,
      confidence,
      factors,
      timestamp: new Date(),
      trend
    };
  }

  /**
   * Преобразует настроение в числовой балл
   */
  private static getMoodScore(mood: MoodAnalysis["mood"]): number {
    const scores: Record<MoodAnalysis["mood"], number> = {
      "happy": 1.0,
      "excited": 0.9,
      "productive": 0.8,
      "neutral": 0.5,
      "tired": 0.3,
      "worried": 0.2,
      "frustrated": 0.1,
      "stressed": 0.0
    };
    
    return scores[mood] || 0.5;
  }

  /**
   * Получает отчет о настроении команды
   */
  static getTeamMoodReport(): TeamMoodReport {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Получаем настроения за последние 24 часа
    const recentMoods = this.moodHistory.filter(mood => mood.timestamp >= last24Hours);
    
    if (recentMoods.length === 0) {
      return {
        overallMood: "neutral",
        averageConfidence: 0.5,
        stressLevel: 0.3,
        productivityLevel: 0.5,
        teamCohesion: 0.5,
        individualMoods: [],
        recommendations: ["Недостаточно данных для анализа настроения"],
        alerts: [],
        lastUpdate: this.lastAnalysis
      };
    }

    // Вычисляем общее настроение
    const moodScores = recentMoods.map(mood => this.getMoodScore(mood.mood));
    const averageScore = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
    
    let overallMood: string;
    if (averageScore >= 0.8) overallMood = "excited";
    else if (averageScore >= 0.6) overallMood = "happy";
    else if (averageScore >= 0.4) overallMood = "neutral";
    else if (averageScore >= 0.2) overallMood = "worried";
    else overallMood = "stressed";

    // Вычисляем уровень стресса
    const stressMoods = recentMoods.filter(mood => 
      mood.mood === "stressed" || mood.mood === "frustrated" || mood.mood === "worried"
    );
    const stressLevel = stressMoods.length / recentMoods.length;

    // Вычисляем уровень продуктивности
    const productiveMoods = recentMoods.filter(mood => 
      mood.mood === "productive" || mood.mood === "excited" || mood.mood === "happy"
    );
    const productivityLevel = productiveMoods.length / recentMoods.length;

    // Вычисляем сплоченность команды
    const teamCohesion = this.calculateTeamCohesion(recentMoods);

    // Генерируем рекомендации
    const recommendations = this.generateRecommendations(recentMoods, stressLevel, productivityLevel);

    // Генерируем предупреждения
    const alerts = this.generateAlerts(recentMoods, stressLevel);

    return {
      overallMood,
      averageConfidence: recentMoods.reduce((sum, mood) => sum + mood.confidence, 0) / recentMoods.length,
      stressLevel,
      productivityLevel,
      teamCohesion,
      individualMoods: recentMoods,
      recommendations,
      alerts,
      lastUpdate: this.lastAnalysis
    };
  }

  /**
   * Вычисляет сплоченность команды
   */
  private static calculateTeamCohesion(moods: MoodAnalysis[]): number {
    // Анализируем взаимодействие между участниками
    const userMoods = new Map<string, MoodAnalysis[]>();
    
    moods.forEach(mood => {
      if (!userMoods.has(mood.userId)) {
        userMoods.set(mood.userId, []);
      }
      userMoods.get(mood.userId)!.push(mood);
    });

    // Вычисляем среднее настроение каждого участника
    const userAverageMoods = new Map<string, number>();
    userMoods.forEach((userMoods, userId) => {
      const averageScore = userMoods.reduce((sum, mood) => sum + this.getMoodScore(mood.mood), 0) / userMoods.length;
      userAverageMoods.set(userId, averageScore);
    });

    // Вычисляем дисперсию настроений (меньше дисперсия = больше сплоченность)
    const scores = Array.from(userAverageMoods.values());
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    // Преобразуем дисперсию в коэффициент сплоченности (0-1)
    return Math.max(0, 1 - variance);
  }

  /**
   * Генерирует рекомендации
   */
  private static generateRecommendations(
    moods: MoodAnalysis[], 
    stressLevel: number, 
    productivityLevel: number
  ): string[] {
    const recommendations: string[] = [];

    if (stressLevel > 0.6) {
      recommendations.push("Высокий уровень стресса в команде. Рекомендуется организовать релаксационные мероприятия.");
    }

    if (productivityLevel < 0.4) {
      recommendations.push("Низкая продуктивность. Рассмотрите возможность пересмотра рабочих процессов.");
    }

    const tiredMembers = moods.filter(mood => mood.mood === "tired").length;
    if (tiredMembers > moods.length * 0.3) {
      recommendations.push("Много уставших участников. Рекомендуется снизить рабочую нагрузку.");
    }

    const frustratedMembers = moods.filter(mood => mood.mood === "frustrated").length;
    if (frustratedMembers > 0) {
      recommendations.push("Есть фрустрированные участники. Организуйте индивидуальные встречи для поддержки.");
    }

    const excitedMembers = moods.filter(mood => mood.mood === "excited").length;
    if (excitedMembers > moods.length * 0.5) {
      recommendations.push("Команда в отличном настроении! Используйте этот момент для сложных задач.");
    }

    return recommendations;
  }

  /**
   * Генерирует предупреждения
   */
  private static generateAlerts(moods: MoodAnalysis[], stressLevel: number): string[] {
    const alerts: string[] = [];

    if (stressLevel > 0.8) {
      alerts.push("КРИТИЧЕСКИЙ уровень стресса в команде!");
    }

    const decliningTrends = moods.filter(mood => mood.trend === "declining").length;
    if (decliningTrends > moods.length * 0.4) {
      alerts.push("Ухудшение настроения у большинства участников");
    }

    const lowConfidenceMoods = moods.filter(mood => mood.confidence < 0.3).length;
    if (lowConfidenceMoods > moods.length * 0.3) {
      alerts.push("Низкая уверенность у многих участников команды");
    }

    return alerts;
  }

  /**
   * Получает настроение конкретного пользователя
   */
  static getUserMood(userId: string): MoodAnalysis | null {
    const userMoods = this.moodHistory.filter(mood => mood.userId === userId);
    if (userMoods.length === 0) return null;

    // Возвращаем последнее настроение
    return userMoods[userMoods.length - 1];
  }

  /**
   * Получает историю настроений пользователя
   */
  static getUserMoodHistory(userId: string, days: number = 7): MoodAnalysis[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.moodHistory.filter(mood => 
      mood.userId === userId && mood.timestamp >= cutoffDate
    );
  }

  /**
   * Получает статистику настроений
   */
  static getMoodStats(): {
    totalMessages: number;
    totalAnalyses: number;
    moodDistribution: Record<string, number>;
    averageConfidence: number;
    mostActiveUsers: Array<{ userId: string; userName: string; messageCount: number }>;
  } {
    const moodDistribution: Record<string, number> = {};
    let totalConfidence = 0;

    this.moodHistory.forEach(mood => {
      moodDistribution[mood.mood] = (moodDistribution[mood.mood] || 0) + 1;
      totalConfidence += mood.confidence;
    });

    // Находим самых активных пользователей
    const userActivity = new Map<string, { userName: string; count: number }>();
    this.messages.forEach(message => {
      const existing = userActivity.get(message.userId);
      if (existing) {
        existing.count++;
      } else {
        userActivity.set(message.userId, { userName: message.userName, count: 1 });
      }
    });

    const mostActiveUsers = Array.from(userActivity.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalMessages: this.messages.length,
      totalAnalyses: this.moodHistory.length,
      moodDistribution,
      averageConfidence: this.moodHistory.length > 0 ? totalConfidence / this.moodHistory.length : 0,
      mostActiveUsers
    };
  }
}
