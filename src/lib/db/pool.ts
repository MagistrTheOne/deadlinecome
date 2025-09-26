import { LoggerService } from '@/lib/logger';

// Интерфейсы для connection pooling
interface PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number; // Максимум соединений
  min?: number; // Минимум соединений
  idleTimeoutMillis?: number; // Таймаут простоя
  connectionTimeoutMillis?: number; // Таймаут подключения
  acquireTimeoutMillis?: number; // Таймаут получения соединения
  createTimeoutMillis?: number; // Таймаут создания соединения
  destroyTimeoutMillis?: number; // Таймаут уничтожения соединения
  reapIntervalMillis?: number; // Интервал очистки
  createRetryIntervalMillis?: number; // Интервал повтора создания
}

interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  activeConnections: number;
  waitingClients: number;
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  uptime: number;
}

// Класс для управления connection pool
export class DatabasePool {
  private pool: any = null;
  private config: PoolConfig;
  private stats: PoolStats;
  private startTime: number;
  private isInitialized: boolean = false;

  constructor(config: PoolConfig) {
    this.config = {
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
      ...config
    };
    
    this.startTime = Date.now();
    this.stats = {
      totalConnections: 0,
      idleConnections: 0,
      activeConnections: 0,
      waitingClients: 0,
      totalRequests: 0,
      totalErrors: 0,
      averageResponseTime: 0,
      uptime: 0
    };
  }

  /**
   * Инициализация пула соединений
   */
  async initialize(): Promise<void> {
    try {
      // Динамический импорт pg
      const { Pool } = await import('pg');
      
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        max: this.config.max,
        min: this.config.min,
        idleTimeoutMillis: this.config.idleTimeoutMillis,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis,
        acquireTimeoutMillis: this.config.acquireTimeoutMillis,
        createTimeoutMillis: this.config.createTimeoutMillis,
        destroyTimeoutMillis: this.config.destroyTimeoutMillis,
        reapIntervalMillis: this.config.reapIntervalMillis,
        createRetryIntervalMillis: this.config.createRetryIntervalMillis
      });

      // Обработчики событий
      this.pool.on('connect', (client: any) => {
        this.stats.totalConnections++;
        this.stats.idleConnections++;
        LoggerService.logSystemEvent('Database Connection Created', {
          totalConnections: this.stats.totalConnections
        });
      });

      this.pool.on('acquire', (client: any) => {
        this.stats.idleConnections--;
        this.stats.activeConnections++;
        this.stats.totalRequests++;
      });

      this.pool.on('release', (client: any) => {
        this.stats.activeConnections--;
        this.stats.idleConnections++;
      });

      this.pool.on('remove', (client: any) => {
        this.stats.totalConnections--;
        if (this.stats.idleConnections > 0) {
          this.stats.idleConnections--;
        }
        LoggerService.logSystemEvent('Database Connection Removed', {
          totalConnections: this.stats.totalConnections
        });
      });

      this.pool.on('error', (error: Error, client: any) => {
        this.stats.totalErrors++;
        LoggerService.logError(error, { context: 'database-pool' });
      });

      // Тестовое подключение
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();

      this.isInitialized = true;
      LoggerService.logSystemEvent('Database Pool Initialized', {
        max: this.config.max,
        min: this.config.min
      });

    } catch (error) {
      LoggerService.logError(error as Error, { context: 'database-pool-init' });
      throw error;
    }
  }

  /**
   * Получение соединения из пула
   */
  async getConnection(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Pool not initialized');
    }

    const start = Date.now();
    
    try {
      const client = await this.pool.connect();
      const duration = Date.now() - start;
      
      // Обновляем статистику
      this.updateAverageResponseTime(duration);
      
      LoggerService.logDatabase('GET_CONNECTION', 'pool', duration);
      
      return client;
    } catch (error) {
      this.stats.totalErrors++;
      LoggerService.logError(error as Error, { context: 'database-get-connection' });
      throw error;
    }
  }

  /**
   * Выполнение запроса с автоматическим управлением соединением
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now();
    const client = await this.getConnection();
    
    try {
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      LoggerService.logDatabase('QUERY', 'database', duration, {
        query: text.substring(0, 100),
        params: params?.length || 0,
        rows: result.rows.length
      });
      
      return result.rows;
    } catch (error) {
      this.stats.totalErrors++;
      LoggerService.logError(error as Error, { 
        context: 'database-query',
        query: text.substring(0, 100),
        params
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Выполнение транзакции
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.getConnection();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      
      LoggerService.logDatabase('TRANSACTION', 'database', 0, { success: true });
      
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.stats.totalErrors++;
      
      LoggerService.logDatabase('TRANSACTION', 'database', 0, { success: false });
      LoggerService.logError(error as Error, { context: 'database-transaction' });
      
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Проверка состояния пула
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    stats: PoolStats;
    details: any;
  }> {
    try {
      const start = Date.now();
      const result = await this.query('SELECT 1 as health');
      const duration = Date.now() - start;
      
      this.updateAverageResponseTime(duration);
      
      return {
        healthy: result.length > 0,
        stats: this.getStats(),
        details: {
          responseTime: duration,
          testQuery: 'SELECT 1'
        }
      };
    } catch (error) {
      LoggerService.logError(error as Error, { context: 'database-health-check' });
      
      return {
        healthy: false,
        stats: this.getStats(),
        details: {
          error: (error as Error).message
        }
      };
    }
  }

  /**
   * Получение статистики пула
   */
  getStats(): PoolStats {
    this.stats.uptime = Date.now() - this.startTime;
    return { ...this.stats };
  }

  /**
   * Обновление средней скорости ответа
   */
  private updateAverageResponseTime(duration: number): void {
    if (this.stats.totalRequests === 0) {
      this.stats.averageResponseTime = duration;
    } else {
      this.stats.averageResponseTime = Math.round(
        (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + duration) / 
        this.stats.totalRequests
      );
    }
  }

  /**
   * Закрытие пула соединений
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.isInitialized = false;
      LoggerService.logSystemEvent('Database Pool Closed');
    }
  }

  /**
   * Проверка инициализации
   */
  isReady(): boolean {
    return this.isInitialized && this.pool !== null;
  }
}

// Глобальный экземпляр пула
let poolInstance: DatabasePool | null = null;

/**
 * Инициализация пула соединений
 */
export async function initializePool(): Promise<DatabasePool> {
  if (poolInstance) {
    return poolInstance;
  }

  const config: PoolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'deadline',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  };

  poolInstance = new DatabasePool(config);
  await poolInstance.initialize();
  
  return poolInstance;
}

/**
 * Получение экземпляра пула
 */
export function getPool(): DatabasePool | null {
  return poolInstance;
}

/**
 * Утилиты для работы с пулом
 */
export const poolUtils = {
  /**
   * Выполнение запроса с автоматическим управлением соединением
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const pool = getPool();
    if (!pool) {
      throw new Error('Database pool not initialized');
    }
    
    return await pool.query<T>(text, params);
  },

  /**
   * Выполнение транзакции
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const pool = getPool();
    if (!pool) {
      throw new Error('Database pool not initialized');
    }
    
    return await pool.transaction(callback);
  },

  /**
   * Проверка здоровья пула
   */
  async healthCheck(): Promise<any> {
    const pool = getPool();
    if (!pool) {
      return { healthy: false, error: 'Pool not initialized' };
    }
    
    return await pool.healthCheck();
  },

  /**
   * Получение статистики пула
   */
  getStats(): PoolStats | null {
    const pool = getPool();
    if (!pool) {
      return null;
    }
    
    return pool.getStats();
  },

  /**
   * Закрытие пула
   */
  async close(): Promise<void> {
    const pool = getPool();
    if (pool) {
      await pool.close();
      poolInstance = null;
    }
  }
};

// Экспорт
export const pool = {
  DatabasePool,
  initializePool,
  getPool,
  utils: poolUtils
} as const;
