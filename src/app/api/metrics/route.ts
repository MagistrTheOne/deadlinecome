import { NextRequest } from 'next/server';
import { snapshot } from '@/lib/ai/core/metrics/metrics';
import { createCachedResponse } from '@/lib/api/cache-utils';
import { WebSocketHealthMonitor, WebSocketConnectionManager } from '@/lib/websocket/websocket-utils';
import { LoggerService } from '@/lib/logger';

interface APIMetrics {
  timestamp: number;
  ai: any;
  websocket: {
    activeConnections: number;
    totalConnections: number;
    connectionsClosed: number;
    errors: number;
    avgConnectionTime: number;
    peakConnections: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  performance: {
    p50: number;
    p95: number;
    p99: number;
    avgResponseTime: number;
    totalRequests: number;
  };
}

class APIMetricsCollector {
  private static instance: APIMetricsCollector;
  private metrics: {
    responseTimes: number[];
    cacheHits: number;
    cacheMisses: number;
    totalRequests: number;
    startTime: number;
  };

  static getInstance(): APIMetricsCollector {
    if (!APIMetricsCollector.instance) {
      APIMetricsCollector.instance = new APIMetricsCollector();
    }
    return APIMetricsCollector.instance;
  }

  private constructor() {
    this.metrics = {
      responseTimes: [],
      cacheHits: 0,
      cacheMisses: 0,
      totalRequests: 0,
      startTime: Date.now()
    };

    // Cleanup old response times every 5 minutes
    setInterval(() => {
      // Keep only last 1000 response times
      if (this.metrics.responseTimes.length > 1000) {
        this.metrics.responseTimes = this.metrics.responseTimes.slice(-500);
      }
    }, 5 * 60 * 1000);
  }

  recordRequest(responseTime: number, cacheHit: boolean = false): void {
    this.metrics.responseTimes.push(responseTime);
    this.metrics.totalRequests++;

    if (cacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  getMetrics(): APIMetrics {
    const responseTimes = [...this.metrics.responseTimes].sort((a, b) => a - b);
    const wsMonitor = WebSocketHealthMonitor.getInstance();
    const wsManager = WebSocketConnectionManager.getInstance();

    return {
      timestamp: Date.now(),
      ai: snapshot(),
      websocket: {
        ...wsMonitor.getMetrics(),
        activeConnections: wsManager.getConnectionCount()
      },
      cache: {
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheMisses,
        hitRate: this.metrics.totalRequests > 0
          ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100
          : 0
      },
      performance: {
        p50: responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.5)] : 0,
        p95: responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.95)] : 0,
        p99: responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.99)] : 0,
        avgResponseTime: responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0,
        totalRequests: this.metrics.totalRequests
      }
    };
  }
}

// Middleware to record API metrics
export function withMetrics<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  cacheHit: boolean = false
) {
  return async (...args: T): Promise<Response> => {
    const startTime = Date.now();

    try {
      const response = await handler(...args);
      const responseTime = Date.now() - startTime;

      APIMetricsCollector.getInstance().recordRequest(responseTime, cacheHit);

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      APIMetricsCollector.getInstance().recordRequest(responseTime, false);

      throw error;
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    const metrics = APIMetricsCollector.getInstance().getMetrics();

    LoggerService.logUserAction('metrics-viewed', 'system', {
      timestamp: metrics.timestamp
    });

    // Cache metrics for 30 seconds
    return createCachedResponse(metrics, request, {
      maxAge: 30,
      staleWhileRevalidate: 60
    });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'metrics-api' });
    return new Response(
      JSON.stringify({ error: 'Failed to fetch metrics' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}