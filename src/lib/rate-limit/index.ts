import { NextRequest, NextResponse } from 'next/server';
import { LoggerService } from '@/lib/logger';

// Интерфейсы для rate limiting
interface RateLimitConfig {
  windowMs: number; // Время окна в миллисекундах
  max: number; // Максимальное количество запросов
  message?: string; // Сообщение при превышении лимита
  skipSuccessfulRequests?: boolean; // Пропускать успешные запросы
  skipFailedRequests?: boolean; // Пропускать неудачные запросы
  keyGenerator?: (req: NextRequest) => string; // Функция генерации ключа
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// In-memory хранилище для rate limiting
class MemoryStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Очистка устаревших записей каждые 5 минут
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  get(key: string): { count: number; resetTime: number } | undefined {
    const value = this.store.get(key);
    if (value && value.resetTime < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return value;
  }

  set(key: string, count: number, resetTime: number) {
    this.store.set(key, { count, resetTime });
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const resetTime = now + windowMs;
    const existing = this.get(key);

    if (existing) {
      existing.count++;
      this.set(key, existing.count, existing.resetTime);
      return existing;
    } else {
      this.set(key, 1, resetTime);
      return { count: 1, resetTime };
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Глобальное хранилище
const store = new MemoryStore();

// Конфигурации rate limiting для разных типов запросов
export const rateLimitConfigs = {
  // Общий лимит для API
  api: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // 100 запросов за 15 минут
    message: 'Слишком много запросов, попробуйте позже'
  },

  // Строгий лимит для аутентификации
  auth: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // 5 попыток за 15 минут
    message: 'Слишком много попыток входа, попробуйте позже'
  },

  // Лимит для AI запросов
  ai: {
    windowMs: 60 * 1000, // 1 минута
    max: 10, // 10 запросов в минуту
    message: 'Слишком много AI запросов, подождите'
  },

  // Лимит для загрузки файлов
  upload: {
    windowMs: 60 * 1000, // 1 минута
    max: 5, // 5 загрузок в минуту
    message: 'Слишком много загрузок, подождите'
  },

  // Лимит для WebSocket соединений
  websocket: {
    windowMs: 60 * 1000, // 1 минута
    max: 10, // 10 соединений в минуту
    message: 'Слишком много WebSocket соединений'
  },

  // Лимит для поиска
  search: {
    windowMs: 60 * 1000, // 1 минута
    max: 30, // 30 поисковых запросов в минуту
    message: 'Слишком много поисковых запросов'
  },

  // Лимит для экспорта данных
  export: {
    windowMs: 60 * 60 * 1000, // 1 час
    max: 5, // 5 экспортов в час
    message: 'Слишком много экспортов, подождите час'
  }
} as const;

// Функция генерации ключа по умолчанию
function defaultKeyGenerator(req: NextRequest): string {
  // Используем IP адрес как базовый ключ
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             req.ip || 
             'unknown';
  
  // Добавляем user-agent для дополнительной уникальности
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  return `rate_limit:${ip}:${userAgent}`;
}

// Функция генерации ключа для аутентифицированных пользователей
function userKeyGenerator(req: NextRequest): string {
  const userId = req.headers.get('x-user-id');
  if (userId) {
    return `rate_limit:user:${userId}`;
  }
  return defaultKeyGenerator(req);
}

// Основной класс Rate Limiter
export class RateLimiter {
  private config: RateLimitConfig;
  private store: MemoryStore;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: defaultKeyGenerator,
      ...config
    };
    this.store = store;
  }

  /**
   * Проверка лимита для запроса
   */
  async checkLimit(req: NextRequest): Promise<{
    allowed: boolean;
    info: RateLimitInfo;
    response?: NextResponse;
  }> {
    const key = this.config.keyGenerator!(req);
    const now = Date.now();
    const windowMs = this.config.windowMs;
    const max = this.config.max;

    // Получаем текущее состояние
    const current = this.store.get(key);
    
    if (!current) {
      // Первый запрос в окне
      this.store.set(key, 1, now + windowMs);
      return {
        allowed: true,
        info: {
          limit: max,
          remaining: max - 1,
          reset: now + windowMs
        }
      };
    }

    // Проверяем, не истекло ли окно
    if (current.resetTime < now) {
      // Окно истекло, сбрасываем счетчик
      this.store.set(key, 1, now + windowMs);
      return {
        allowed: true,
        info: {
          limit: max,
          remaining: max - 1,
          reset: now + windowMs
        }
      };
    }

    // Проверяем лимит
    if (current.count >= max) {
      const retryAfter = Math.ceil((current.resetTime - now) / 1000);
      
      // Логируем превышение лимита
      LoggerService.logSecurity('Rate Limit Exceeded', {
        key,
        count: current.count,
        limit: max,
        retryAfter,
        url: req.url,
        method: req.method
      });

      return {
        allowed: false,
        info: {
          limit: max,
          remaining: 0,
          reset: current.resetTime,
          retryAfter
        },
        response: this.createRateLimitResponse(retryAfter)
      };
    }

    // Увеличиваем счетчик
    const updated = this.store.increment(key, windowMs);
    
    return {
      allowed: true,
      info: {
        limit: max,
        remaining: max - updated.count,
        reset: updated.resetTime
      }
    };
  }

  /**
   * Создание ответа при превышении лимита
   */
  private createRateLimitResponse(retryAfter: number): NextResponse {
    const message = this.config.message || 'Слишком много запросов';
    
    return NextResponse.json(
      {
        success: false,
        error: 'Rate Limit Exceeded',
        message,
        retryAfter,
        timestamp: new Date().toISOString()
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': this.config.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString()
        }
      }
    );
  }

  /**
   * Создание ответа с информацией о лимите
   */
  createResponseWithInfo(info: RateLimitInfo): NextResponse {
    return NextResponse.json(
      {
        success: true,
        rateLimit: {
          limit: info.limit,
          remaining: info.remaining,
          reset: new Date(info.reset).toISOString()
        }
      },
      {
        headers: {
          'X-RateLimit-Limit': info.limit.toString(),
          'X-RateLimit-Remaining': info.remaining.toString(),
          'X-RateLimit-Reset': new Date(info.reset).toISOString()
        }
      }
    );
  }
}

// Предустановленные rate limiter'ы
export const rateLimiters = {
  api: new RateLimiter(rateLimitConfigs.api),
  auth: new RateLimiter({
    ...rateLimitConfigs.auth,
    keyGenerator: userKeyGenerator
  }),
  ai: new RateLimiter({
    ...rateLimitConfigs.ai,
    keyGenerator: userKeyGenerator
  }),
  upload: new RateLimiter({
    ...rateLimitConfigs.upload,
    keyGenerator: userKeyGenerator
  }),
  websocket: new RateLimiter(rateLimitConfigs.websocket),
  search: new RateLimiter({
    ...rateLimitConfigs.search,
    keyGenerator: userKeyGenerator
  }),
  export: new RateLimiter({
    ...rateLimitConfigs.export,
    keyGenerator: userKeyGenerator
  })
};

// Middleware для rate limiting
export function withRateLimit(
  limiter: RateLimiter,
  options?: {
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }
) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    try {
      const result = await limiter.checkLimit(req);
      
      if (!result.allowed) {
        return result.response!;
      }

      // Добавляем заголовки с информацией о лимите
      const response = new NextResponse();
      response.headers.set('X-RateLimit-Limit', result.info.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.info.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(result.info.reset).toISOString());
      
      return null; // Продолжаем выполнение
    } catch (error) {
      LoggerService.logError(error as Error, { context: 'rate-limit-middleware' });
      return null; // В случае ошибки пропускаем rate limiting
    }
  };
}

// Утилиты для rate limiting
export const rateLimitUtils = {
  /**
   * Создание кастомного rate limiter'а
   */
  createCustomLimiter: (config: RateLimitConfig) => new RateLimiter(config),

  /**
   * Проверка лимита для конкретного ключа
   */
  checkKeyLimit: async (key: string, config: RateLimitConfig) => {
    const limiter = new RateLimiter(config);
    const mockReq = new NextRequest('http://localhost', {
      headers: { 'x-rate-limit-key': key }
    });
    
    return await limiter.checkLimit(mockReq);
  },

  /**
   * Сброс лимита для ключа
   */
  resetKeyLimit: (key: string) => {
    store.store.delete(key);
  },

  /**
   * Получение статистики rate limiting
   */
  getStats: () => {
    const stats = {
      totalKeys: store.store.size,
      keys: Array.from(store.store.keys()),
      timestamp: new Date().toISOString()
    };
    
    return stats;
  },

  /**
   * Очистка всех лимитов
   */
  clearAll: () => {
    store.store.clear();
  },

  /**
   * Проверка IP адреса на подозрительную активность
   */
  isSuspiciousIP: (ip: string): boolean => {
    // Простая проверка на подозрительные IP
    const suspiciousPatterns = [
      /^10\./, // Частные сети
      /^192\.168\./, // Частные сети
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Частные сети
      /^127\./, // Локальный хост
      /^::1$/, // IPv6 локальный хост
      /^fe80:/, // IPv6 link-local
    ];

    return suspiciousPatterns.some(pattern => pattern.test(ip));
  },

  /**
   * Генерация ключа для IP
   */
  generateIPKey: (ip: string, userAgent?: string) => {
    const baseKey = `rate_limit:ip:${ip}`;
    return userAgent ? `${baseKey}:${userAgent}` : baseKey;
  },

  /**
   * Генерация ключа для пользователя
   */
  generateUserKey: (userId: string, action?: string) => {
    const baseKey = `rate_limit:user:${userId}`;
    return action ? `${baseKey}:${action}` : baseKey;
  }
};

// Экспорт всех утилит
export const rateLimit = {
  RateLimiter,
  rateLimiters,
  rateLimitConfigs,
  withRateLimit,
  utils: rateLimitUtils
} as const;
