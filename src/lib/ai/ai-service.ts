import { gigaChatService } from "./gigachat-service";

export interface TaskContext {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee?: string;
  projectName?: string;
  createdAt: Date;
}

export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";
  estimatedHours: number;
  reasoning: string;
}

export interface AIResponse {
  response: string;
  suggestions?: AITaskSuggestion[];
  context?: TaskContext[];
}

export class AIService {
  /**
   * Универсальный чат с AI (только GigaChat)
   */
  static async chat(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      return await gigaChatService.chat(messages, options);
    } catch (error) {
      console.error("Ошибка GigaChat API:", error);
      throw new Error("Не удалось получить ответ от Василия (GigaChat)");
    }
  }

  /**
   * Создание задач на основе описания проекта
   */
  static async createTasksFromDescription(
    projectDescription: string, 
    existingTasks: any[] = []
  ): Promise<{
    tasks: Array<{
      title: string;
      description: string;
      priority: "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";
      type: "BUG" | "TASK" | "STORY" | "EPIC";
      estimatedHours?: number;
    }>;
    reasoning: string;
  }> {
    try {
      return await gigaChatService.createTasksFromDescription(projectDescription, existingTasks);
    } catch (error) {
      console.error("Ошибка создания задач:", error);
      throw error;
    }
  }

  /**
   * Анализ времени выполнения задач
   */
  static async analyzeTaskTime(tasks: any[]): Promise<{
    analysis: string;
    recommendations: string[];
    estimatedTotalHours: number;
  }> {
    try {
      return await gigaChatService.analyzeTaskTime(tasks);
    } catch (error) {
      console.error("Ошибка анализа времени:", error);
      throw error;
    }
  }

  /**
   * Генерация отчета по проекту
   */
  static async generateProjectReport(projectData: any): Promise<{
    summary: string;
    keyMetrics: Record<string, any>;
    recommendations: string[];
    nextSteps: string[];
  }> {
    try {
      return await gigaChatService.generateProjectReport(projectData);
    } catch (error) {
      console.error("Ошибка генерации отчета:", error);
      throw error;
    }
  }

  /**
   * Умные предложения по улучшению проекта
   */
  static async getSmartSuggestions(projectContext: any): Promise<{
    suggestions: Array<{
      title: string;
      description: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
      category: string;
    }>;
    reasoning: string;
  }> {
    try {
      return await gigaChatService.getSmartSuggestions(projectContext);
    } catch (error) {
      console.error("Ошибка получения предложений:", error);
      throw error;
    }
  }

  /**
   * Получение статуса AI сервиса
   */
  static getServiceStatus(): {
    service: string;
    status: string;
  } {
    return {
      service: "GigaChat (Василий)",
      status: "Активен",
    };
  }
}
