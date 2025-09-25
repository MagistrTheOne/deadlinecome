"use client";

export interface TaskPrediction {
  id: string;
  taskId: string;
  estimatedTime: number; // в часах
  confidence: number; // 0-1
  factors: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  blockers: string[];
  recommendations: string[];
  predictedCompletion: Date;
  createdAt: Date;
}

export interface RiskAssessment {
  id: string;
  type: "technical" | "resource" | "timeline" | "quality" | "team";
  severity: "low" | "medium" | "high" | "critical";
  probability: number; // 0-1
  impact: number; // 0-1
  description: string;
  mitigation: string[];
  affectedTasks: string[];
  detectedAt: Date;
  resolved: boolean;
}

export interface ProjectForecast {
  id: string;
  projectId: string;
  totalEstimatedTime: number;
  confidence: number;
  completionDate: Date;
  risks: RiskAssessment[];
  resourceNeeds: {
    developers: number;
    designers: number;
    testers: number;
    managers: number;
  };
  milestones: Array<{
    name: string;
    date: Date;
    confidence: number;
  }>;
  createdAt: Date;
}

export interface DeveloperPerformance {
  userId: string;
  userName: string;
  averageTaskTime: number;
  qualityScore: number;
  productivityTrend: "improving" | "stable" | "declining";
  specialization: string[];
  workload: number; // 0-1
  availability: Date[];
  predictedCapacity: number; // часов в неделю
}

export class PredictiveAnalytics {
  private static predictions: TaskPrediction[] = [];
  private static risks: RiskAssessment[] = [];
  private static forecasts: ProjectForecast[] = [];
  private static developerPerformance: Map<string, DeveloperPerformance> = new Map();

  /**
   * Предсказывает время выполнения задачи
   */
  static async predictTaskCompletion(task: {
    id: string;
    title: string;
    description: string;
    type: string;
    complexity: number;
    assignee?: string;
    dependencies: string[];
    projectId: string;
  }): Promise<TaskPrediction> {
    const factors: string[] = [];
    let estimatedTime = 4; // Базовое время в часах
    let confidence = 0.5;
    const blockers: string[] = [];
    const recommendations: string[] = [];

    // Анализируем сложность
    if (task.complexity > 7) {
      estimatedTime *= 2;
      factors.push("Высокая сложность");
      confidence -= 0.2;
    } else if (task.complexity < 3) {
      estimatedTime *= 0.5;
      factors.push("Низкая сложность");
      confidence += 0.1;
    }

    // Анализируем тип задачи
    switch (task.type.toLowerCase()) {
      case "bug":
        estimatedTime *= 1.5;
        factors.push("Исправление бага");
        break;
      case "feature":
        estimatedTime *= 2;
        factors.push("Новая функция");
        break;
      case "refactor":
        estimatedTime *= 1.8;
        factors.push("Рефакторинг");
        break;
      case "test":
        estimatedTime *= 0.7;
        factors.push("Написание тестов");
        break;
      case "documentation":
        estimatedTime *= 0.6;
        factors.push("Документация");
        break;
    }

    // Анализируем зависимости
    if (task.dependencies.length > 0) {
      estimatedTime += task.dependencies.length * 2;
      factors.push(`${task.dependencies.length} зависимостей`);
      confidence -= 0.1;
      blockers.push("Зависимости от других задач");
    }

    // Анализируем исполнителя
    if (task.assignee) {
      const devPerf = this.developerPerformance.get(task.assignee);
      if (devPerf) {
        estimatedTime *= (1 / devPerf.averageTaskTime) * 4; // Нормализуем к базовому времени
        factors.push(`Исполнитель: ${devPerf.userName}`);
        confidence += 0.1;
        
        if (devPerf.workload > 0.8) {
          estimatedTime *= 1.5;
          blockers.push("Высокая загрузка исполнителя");
          recommendations.push("Рассмотрите перераспределение нагрузки");
        }
      }
    }

    // Анализируем описание задачи
    const description = task.description.toLowerCase();
    if (description.includes("urgent") || description.includes("critical")) {
      estimatedTime *= 0.8; // Срочные задачи выполняются быстрее
      factors.push("Срочная задача");
    }

    if (description.includes("research") || description.includes("investigate")) {
      estimatedTime *= 2;
      factors.push("Требует исследования");
      confidence -= 0.2;
    }

    // Определяем уровень риска
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    if (blockers.length > 2 || confidence < 0.3) {
      riskLevel = "critical";
    } else if (blockers.length > 1 || confidence < 0.5) {
      riskLevel = "high";
    } else if (blockers.length > 0 || confidence < 0.7) {
      riskLevel = "medium";
    }

    // Генерируем рекомендации
    if (task.dependencies.length > 3) {
      recommendations.push("Разбейте задачу на более мелкие части");
    }

    if (confidence < 0.5) {
      recommendations.push("Требуется дополнительное планирование");
    }

    if (estimatedTime > 40) {
      recommendations.push("Рассмотрите разбиение на подзадачи");
    }

    const prediction: TaskPrediction = {
      id: crypto.randomUUID(),
      taskId: task.id,
      estimatedTime: Math.round(estimatedTime * 10) / 10,
      confidence: Math.max(0.1, Math.min(1, confidence)),
      factors,
      riskLevel,
      blockers,
      recommendations,
      predictedCompletion: new Date(Date.now() + estimatedTime * 60 * 60 * 1000),
      createdAt: new Date()
    };

    this.predictions.push(prediction);
    return prediction;
  }

  /**
   * Оценивает риски проекта
   */
  static assessProjectRisks(project: {
    id: string;
    name: string;
    tasks: any[];
    team: string[];
    deadline: Date;
    budget?: number;
  }): RiskAssessment[] {
    const risks: RiskAssessment[] = [];

    // Анализируем временные риски
    const totalEstimatedTime = project.tasks.reduce((sum, task) => {
      const prediction = this.predictions.find(p => p.taskId === task.id);
      return sum + (prediction?.estimatedTime || 4);
    }, 0);

    const timeUntilDeadline = project.deadline.getTime() - Date.now();
    const availableHours = timeUntilDeadline / (1000 * 60 * 60);

    if (totalEstimatedTime > availableHours * 0.8) {
      risks.push({
        id: crypto.randomUUID(),
        type: "timeline",
        severity: "high",
        probability: 0.8,
        impact: 0.9,
        description: "Высокий риск срыва дедлайна",
        mitigation: [
          "Увеличить команду разработки",
          "Приоритизировать задачи",
          "Упростить функциональность"
        ],
        affectedTasks: project.tasks.map(t => t.id),
        detectedAt: new Date(),
        resolved: false
      });
    }

    // Анализируем технические риски
    const complexTasks = project.tasks.filter(task => task.complexity > 7);
    if (complexTasks.length > project.tasks.length * 0.3) {
      risks.push({
        id: crypto.randomUUID(),
        type: "technical",
        severity: "medium",
        probability: 0.6,
        impact: 0.7,
        description: "Много сложных технических задач",
        mitigation: [
          "Провести техническое планирование",
          "Создать прототипы",
          "Привлечь экспертов"
        ],
        affectedTasks: complexTasks.map(t => t.id),
        detectedAt: new Date(),
        resolved: false
      });
    }

    // Анализируем ресурсные риски
    if (project.team.length < 3) {
      risks.push({
        id: crypto.randomUUID(),
        type: "resource",
        severity: "high",
        probability: 0.7,
        impact: 0.8,
        description: "Недостаточно ресурсов в команде",
        mitigation: [
          "Нанять дополнительных разработчиков",
          "Привлечь внешних консультантов",
          "Пересмотреть объем проекта"
        ],
        affectedTasks: project.tasks.map(t => t.id),
        detectedAt: new Date(),
        resolved: false
      });
    }

    // Анализируем риски качества
    const tasksWithoutTests = project.tasks.filter(task => 
      !task.description.toLowerCase().includes("test") && 
      task.type !== "test"
    );

    if (tasksWithoutTests.length > project.tasks.length * 0.7) {
      risks.push({
        id: crypto.randomUUID(),
        type: "quality",
        severity: "medium",
        probability: 0.5,
        impact: 0.6,
        description: "Недостаточное покрытие тестами",
        mitigation: [
          "Добавить задачи на написание тестов",
          "Внедрить TDD практики",
          "Провести code review"
        ],
        affectedTasks: tasksWithoutTests.map(t => t.id),
        detectedAt: new Date(),
        resolved: false
      });
    }

    // Анализируем командные риски
    const teamWorkload = Array.from(this.developerPerformance.values())
      .filter(dev => project.team.includes(dev.userId))
      .reduce((sum, dev) => sum + dev.workload, 0) / project.team.length;

    if (teamWorkload > 0.9) {
      risks.push({
        id: crypto.randomUUID(),
        type: "team",
        severity: "high",
        probability: 0.8,
        impact: 0.7,
        description: "Высокая загрузка команды",
        mitigation: [
          "Снизить нагрузку на команду",
          "Перенести дедлайн",
          "Привлечь дополнительных разработчиков"
        ],
        affectedTasks: project.tasks.map(t => t.id),
        detectedAt: new Date(),
        resolved: false
      });
    }

    this.risks.push(...risks);
    return risks;
  }

  /**
   * Создает прогноз проекта
   */
  static createProjectForecast(project: {
    id: string;
    name: string;
    tasks: any[];
    team: string[];
    deadline: Date;
  }): ProjectForecast {
    const risks = this.assessProjectRisks(project);
    
    // Вычисляем общее время
    const totalEstimatedTime = project.tasks.reduce((sum, task) => {
      const prediction = this.predictions.find(p => p.taskId === task.id);
      return sum + (prediction?.estimatedTime || 4);
    }, 0);

    // Учитываем риски в расчете времени
    const riskMultiplier = 1 + risks.reduce((sum, risk) => {
      return sum + (risk.probability * risk.impact * 0.1);
    }, 0);

    const adjustedTime = totalEstimatedTime * riskMultiplier;

    // Вычисляем дату завершения
    const teamCapacity = project.team.length * 40; // 40 часов в неделю на человека
    const weeksNeeded = adjustedTime / teamCapacity;
    const completionDate = new Date(Date.now() + weeksNeeded * 7 * 24 * 60 * 60 * 1000);

    // Вычисляем уверенность
    const avgConfidence = this.predictions
      .filter(p => project.tasks.some(t => t.id === p.taskId))
      .reduce((sum, p) => sum + p.confidence, 0) / project.tasks.length || 0.5;

    // Создаем вехи
    const milestones = [
      {
        name: "Планирование завершено",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        confidence: 0.9
      },
      {
        name: "50% задач выполнено",
        date: new Date(Date.now() + (weeksNeeded * 0.5) * 7 * 24 * 60 * 60 * 1000),
        confidence: avgConfidence
      },
      {
        name: "Проект завершен",
        date: completionDate,
        confidence: avgConfidence * 0.8
      }
    ];

    const forecast: ProjectForecast = {
      id: crypto.randomUUID(),
      projectId: project.id,
      totalEstimatedTime: Math.round(adjustedTime * 10) / 10,
      confidence: Math.max(0.1, Math.min(1, avgConfidence)),
      completionDate,
      risks,
      resourceNeeds: {
        developers: Math.ceil(project.team.length * 1.2),
        designers: Math.ceil(project.team.length * 0.3),
        testers: Math.ceil(project.team.length * 0.4),
        managers: Math.ceil(project.team.length * 0.2)
      },
      milestones,
      createdAt: new Date()
    };

    this.forecasts.push(forecast);
    return forecast;
  }

  /**
   * Обновляет производительность разработчика
   */
  static updateDeveloperPerformance(userId: string, data: {
    taskTime: number;
    qualityScore: number;
    workload: number;
    specialization: string[];
  }): void {
    const existing = this.developerPerformance.get(userId);
    
    const performance: DeveloperPerformance = {
      userId,
      userName: existing?.userName || "Разработчик",
      averageTaskTime: existing ? 
        (existing.averageTaskTime + data.taskTime) / 2 : 
        data.taskTime,
      qualityScore: existing ? 
        (existing.qualityScore + data.qualityScore) / 2 : 
        data.qualityScore,
      productivityTrend: existing ? 
        this.calculateProductivityTrend(existing.averageTaskTime, data.taskTime) : 
        "stable",
      specialization: data.specialization,
      workload: data.workload,
      availability: existing?.availability || [],
      predictedCapacity: Math.round((1 - data.workload) * 40) // 40 часов в неделю
    };

    this.developerPerformance.set(userId, performance);
  }

  /**
   * Вычисляет тренд продуктивности
   */
  private static calculateProductivityTrend(oldTime: number, newTime: number): "improving" | "stable" | "declining" {
    const change = (oldTime - newTime) / oldTime;
    
    if (change > 0.1) return "improving";
    if (change < -0.1) return "declining";
    return "stable";
  }

  /**
   * Получает все предсказания
   */
  static getPredictions(): TaskPrediction[] {
    return [...this.predictions];
  }

  /**
   * Получает все риски
   */
  static getRisks(): RiskAssessment[] {
    return [...this.risks];
  }

  /**
   * Получает все прогнозы
   */
  static getForecasts(): ProjectForecast[] {
    return [...this.forecasts];
  }

  /**
   * Получает производительность разработчиков
   */
  static getDeveloperPerformance(): DeveloperPerformance[] {
    return Array.from(this.developerPerformance.values());
  }

  /**
   * Получает статистику предсказаний
   */
  static getPredictionStats(): {
    totalPredictions: number;
    averageConfidence: number;
    riskDistribution: Record<string, number>;
    accuracy: number;
  } {
    const totalPredictions = this.predictions.length;
    const averageConfidence = totalPredictions > 0 ? 
      this.predictions.reduce((sum, p) => sum + p.confidence, 0) / totalPredictions : 0;

    const riskDistribution: Record<string, number> = {};
    this.predictions.forEach(prediction => {
      riskDistribution[prediction.riskLevel] = (riskDistribution[prediction.riskLevel] || 0) + 1;
    });

    // Упрощенная оценка точности (в реальном проекте нужно сравнивать с фактическими результатами)
    const accuracy = Math.max(0.6, averageConfidence * 0.8);

    return {
      totalPredictions,
      averageConfidence,
      riskDistribution,
      accuracy
    };
  }

  /**
   * Разрешает риск
   */
  static resolveRisk(riskId: string): boolean {
    const risk = this.risks.find(r => r.id === riskId);
    if (risk) {
      risk.resolved = true;
      return true;
    }
    return false;
  }
}
