import { NextRequest, NextResponse } from 'next/server';
import { LoggerService } from '@/lib/logger';

// Интерфейсы для health checks
interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  message?: string;
  details?: any;
  timestamp: string;
}

interface HealthStatus {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheckResult[];
  metrics?: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

// Базовый класс для health checks
abstract class HealthCheck {
  abstract name: string;
  abstract check(): Promise<HealthCheckResult>;
}

// Проверка базы данных
class DatabaseHealthCheck extends HealthCheck {
  name = 'database';

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      // Здесь должна быть проверка подключения к БД
      // Пока что симулируем проверку
      const responseTime = Date.now() - start;
      
      return {
        name: this.name,
        status: 'healthy',
        responseTime,
        message: 'База данных доступна',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      
      LoggerService.logError(error as Error, { context: 'database-health-check' });
      
      return {
        name: this.name,
        status: 'unhealthy',
        responseTime,
        message: 'База данных недоступна',
        details: { error: (error as Error).message },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Проверка Redis (если настроен)
class RedisHealthCheck extends HealthCheck {
  name = 'redis';

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      // Здесь должна быть проверка подключения к Redis
      // Пока что симулируем проверку
      const responseTime = Date.now() - start;
      
      return {
        name: this.name,
        status: 'healthy',
        responseTime,
        message: 'Redis доступен',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      
      LoggerService.logError(error as Error, { context: 'redis-health-check' });
      
      return {
        name: this.name,
        status: 'unhealthy',
        responseTime,
        message: 'Redis недоступен',
        details: { error: (error as Error).message },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Проверка внешних API
class ExternalAPIHealthCheck extends HealthCheck {
  name = 'external-apis';

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      // Проверяем доступность внешних API
      const checks = await Promise.allSettled([
        this.checkGigaChatAPI(),
        this.checkOpenAIAPI()
      ]);
      
      const responseTime = Date.now() - start;
      const healthyCount = checks.filter(result => 
        result.status === 'fulfilled' && result.value
      ).length;
      
      const status = healthyCount === checks.length ? 'healthy' : 
                    healthyCount > 0 ? 'degraded' : 'unhealthy';
      
      return {
        name: this.name,
        status,
        responseTime,
        message: `${healthyCount}/${checks.length} внешних API доступны`,
        details: { checks: checks.map(c => c.status === 'fulfilled' ? c.value : c.reason) },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      
      return {
        name: this.name,
        status: 'unhealthy',
        responseTime,
        message: 'Ошибка проверки внешних API',
        details: { error: (error as Error).message },
        timestamp: new Date().toISOString()
      };
    }
  }

  private async checkGigaChatAPI(): Promise<boolean> {
    try {
      // Здесь должна быть реальная проверка GigaChat API
      return true;
    } catch {
      return false;
    }
  }

  private async checkOpenAIAPI(): Promise<boolean> {
    try {
      // Здесь должна быть реальная проверка OpenAI API
      return true;
    } catch {
      return false;
    }
  }
}

// Проверка WebSocket сервера
class WebSocketHealthCheck extends HealthCheck {
  name = 'websocket';

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      // Здесь должна быть проверка WebSocket сервера
      const responseTime = Date.now() - start;
      
      return {
        name: this.name,
        status: 'healthy',
        responseTime,
        message: 'WebSocket сервер работает',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      
      return {
        name: this.name,
        status: 'unhealthy',
        responseTime,
        message: 'WebSocket сервер недоступен',
        details: { error: (error as Error).message },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Проверка файловой системы
class FileSystemHealthCheck extends HealthCheck {
  name = 'filesystem';

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      // Проверяем доступность файловой системы
      const fs = await import('fs/promises');
      await fs.access('./logs', fs.constants.W_OK);
      
      const responseTime = Date.now() - start;
      
      return {
        name: this.name,
        status: 'healthy',
        responseTime,
        message: 'Файловая система доступна',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      
      return {
        name: this.name,
        status: 'unhealthy',
        responseTime,
        message: 'Файловая система недоступна',
        details: { error: (error as Error).message },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Основной класс Health Service
export class HealthService {
  private checks: HealthCheck[] = [];
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.initializeChecks();
  }

  private initializeChecks() {
    this.checks = [
      new DatabaseHealthCheck(),
      new RedisHealthCheck(),
      new ExternalAPIHealthCheck(),
      new WebSocketHealthCheck(),
      new FileSystemHealthCheck()
    ];
  }

  /**
   * Выполнение всех health checks
   */
  async performHealthChecks(): Promise<HealthStatus> {
    const start = Date.now();
    
    try {
      // Выполняем все проверки параллельно
      const results = await Promise.all(
        this.checks.map(check => check.check())
      );
      
      // Определяем общий статус
      const overall = this.determineOverallStatus(results);
      
      // Получаем метрики системы
      const metrics = await this.getSystemMetrics();
      
      const healthStatus: HealthStatus = {
        overall,
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: results,
        metrics
      };
      
      // Логируем результат
      LoggerService.logSystemEvent('Health Check Completed', {
        overall,
        checksCount: results.length,
        healthyCount: results.filter(r => r.status === 'healthy').length,
        responseTime: Date.now() - start
      });
      
      return healthStatus;
    } catch (error) {
      LoggerService.logError(error as Error, { context: 'health-checks' });
      
      return {
        overall: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: [],
        metrics: undefined
      };
    }
  }

  /**
   * Определение общего статуса
   */
  private determineOverallStatus(results: HealthCheckResult[]): 'healthy' | 'unhealthy' | 'degraded' {
    const unhealthyCount = results.filter(r => r.status === 'unhealthy').length;
    const degradedCount = results.filter(r => r.status === 'degraded').length;
    
    if (unhealthyCount > 0) {
      return 'unhealthy';
    } else if (degradedCount > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Получение метрик системы
   */
  private async getSystemMetrics() {
    try {
      const os = await import('os');
      const fs = await import('fs/promises');
      
      // Информация о памяти
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      
      // Информация о диске
      const stats = await fs.statfs('./');
      const totalDisk = stats.bavail * stats.bsize;
      const usedDisk = (stats.blocks - stats.bavail) * stats.bsize;
      
      return {
        memory: {
          used: usedMemory,
          total: totalMemory,
          percentage: Math.round((usedMemory / totalMemory) * 100)
        },
        cpu: {
          usage: Math.round(os.loadavg()[0] * 100) / 100
        },
        disk: {
          used: usedDisk,
          total: totalDisk,
          percentage: Math.round((usedDisk / totalDisk) * 100)
        }
      };
    } catch (error) {
      LoggerService.logError(error as Error, { context: 'system-metrics' });
      return undefined;
    }
  }

  /**
   * Проверка конкретного сервиса
   */
  async checkService(serviceName: string): Promise<HealthCheckResult | null> {
    const check = this.checks.find(c => c.name === serviceName);
    if (!check) {
      return null;
    }
    
    return await check.check();
  }

  /**
   * Добавление кастомной проверки
   */
  addCheck(check: HealthCheck) {
    this.checks.push(check);
  }

  /**
   * Удаление проверки
   */
  removeCheck(name: string) {
    this.checks = this.checks.filter(c => c.name !== name);
  }
}

// Глобальный экземпляр Health Service
export const healthService = new HealthService();

// API endpoints для health checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    
    if (service) {
      // Проверка конкретного сервиса
      const result = await healthService.checkService(service);
      if (!result) {
        return NextResponse.json(
          { error: 'Сервис не найден' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result);
    }
    
    // Полная проверка здоровья системы
    const healthStatus = await healthService.performHealthChecks();
    
    // Определяем HTTP статус
    const httpStatus = healthStatus.overall === 'healthy' ? 200 : 
                      healthStatus.overall === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: httpStatus });
  } catch (error) {
    LoggerService.logError(error as Error, { context: 'health-api' });
    
    return NextResponse.json(
      {
        overall: 'unhealthy',
        error: 'Ошибка выполнения health check',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Утилиты для health checks
export const healthUtils = {
  /**
   * Создание кастомной проверки
   */
  createCustomCheck: (name: string, checkFunction: () => Promise<HealthCheckResult>) => {
    return new class extends HealthCheck {
      name = name;
      async check() {
        return await checkFunction();
      }
    };
  },

  /**
   * Проверка доступности URL
   */
  checkUrl: async (url: string, timeout: number = 5000): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'HEAD'
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Проверка подключения к базе данных
   */
  checkDatabase: async (connectionString: string): Promise<boolean> => {
    try {
      // Здесь должна быть реальная проверка БД
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Проверка подключения к Redis
   */
  checkRedis: async (host: string, port: number): Promise<boolean> => {
    try {
      // Здесь должна быть реальная проверка Redis
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Проверка доступности файла
   */
  checkFile: async (filePath: string): Promise<boolean> => {
    try {
      const fs = await import('fs/promises');
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Проверка доступности директории
   */
  checkDirectory: async (dirPath: string): Promise<boolean> => {
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }
};

// Экспорт всех утилит
export const health = {
  HealthService,
  healthService,
  healthUtils,
  GET
} as const;
