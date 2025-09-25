import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

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

export class OpenAIService {
  /**
   * Generate embeddings for text using OpenAI
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  /**
   * Universal chat method
   */
  static async chat(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      const systemPrompt = `Ты - AI-ассистент Василий для системы управления проектами DeadLine. 
      Отвечай на русском языке, будь полезным и дружелюбным.`;
      
      const langchainMessages = [
        new SystemMessage(systemPrompt),
        ...messages.map(msg => 
          msg.role === "user" 
            ? new HumanMessage(msg.content)
            : new SystemMessage(msg.content)
        )
      ];

      const response = await chatModel.invoke(langchainMessages);
      return response.content as string;
    } catch (error) {
      console.error("Error in OpenAI chat:", error);
      throw new Error("Failed to get AI response");
    }
  }

  /**
   * Ask AI assistant with context from similar tasks
   */
  static async askAssistant(
    query: string,
    context: TaskContext[] = []
  ): Promise<AIResponse> {
    try {
      const systemPrompt = `Ты - AI-ассистент для системы управления проектами DeadLine. 
Твоя задача - помогать пользователям с управлением задачами, проектами и командой.

Контекст из похожих задач:
${context.map(task => `
- Задача: ${task.title}
- Описание: ${task.description || "Нет описания"}
- Статус: ${task.status}
- Приоритет: ${task.priority}
- Исполнитель: ${task.assignee || "Не назначен"}
- Проект: ${task.projectName || "Не указан"}
`).join("\n")}

Отвечай на русском языке, будь полезным и конкретным. Если можешь предложить улучшения или новые задачи - делай это.`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(query),
      ];

      const response = await chatModel.invoke(messages);
      
      return {
        response: response.content as string,
        context,
      };
    } catch (error) {
      console.error("Error asking AI assistant:", error);
      throw new Error("Failed to get AI response");
    }
  }

  /**
   * Generate task suggestions based on project context
   */
  static async generateTaskSuggestions(
    projectContext: string,
    existingTasks: TaskContext[]
  ): Promise<AITaskSuggestion[]> {
    try {
      const systemPrompt = `Ты - эксперт по управлению проектами. Проанализируй контекст проекта и существующие задачи, затем предложи 3-5 новых задач, которые могут быть полезны.

Контекст проекта: ${projectContext}

Существующие задачи:
${existingTasks.map(task => `- ${task.title} (${task.status}, ${task.priority})`).join("\n")}

Для каждой предложенной задачи укажи:
- title: краткое название задачи
- description: подробное описание
- priority: LOWEST, LOW, MEDIUM, HIGH, или HIGHEST
- estimatedHours: примерное количество часов
- reasoning: обоснование, почему эта задача важна

Отвечай в формате JSON массива объектов.`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage("Предложи новые задачи для этого проекта."),
      ];

      const response = await chatModel.invoke(messages);
      const content = response.content as string;
      
      // Try to parse JSON response
      try {
        const suggestions = JSON.parse(content);
        return Array.isArray(suggestions) ? suggestions : [];
      } catch (parseError) {
        console.error("Error parsing AI suggestions:", parseError);
        return [];
      }
    } catch (error) {
      console.error("Error generating task suggestions:", error);
      throw new Error("Failed to generate task suggestions");
    }
  }

  /**
   * Estimate task priority based on context
   */
  static async estimateTaskPriority(
    title: string,
    description: string,
    projectContext: string,
    existingTasks: TaskContext[]
  ): Promise<{
    priority: "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";
    reasoning: string;
    estimatedHours: number;
  }> {
    try {
      const systemPrompt = `Ты - эксперт по приоритизации задач. Проанализируй новую задачу и определи её приоритет на основе контекста проекта и существующих задач.

Контекст проекта: ${projectContext}

Существующие задачи:
${existingTasks.map(task => `- ${task.title} (${task.priority})`).join("\n")}

Новая задача:
- Название: ${title}
- Описание: ${description}

Определи:
- priority: LOWEST, LOW, MEDIUM, HIGH, или HIGHEST
- reasoning: обоснование приоритета
- estimatedHours: примерное количество часов на выполнение

Отвечай в формате JSON объекта.`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage("Определи приоритет и оценку времени для этой задачи."),
      ];

      const response = await chatModel.invoke(messages);
      const content = response.content as string;
      
      try {
        const result = JSON.parse(content);
        return {
          priority: result.priority || "MEDIUM",
          reasoning: result.reasoning || "Автоматическая оценка",
          estimatedHours: result.estimatedHours || 4,
        };
      } catch (parseError) {
        console.error("Error parsing AI priority estimation:", parseError);
        return {
          priority: "MEDIUM",
          reasoning: "Не удалось определить приоритет автоматически",
          estimatedHours: 4,
        };
      }
    } catch (error) {
      console.error("Error estimating task priority:", error);
      throw new Error("Failed to estimate task priority");
    }
  }

  /**
   * Generate project report with insights
   */
  static async generateProjectReport(
    projectName: string,
    tasks: TaskContext[],
    timeRange: string = "последний месяц"
  ): Promise<string> {
    try {
      const completedTasks = tasks.filter(t => t.status === "DONE");
      const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS");
      const todoTasks = tasks.filter(t => t.status === "TODO");
      
      const systemPrompt = `Ты - аналитик проектов. Создай подробный отчёт о проекте "${projectName}" за ${timeRange}.

Статистика:
- Всего задач: ${tasks.length}
- Завершено: ${completedTasks.length}
- В работе: ${inProgressTasks.length}
- К выполнению: ${todoTasks.length}

Задачи:
${tasks.map(task => `- ${task.title} (${task.status}, ${task.priority})`).join("\n")}

Создай отчёт, который включает:
1. Общую статистику проекта
2. Анализ производительности
3. Выявленные проблемы и риски
4. Рекомендации по улучшению
5. Прогноз завершения

Отвечай на русском языке, будь конкретным и полезным.`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage("Создай отчёт по проекту."),
      ];

      const response = await chatModel.invoke(messages);
      return response.content as string;
    } catch (error) {
      console.error("Error generating project report:", error);
      throw new Error("Failed to generate project report");
    }
  }
}
