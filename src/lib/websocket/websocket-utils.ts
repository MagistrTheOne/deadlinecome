/**
 * WebSocket Cleanup and Connection Management Utilities
 * Implements proper cleanup patterns to prevent memory leaks
 */

import { WebSocket } from 'ws';
import { LoggerService } from '@/lib/logger';

export interface WebSocketCleanup {
  (): void;
}

export class WebSocketConnectionManager {
  private static instance: WebSocketConnectionManager;
  private connections = new Map<string, WebSocketCleanup>();
  private cleanupInterval: NodeJS.Timeout;

  static getInstance(): WebSocketConnectionManager {
    if (!WebSocketConnectionManager.instance) {
      WebSocketConnectionManager.instance = new WebSocketConnectionManager();
    }
    return WebSocketConnectionManager.instance;
  }

  constructor() {
    // Auto cleanup every 30 seconds to remove stale connections
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 30000);
  }

  /**
   * Register a WebSocket connection with its cleanup function
   */
  registerConnection(id: string, cleanup: WebSocketCleanup): void {
    this.connections.set(id, cleanup);
    LoggerService.websocket.debug('WebSocket connection registered', { id });
  }

  /**
   * Unregister a WebSocket connection and execute cleanup
   */
  unregisterConnection(id: string): void {
    const cleanup = this.connections.get(id);
    if (cleanup) {
      try {
        cleanup();
        LoggerService.websocket.debug('WebSocket connection cleaned up', { id });
      } catch (error) {
        LoggerService.websocket.error('Error during WebSocket cleanup', {
          id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      this.connections.delete(id);
    }
  }

  /**
   * Get connection count for monitoring
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Perform cleanup of stale connections
   */
  private performCleanup(): void {
    // This is called periodically to ensure cleanup
    // In a real implementation, you might want to track connection health
    LoggerService.websocket.debug('WebSocket cleanup performed', {
      activeConnections: this.connections.size
    });
  }

  /**
   * Graceful shutdown - cleanup all connections
   */
  shutdown(): void {
    clearInterval(this.cleanupInterval);

    LoggerService.websocket.info('WebSocket manager shutting down', {
      connectionsToCleanup: this.connections.size
    });

    // Use Array.from for better compatibility
    Array.from(this.connections.entries()).forEach(([id, cleanup]) => {
      try {
        cleanup();
      } catch (error) {
        LoggerService.websocket.error('Error during shutdown cleanup', {
          id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

    this.connections.clear();
  }
}

/**
 * Create a WebSocket cleanup function for a connection
 */
export function createWebSocketCleanup(
  ws: WebSocket,
  id: string,
  intervals: NodeJS.Timeout[] = [],
  timeouts: NodeJS.Timeout[] = []
): WebSocketCleanup {
  return () => {
    try {
      // Clear all intervals
      intervals.forEach(interval => clearInterval(interval));

      // Clear all timeouts
      timeouts.forEach(timeout => clearTimeout(timeout));

      // Close WebSocket if not already closed
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Connection cleanup');
      }

      // Remove all event listeners to prevent memory leaks
      ws.removeAllListeners();

      LoggerService.websocket.debug('WebSocket cleanup completed', { id });
    } catch (error) {
      LoggerService.websocket.error('Error in WebSocket cleanup', {
        id,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
}

/**
 * Setup heartbeat monitoring for WebSocket connections
 */
export function setupHeartbeat(
  ws: WebSocket,
  id: string,
  pingInterval: number = 30000, // 30 seconds
  pongTimeout: number = 5000   // 5 seconds
): { cleanup: WebSocketCleanup; intervals: NodeJS.Timeout[] } {
  let isAlive = true;
  let pongTimeoutId: NodeJS.Timeout | null = null;

  const pingIntervalId = setInterval(() => {
    if (!isAlive) {
      LoggerService.websocket.warn('WebSocket connection appears dead', { id });
      ws.close(1008, 'Connection timeout');
      return;
    }

    isAlive = false;
    ws.ping();

    // Set timeout for pong response
    pongTimeoutId = setTimeout(() => {
      if (!isAlive) {
        LoggerService.websocket.warn('WebSocket pong timeout', { id });
        ws.close(1008, 'Pong timeout');
      }
    }, pongTimeout);

  }, pingInterval);

  // Handle pong responses
  const pongHandler = () => {
    isAlive = true;
    if (pongTimeoutId) {
      clearTimeout(pongTimeoutId);
      pongTimeoutId = null;
    }
  };

  ws.on('pong', pongHandler);

  // Handle connection close
  const closeHandler = () => {
    if (pongTimeoutId) {
      clearTimeout(pongTimeoutId);
    }
  };

  ws.on('close', closeHandler);

  const cleanup = createWebSocketCleanup(
    ws,
    id,
    [pingIntervalId],
    pongTimeoutId ? [pongTimeoutId] : []
  );

  return { cleanup, intervals: [pingIntervalId] };
}

/**
 * Monitor WebSocket connection health
 */
export class WebSocketHealthMonitor {
  private static instance: WebSocketHealthMonitor;
  private metrics = {
    totalConnections: 0,
    activeConnections: 0,
    connectionsClosed: 0,
    errors: 0,
    avgConnectionTime: 0,
    peakConnections: 0
  };

  private connectionStartTimes = new Map<string, number>();

  static getInstance(): WebSocketHealthMonitor {
    if (!WebSocketHealthMonitor.instance) {
      WebSocketHealthMonitor.instance = new WebSocketHealthMonitor();
    }
    return WebSocketHealthMonitor.instance;
  }

  recordConnectionStart(id: string): void {
    this.connectionStartTimes.set(id, Date.now());
    this.metrics.totalConnections++;
    this.metrics.activeConnections++;
    this.metrics.peakConnections = Math.max(this.metrics.peakConnections, this.metrics.activeConnections);
  }

  recordConnectionEnd(id: string): void {
    const startTime = this.connectionStartTimes.get(id);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.updateAvgConnectionTime(duration);
      this.connectionStartTimes.delete(id);
    }

    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
    this.metrics.connectionsClosed++;
  }

  recordError(): void {
    this.metrics.errors++;
  }

  private updateAvgConnectionTime(duration: number): void {
    const totalConnections = this.metrics.totalConnections;
    const currentAvg = this.metrics.avgConnectionTime;
    this.metrics.avgConnectionTime = (currentAvg * (totalConnections - 1) + duration) / totalConnections;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      connectionsClosed: 0,
      errors: 0,
      avgConnectionTime: 0,
      peakConnections: 0
    };
    this.connectionStartTimes.clear();
  }
}
