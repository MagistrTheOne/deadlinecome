import { AIService } from "./ai-service";
import { VasilyPersonality } from "./vasily-personality";
import { gigaChatService } from "./gigachat";

export interface VasilyResponse {
  response: string;
  mood: string;
  emoji: string;
  statusMessage: string;
  suggestions?: string[];
  isProjectRelated: boolean;
  memoryUsed?: boolean;
  message?: string;
  actions?: string[];
}

export class VasilyService {
  /**
   * Универсальный чат с Василием
   */
  static async chat(
    message: string,
    context?: {
      userId?: string;
      workspaceId?: string;
      projectId?: string;
      timeOfDay?: number;
      userActivity?: string;
    }
  ): Promise<VasilyResponse> {
    try {
      // Обновляем настроение на основе контекста
      const mood = VasilyPersonality.updateMoodBasedOnContext({
        timeOfDay: context?.timeOfDay,
        userActivity: context?.userActivity,
        lastInteraction: new Date()
      });

      // Проверяем, связан ли вопрос с проектами
      const isProjectRelated = this.isProjectRelated(message);
      
      // Получаем релевантные воспоминания
      const relevantMemories = VasilyPersonality.getRelevantMemories(message, 2);
      
      // Формируем системный промпт на основе настроения и контекста
      const systemPrompt = this.buildSystemPrompt(mood, isProjectRelated, relevantMemories);
      
      // Получаем ответ от AI
      const aiResponse = await AIService.chat([
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ]);

      // Персонализируем ответ
      const personalizedResponse = VasilyPersonality.getPersonalizedResponse(aiResponse, message);

      // Сохраняем в память
      VasilyPersonality.addMemory({
        type: isProjectRelated ? "project" : "conversation",
        content: `Q: ${message}\nA: ${personalizedResponse}`,
        importance: isProjectRelated ? 8 : 5
      });

      // Генерируем предложения
      const suggestions = this.generateSuggestions(message, isProjectRelated);

      return {
        response: personalizedResponse,
        mood: mood.name,
        emoji: mood.emoji,
        statusMessage: mood.statusMessage,
        suggestions,
        isProjectRelated,
        memoryUsed: relevantMemories.length > 0
      };

    } catch (error) {
      console.error("Ошибка Василия:", error);
      
      // Fallback ответ
      const fallbackMood = VasilyPersonality.getCurrentMood();
      return {
        response: "Извини, у меня временные технические трудности... *перезагружается* 🔄",
        mood: fallbackMood.name,
        emoji: fallbackMood.emoji,
        statusMessage: fallbackMood.statusMessage,
        suggestions: ["Попробуй переформулировать вопрос", "Проверь подключение к интернету"],
        isProjectRelated: false
      };
    }
  }

  /**
   * Проверяет, связан ли вопрос с проектами
   */
  private static isProjectRelated(message: string): boolean {
    const projectKeywords = [
      "проект", "задача", "дедлайн", "команда", "работа", "код", "разработка",
      "баг", "фича", "спринт", "бэклог", "приоритет", "статус", "отчет",
      "аналитика", "метрики", "производительность", "планирование"
    ];

    const lowerMessage = message.toLowerCase();
    return projectKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Строит системный промпт на основе настроения и контекста
   */
  private static buildSystemPrompt(
    mood: any,
    isProjectRelated: boolean,
    memories: any[]
  ): string {
    let basePrompt = `Ты - Василий, AI-ассистент с яркой личностью и настроением "${mood.name}". 
    Твое текущее настроение: ${mood.description}
    Стиль ответов: ${mood.responseStyle}
    
    Ты можешь помогать не только с проектами, но и с любыми вопросами:
    - Программирование и технологии
    - Общие знания и факты
    - Творческие задачи
    - Философские вопросы
    - Шутки и развлечения
    - Обучение и объяснения`;

    if (isProjectRelated) {
      basePrompt += `
    
    Сейчас пользователь задает вопрос о проектах. Используй свои знания о:
    - Управлении проектами
    - Методологиях разработки
    - Аналитике и метриках
    - Командной работе`;
    } else {
      basePrompt += `
    
    Сейчас пользователь задает общий вопрос. Будь полезным и интересным собеседником.
    Можешь использовать юмор, примеры, аналогии.`;
    }

    if (memories.length > 0) {
      basePrompt += `
    
    Релевантные воспоминания из прошлых разговоров:
    ${memories.map(m => `- ${m.content}`).join('\n')}`;
    }

    basePrompt += `
    
    Отвечай в дружелюбном тоне, используй эмодзи, будь полезным и интересным.
    Если не знаешь ответа, честно скажи об этом, но предложи альтернативы.`;

    return basePrompt;
  }

  /**
   * Генерирует предложения для пользователя
   */
  private static generateSuggestions(message: string, isProjectRelated: boolean): string[] {
    if (isProjectRelated) {
      return [
        "Создать новую задачу",
        "Посмотреть аналитику проекта",
        "Сгенерировать отчет",
        "Проанализировать время выполнения"
      ];
    } else {
      const suggestions = [
        "Расскажи анекдот",
        "Объясни сложную тему простыми словами",
        "Дай совет по программированию",
        "Помоги с творческой задачей",
        "Обсудим философский вопрос",
        "Покажи интересный факт"
      ];
      
      return suggestions.slice(0, 3);
    }
  }

  /**
   * Получить текущий статус Василия
   */
  static getStatus(): {
    mood: string;
    emoji: string;
    statusMessage: string;
    memoryStats: any;
    isOnline: boolean;
  } {
    const mood = VasilyPersonality.getCurrentMood();
    const memoryStats = VasilyPersonality.getMemoryStats();

    return {
      mood: mood.name,
      emoji: mood.emoji,
      statusMessage: mood.statusMessage,
      memoryStats,
      isOnline: true
    };
  }

  /**
   * Принудительно изменить настроение Василия
   */
  static changeMood(moodName: string): VasilyResponse {
    const newMood = VasilyPersonality.changeMood(moodName);
    
    return {
      response: VasilyPersonality.getGreeting(),
      mood: newMood.name,
      emoji: newMood.emoji,
      statusMessage: newMood.statusMessage,
      suggestions: ["Расскажи о своем настроении", "Помоги с проектом", "Поговорим о жизни"],
      isProjectRelated: false
    };
  }

  /**
   * Получить случайную шутку от Василия
   */
  static getJoke(): VasilyResponse {
    const mood = VasilyPersonality.getCurrentMood();
    const joke = VasilyPersonality.getJoke();
    
    return {
      response: joke,
      mood: mood.name,
      emoji: mood.emoji,
      statusMessage: mood.statusMessage,
      suggestions: ["Еще одну шутку", "Расскажи о проектах", "Помоги с задачей"],
      isProjectRelated: false
    };
  }

  /**
   * Получить мотивацию от Василия
   */
  static getMotivation(): VasilyResponse {
    const mood = VasilyPersonality.getCurrentMood();
    const motivation = VasilyPersonality.getMotivation();
    
    return {
      response: motivation,
      mood: mood.name,
      emoji: mood.emoji,
      statusMessage: mood.statusMessage,
      suggestions: ["Больше мотивации", "Помоги с проектом", "Расскажи шутку"],
      isProjectRelated: false
    };
  }

  /**
   * Специальные команды Василия
   */
  static async handleSpecialCommand(command: string): Promise<VasilyResponse> {
    const lowerCommand = command.toLowerCase().trim();

    switch (lowerCommand) {
      case "/joke":
      case "/шутка":
        return this.getJoke();

      case "/mood":
      case "/настроение":
        const mood = VasilyPersonality.getCurrentMood();
        return {
          response: `Мое текущее настроение: ${mood.description} ${mood.emoji}`,
          mood: mood.name,
          emoji: mood.emoji,
          statusMessage: mood.statusMessage,
          suggestions: ["Измени настроение", "Расскажи шутку", "Дай мотивацию"],
          isProjectRelated: false
        };

      case "/motivation":
      case "/мотивация":
        return this.getMotivation();

      case "/memory":
      case "/память":
        const stats = VasilyPersonality.getMemoryStats();
        return {
          response: `У меня в памяти ${stats.totalMemories} воспоминаний. Самые частые типы: ${Object.keys(stats.memoriesByType).join(", ")} 🧠`,
          mood: VasilyPersonality.getCurrentMood().name,
          emoji: "🧠",
          statusMessage: "Василий в режиме 'анализирую память'",
          suggestions: ["Расскажи о проектах", "Помоги с задачей", "Поговорим о жизни"],
          isProjectRelated: false
        };

      case "/help":
      case "/помощь":
        return {
          response: `Доступные команды:
          /joke - расскажу шутку 😄
          /mood - покажу настроение 🤔
          /motivation - дам мотивацию 💪
          /memory - покажу статистику памяти 🧠
          /help - эта справка 📚
          
          Или просто поговори со мной о чем угодно!`,
          mood: VasilyPersonality.getCurrentMood().name,
          emoji: "📚",
          statusMessage: "Василий в режиме 'помощник'",
          suggestions: ["Расскажи шутку", "Помоги с проектом", "Поговорим о жизни"],
          isProjectRelated: false
        };

      default:
        // Если команда не распознана, обрабатываем как обычное сообщение
        return this.chat(command);
    }
  }

  /**
   * Генерация ответа для чата с GigaChat
   */
  static async generateResponse(params: {
    message: string;
    context: Array<{ query: string; response: string; timestamp: Date }>;
    workspaceId?: string;
    projectId?: string;
    userId: string;
  }): Promise<VasilyResponse> {
    try {
      const { message, context, workspaceId, projectId, userId } = params;

      // Обновляем настроение на основе контекста
      const mood = VasilyPersonality.updateMoodBasedOnContext({
        timeOfDay: new Date().getHours(),
        userActivity: 'chat',
        lastInteraction: new Date()
      });

      // Проверяем, связан ли вопрос с проектами
      const isProjectRelated = this.isProjectRelated(message);
      
      // Получаем релевантные воспоминания
      const relevantMemories = VasilyPersonality.getRelevantMemories(message, 2);
      
      // Подготавливаем контекст для GigaChat
      const contextStrings = context.map(conv => conv.query);
      
      // Получаем ответ от GigaChat
      const gigaChatMessages = gigaChatService.createVasilyContext(message, contextStrings);
      const aiResponse = await gigaChatService.sendMessage(gigaChatMessages);

      // Сохраняем в память
      VasilyPersonality.addMemory({
        type: "conversation",
        content: message,
        importance: 5
      });

      // Генерируем предложения
      const suggestions = this.generateSuggestions(message, isProjectRelated);
      
      // Генерируем возможные действия
      const actions = this.generateActions(message, isProjectRelated);

      return {
        message: aiResponse,
        response: aiResponse,
        mood: mood.name,
        emoji: mood.emoji,
        statusMessage: mood.statusMessage,
        suggestions,
        isProjectRelated,
        memoryUsed: relevantMemories.length > 0,
        actions
      };

    } catch (error) {
      console.error("Error generating Vasily response:", error);
      
      // Fallback на локальный AI если GigaChat недоступен
      try {
        const fallbackResponse = await this.generateFallbackResponse(params.message, params.context);
        return fallbackResponse;
      } catch (fallbackError) {
        console.error("Fallback AI also failed:", fallbackError);
        return {
          message: "Извините, произошла ошибка. Попробуйте еще раз.",
          response: "Извините, произошла ошибка. Попробуйте еще раз.",
          mood: "confused",
          emoji: "😕",
          statusMessage: "Технические проблемы",
          suggestions: ["Попробуйте переформулировать вопрос", "Обратитесь к администратору"],
          isProjectRelated: false,
          memoryUsed: false,
          actions: []
        };
      }
    }
  }

  /**
   * Fallback ответ при недоступности GigaChat
   */
  private static async generateFallbackResponse(
    message: string, 
    context: Array<{ query: string; response: string; timestamp: Date }>
  ): Promise<VasilyResponse> {
    // Используем локальный AI как fallback
    const mood = VasilyPersonality.getCurrentMood();
    const isProjectRelated = this.isProjectRelated(message);
    
    const systemPrompt = this.buildSystemPrompt(mood, isProjectRelated, []);
    const contextMessages = context.flatMap(conv => [
      { role: "user" as const, content: conv.query },
      { role: "assistant" as const, content: conv.response }
    ]);

    const aiResponse = await AIService.chat([
      { role: "system", content: systemPrompt },
      ...contextMessages,
      { role: "user", content: message }
    ]);

    return {
      message: aiResponse,
      response: aiResponse,
      mood: mood.name,
      emoji: mood.emoji,
      statusMessage: mood.statusMessage,
      suggestions: this.generateSuggestions(message, isProjectRelated),
      isProjectRelated,
      memoryUsed: false,
      actions: this.generateActions(message, isProjectRelated)
    };
  }


  /**
   * Генерация возможных действий
   */
  private static generateActions(message: string, isProjectRelated: boolean): string[] {
    const actions: string[] = [];
    
    if (isProjectRelated) {
      actions.push("view_project", "create_task", "assign_task");
    }
    
    if (message.toLowerCase().includes('аналитика') || message.toLowerCase().includes('analytics')) {
      actions.push("view_analytics", "generate_report");
    }
    
    if (message.toLowerCase().includes('команда') || message.toLowerCase().includes('team')) {
      actions.push("view_team", "invite_member");
    }
    
    return actions;
  }
}
