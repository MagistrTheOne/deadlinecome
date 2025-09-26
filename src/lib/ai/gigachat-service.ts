// @deprecated: Use unified AI client with GigaChatProvider from src/lib/ai/core/
// This file will be removed after migration to unified AI client is complete

interface GigaChatConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface GigaChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    total_tokens: number;
  };
}

class GigaChatService {
  private config: GigaChatConfig;

  constructor() {
    this.config = {
      apiKey: process.env.GIGACHAT_API_KEY || '',
      baseUrl: process.env.GIGACHAT_BASE_URL || 'https://gigachat.devices.sberbank.ru/api/v1',
      model: 'GigaChat:latest',
      maxTokens: 4000,
      temperature: 0.7
    };
  }

  async analyzeExperience(data: {
    experience: string;
    outcome: 'success' | 'failure' | 'partial';
    aiId: string;
  }): Promise<{
    lessons: string[];
    confidence: number;
  }> {
    try {
      const prompt = `
        Проанализируй опыт AI-ассистента:
        
        Опыт: ${data.experience}
        Результат: ${data.outcome}
        AI ID: ${data.aiId}
        
        Извлеки ключевые уроки и рекомендации для улучшения.
        Верни ответ в формате JSON:
        {
          "lessons": ["урок1", "урок2", "урок3"],
          "confidence": 0.85
        }
      `;

      const response = await this.callGigaChat(prompt);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Ошибка анализа опыта:', error);
      return {
        lessons: ['Анализ недоступен'],
        confidence: 0.5
      };
    }
  }

  async planCollaboration(data: {
    participants: string[];
    task: string;
  }): Promise<{
    plan: string;
    roles: { [participant: string]: string };
    timeline: string;
  }> {
    try {
      const prompt = `
        Создай план коллаборации для AI-команды:
        
        Участники: ${data.participants.join(', ')}
        Задача: ${data.task}
        
        Определи роли каждого участника и временные рамки.
        Верни ответ в формате JSON:
        {
          "plan": "детальный план",
          "roles": {"ai-1": "роль1", "ai-2": "роль2"},
          "timeline": "временные рамки"
        }
      `;

      const response = await this.callGigaChat(prompt);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Ошибка планирования коллаборации:', error);
      return {
        plan: 'План недоступен',
        roles: {},
        timeline: 'Не определено'
      };
    }
  }

  async analyzeEmotions(data: {
    aiId: string;
    context: any;
    recentStates: any[];
  }): Promise<{
    mood: 'happy' | 'focused' | 'stressed' | 'tired' | 'excited' | 'frustrated';
    energy: number;
    stress: number;
    satisfaction: number;
    confidence: number;
  }> {
    try {
      const prompt = `
        Проанализируй эмоциональное состояние AI:
        
        AI ID: ${data.aiId}
        Контекст: ${JSON.stringify(data.context)}
        Последние состояния: ${JSON.stringify(data.recentStates)}
        
        Определи настроение, энергию, стресс, удовлетворенность и уверенность.
        Верни ответ в формате JSON:
        {
          "mood": "focused",
          "energy": 75,
          "stress": 25,
          "satisfaction": 80,
          "confidence": 85
        }
      `;

      const response = await this.callGigaChat(prompt);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Ошибка анализа эмоций:', error);
      return {
        mood: 'focused',
        energy: 70,
        stress: 30,
        satisfaction: 80,
        confidence: 85
      };
    }
  }

  async predictRisks(data: {
    projectData: any;
    historicalData: any[];
  }): Promise<{
    predictions: any[];
    mitigationStrategies: string[];
    monitoringPoints: string[];
  }> {
    try {
      const prompt = `
        Проанализируй риски проекта:
        
        Данные проекта: ${JSON.stringify(data.projectData)}
        Исторические данные: ${JSON.stringify(data.historicalData)}
        
        Предскажи возможные риски и предложи стратегии их снижения.
        Верни ответ в формате JSON:
        {
          "predictions": [
            {
              "type": "risk",
              "probability": 0.7,
              "impact": "high",
              "description": "описание риска",
              "recommendations": ["рекомендация1"],
              "timeframe": "2 недели",
              "confidence": 0.8
            }
          ],
          "mitigationStrategies": ["стратегия1", "стратегия2"],
          "monitoringPoints": ["метрика1", "метрика2"]
        }
      `;

      const response = await this.callGigaChat(prompt);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Ошибка предсказания рисков:', error);
      return {
        predictions: [],
        mitigationStrategies: ['Проведите дополнительный анализ'],
        monitoringPoints: ['Мониторьте ключевые метрики']
      };
    }
  }

  async trainCustomAI(data: {
    customAIId: string;
    dataType: string;
    data: any[];
    companyContext: any;
  }): Promise<{
    concepts: string[];
    accuracy: number;
    confidence: number;
  }> {
    try {
      const prompt = `
        Обучи Custom AI на корпоративных данных:
        
        AI ID: ${data.customAIId}
        Тип данных: ${data.dataType}
        Данные: ${JSON.stringify(data.data.slice(0, 5))} // Ограничиваем для промпта
        Контекст компании: ${JSON.stringify(data.companyContext)}
        
        Извлеки ключевые концепции и оцени точность обучения.
        Верни ответ в формате JSON:
        {
          "concepts": ["концепция1", "концепция2"],
          "accuracy": 0.85,
          "confidence": 0.9
        }
      `;

      const response = await this.callGigaChat(prompt);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Ошибка обучения Custom AI:', error);
      return {
        concepts: ['Обучение недоступно'],
        accuracy: 0.5,
        confidence: 0.5
      };
    }
  }

  async queryCustomAI(data: {
    customAIId: string;
    question: string;
    context: any;
  }): Promise<{
    answer: string;
    confidence: number;
    sources: string[];
    suggestions: string[];
  }> {
    try {
      const prompt = `
        Ответь на вопрос используя знания Custom AI:
        
        AI ID: ${data.customAIId}
        Вопрос: ${data.question}
        Контекст: ${JSON.stringify(data.context)}
        
        Дай развернутый ответ с указанием источников и предложениями.
        Верни ответ в формате JSON:
        {
          "answer": "детальный ответ",
          "confidence": 0.9,
          "sources": ["источник1", "источник2"],
          "suggestions": ["предложение1", "предложение2"]
        }
      `;

      const response = await this.callGigaChat(prompt);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Ошибка запроса к Custom AI:', error);
      return {
        answer: 'Ответ недоступен',
        confidence: 0.5,
        sources: [],
        suggestions: []
      };
    }
  }

  private async callGigaChat(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`GigaChat API error: ${response.status}`);
      }

      const data: GigaChatResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Ошибка вызова GigaChat API:', error);
      throw error;
    }
  }

  private parseJSONResponse(response: string): any {
    try {
      // Ищем JSON в ответе
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback - возвращаем базовую структуру
      return {
        error: 'Не удалось распарсить JSON ответ',
        rawResponse: response
      };
    } catch (error) {
      console.error('Ошибка парсинга JSON:', error);
      return {
        error: 'Ошибка парсинга JSON',
        rawResponse: response
      };
    }
  }
}

export { GigaChatService };

// Экспортируем экземпляр для обратной совместимости
export const gigaChatService = new GigaChatService();