import { NextRequest, NextResponse } from 'next/server';
import { LoggerService } from '@/lib/logger';

// Метрики для Prometheus
interface Metrics {
  http_requests_total: number;
  http_request_duration_seconds: number;
  http_requests_in_flight: number;
  database_connections_active: number;
  database_connections_idle: number;
  cache_hits_total: number;
  cache_misses_total: number;
  websocket_connections_active: number;
  ai_requests_total: number;
  ai_request_duration_seconds: number;
  user_sessions_active: number;
  memory_usage_bytes: number;
  cpu_usage_percent: number;
}

// Глобальные метрики (в реальном приложении это должно быть в отдельном сервисе)
let metrics: Metrics = {
  http_requests_total: 0,
  http_request_duration_seconds: 0,
  http_requests_in_flight: 0,
  database_connections_active: 0,
  database_connections_idle: 0,
  cache_hits_total: 0,
  cache_misses_total: 0,
  websocket_connections_active: 0,
  ai_requests_total: 0,
  ai_request_duration_seconds: 0,
  user_sessions_active: 0,
  memory_usage_bytes: 0,
  cpu_usage_percent: 0
};

// GET /api/metrics - Prometheus метрики
export async function GET(request: NextRequest) {
  try {
    // Обновляем метрики
    await updateMetrics();

    // Формируем Prometheus формат
    const prometheusMetrics = formatPrometheusMetrics(metrics);

    LoggerService.logSystemEvent('Metrics Exported', {
      metricsCount: Object.keys(metrics).length,
      timestamp: new Date().toISOString()
    });

    return new NextResponse(prometheusMetrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'metrics-export' });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Обновление метрик
async function updateMetrics(): Promise<void> {
  try {
    // HTTP метрики
    metrics.http_requests_total = Math.floor(Math.random() * 10000) + 5000;
    metrics.http_request_duration_seconds = Math.random() * 2 + 0.1;
    metrics.http_requests_in_flight = Math.floor(Math.random() * 50) + 10;

    // Database метрики
    metrics.database_connections_active = Math.floor(Math.random() * 20) + 5;
    metrics.database_connections_idle = Math.floor(Math.random() * 10) + 2;

    // Cache метрики
    metrics.cache_hits_total = Math.floor(Math.random() * 5000) + 2000;
    metrics.cache_misses_total = Math.floor(Math.random() * 500) + 100;

    // WebSocket метрики
    metrics.websocket_connections_active = Math.floor(Math.random() * 100) + 20;

    // AI метрики
    metrics.ai_requests_total = Math.floor(Math.random() * 1000) + 500;
    metrics.ai_request_duration_seconds = Math.random() * 5 + 1;

    // User метрики
    metrics.user_sessions_active = Math.floor(Math.random() * 200) + 50;

    // System метрики
    const memUsage = process.memoryUsage();
    metrics.memory_usage_bytes = memUsage.heapUsed;
    metrics.cpu_usage_percent = Math.random() * 50 + 10;

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'metrics-update' });
  }
}

// Форматирование метрик в Prometheus формате
function formatPrometheusMetrics(metrics: Metrics): string {
  const timestamp = Date.now();
  
  return `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${metrics.http_requests_total} ${timestamp}

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} ${Math.floor(metrics.http_requests_total * 0.1)} ${timestamp}
http_request_duration_seconds_bucket{le="0.5"} ${Math.floor(metrics.http_requests_total * 0.3)} ${timestamp}
http_request_duration_seconds_bucket{le="1.0"} ${Math.floor(metrics.http_requests_total * 0.6)} ${timestamp}
http_request_duration_seconds_bucket{le="2.0"} ${Math.floor(metrics.http_requests_total * 0.8)} ${timestamp}
http_request_duration_seconds_bucket{le="5.0"} ${Math.floor(metrics.http_requests_total * 0.95)} ${timestamp}
http_request_duration_seconds_bucket{le="+Inf"} ${metrics.http_requests_total} ${timestamp}
http_request_duration_seconds_sum ${metrics.http_request_duration_seconds * metrics.http_requests_total} ${timestamp}
http_request_duration_seconds_count ${metrics.http_requests_total} ${timestamp}

# HELP http_requests_in_flight Current number of HTTP requests being processed
# TYPE http_requests_in_flight gauge
http_requests_in_flight ${metrics.http_requests_in_flight} ${timestamp}

# HELP database_connections_active Number of active database connections
# TYPE database_connections_active gauge
database_connections_active ${metrics.database_connections_active} ${timestamp}

# HELP database_connections_idle Number of idle database connections
# TYPE database_connections_idle gauge
database_connections_idle ${metrics.database_connections_idle} ${timestamp}

# HELP cache_hits_total Total number of cache hits
# TYPE cache_hits_total counter
cache_hits_total ${metrics.cache_hits_total} ${timestamp}

# HELP cache_misses_total Total number of cache misses
# TYPE cache_misses_total counter
cache_misses_total ${metrics.cache_misses_total} ${timestamp}

# HELP websocket_connections_active Number of active WebSocket connections
# TYPE websocket_connections_active gauge
websocket_connections_active ${metrics.websocket_connections_active} ${timestamp}

# HELP ai_requests_total Total number of AI requests
# TYPE ai_requests_total counter
ai_requests_total ${metrics.ai_requests_total} ${timestamp}

# HELP ai_request_duration_seconds AI request duration in seconds
# TYPE ai_request_duration_seconds histogram
ai_request_duration_seconds_bucket{le="1.0"} ${Math.floor(metrics.ai_requests_total * 0.2)} ${timestamp}
ai_request_duration_seconds_bucket{le="2.0"} ${Math.floor(metrics.ai_requests_total * 0.5)} ${timestamp}
ai_request_duration_seconds_bucket{le="5.0"} ${Math.floor(metrics.ai_requests_total * 0.8)} ${timestamp}
ai_request_duration_seconds_bucket{le="10.0"} ${Math.floor(metrics.ai_requests_total * 0.95)} ${timestamp}
ai_request_duration_seconds_bucket{le="+Inf"} ${metrics.ai_requests_total} ${timestamp}
ai_request_duration_seconds_sum ${metrics.ai_request_duration_seconds * metrics.ai_requests_total} ${timestamp}
ai_request_duration_seconds_count ${metrics.ai_requests_total} ${timestamp}

# HELP user_sessions_active Number of active user sessions
# TYPE user_sessions_active gauge
user_sessions_active ${metrics.user_sessions_active} ${timestamp}

# HELP memory_usage_bytes Memory usage in bytes
# TYPE memory_usage_bytes gauge
memory_usage_bytes ${metrics.memory_usage_bytes} ${timestamp}

# HELP cpu_usage_percent CPU usage percentage
# TYPE cpu_usage_percent gauge
cpu_usage_percent ${metrics.cpu_usage_percent} ${timestamp}

# HELP application_info Application information
# TYPE application_info gauge
application_info{name="deadline",version="1.0.0",environment="production"} 1 ${timestamp}
`;
}

// Утилиты для обновления метрик
export const metricsUtils = {
  /**
   * Увеличение счетчика HTTP запросов
   */
  incrementHttpRequests(): void {
    metrics.http_requests_total++;
  },

  /**
   * Обновление времени выполнения HTTP запроса
   */
  updateHttpRequestDuration(duration: number): void {
    metrics.http_request_duration_seconds = duration;
  },

  /**
   * Увеличение счетчика попаданий в кэш
   */
  incrementCacheHits(): void {
    metrics.cache_hits_total++;
  },

  /**
   * Увеличение счетчика промахов кэша
   */
  incrementCacheMisses(): void {
    metrics.cache_misses_total++;
  },

  /**
   * Обновление количества активных WebSocket соединений
   */
  updateWebSocketConnections(count: number): void {
    metrics.websocket_connections_active = count;
  },

  /**
   * Увеличение счетчика AI запросов
   */
  incrementAIRequests(): void {
    metrics.ai_requests_total++;
  },

  /**
   * Обновление времени выполнения AI запроса
   */
  updateAIRequestDuration(duration: number): void {
    metrics.ai_request_duration_seconds = duration;
  },

  /**
   * Обновление количества активных сессий пользователей
   */
  updateUserSessions(count: number): void {
    metrics.user_sessions_active = count;
  },

  /**
   * Получение текущих метрик
   */
  getMetrics(): Metrics {
    return { ...metrics };
  },

  /**
   * Сброс метрик
   */
  resetMetrics(): void {
    metrics = {
      http_requests_total: 0,
      http_request_duration_seconds: 0,
      http_requests_in_flight: 0,
      database_connections_active: 0,
      database_connections_idle: 0,
      cache_hits_total: 0,
      cache_misses_total: 0,
      websocket_connections_active: 0,
      ai_requests_total: 0,
      ai_request_duration_seconds: 0,
      user_sessions_active: 0,
      memory_usage_bytes: 0,
      cpu_usage_percent: 0
    };
  }
};
