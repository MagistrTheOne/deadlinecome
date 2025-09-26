import { LoggerService } from '@/lib/logger';

// Интерфейсы для кэширования
interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

interface CacheOptions {
  ttl?: number; // Time to live в секундах
  prefix?: string; // Префикс для ключей
  serialize?: boolean; // Сериализация данных
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  totalRequests: number;
  hitRate: number;
}

// Класс для работы с Redis кэшем
export class RedisCache {
  private client: any = null;
  private config: CacheConfig;
  private stats: CacheStats;
  private isConnected: boolean = false;

  constructor(config: CacheConfig) {
    this.config = {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      ...config
    };
    
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalRequests: 0,
      hitRate: 0
    };
  }

  /**
   * Инициализация подключения к Redis
   */
  async connect(): Promise<void> {
    try {
      // Динамический импорт Redis
      const Redis = await import('ioredis');
      
      this.client = new Redis.default({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db || 0,
        retryDelayOnFailover: this.config.retryDelayOnFailover,
        maxRetriesPerRequest: this.config.maxRetriesPerRequest,
        lazyConnect: this.config.lazyConnect
      });

      // Обработчики событий
      this.client.on('connect', () => {
        this.isConnected = true;
        LoggerService.logSystemEvent('Redis Connected', {
          host: this.config.host,
          port: this.config.port
        });
      });

      this.client.on('error', (error: Error) => {
        this.isConnected = false;
        this.stats.errors++;
        LoggerService.logError(error, { context: 'redis-connection' });
      });

      this.client.on('close', () => {
        this.isConnected = false;
        LoggerService.logSystemEvent('Redis Disconnected');
      });

      // Подключаемся
      await this.client.connect();
      
    } catch (error) {
      LoggerService.logError(error as Error, { context: 'redis-connection' });
      throw error;
    }
  }

  /**
   * Проверка подключения
   */
  async isReady(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получение значения из кэша
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    this.stats.totalRequests++;
    
    try {
      if (!this.isConnected) {
        this.stats.misses++;
        return null;
      }

      const fullKey = this.buildKey(key, options?.prefix);
      const value = await this.client.get(fullKey);
      
      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();
      
      // Логируем попадание в кэш
      LoggerService.logCache('GET', fullKey, true);
      
      // Десериализация если нужно
      if (options?.serialize !== false) {
        try {
          return JSON.parse(value);
        } catch {
          return value as T;
        }
      }
      
      return value as T;
    } catch (error) {
      this.stats.errors++;
      LoggerService.logError(error as Error, { context: 'redis-get' });
      return null;
    }
  }

  /**
   * Установка значения в кэш
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const fullKey = this.buildKey(key, options?.prefix);
      let serializedValue: string;
      
      // Сериализация если нужно
      if (options?.serialize !== false) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = String(value);
      }

      // Установка с TTL
      if (options?.ttl) {
        await this.client.setex(fullKey, options.ttl, serializedValue);
      } else {
        await this.client.set(fullKey, serializedValue);
      }

      this.stats.sets++;
      LoggerService.logCache('SET', fullKey, false);
      
      return true;
    } catch (error) {
      this.stats.errors++;
      LoggerService.logError(error as Error, { context: 'redis-set' });
      return false;
    }
  }

  /**
   * Удаление значения из кэша
   */
  async delete(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.client.del(fullKey);
      
      this.stats.deletes++;
      LoggerService.logCache('DELETE', fullKey, false);
      
      return result > 0;
    } catch (error) {
      this.stats.errors++;
      LoggerService.logError(error as Error, { context: 'redis-delete' });
      return false;
    }
  }

  /**
   * Проверка существования ключа
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.client.exists(fullKey);
      
      return result === 1;
    } catch (error) {
      this.stats.errors++;
      LoggerService.logError(error as Error, { context: 'redis-exists' });
      return false;
    }
  }

  /**
   * Установка TTL для ключа
   */
  async expire(key: string, ttl: number, options?: CacheOptions): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.client.expire(fullKey, ttl);
      
      return result === 1;
    } catch (error) {
      this.stats.errors++;
      LoggerService.logError(error as Error, { context: 'redis-expire' });
      return false;
    }
  }

  /**
   * Получение TTL ключа
   */
  async ttl(key: string, options?: CacheOptions): Promise<number> {
    try {
      if (!this.isConnected) {
        return -1;
      }

      const fullKey = this.buildKey(key, options?.prefix);
      return await this.client.ttl(fullKey);
    } catch (error) {
      this.stats.errors++;
      LoggerService.logError(error as Error, { context: 'redis-ttl' });
      return -1;
    }
  }

  /**
   * Очистка кэша по паттерну
   */
  async clearPattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) {
        return 0;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client.del(...keys);
      LoggerService.logSystemEvent('Cache Cleared', { pattern, keysCount: keys.length });
      
      return result;
    } catch (error) {
      this.stats.errors++;
      LoggerService.logError(error as Error, { context: 'redis-clear-pattern' });
      return 0;
    }
  }

  /**
   * Получение статистики кэша
   */
  getStats(): CacheStats {
    this.updateHitRate();
    return { ...this.stats };
  }

  /**
   * Сброс статистики
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalRequests: 0,
      hitRate: 0
    };
  }

  /**
   * Закрытие подключения
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Построение полного ключа
   */
  private buildKey(key: string, prefix?: string): string {
    const basePrefix = process.env.REDIS_PREFIX || 'deadline';
    const fullPrefix = prefix ? `${basePrefix}:${prefix}` : basePrefix;
    return `${fullPrefix}:${key}`;
  }

  /**
   * Обновление hit rate
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = Math.round((this.stats.hits / this.stats.totalRequests) * 100);
    }
  }
}

// Глобальный экземпляр кэша
let cacheInstance: RedisCache | null = null;

/**
 * Инициализация кэша
 */
export async function initializeCache(): Promise<RedisCache> {
  if (cacheInstance) {
    return cacheInstance;
  }

  const config: CacheConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  };

  cacheInstance = new RedisCache(config);
  await cacheInstance.connect();
  
  return cacheInstance;
}

/**
 * Получение экземпляра кэша
 */
export function getCache(): RedisCache | null {
  return cacheInstance;
}

/**
 * Утилиты для кэширования
 */
export const cacheUtils = {
  /**
   * Кэширование с автоматическим fallback
   */
  async withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions & { ttl?: number }
  ): Promise<T> {
    const cache = getCache();
    if (!cache) {
      return await fetcher();
    }

    // Пытаемся получить из кэша
    const cached = await cache.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Получаем данные
    const data = await fetcher();
    
    // Сохраняем в кэш
    await cache.set(key, data, options);
    
    return data;
  },

  /**
   * Инвалидация кэша по паттерну
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const cache = getCache();
    if (!cache) return 0;
    
    return await cache.clearPattern(pattern);
  },

  /**
   * Кэширование пользовательских данных
   */
  async cacheUserData(userId: string, data: any, ttl: number = 3600): Promise<void> {
    const cache = getCache();
    if (!cache) return;
    
    await cache.set(`user:${userId}`, data, { ttl, prefix: 'user' });
  },

  /**
   * Получение пользовательских данных
   */
  async getUserData<T>(userId: string): Promise<T | null> {
    const cache = getCache();
    if (!cache) return null;
    
    return await cache.get<T>(`user:${userId}`, { prefix: 'user' });
  },

  /**
   * Кэширование API ответов
   */
  async cacheApiResponse(endpoint: string, params: any, data: any, ttl: number = 300): Promise<void> {
    const cache = getCache();
    if (!cache) return;
    
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    await cache.set(key, data, { ttl, prefix: 'api' });
  },

  /**
   * Получение API ответа из кэша
   */
  async getApiResponse<T>(endpoint: string, params: any): Promise<T | null> {
    const cache = getCache();
    if (!cache) return null;
    
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return await cache.get<T>(key, { prefix: 'api' });
  }
};

// Экспорт
export const cache = {
  RedisCache,
  initializeCache,
  getCache,
  utils: cacheUtils
} as const;
