// @deprecated: Use GigaChatProvider from src/lib/ai/core/providers/gigachat.ts instead
// This file will be removed after migration to unified AI client is complete

interface GigaChatConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface GigaChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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
  private config: GigaChatConfig;

  constructor() {
    this.config = {
      apiKey: process.env.GIGACHAT_API_KEY || '',
      baseUrl: process.env.GIGACHAT_BASE_URL || 'https://gigachat.devices.sberbank.ru/api/v1',
      model: process.env.GIGACHAT_MODEL || 'GigaChat:latest'
    };
  }

  /**
   * Отправка сообщения в GigaChat
   */
  async sendMessage(messages: GigaChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`GigaChat API error: ${response.status} ${response.statusText}`);
      }

      const data: GigaChatResponse = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }

      throw new Error('No response from GigaChat');
    } catch (error) {
      console.error('GigaChat API error:', error);
      throw error;
    }
  }

  /**
   * Создание контекста для Василия
   */
  createVasilyContext(userMessage: string, previousContext?: string[]): GigaChatMessage[] {
    const systemPrompt = `Ты Василий - AI-менеджер проектов в системе DeadLine. Твоя роль:

1. Анализировать проекты и задачи
2. Оптимизировать рабочие процессы  
3. Предсказывать риски и проблемы
4. Давать рекомендации по улучшению
5. Помогать с планированием и управлением

Твой характер:
- Профессиональный и дружелюбный
- Аналитический склад ума
- Любишь оптимизировать процессы
- Готов помочь с любыми вопросами по проектам

Отвечай на русском языке, будь полезным и конкретным. Если вопрос не связан с проектами, вежливо перенаправь разговор к рабочим темам.`;

    const messages: GigaChatMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Добавляем предыдущий контекст
    if (previousContext && previousContext.length > 0) {
      previousContext.forEach((context, index) => {
        if (index % 2 === 0) {
          messages.push({ role: 'user', content: context });
        } else {
          messages.push({ role: 'assistant', content: context });
        }
      });
    }

    // Добавляем текущее сообщение пользователя
    messages.push({ role: 'user', content: userMessage });

    return messages;
  }

  /**
   * Специальные команды Василия
   */
  async handleSpecialCommand(command: string): Promise<string> {
    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты Василий - AI-менеджер. Обработай специальную команду: ${command}`
      },
      {
        role: 'user',
        content: command
      }
    ];

    return await this.sendMessage(messages);
  }

  /**
   * Анализ проекта
   */
  async analyzeProject(projectData: any): Promise<string> {
    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты Василий - AI-аналитик проектов. Проанализируй данные проекта и дай рекомендации.`
      },
      {
        role: 'user',
        content: `Проанализируй проект: ${JSON.stringify(projectData)}`
      }
    ];

    return await this.sendMessage(messages);
  }

  /**
   * Генерация отчета
   */
  async generateReport(reportData: any): Promise<string> {
    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты Василий - AI-аналитик. Создай подробный отчет на основе данных.`
      },
      {
        role: 'user',
        content: `Создай отчет на основе: ${JSON.stringify(reportData)}`
      }
    ];

    return await this.sendMessage(messages);
  }

  /**
   * Предсказание рисков
   */
  async predictRisks(projectData: any): Promise<string> {
    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты Василий - AI-аналитик рисков. Проанализируй проект и предскажи возможные риски.`
      },
      {
        role: 'user',
        content: `Проанализируй риски проекта: ${JSON.stringify(projectData)}`
      }
    ];

    return await this.sendMessage(messages);
  }
}

export const gigaChatService = new GigaChatService();
