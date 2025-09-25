import { gigaChatService } from "./gigachat-service";
import { OpenAIService } from "./openai-service";

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
  private static useGigaChat = true; // Приоритет GigaChat

  /**
   * Универсальный чат с AI
   */
  static async chat(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      if (this.useGigaChat) {
        return await gigaChatService.chat(messages, options);
      } else {
        // Fallback на OpenAI
        return await OpenAIService.chat(messages, options);
      }
    } catch (error) {
      console.error("Ошибка основного AI сервиса:", error);
      
      // Переключаемся на fallback
      if (this.useGigaChat) {
        console.log("Переключение на OpenAI fallback");
        this.useGigaChat = false;
        return await OpenAIService.chat(messages, options);
      } else {
        throw error;
      }
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
      if (this.useGigaChat) {
        return await gigaChatService.createTasksFromDescription(projectDescription, existingTasks);
      } else {
        return await OpenAIService.createTasksFromDescription(projectDescription, existingTasks);
      }
    } catch (error) {
      console.error("Ошибка создания задач:", error);
      
      if (this.useGigaChat) {
        this.useGigaChat = false;
        return await OpenAIService.createTasksFromDescription(projectDescription, existingTasks);
      } else {
        throw error;
      }
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
      if (this.useGigaChat) {
        return await gigaChatService.analyzeTaskTime(tasks);
      } else {
        return await OpenAIService.analyzeTaskTime(tasks);
      }
    } catch (error) {
      console.error("Ошибка анализа времени:", error);
      
      if (this.useGigaChat) {
        this.useGigaChat = false;
        return await OpenAIService.analyzeTaskTime(tasks);
      } else {
        throw error;
      }
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
      if (this.useGigaChat) {
        return await gigaChatService.generateProjectReport(projectData);
      } else {
        return await OpenAIService.generateProjectReport(projectData);
      }
    } catch (error) {
      console.error("Ошибка генерации отчета:", error);
      
      if (this.useGigaChat) {
        this.useGigaChat = false;
        return await OpenAIService.generateProjectReport(projectData);
      } else {
        throw error;
      }
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
      if (this.useGigaChat) {
        return await gigaChatService.getSmartSuggestions(projectContext);
      } else {
        return await OpenAIService.getSmartSuggestions(projectContext);
      }
    } catch (error) {
      console.error("Ошибка получения предложений:", error);
      
      if (this.useGigaChat) {
        this.useGigaChat = false;
        return await OpenAIService.getSmartSuggestions(projectContext);
      } else {
        throw error;
      }
    }
  }

  /**
   * Генерация эмбеддингов (только OpenAI)
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    return await OpenAIService.generateEmbedding(text);
  }

  /**
   * Поиск похожих задач (только OpenAI)
   */
  static async findSimilarTasks(
    query: string, 
    tasks: TaskContext[], 
    threshold: number = 0.8
  ): Promise<TaskContext[]> {
    return await OpenAIService.findSimilarTasks(query, tasks, threshold);
  }

  /**
   * Получение статуса AI сервиса
   */
  static getServiceStatus(): {
    primary: string;
    fallback: string;
    isUsingPrimary: boolean;
  } {
    return {
      primary: "GigaChat",
      fallback: "OpenAI",
      isUsingPrimary: this.useGigaChat,
    };
  }

  /**
   * Принудительное переключение на GigaChat
   */
  static forceGigaChat(): void {
    this.useGigaChat = true;
  }

  /**
   * Принудительное переключение на OpenAI
   */
  static forceOpenAI(): void {
    this.useGigaChat = false;
  }
}
