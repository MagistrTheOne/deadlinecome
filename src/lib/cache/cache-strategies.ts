import { getCache } from './redis';
import { LoggerService } from '@/lib/logger';

// Стратегии кэширования
export class CacheStrategies {
  private cache = getCache();

  // LRU кэширование для часто используемых данных
  async lruCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; maxSize?: number } = {}
  ): Promise<T> {
    const { ttl = 3600, maxSize = 1000 } = options;
    
    if (!this.cache) {
      return await fetcher();
    }

    // Проверяем кэш
    const cached = await this.cache.get<T>(key);
    if (cached !== null) {
      // Обновляем время доступа для LRU
      await this.cache.expire(key, ttl);
      return cached;
    }

    // Получаем данные
    const data = await fetcher();
    
    // Сохраняем в кэш
    await this.cache.set(key, data, { ttl });
    
    return data;
  }

  // Write-through кэширование
  async writeThroughCache<T>(
    key: string,
    data: T,
    options: { ttl?: number } = {}
  ): Promise<void> {
    const { ttl = 3600 } = options;
    
    if (!this.cache) return;

    await this.cache.set(key, data, { ttl });
    LoggerService.db.info('Write-through cache updated', { key, ttl });
  }

  // Write-behind кэширование
  async writeBehindCache<T>(
    key: string,
    data: T,
    options: { ttl?: number; batchSize?: number } = {}
  ): Promise<void> {
    const { ttl = 3600, batchSize = 10 } = options;
    
    if (!this.cache) return;

    // Добавляем в очередь для асинхронной записи
    await this.cache.set(`queue:${key}`, data, { ttl: 86400 }); // 24 часа для очереди
    
    LoggerService.db.info('Write-behind cache queued', { key, batchSize });
  }

  // Cache-aside паттерн
  async cacheAside<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number } = {}
  ): Promise<T> {
    const { ttl = 3600 } = options;
    
    if (!this.cache) {
      return await fetcher();
    }

    // Пытаемся получить из кэша
    const cached = await this.cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Получаем данные из источника
    const data = await fetcher();
    
    // Сохраняем в кэш
    await this.cache.set(key, data, { ttl });
    
    return data;
  }

  // Инвалидация кэша при обновлении
  async invalidateOnUpdate<T>(
    key: string,
    updater: () => Promise<T>,
    options: { ttl?: number; invalidatePattern?: string } = {}
  ): Promise<T> {
    const { ttl = 3600, invalidatePattern } = options;
    
    // Выполняем обновление
    const data = await updater();
    
    if (!this.cache) {
      return data;
    }

    // Инвалидируем связанные ключи
    if (invalidatePattern) {
      await this.cache.clearPattern(invalidatePattern);
    } else {
      await this.cache.delete(key);
    }
    
    // Сохраняем новые данные
    await this.cache.set(key, data, { ttl });
    
    LoggerService.db.info('Cache invalidated and updated', { key, invalidatePattern });
    
    return data;
  }

  // Кэширование с зависимостями
  async dependentCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    dependencies: string[],
    options: { ttl?: number } = {}
  ): Promise<T> {
    const { ttl = 3600 } = options;
    
    if (!this.cache) {
      return await fetcher();
    }

    // Проверяем зависимости
    const depKeys = dependencies.map(dep => `dep:${dep}`);
    const depValues = await Promise.all(
      depKeys.map(depKey => this.cache!.get(depKey))
    );

    // Если все зависимости актуальны
    if (depValues.every(val => val !== null)) {
      const cached = await this.cache.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Получаем данные
    const data = await fetcher();
    
    // Сохраняем данные и зависимости
    await this.cache.set(key, data, { ttl });
    await Promise.all(
      depKeys.map((depKey, index) => 
        this.cache!.set(depKey, Date.now(), { ttl })
      )
    );
    
    return data;
  }

  // Кэширование с версионированием
  async versionedCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    version: string,
    options: { ttl?: number } = {}
  ): Promise<T> {
    const { ttl = 3600 } = options;
    const versionedKey = `${key}:v${version}`;
    
    if (!this.cache) {
      return await fetcher();
    }

    // Проверяем версию
    const currentVersion = await this.cache.get<string>(`${key}:version`);
    if (currentVersion === version) {
      const cached = await this.cache.get<T>(versionedKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Получаем данные
    const data = await fetcher();
    
    // Сохраняем с новой версией
    await this.cache.set(versionedKey, data, { ttl });
    await this.cache.set(`${key}:version`, version, { ttl });
    
    // Очищаем старые версии
    await this.cache.clearPattern(`${key}:v*`);
    
    return data;
  }

  // Кэширование с TTL градацией
  async tieredCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    tiers: { level: number; ttl: number; probability: number }[] = [
      { level: 1, ttl: 300, probability: 0.8 },    // 5 минут, 80% запросов
      { level: 2, ttl: 1800, probability: 0.15 },   // 30 минут, 15% запросов
      { level: 3, ttl: 3600, probability: 0.05 }    // 1 час, 5% запросов
    ]
  ): Promise<T> {
    if (!this.cache) {
      return await fetcher();
    }

    // Выбираем уровень кэша на основе вероятности
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedTier = tiers[0];

    for (const tier of tiers) {
      cumulativeProbability += tier.probability;
      if (random <= cumulativeProbability) {
        selectedTier = tier;
        break;
      }
    }

    const tieredKey = `${key}:tier${selectedTier.level}`;
    
    // Проверяем кэш
    const cached = await this.cache.get<T>(tieredKey);
    if (cached !== null) {
      return cached;
    }

    // Получаем данные
    const data = await fetcher();
    
    // Сохраняем в выбранном уровне
    await this.cache.set(tieredKey, data, { ttl: selectedTier.ttl });
    
    LoggerService.db.info('Tiered cache updated', { 
      key, 
      tier: selectedTier.level, 
      ttl: selectedTier.ttl 
    });
    
    return data;
  }

  // Кэширование с предзагрузкой
  async preloadCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; preloadThreshold?: number } = {}
  ): Promise<T> {
    const { ttl = 3600, preloadThreshold = 0.8 } = options;
    
    if (!this.cache) {
      return await fetcher();
    }

    // Проверяем TTL
    const remainingTtl = await this.cache.ttl(key);
    const shouldPreload = remainingTtl > 0 && remainingTtl < (ttl * preloadThreshold);

    if (shouldPreload) {
      // Асинхронно обновляем кэш
      setImmediate(async () => {
        try {
          const data = await fetcher();
          await this.cache!.set(key, data, { ttl });
          LoggerService.db.info('Cache preloaded', { key, ttl });
        } catch (error) {
          LoggerService.error.error('Cache preload failed', { error: error.message, key });
        }
      });
    }

    // Возвращаем текущие данные
    const cached = await this.cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Если кэш пуст, получаем данные
    const data = await fetcher();
    await this.cache.set(key, data, { ttl });
    
    return data;
  }
}

// Экспорт стратегий
export const cacheStrategies = new CacheStrategies();
