import { LoggerService } from '@/lib/logger';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketClientOptions {
  url: string;
  userId: string;
  workspaceId?: string;
  projectId?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: WebSocketClientOptions;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isDestroyed = false;

  constructor(options: WebSocketClientOptions) {
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...options
    };
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isDestroyed) {
        reject(new Error('Connection already in progress or client destroyed'));
        return;
      }

      this.isConnecting = true;

      try {
        const url = new URL(this.options.url);
        url.searchParams.set('userId', this.options.userId);
        if (this.options.workspaceId) {
          url.searchParams.set('workspaceId', this.options.workspaceId);
        }
        if (this.options.projectId) {
          url.searchParams.set('projectId', this.options.projectId);
        }

        this.ws = new WebSocket(url.toString());

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startPingTimer();
          
          LoggerService.websocket.info('WebSocket connected', {
            userId: this.options.userId,
            workspaceId: this.options.workspaceId,
            projectId: this.options.projectId
          });

          this.options.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.options.onMessage?.(message);
          } catch (error) {
            LoggerService.error.error('Failed to parse WebSocket message', {
              error: error.message,
              data: event.data
            });
          }
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.stopPingTimer();
          
          LoggerService.websocket.info('WebSocket disconnected', {
            code: event.code,
            reason: event.reason,
            userId: this.options.userId
          });

          this.options.onDisconnect?.();

          if (!this.isDestroyed && event.code !== 1000) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          
          LoggerService.error.error('WebSocket error', {
            error: error.message,
            userId: this.options.userId
          });

          this.options.onError?.(error as Error);
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.isDestroyed = true;
    this.stopPingTimer();
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    LoggerService.websocket.info('WebSocket client disconnected', {
      userId: this.options.userId
    });
  }

  public send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      LoggerService.websocket.warn('Cannot send message - WebSocket not connected', {
        userId: this.options.userId,
        messageType: message.type
      });
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
      LoggerService.websocket.info('Message sent', {
        userId: this.options.userId,
        type: message.type
      });
    } catch (error) {
      LoggerService.error.error('Failed to send WebSocket message', {
        error: error.message,
        userId: this.options.userId,
        messageType: message.type
      });
    }
  }

  public joinRoom(roomId: string): void {
    this.send({
      type: 'join_room',
      data: { roomId },
      timestamp: Date.now()
    });
  }

  public leaveRoom(roomId: string): void {
    this.send({
      type: 'leave_room',
      data: { roomId },
      timestamp: Date.now()
    });
  }

  public broadcastToRoom(roomId: string, message: any): void {
    this.send({
      type: 'broadcast_to_room',
      data: { roomId, message },
      timestamp: Date.now()
    });
  }

  public getOnlineUsers(): void {
    this.send({
      type: 'get_online_users',
      data: {},
      timestamp: Date.now()
    });
  }

  public getRoomStats(roomId: string): void {
    this.send({
      type: 'get_room_stats',
      data: { roomId },
      timestamp: Date.now()
    });
  }

  public ping(): void {
    this.send({
      type: 'ping',
      data: {},
      timestamp: Date.now()
    });
  }

  private scheduleReconnect(): void {
    if (this.isDestroyed || this.reconnectAttempts >= this.options.maxReconnectAttempts!) {
      LoggerService.websocket.warn('Max reconnection attempts reached', {
        userId: this.options.userId,
        attempts: this.reconnectAttempts
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectInterval! * this.reconnectAttempts;

    LoggerService.websocket.info('Scheduling reconnection', {
      userId: this.options.userId,
      attempt: this.reconnectAttempts,
      delay
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        LoggerService.error.error('Reconnection failed', {
          error: error.message,
          userId: this.options.userId,
          attempt: this.reconnectAttempts
        });
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startPingTimer(): void {
    this.stopPingTimer();
    this.pingTimer = setInterval(() => {
      this.ping();
    }, 30000); // Ping каждые 30 секунд
  }

  private stopPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  public get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public get connectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}
