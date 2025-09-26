import winston from 'winston';
import path from 'path';

// Создаем директорию для логов
const logDir = path.join(process.cwd(), 'logs');

// Формат логов
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Формат для консоли
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Создаем логгер
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'deadline-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Файл для всех логов
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Файл только для ошибок
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Файл для API запросов
    new winston.transports.File({
      filename: path.join(logDir, 'api.log'),
      level: 'info',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Добавляем консольный вывод в development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Специализированные логгеры
export const apiLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'deadline-api' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'api.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true
    })
  ]
});

export const errorLogger = winston.createLogger({
  level: 'error',
  format: logFormat,
  defaultMeta: { service: 'deadline-api' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true
    })
  ]
});

export const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'deadline-security' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'security.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true
    })
  ]
});

export const performanceLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'deadline-performance' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'performance.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true
    })
  ]
});

export const aiLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'deadline-ai' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'ai.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Утилиты для логирования
export class LoggerService {
  static websocket: any;
  /**
   * Логирование API запросов
   */
  static logApiRequest(method: string, url: string, statusCode: number, duration: number, userId?: string) {
    apiLogger.info('API Request', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование ошибок
   */
  static logError(error: Error, context?: any) {
    errorLogger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование безопасности
   */
  static logSecurity(event: string, details: any, userId?: string, ip?: string) {
    securityLogger.warn('Security Event', {
      event,
      details,
      userId,
      ip,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование производительности
   */
  static logPerformance(operation: string, duration: number, details?: any) {
    performanceLogger.info('Performance Metric', {
      operation,
      duration: `${duration}ms`,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование AI действий
   */
  static logAI(action: string, details: any, userId?: string) {
    aiLogger.info('AI Action', {
      action,
      details,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование пользовательских действий
   */
  static logUserAction(action: string, userId: string, details?: any) {
    logger.info('User Action', {
      action,
      userId,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование системных событий
   */
  static logSystemEvent(event: string, details?: any) {
    logger.info('System Event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование WebSocket событий
   */
  static logWebSocketEvent(event: string, userId: string, details?: any) {
    logger.info('WebSocket Event', {
      event,
      userId,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование базы данных
   */
  static logDatabase(operation: string, table: string, duration: number, details?: any) {
    performanceLogger.info('Database Operation', {
      operation,
      table,
      duration: `${duration}ms`,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование кэша
   */
  static logCache(operation: string, key: string, hit: boolean, duration?: number) {
    performanceLogger.info('Cache Operation', {
      operation,
      key,
      hit,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование внешних API
   */
  static logExternalAPI(service: string, endpoint: string, statusCode: number, duration: number, details?: any) {
    apiLogger.info('External API Call', {
      service,
      endpoint,
      statusCode,
      duration: `${duration}ms`,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

// Middleware для логирования запросов
export function logRequest(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    LoggerService.logApiRequest(
      req.method,
      req.url,
      res.statusCode,
      duration,
      req.user?.id
    );
  });
  
  next();
}

// Middleware для логирования ошибок
export function logError(error: Error, req: any, res: any, next: any) {
  LoggerService.logError(error, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  next(error);
}

// Middleware для логирования безопасности
export function logSecurity(req: any, res: any, next: any) {
  // Логируем подозрительную активность
  if (req.statusCode >= 400) {
    LoggerService.logSecurity(
      'HTTP Error',
      {
        statusCode: req.statusCode,
        method: req.method,
        url: req.url
      },
      req.user?.id,
      req.ip
    );
  }
  
  next();
}

// Middleware для логирования производительности
export function logPerformance(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Логируем только медленные запросы
      LoggerService.logPerformance(
        'Slow Request',
        duration,
        {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode
        }
      );
    }
  });
  
  next();
}

// Утилиты для логирования
export const logUtils = {
  /**
   * Создание контекста для логов
   */
  createContext: (req: any) => ({
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  }),

  /**
   * Маскирование чувствительных данных
   */
  maskSensitiveData: (data: any): any => {
    if (typeof data !== 'object' || data === null) return data;
    
    const masked = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    
    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    }
    
    return masked;
  },

  /**
   * Форматирование ошибок
   */
  formatError: (error: Error) => ({
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  }),

  /**
   * Создание уникального ID для запроса
   */
  createRequestId: () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Логирование с контекстом
   */
  logWithContext: (level: string, message: string, context: any) => {
    logger.log(level, message, {
      ...context,
      timestamp: new Date().toISOString()
    });
  }
};

// Экспорт всех логгеров
export const loggers = {
  main: logger,
  api: apiLogger,
  error: errorLogger,
  security: securityLogger,
  performance: performanceLogger,
  ai: aiLogger
} as const;

// Экспорт утилит
export const utils = {
  LoggerService,
  logUtils,
  logRequest,
  logError,
  logSecurity,
  logPerformance
} as const;
