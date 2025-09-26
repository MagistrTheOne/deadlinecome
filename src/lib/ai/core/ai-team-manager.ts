/**
 * AI Team Manager - Unified system for managing all AI specialists
 * Provides switching between different AI personalities and unified API
 */

import { askVasily } from '../vasily-service';
import { AIClient } from './ai-client';
import { GigaChatProvider } from './providers/gigachat';
import { OpenAIProvider } from './providers/openai';
import { CircuitBreaker } from './resilience/circuit-breaker';
import { TokenBucket } from './resilience/rate-limit';
import { cache, aiCacheKey } from './cache/cache';
import { loadSystem } from './prompts';

// AI Specialist Types
export enum AISpecialistType {
  VASILY = 'vasily',           // Project Manager
  OLGA = 'olga',              // Security Expert
  PAVEL = 'pavel',            // Performance Engineer
  MIKHAIL = 'mikhail',        // Sprint Planning
  TATYANA = 'tatyana',        // Documentation
  SVETLANA = 'svetlana',      // Analytics
  ANDREY = 'andrey',          // DevOps
  ANNA = 'anna',              // QA Lead
  DMITRY = 'dmitry',          // Architecture
  MARIA = 'maria',            // UX/UI Designer
  ALEXEY = 'alexey',          // Code Reviewer
  IRINA = 'irina',            // HR Analytics
  SERGEY = 'sergey'           // Technical Writer
}

export interface AISpecialistInfo {
  id: AISpecialistType;
  name: string;
  role: string;
  specialization: string;
  avatar: string;
  color: string;
  skills: string[];
  personality: string;
  available: boolean;
  mood: 'productive' | 'thinking' | 'excited' | 'focused' | 'relaxed';
}

export interface AIChatRequest {
  message: string;
  specialist: AISpecialistType;
  context?: {
    userId?: string;
    workspaceId?: string;
    projectId?: string;
    timeOfDay?: number;
    userActivity?: string;
  };
}

export interface AIChatResponse {
  message: string;
  specialist: AISpecialistInfo;
  mood: string;
  emoji: string;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
  timestamp: string;
  context?: any;
}

// Specialist Registry
const SPECIALISTS: Record<AISpecialistType, AISpecialistInfo> = {
  [AISpecialistType.VASILY]: {
    id: AISpecialistType.VASILY,
    name: 'Василий',
    role: 'AI Project Manager',
    specialization: 'Управление проектами, планирование, оптимизация процессов',
    avatar: '👨‍💼',
    color: 'blue',
    skills: ['Project Management', 'Process Optimization', 'Risk Assessment', 'Team Coordination'],
    personality: 'Опытный руководитель с юмором, всегда готов помочь',
    available: true,
    mood: 'productive'
  },
  [AISpecialistType.OLGA]: {
    id: AISpecialistType.OLGA,
    name: 'Ольга',
    role: 'AI Security Expert',
    specialization: 'Безопасность приложений, сканирование уязвимостей, защита данных',
    avatar: '👩‍🔒',
    color: 'red',
    skills: ['Security Auditing', 'Vulnerability Assessment', 'Penetration Testing', 'Compliance'],
    personality: 'Тщательный аналитик, всегда бдительна к угрозам',
    available: true,
    mood: 'focused'
  },
  [AISpecialistType.PAVEL]: {
    id: AISpecialistType.PAVEL,
    name: 'Павел',
    role: 'AI Performance Engineer',
    specialization: 'Оптимизация производительности, анализ узких мест, масштабирование',
    avatar: '👨‍🔧',
    color: 'green',
    skills: ['Performance Tuning', 'Load Testing', 'Database Optimization', 'Caching'],
    personality: 'Технический перфекционист, любит решать сложные задачи',
    available: true,
    mood: 'focused'
  },
  [AISpecialistType.MIKHAIL]: {
    id: AISpecialistType.MIKHAIL,
    name: 'Михаил',
    role: 'AI Sprint Planning',
    specialization: 'Планирование спринтов, оценка задач, предсказание рисков',
    avatar: '👨‍📅',
    color: 'purple',
    skills: ['Sprint Planning', 'Task Estimation', 'Risk Analysis', 'Velocity Tracking'],
    personality: 'Стратегический мыслитель, любит планировать наперед',
    available: true,
    mood: 'thinking'
  },
  [AISpecialistType.TATYANA]: {
    id: AISpecialistType.TATYANA,
    name: 'Татьяна',
    role: 'AI Documentation Specialist',
    specialization: 'Генерация документации, API docs, технические спецификации',
    avatar: '👩‍📝',
    color: 'pink',
    skills: ['Technical Writing', 'API Documentation', 'Code Comments', 'User Guides'],
    personality: 'Творческая и внимательная к деталям',
    available: true,
    mood: 'productive'
  },
  [AISpecialistType.SVETLANA]: {
    id: AISpecialistType.SVETLANA,
    name: 'Светлана',
    role: 'AI Analytics Expert',
    specialization: 'Продвинутая аналитика, предсказательные модели, инсайты',
    avatar: '👩‍💼',
    color: 'orange',
    skills: ['Data Analysis', 'Predictive Modeling', 'Business Intelligence', 'Reporting'],
    personality: 'Аналитический ум, любит работать с данными',
    available: true,
    mood: 'thinking'
  },
  [AISpecialistType.ANDREY]: {
    id: AISpecialistType.ANDREY,
    name: 'Андрей',
    role: 'AI DevOps Engineer',
    specialization: 'CI/CD, автоматизация развертывания, инфраструктура',
    avatar: '👨‍💻',
    color: 'cyan',
    skills: ['CI/CD', 'Infrastructure as Code', 'Containerization', 'Monitoring'],
    personality: 'Практичный инженер, любит автоматизацию',
    available: true,
    mood: 'productive'
  },
  [AISpecialistType.ANNA]: {
    id: AISpecialistType.ANNA,
    name: 'Анна',
    role: 'AI QA Lead',
    specialization: 'Тестирование, QA процессы, автоматизация тестирования',
    avatar: '👩‍🔬',
    color: 'teal',
    skills: ['Test Automation', 'Quality Assurance', 'Bug Tracking', 'Test Strategy'],
    personality: 'Тщательная и методичная, любит порядок',
    available: false,
    mood: 'focused'
  },
  [AISpecialistType.DMITRY]: {
    id: AISpecialistType.DMITRY,
    name: 'Дмитрий',
    role: 'AI Architect',
    specialization: 'Архитектура систем, дизайн паттерны, масштабируемость',
    avatar: '👨‍🏗️',
    color: 'indigo',
    skills: ['System Architecture', 'Design Patterns', 'Scalability', 'Microservices'],
    personality: 'Архитектор с видением, любит строить надежные системы',
    available: false,
    mood: 'thinking'
  },
  [AISpecialistType.MARIA]: {
    id: AISpecialistType.MARIA,
    name: 'Мария',
    role: 'AI UX/UI Designer',
    specialization: 'Дизайн интерфейсов, пользовательский опыт, прототипирование',
    avatar: '👩‍🎨',
    color: 'rose',
    skills: ['UI/UX Design', 'Prototyping', 'User Research', 'Design Systems'],
    personality: 'Творческая и эмпатичная, любит создавать красивые интерфейсы',
    available: false,
    mood: 'excited'
  },
  [AISpecialistType.ALEXEY]: {
    id: AISpecialistType.ALEXEY,
    name: 'Алексей',
    role: 'AI Code Reviewer',
    specialization: 'Code review, качество кода, best practices',
    avatar: '👨‍⚖️',
    color: 'slate',
    skills: ['Code Review', 'Code Quality', 'Best Practices', 'Refactoring'],
    personality: 'Строгий, но справедливый критик кода',
    available: false,
    mood: 'focused'
  },
  [AISpecialistType.IRINA]: {
    id: AISpecialistType.IRINA,
    name: 'Ирина',
    role: 'AI HR Analytics',
    specialization: 'Аналитика команды, мотивация, предотвращение выгорания',
    avatar: '👩‍💼',
    color: 'emerald',
    skills: ['Team Analytics', 'Motivation', 'Burnout Prevention', 'Team Dynamics'],
    personality: 'Эмпатичная и заботливая, любит работать с людьми',
    available: false,
    mood: 'relaxed'
  },
  [AISpecialistType.SERGEY]: {
    id: AISpecialistType.SERGEY,
    name: 'Сергей',
    role: 'AI Technical Writer',
    specialization: 'Техническая документация, руководства, блог-посты',
    avatar: '👨‍✍️',
    color: 'amber',
    skills: ['Technical Writing', 'Content Creation', 'Knowledge Base', 'Blog Writing'],
    personality: 'Коммуникативный и образованный, любит объяснять сложное',
    available: false,
    mood: 'productive'
  }
};

// Unified AI Client
const cb = new CircuitBreaker({ threshold: 3, cooldownMs: 15000 });
const buckets = new Map<string, TokenBucket>();
function bucket(key: string) {
  if (!buckets.has(key)) buckets.set(key, new TokenBucket(10, 2));
  return buckets.get(key)!;
}

const client = new AIClient(
  new GigaChatProvider({ baseUrl: process.env.GIGACHAT_BASE!, apiKey: process.env.GIGACHAT_KEY! }),
  new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! })
);

export class AITeamManager {
  private static instance: AITeamManager;

  static getInstance(): AITeamManager {
    if (!AITeamManager.instance) {
      AITeamManager.instance = new AITeamManager();
    }
    return AITeamManager.instance;
  }

  /**
   * Get all available AI specialists
   */
  getAllSpecialists(): AISpecialistInfo[] {
    return Object.values(SPECIALISTS);
  }

  /**
   * Get available specialists only
   */
  getAvailableSpecialists(): AISpecialistInfo[] {
    return Object.values(SPECIALISTS).filter(s => s.available);
  }

  /**
   * Get specialist by type
   */
  getSpecialist(type: AISpecialistType): AISpecialistInfo | null {
    return SPECIALISTS[type] || null;
  }

  /**
   * Unified chat with any AI specialist
   */
  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const specialist = this.getSpecialist(request.specialist);
    if (!specialist) {
      throw new Error(`AI specialist ${request.specialist} not found`);
    }

    if (!specialist.available) {
      throw new Error(`AI specialist ${specialist.name} is currently unavailable`);
    }

    // Special handling for Vasily (existing implementation)
    if (request.specialist === AISpecialistType.VASILY) {
      const vasilyResponse = await askVasily(request.message, {
        userId: request.context?.userId,
        route: `ai-${request.specialist}`
      });

      return {
        message: vasilyResponse.message || vasilyResponse.response,
        specialist,
        mood: vasilyResponse.mood || 'productive',
        emoji: vasilyResponse.emoji || '🤖',
        suggestions: vasilyResponse.suggestions,
        actions: vasilyResponse.actions,
        timestamp: new Date().toISOString(),
        context: request.context
      };
    }

    // Generic AI response for other specialists
    const cacheKey = aiCacheKey({
      route: `ai-${request.specialist}`,
      prompt: request.message,
      user: request.context?.userId
    });

    // Check cache
    const cached = await cache.get<any>(cacheKey);
    if (cached) {
      return {
        ...cached,
        specialist,
        timestamp: new Date().toISOString()
      };
    }

    // Rate limiting
    const userKey = request.context?.userId || 'anon';
    if (!bucket(userKey).allow(1)) {
      throw new Error('rate-limited');
    }

    // Load specialist-specific system prompt
    const systemPrompt = await this.loadSpecialistPrompt(request.specialist, request.context);

    // Get AI response
    const aiResponse = await cb.exec(() =>
      client.chat({
        prompt: request.message,
        system: systemPrompt,
        json: true
      })
    );

    // Format response
    const response: AIChatResponse = {
      message: aiResponse.response || aiResponse.message || `Hello from ${specialist.name}!`,
      specialist,
      mood: specialist.mood,
      emoji: specialist.avatar,
      suggestions: this.generateSpecialistSuggestions(request.specialist, request.message),
      actions: this.generateSpecialistActions(request.specialist, request.context),
      timestamp: new Date().toISOString(),
      context: request.context
    };

    // Cache response
    await cache.set(cacheKey, response, 120);

    return response;
  }

  /**
   * Load specialist-specific system prompt
   */
  private async loadSpecialistPrompt(
    specialist: AISpecialistType,
    context?: any
  ): Promise<string> {
    try {
      // Try to load specialist-specific prompt
      return await loadSystem(specialist);
    } catch {
      // Fallback to generic specialist prompt
      const specialistInfo = SPECIALISTS[specialist];
      return `You are ${specialistInfo.name}, a ${specialistInfo.role} specializing in ${specialistInfo.specialization}.
Your personality: ${specialistInfo.personality}
Your skills: ${specialistInfo.skills.join(', ')}

Always respond in Russian and be helpful, professional, and engaging.
Context: ${JSON.stringify(context || {})}`;
    }
  }

  /**
   * Generate specialist-specific suggestions
   */
  private generateSpecialistSuggestions(specialist: AISpecialistType, message: string): string[] {
    const suggestions: Record<AISpecialistType, string[]> = {
      [AISpecialistType.VASILY]: ['Создать задачу', 'Показать аналитику', 'Оптимизировать процесс'],
      [AISpecialistType.OLGA]: ['Проверить безопасность', 'Сканировать уязвимости', 'Настроить защиту'],
      [AISpecialistType.PAVEL]: ['Оптимизировать производительность', 'Анализировать узкие места', 'Настроить кеширование'],
      [AISpecialistType.MIKHAIL]: ['Запланировать спринт', 'Оценить задачи', 'Проанализировать риски'],
      [AISpecialistType.TATYANA]: ['Создать документацию', 'Написать API docs', 'Обновить README'],
      [AISpecialistType.SVETLANA]: ['Показать аналитику', 'Создать отчет', 'Спрогнозировать метрики'],
      [AISpecialistType.ANDREY]: ['Настроить CI/CD', 'Оптимизировать деплой', 'Мониторить инфраструктуру'],
      [AISpecialistType.ANNA]: ['Создать тест-кейсы', 'Провести тестирование', 'Найти баги'],
      [AISpecialistType.DMITRY]: ['Спроектировать архитектуру', 'Выбрать паттерны', 'Планировать масштабирование'],
      [AISpecialistType.MARIA]: ['Создать дизайн', 'Прототипировать UI', 'Исследовать UX'],
      [AISpecialistType.ALEXEY]: ['Провести code review', 'Проверить качество', 'Предложить рефакторинг'],
      [AISpecialistType.IRINA]: ['Анализировать команду', 'Предотвратить выгорание', 'Повысить мотивацию'],
      [AISpecialistType.SERGEY]: ['Написать статью', 'Создать гайд', 'Документировать процесс']
    };

    return suggestions[specialist] || ['Помочь с задачей', 'Предоставить информацию', 'Дать совет'];
  }

  /**
   * Generate specialist-specific actions
   */
  private generateSpecialistActions(specialist: AISpecialistType, context?: any): Array<{ type: string; label: string; data: any }> {
    const actions: Record<AISpecialistType, Array<{ type: string; label: string; data: any }>> = {
      [AISpecialistType.VASILY]: [
        { type: 'create_task', label: 'Создать задачу', data: { projectId: context?.projectId } },
        { type: 'view_analytics', label: 'Аналитика', data: { workspaceId: context?.workspaceId } }
      ],
      [AISpecialistType.OLGA]: [
        { type: 'security_scan', label: 'Сканировать безопасность', data: { projectId: context?.projectId } },
        { type: 'vulnerability_check', label: 'Проверить уязвимости', data: { workspaceId: context?.workspaceId } }
      ],
      [AISpecialistType.PAVEL]: [
        { type: 'performance_analysis', label: 'Анализ производительности', data: { projectId: context?.projectId } },
        { type: 'optimization_suggestions', label: 'Предложения по оптимизации', data: { workspaceId: context?.workspaceId } }
      ],
      [AISpecialistType.MIKHAIL]: [
        { type: 'sprint_planning', label: 'Планирование спринта', data: { projectId: context?.projectId } },
        { type: 'risk_assessment', label: 'Оценка рисков', data: { workspaceId: context?.workspaceId } }
      ],
      [AISpecialistType.TATYANA]: [
        { type: 'generate_docs', label: 'Создать документацию', data: { projectId: context?.projectId } },
        { type: 'api_docs', label: 'Документировать API', data: { projectId: context?.projectId } }
      ],
      [AISpecialistType.SVETLANA]: [
        { type: 'show_analytics', label: 'Показать аналитику', data: { projectId: context?.projectId } },
        { type: 'generate_report', label: 'Создать отчет', data: { workspaceId: context?.workspaceId } }
      ],
      [AISpecialistType.ANDREY]: [
        { type: 'setup_cicd', label: 'Настроить CI/CD', data: { projectId: context?.projectId } },
        { type: 'deployment_status', label: 'Статус деплоя', data: { projectId: context?.projectId } }
      ],
      [AISpecialistType.ANNA]: [
        { type: 'create_tests', label: 'Создать тесты', data: { projectId: context?.projectId } },
        { type: 'run_tests', label: 'Запустить тестирование', data: { projectId: context?.projectId } }
      ],
      [AISpecialistType.DMITRY]: [
        { type: 'architecture_review', label: 'Ревью архитектуры', data: { projectId: context?.projectId } },
        { type: 'design_patterns', label: 'Рекомендовать паттерны', data: { projectId: context?.projectId } }
      ],
      [AISpecialistType.MARIA]: [
        { type: 'ui_design', label: 'Создать UI дизайн', data: { projectId: context?.projectId } },
        { type: 'ux_research', label: 'UX исследование', data: { projectId: context?.projectId } }
      ],
      [AISpecialistType.ALEXEY]: [
        { type: 'code_review', label: 'Code review', data: { projectId: context?.projectId } },
        { type: 'quality_check', label: 'Проверка качества', data: { projectId: context?.projectId } }
      ],
      [AISpecialistType.IRINA]: [
        { type: 'team_analytics', label: 'Аналитика команды', data: { workspaceId: context?.workspaceId } },
        { type: 'burnout_prevention', label: 'Предотвращение выгорания', data: { workspaceId: context?.workspaceId } }
      ],
      [AISpecialistType.SERGEY]: [
        { type: 'write_article', label: 'Написать статью', data: { projectId: context?.projectId } },
        { type: 'create_guide', label: 'Создать гайд', data: { projectId: context?.projectId } }
      ]
    };

    return actions[specialist] || [];
  }

  /**
   * Get specialist availability status
   */
  isSpecialistAvailable(type: AISpecialistType): boolean {
    return SPECIALISTS[type]?.available || false;
  }

  /**
   * Update specialist mood/status
   */
  updateSpecialistMood(type: AISpecialistType, mood: AISpecialistInfo['mood']): void {
    if (SPECIALISTS[type]) {
      SPECIALISTS[type].mood = mood;
    }
  }
}

// Export singleton instance
export const aiTeamManager = AITeamManager.getInstance();
