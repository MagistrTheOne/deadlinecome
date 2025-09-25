"use client";

export interface AutoTask {
  id: string;
  title: string;
  description: string;
  type: "bug" | "feature" | "improvement" | "refactor" | "documentation" | "test";
  priority: "low" | "medium" | "high" | "critical";
  estimatedTime: number; // в часах
  assignee?: string;
  projectId?: string;
  tags: string[];
  source: "commit_analysis" | "code_review" | "performance_monitor" | "user_feedback" | "ai_suggestion";
  confidence: number; // 0-1
  createdAt: Date;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

export interface CommitAnalysis {
  hash: string;
  message: string;
  files: string[];
  additions: number;
  deletions: number;
  timestamp: Date;
  author: string;
}

export class AutoTaskCreator {
  private static createdTasks: AutoTask[] = [];

  /**
   * Анализирует коммит и создает задачи на основе изменений
   */
  static async analyzeCommitAndCreateTasks(commit: CommitAnalysis): Promise<AutoTask[]> {
    const tasks: AutoTask[] = [];

    // Анализируем сообщение коммита
    const messageTasks = this.analyzeCommitMessage(commit);
    tasks.push(...messageTasks);

    // Анализируем измененные файлы
    const fileTasks = this.analyzeFileChanges(commit);
    tasks.push(...fileTasks);

    // Анализируем размер изменений
    const sizeTasks = this.analyzeChangeSize(commit);
    tasks.push(...sizeTasks);

    // Сохраняем созданные задачи
    this.createdTasks.push(...tasks);

    return tasks;
  }

  /**
   * Анализирует сообщение коммита
   */
  private static analyzeCommitMessage(commit: CommitAnalysis): AutoTask[] {
    const tasks: AutoTask[] = [];
    const message = commit.message.toLowerCase();

    // Обнаруживаем баги
    if (message.includes("fix") || message.includes("bug") || message.includes("error")) {
      tasks.push({
        id: crypto.randomUUID(),
        title: `Исправление бага: ${commit.message.substring(0, 50)}`,
        description: `Обнаружен баг в коммите ${commit.hash}. Сообщение: "${commit.message}"`,
        type: "bug",
        priority: this.determinePriority(message),
        estimatedTime: 2,
        tags: ["bug", "fix", "commit-analysis"],
        source: "commit_analysis",
        confidence: 0.8,
        createdAt: new Date(),
        status: "pending"
      });
    }

    // Обнаруживаем новые функции
    if (message.includes("feat") || message.includes("add") || message.includes("implement")) {
      tasks.push({
        id: crypto.randomUUID(),
        title: `Новая функция: ${commit.message.substring(0, 50)}`,
        description: `Добавлена новая функция в коммите ${commit.hash}. Сообщение: "${commit.message}"`,
        type: "feature",
        priority: "medium",
        estimatedTime: 4,
        tags: ["feature", "new", "commit-analysis"],
        source: "commit_analysis",
        confidence: 0.7,
        createdAt: new Date(),
        status: "pending"
      });
    }

    // Обнаруживаем рефакторинг
    if (message.includes("refactor") || message.includes("clean") || message.includes("optimize")) {
      tasks.push({
        id: crypto.randomUUID(),
        title: `Рефакторинг: ${commit.message.substring(0, 50)}`,
        description: `Выполнен рефакторинг в коммите ${commit.hash}. Сообщение: "${commit.message}"`,
        type: "refactor",
        priority: "low",
        estimatedTime: 3,
        tags: ["refactor", "cleanup", "commit-analysis"],
        source: "commit_analysis",
        confidence: 0.9,
        createdAt: new Date(),
        status: "pending"
      });
    }

    // Обнаруживаем технический долг
    if (message.includes("todo") || message.includes("hack") || message.includes("temp")) {
      tasks.push({
        id: crypto.randomUUID(),
        title: `Технический долг: ${commit.message.substring(0, 50)}`,
        description: `Обнаружен технический долг в коммите ${commit.hash}. Сообщение: "${commit.message}"`,
        type: "improvement",
        priority: "medium",
        estimatedTime: 2,
        tags: ["tech-debt", "improvement", "commit-analysis"],
        source: "commit_analysis",
        confidence: 0.6,
        createdAt: new Date(),
        status: "pending"
      });
    }

    return tasks;
  }

  /**
   * Анализирует изменения в файлах
   */
  private static analyzeFileChanges(commit: CommitAnalysis): AutoTask[] {
    const tasks: AutoTask[] = [];

    commit.files.forEach(file => {
      const fileName = file.toLowerCase();

      // Анализируем тестовые файлы
      if (fileName.includes("test") || fileName.includes("spec")) {
        tasks.push({
          id: crypto.randomUUID(),
          title: `Обновление тестов: ${file}`,
          description: `Обновлены тесты для файла ${file} в коммите ${commit.hash}`,
          type: "test",
          priority: "medium",
          estimatedTime: 1,
          tags: ["test", "quality", "commit-analysis"],
          source: "commit_analysis",
          confidence: 0.8,
          createdAt: new Date(),
          status: "pending"
        });
      }

      // Анализируем документацию
      if (fileName.includes("readme") || fileName.includes("doc") || fileName.endsWith(".md")) {
        tasks.push({
          id: crypto.randomUUID(),
          title: `Обновление документации: ${file}`,
          description: `Обновлена документация для файла ${file} в коммите ${commit.hash}`,
          type: "documentation",
          priority: "low",
          estimatedTime: 1,
          tags: ["documentation", "docs", "commit-analysis"],
          source: "commit_analysis",
          confidence: 0.9,
          createdAt: new Date(),
          status: "pending"
        });
      }

      // Анализируем конфигурационные файлы
      if (fileName.includes("config") || fileName.includes("package.json") || fileName.includes(".env")) {
        tasks.push({
          id: crypto.randomUUID(),
          title: `Изменение конфигурации: ${file}`,
          description: `Изменена конфигурация в файле ${file} в коммите ${commit.hash}`,
          type: "improvement",
          priority: "high",
          estimatedTime: 2,
          tags: ["config", "setup", "commit-analysis"],
          source: "commit_analysis",
          confidence: 0.7,
          createdAt: new Date(),
          status: "pending"
        });
      }
    });

    return tasks;
  }

  /**
   * Анализирует размер изменений
   */
  private static analyzeChangeSize(commit: CommitAnalysis): AutoTask[] {
    const tasks: AutoTask[] = [];
    const totalChanges = commit.additions + commit.deletions;

    // Большие изменения могут требовать дополнительного тестирования
    if (totalChanges > 500) {
      tasks.push({
        id: crypto.randomUUID(),
        title: `Тестирование больших изменений`,
        description: `Коммит ${commit.hash} содержит ${totalChanges} изменений. Рекомендуется дополнительное тестирование.`,
        type: "test",
        priority: "high",
        estimatedTime: 4,
        tags: ["testing", "large-changes", "commit-analysis"],
        source: "commit_analysis",
        confidence: 0.8,
        createdAt: new Date(),
        status: "pending"
      });
    }

    // Много удалений может указывать на рефакторинг
    if (commit.deletions > commit.additions * 2) {
      tasks.push({
        id: crypto.randomUUID(),
        title: `Проверка после рефакторинга`,
        description: `Коммит ${commit.hash} содержит много удалений (${commit.deletions}). Проверьте, что функциональность не нарушена.`,
        type: "test",
        priority: "medium",
        estimatedTime: 2,
        tags: ["refactor", "testing", "commit-analysis"],
        source: "commit_analysis",
        confidence: 0.6,
        createdAt: new Date(),
        status: "pending"
      });
    }

    return tasks;
  }

  /**
   * Определяет приоритет на основе сообщения коммита
   */
  private static determinePriority(message: string): "low" | "medium" | "high" | "critical" {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("critical") || lowerMessage.includes("urgent") || lowerMessage.includes("hotfix")) {
      return "critical";
    }

    if (lowerMessage.includes("important") || lowerMessage.includes("major") || lowerMessage.includes("security")) {
      return "high";
    }

    if (lowerMessage.includes("minor") || lowerMessage.includes("small")) {
      return "low";
    }

    return "medium";
  }

  /**
   * Создает задачи на основе анализа производительности
   */
  static createPerformanceTasks(metrics: {
    slowQueries: number;
    memoryLeaks: number;
    cpuUsage: number;
    responseTime: number;
  }): AutoTask[] {
    const tasks: AutoTask[] = [];

    if (metrics.slowQueries > 5) {
      tasks.push({
        id: crypto.randomUUID(),
        title: "Оптимизация медленных запросов",
        description: `Обнаружено ${metrics.slowQueries} медленных запросов. Требуется оптимизация базы данных.`,
        type: "improvement",
        priority: "high",
        estimatedTime: 6,
        tags: ["performance", "database", "optimization"],
        source: "performance_monitor",
        confidence: 0.9,
        createdAt: new Date(),
        status: "pending"
      });
    }

    if (metrics.memoryLeaks > 0) {
      tasks.push({
        id: crypto.randomUUID(),
        title: "Исправление утечек памяти",
        description: `Обнаружено ${metrics.memoryLeaks} утечек памяти. Требуется немедленное исправление.`,
        type: "bug",
        priority: "critical",
        estimatedTime: 8,
        tags: ["memory", "leak", "performance"],
        source: "performance_monitor",
        confidence: 0.95,
        createdAt: new Date(),
        status: "pending"
      });
    }

    if (metrics.cpuUsage > 80) {
      tasks.push({
        id: crypto.randomUUID(),
        title: "Оптимизация использования CPU",
        description: `Высокое использование CPU (${metrics.cpuUsage}%). Требуется оптимизация алгоритмов.`,
        type: "improvement",
        priority: "high",
        estimatedTime: 4,
        tags: ["cpu", "performance", "optimization"],
        source: "performance_monitor",
        confidence: 0.8,
        createdAt: new Date(),
        status: "pending"
      });
    }

    if (metrics.responseTime > 2000) {
      tasks.push({
        id: crypto.randomUUID(),
        title: "Улучшение времени отклика",
        description: `Медленное время отклика (${metrics.responseTime}ms). Требуется оптимизация.`,
        type: "improvement",
        priority: "medium",
        estimatedTime: 3,
        tags: ["response-time", "performance", "optimization"],
        source: "performance_monitor",
        confidence: 0.7,
        createdAt: new Date(),
        status: "pending"
      });
    }

    return tasks;
  }

  /**
   * Создает задачи на основе пользовательского фидбека
   */
  static createFeedbackTasks(feedback: {
    message: string;
    type: "bug" | "feature" | "improvement";
    priority: "low" | "medium" | "high";
    user: string;
  }): AutoTask {
    return {
      id: crypto.randomUUID(),
      title: `Пользовательский фидбек: ${feedback.type}`,
      description: `Пользователь ${feedback.user} сообщил: "${feedback.message}"`,
      type: feedback.type,
      priority: feedback.priority,
      estimatedTime: this.estimateTimeFromType(feedback.type),
      tags: ["user-feedback", feedback.type],
      source: "user_feedback",
      confidence: 0.6,
      createdAt: new Date(),
      status: "pending"
    };
  }

  /**
   * Оценивает время выполнения на основе типа задачи
   */
  private static estimateTimeFromType(type: string): number {
    switch (type) {
      case "bug": return 2;
      case "feature": return 6;
      case "improvement": return 3;
      case "refactor": return 4;
      case "documentation": return 1;
      case "test": return 2;
      default: return 2;
    }
  }

  /**
   * Получить все созданные задачи
   */
  static getCreatedTasks(): AutoTask[] {
    return [...this.createdTasks];
  }

  /**
   * Получить статистику созданных задач
   */
  static getTaskStats(): {
    total: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    bySource: Record<string, number>;
    averageConfidence: number;
  } {
    const stats = {
      total: this.createdTasks.length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      averageConfidence: 0
    };

    let totalConfidence = 0;

    this.createdTasks.forEach(task => {
      stats.byType[task.type] = (stats.byType[task.type] || 0) + 1;
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
      stats.bySource[task.source] = (stats.bySource[task.source] || 0) + 1;
      totalConfidence += task.confidence;
    });

    stats.averageConfidence = this.createdTasks.length > 0 
      ? totalConfidence / this.createdTasks.length 
      : 0;

    return stats;
  }

  /**
   * Получить задачи по приоритету
   */
  static getTasksByPriority(priority: "low" | "medium" | "high" | "critical"): AutoTask[] {
    return this.createdTasks.filter(task => task.priority === priority);
  }

  /**
   * Получить задачи по типу
   */
  static getTasksByType(type: AutoTask["type"]): AutoTask[] {
    return this.createdTasks.filter(task => task.type === type);
  }

  /**
   * Обновить статус задачи
   */
  static updateTaskStatus(taskId: string, status: AutoTask["status"]): boolean {
    const task = this.createdTasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      return true;
    }
    return false;
  }
}
