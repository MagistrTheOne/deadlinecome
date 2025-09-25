"use client";

export interface ActivityMetric {
  id: string;
  type: "commit" | "task" | "message" | "code_review" | "deployment" | "bug_report";
  timestamp: Date;
  userId?: string;
  projectId?: string;
  data: Record<string, any>;
  impact: "low" | "medium" | "high";
}

export interface TeamActivity {
  totalCommits: number;
  totalTasks: number;
  totalMessages: number;
  activeDevelopers: number;
  codeQuality: number;
  bugCount: number;
  deploymentCount: number;
  lastActivity: Date;
}

export interface DeveloperMood {
  userId: string;
  mood: "happy" | "stressed" | "productive" | "tired" | "frustrated";
  confidence: number; // 0-1
  workload: number; // 0-1
  lastUpdate: Date;
}

export class ActivityMonitor {
  private static activities: ActivityMetric[] = [];
  private static teamMoods: Map<string, DeveloperMood> = new Map();
  private static lastAnalysis: Date = new Date();

  /**
   * Добавить новую активность
   */
  static addActivity(activity: Omit<ActivityMetric, "id" | "timestamp">): ActivityMetric {
    const newActivity: ActivityMetric = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    this.activities.push(newActivity);
    
    // Ограничиваем историю последними 1000 активностями
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(-1000);
    }

    // Обновляем настроение разработчика на основе активности
    if (newActivity.userId) {
      this.updateDeveloperMood(newActivity.userId, newActivity);
    }

    return newActivity;
  }

  /**
   * Обновить настроение разработчика
   */
  private static updateDeveloperMood(userId: string, activity: ActivityMetric): void {
    const currentMood = this.teamMoods.get(userId) || {
      userId,
      mood: "productive",
      confidence: 0.7,
      workload: 0.5,
      lastUpdate: new Date()
    };

    // Анализируем активность и обновляем настроение
    switch (activity.type) {
      case "commit":
        if (activity.data.message?.includes("fix") || activity.data.message?.includes("bug")) {
          currentMood.mood = "frustrated";
          currentMood.confidence = Math.max(0.3, currentMood.confidence - 0.1);
        } else if (activity.data.message?.includes("feat") || activity.data.message?.includes("add")) {
          currentMood.mood = "happy";
          currentMood.confidence = Math.min(1.0, currentMood.confidence + 0.1);
        }
        break;

      case "task":
        if (activity.data.status === "completed") {
          currentMood.mood = "productive";
          currentMood.confidence = Math.min(1.0, currentMood.confidence + 0.05);
        } else if (activity.data.priority === "high") {
          currentMood.workload = Math.min(1.0, currentMood.workload + 0.2);
        }
        break;

      case "bug_report":
        currentMood.mood = "stressed";
        currentMood.confidence = Math.max(0.2, currentMood.confidence - 0.15);
        break;

      case "deployment":
        currentMood.mood = "happy";
        currentMood.confidence = Math.min(1.0, currentMood.confidence + 0.2);
        break;
    }

    currentMood.lastUpdate = new Date();
    this.teamMoods.set(userId, currentMood);
  }

  /**
   * Получить общую активность команды
   */
  static getTeamActivity(): TeamActivity {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentActivities = this.activities.filter(
      activity => activity.timestamp >= last24Hours
    );

    const commits = recentActivities.filter(a => a.type === "commit");
    const tasks = recentActivities.filter(a => a.type === "task");
    const messages = recentActivities.filter(a => a.type === "message");
    const bugs = recentActivities.filter(a => a.type === "bug_report");
    const deployments = recentActivities.filter(a => a.type === "deployment");

    // Анализируем качество кода на основе коммитов
    const codeQuality = this.analyzeCodeQuality(commits);

    // Подсчитываем активных разработчиков
    const activeDevelopers = new Set(
      recentActivities
        .filter(a => a.userId)
        .map(a => a.userId!)
    ).size;

    return {
      totalCommits: commits.length,
      totalTasks: tasks.length,
      totalMessages: messages.length,
      activeDevelopers,
      codeQuality,
      bugCount: bugs.length,
      deploymentCount: deployments.length,
      lastActivity: recentActivities.length > 0 
        ? recentActivities[recentActivities.length - 1].timestamp 
        : now
    };
  }

  /**
   * Анализ качества кода
   */
  private static analyzeCodeQuality(commits: ActivityMetric[]): number {
    if (commits.length === 0) return 0.5;

    let qualityScore = 0.5; // Базовый балл

    commits.forEach(commit => {
      const message = commit.data.message?.toLowerCase() || "";
      
      // Положительные индикаторы
      if (message.includes("refactor") || message.includes("optimize")) {
        qualityScore += 0.1;
      }
      if (message.includes("test") || message.includes("spec")) {
        qualityScore += 0.05;
      }
      if (message.includes("docs") || message.includes("readme")) {
        qualityScore += 0.05;
      }

      // Отрицательные индикаторы
      if (message.includes("fix") || message.includes("bug")) {
        qualityScore -= 0.05;
      }
      if (message.includes("hotfix") || message.includes("urgent")) {
        qualityScore -= 0.1;
      }
      if (message.includes("hack") || message.includes("temp")) {
        qualityScore -= 0.15;
      }
    });

    return Math.max(0, Math.min(1, qualityScore));
  }

  /**
   * Получить настроения команды
   */
  static getTeamMoods(): DeveloperMood[] {
    return Array.from(this.teamMoods.values());
  }

  /**
   * Получить общее настроение команды
   */
  static getOverallTeamMood(): {
    mood: string;
    confidence: number;
    workload: number;
    stressLevel: number;
  } {
    const moods = this.getTeamMoods();
    
    if (moods.length === 0) {
      return {
        mood: "neutral",
        confidence: 0.5,
        workload: 0.5,
        stressLevel: 0.3
      };
    }

    const moodCounts: Record<string, number> = {};
    let totalConfidence = 0;
    let totalWorkload = 0;

    moods.forEach(mood => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
      totalConfidence += mood.confidence;
      totalWorkload += mood.workload;
    });

    const mostCommonMood = Object.entries(moodCounts)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    const avgConfidence = totalConfidence / moods.length;
    const avgWorkload = totalWorkload / moods.length;
    
    // Вычисляем уровень стресса
    const stressLevel = Math.max(0, 
      (1 - avgConfidence) * 0.5 + 
      avgWorkload * 0.3 + 
      (moodCounts.stressed || 0) / moods.length * 0.2
    );

    return {
      mood: mostCommonMood,
      confidence: avgConfidence,
      workload: avgWorkload,
      stressLevel
    };
  }

  /**
   * Получить рекомендации на основе активности
   */
  static getRecommendations(): string[] {
    const teamActivity = this.getTeamActivity();
    const teamMood = this.getOverallTeamMood();
    const recommendations: string[] = [];

    // Рекомендации по активности
    if (teamActivity.totalCommits < 5) {
      recommendations.push("Команда работает медленно. Возможно, стоит проверить блокеры.");
    }

    if (teamActivity.bugCount > teamActivity.totalCommits * 0.3) {
      recommendations.push("Высокое количество багов. Рекомендуется больше тестирования.");
    }

    if (teamActivity.codeQuality < 0.4) {
      recommendations.push("Качество кода снижается. Планируйте рефакторинг.");
    }

    // Рекомендации по настроению
    if (teamMood.stressLevel > 0.7) {
      recommendations.push("Высокий уровень стресса в команде. Рекомендуется снизить нагрузку.");
    }

    if (teamMood.confidence < 0.4) {
      recommendations.push("Низкая уверенность команды. Нужна поддержка и мотивация.");
    }

    if (teamMood.workload > 0.8) {
      recommendations.push("Перегрузка команды. Рассмотрите возможность расширения.");
    }

    // Рекомендации по времени
    const hour = new Date().getHours();
    if (hour < 9 && teamActivity.totalCommits > 0) {
      recommendations.push("Активность рано утром. Команда может работать сверхурочно.");
    }

    if (hour > 20 && teamActivity.totalCommits > 0) {
      recommendations.push("Работа поздно вечером. Проверьте баланс работы и отдыха.");
    }

    return recommendations;
  }

  /**
   * Получить метрики для дашборда
   */
  static getDashboardMetrics(): {
    productivity: number;
    quality: number;
    teamHappiness: number;
    workload: number;
    recommendations: string[];
  } {
    const teamActivity = this.getTeamActivity();
    const teamMood = this.getOverallTeamMood();
    const recommendations = this.getRecommendations();

    // Вычисляем продуктивность (0-1)
    const productivity = Math.min(1, 
      (teamActivity.totalCommits / 20) * 0.4 + 
      (teamActivity.totalTasks / 10) * 0.3 + 
      (teamActivity.activeDevelopers / 5) * 0.3
    );

    // Качество кода
    const quality = teamActivity.codeQuality;

    // Счастье команды
    const teamHappiness = Math.max(0, 
      teamMood.confidence * 0.6 + 
      (1 - teamMood.stressLevel) * 0.4
    );

    // Рабочая нагрузка
    const workload = teamMood.workload;

    return {
      productivity,
      quality,
      teamHappiness,
      workload,
      recommendations
    };
  }
}
