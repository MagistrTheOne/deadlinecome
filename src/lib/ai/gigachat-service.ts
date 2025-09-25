interface GigaChatAuthResponse {
  access_token: string;
  expires_at: number;
  token_type: string;
}

interface GigaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GigaChatRequest {
  model: string;
  messages: GigaChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface GigaChatResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GigaChatService {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private readonly baseUrl = process.env.GIGACHAT_BASE_URL || "https://gigachat.devices.sberbank.ru/api/v1";
  private readonly apiKey = process.env.GIGACHAT_API_KEY;
  private readonly authToken = process.env.GIGACHAT_AUTH_TOKEN;
  private readonly scope = process.env.GIGACHAT_SCOPE || "GIGACHAT_API_PERS";

  /**
   * Получение токена доступа для GigaChat API
   */
  private async getAccessToken(): Promise<string> {
    // Проверяем, есть ли действующий токен
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (!this.authToken) {
      throw new Error("GigaChat auth token не настроен");
    }

    try {
      // Для Node.js окружения отключаем проверку SSL
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "RqUID": this.generateRqUID(),
          "Authorization": `Bearer ${this.authToken}`,
        },
        body: new URLSearchParams({
          scope: this.scope,
        }),
      };

      // В Node.js окружении добавляем опции для игнорирования SSL
      if (typeof window === 'undefined') {
        // @ts-ignore
        fetchOptions.agent = new (require('https').Agent)({
          rejectUnauthorized: false
        });
      }

      const response = await fetch("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", fetchOptions);

      if (!response.ok) {
        throw new Error(`Ошибка авторизации GigaChat: ${response.status} ${response.statusText}`);
      }

      const data: GigaChatAuthResponse = await response.json();
      
      this.accessToken = data.access_token;
      this.tokenExpiresAt = data.expires_at * 1000; // Конвертируем в миллисекунды
      
      return this.accessToken;
    } catch (error) {
      console.error("Ошибка получения токена GigaChat:", error);
      throw new Error("Не удалось получить токен доступа GigaChat");
    }
  }

  /**
   * Генерация уникального RqUID
   */
  private generateRqUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Отправка запроса к GigaChat API
   */
  async chat(messages: GigaChatMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      
      const requestBody: GigaChatRequest = {
        model: options?.model || "GigaChat:latest",
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
        stream: false,
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка GigaChat API: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: GigaChatResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error("GigaChat вернул пустой ответ");
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error("Ошибка GigaChat API:", error);
      throw error;
    }
  }

  /**
   * Создание задач на основе описания проекта
   */
  async createTasksFromDescription(projectDescription: string, existingTasks: any[] = []): Promise<{
    tasks: Array<{
      title: string;
      description: string;
      priority: "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";
      type: "BUG" | "TASK" | "STORY" | "EPIC";
      estimatedHours?: number;
    }>;
    reasoning: string;
  }> {
    const messages: GigaChatMessage[] = [
      {
        role: "system",
        content: `Ты - AI-ассистент Василий, специализирующийся на управлении проектами. 
        Твоя задача - анализировать описание проекта и создавать структурированные задачи.
        
        Существующие задачи: ${JSON.stringify(existingTasks, null, 2)}
        
        Верни ответ в формате JSON:
        {
          "tasks": [
            {
              "title": "Название задачи",
              "description": "Подробное описание",
              "priority": "LOWEST|LOW|MEDIUM|HIGH|HIGHEST",
              "type": "BUG|TASK|STORY|EPIC",
              "estimatedHours": число_часов
            }
          ],
          "reasoning": "Объяснение логики создания задач"
        }`
      },
      {
        role: "user",
        content: `Создай задачи для проекта: ${projectDescription}`
      }
    ];

    const response = await this.chat(messages, { temperature: 0.3 });
    
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error("Не удалось распарсить ответ GigaChat");
    }
  }

  /**
   * Анализ времени выполнения задач
   */
  async analyzeTaskTime(tasks: any[]): Promise<{
    analysis: string;
    recommendations: string[];
    estimatedTotalHours: number;
  }> {
    const messages: GigaChatMessage[] = [
      {
        role: "system",
        content: `Ты - AI-ассистент Василий, эксперт по анализу времени выполнения задач.
        Проанализируй предоставленные задачи и дай рекомендации по оптимизации времени.
        
        Верни ответ в формате JSON:
        {
          "analysis": "Анализ времени выполнения",
          "recommendations": ["рекомендация1", "рекомендация2"],
          "estimatedTotalHours": общее_количество_часов
        }`
      },
      {
        role: "user",
        content: `Проанализируй время выполнения задач: ${JSON.stringify(tasks, null, 2)}`
      }
    ];

    const response = await this.chat(messages, { temperature: 0.4 });
    
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error("Не удалось распарсить ответ GigaChat");
    }
  }

  /**
   * Генерация отчета по проекту
   */
  async generateProjectReport(projectData: any): Promise<{
    summary: string;
    keyMetrics: Record<string, any>;
    recommendations: string[];
    nextSteps: string[];
  }> {
    const messages: GigaChatMessage[] = [
      {
        role: "system",
        content: `Ты - AI-ассистент Василий, создающий аналитические отчеты по проектам.
        Создай подробный отчет на основе данных проекта.
        
        Верни ответ в формате JSON:
        {
          "summary": "Краткое резюме проекта",
          "keyMetrics": {"метрика": "значение"},
          "recommendations": ["рекомендация1", "рекомендация2"],
          "nextSteps": ["шаг1", "шаг2"]
        }`
      },
      {
        role: "user",
        content: `Создай отчет по проекту: ${JSON.stringify(projectData, null, 2)}`
      }
    ];

    const response = await this.chat(messages, { temperature: 0.5 });
    
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error("Не удалось распарсить ответ GigaChat");
    }
  }

  /**
   * Умные предложения по улучшению проекта
   */
  async getSmartSuggestions(projectContext: any): Promise<{
    suggestions: Array<{
      title: string;
      description: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
      category: string;
    }>;
    reasoning: string;
  }> {
    const messages: GigaChatMessage[] = [
      {
        role: "system",
        content: `Ты - AI-ассистент Василий, дающий умные предложения по улучшению проектов.
        Проанализируй контекст и предложи улучшения.
        
        Верни ответ в формате JSON:
        {
          "suggestions": [
            {
              "title": "Название предложения",
              "description": "Описание",
              "priority": "LOW|MEDIUM|HIGH",
              "category": "Категория"
            }
          ],
          "reasoning": "Объяснение предложений"
        }`
      },
      {
        role: "user",
        content: `Дай предложения по улучшению: ${JSON.stringify(projectContext, null, 2)}`
      }
    ];

    const response = await this.chat(messages, { temperature: 0.6 });
    
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error("Не удалось распарсить ответ GigaChat");
    }
  }
}

// Экспортируем единственный экземпляр сервиса
export const gigaChatService = new GigaChatService();
