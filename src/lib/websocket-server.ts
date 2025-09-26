import { WebSocketServer, WebSocket } from 'ws';
import { NextRequest } from 'next/server';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private isRunning = false;

  constructor() {
    this.initializeServer();
  }

  private initializeServer() {
    if (typeof window !== 'undefined') return; // Только на сервере
    
    try {
      this.wss = new WebSocketServer({ 
        port: 8080,
        path: '/ws'
      });

      this.wss.on('connection', (ws: WebSocket, req) => {
        const clientId = this.generateClientId();
        this.clients.set(clientId, ws);
        
        console.log(`🔌 WebSocket клиент подключен: ${clientId}`);
        
        // Отправляем приветственное сообщение
        this.sendToClient(clientId, {
          type: 'connection',
          data: { message: 'Подключение установлено', clientId },
          timestamp: Date.now()
        });

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(clientId, message);
          } catch (error) {
            console.error('Ошибка парсинга WebSocket сообщения:', error);
          }
        });

        ws.on('close', () => {
          console.log(`🔌 WebSocket клиент отключен: ${clientId}`);
          this.clients.delete(clientId);
        });

        ws.on('error', (error) => {
          console.error(`WebSocket ошибка для клиента ${clientId}:`, error);
          this.clients.delete(clientId);
        });
      });

      this.wss.on('error', (error) => {
        console.error('WebSocket Server ошибка:', error);
      });

      this.isRunning = true;
      console.log('🚀 WebSocket сервер запущен на порту 8080');
    } catch (error) {
      console.error('Ошибка инициализации WebSocket сервера:', error);
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleMessage(clientId: string, message: WebSocketMessage) {
    console.log(`📨 Получено сообщение от ${clientId}:`, message);
    
    switch (message.type) {
      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        });
        break;
        
      case 'subscribe':
        // Подписка на обновления
        this.sendToClient(clientId, {
          type: 'subscribed',
          data: { channels: message.data.channels },
          timestamp: Date.now()
        });
        break;
        
      default:
        console.log(`Неизвестный тип сообщения: ${message.type}`);
    }
  }

  private sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  public broadcast(message: WebSocketMessage) {
    this.clients.forEach((client, clientId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public getStats() {
    return {
      isRunning: this.isRunning,
      connectedClients: this.clients.size,
      port: 8080
    };
  }

  public close() {
    if (this.wss) {
      this.wss.close();
      this.isRunning = false;
      console.log('🔌 WebSocket сервер остановлен');
    }
  }
}

// Создаем глобальный экземпляр
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager();
  }
  return wsManager;
}

export function getWebSocketStats() {
  if (!wsManager) {
    return {
      isRunning: false,
      connectedClients: 0,
      port: 8080,
      error: 'WebSocket сервер не инициализирован'
    };
  }
  return wsManager.getStats();
}