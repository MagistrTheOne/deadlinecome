import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { auth } from '@/lib/auth';

export interface WebSocketMessage {
  type: 'task_update' | 'project_update' | 'team_update' | 'ai_notification' | 'chat_message' | 'user_status';
  data: any;
  timestamp: Date;
  userId?: string;
  workspaceId?: string;
  projectId?: string;
}

export interface ConnectedUser {
  userId: string;
  socket: WebSocket;
  workspaceId?: string;
  projectId?: string;
  lastPing: Date;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private rooms: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds

  initialize(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Ping каждые 30 секунд для поддержания соединения
    setInterval(() => {
      this.pingAll();
    }, 30000);

    console.log('🚀 WebSocket сервер запущен на /ws');
  }

  private async handleConnection(ws: WebSocket, request: IncomingMessage) {
    try {
      const url = parse(request.url || '', true);
      const token = url.query.token as string;
      
      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Проверяем токен (упрощенная версия)
      const session = await this.authenticateUser(token);
      if (!session) {
        ws.close(1008, 'Invalid token');
        return;
      }

      const userId = session.user.id;
      const workspaceId = url.query.workspaceId as string;
      const projectId = url.query.projectId as string;

      // Сохраняем соединение
      this.connectedUsers.set(userId, {
        userId,
        socket: ws,
        workspaceId,
        projectId,
        lastPing: new Date()
      });

      // Добавляем в комнаты
      if (workspaceId) {
        this.joinRoom(`workspace:${workspaceId}`, userId);
      }
      if (projectId) {
        this.joinRoom(`project:${projectId}`, userId);
      }

      console.log(`👤 Пользователь ${userId} подключился`);

      // Отправляем приветственное сообщение
      this.sendToUser(userId, {
        type: 'user_status',
        data: { status: 'connected', message: 'Подключение установлено' },
        timestamp: new Date()
      });

      // Обработка сообщений
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage;
          this.handleMessage(userId, message);
        } catch (error) {
          console.error('Ошибка обработки сообщения:', error);
        }
      });

      // Обработка закрытия соединения
      ws.on('close', () => {
        this.handleDisconnection(userId);
      });

      // Обработка ошибок
      ws.on('error', (error) => {
        console.error(`Ошибка WebSocket для пользователя ${userId}:`, error);
        this.handleDisconnection(userId);
      });

    } catch (error) {
      console.error('Ошибка установки соединения:', error);
      ws.close(1008, 'Connection error');
    }
  }

  private async authenticateUser(token: string) {
    try {
      // Здесь должна быть проверка токена через auth
      // Для демо возвращаем mock данные
      return {
        user: { id: 'user_' + Date.now(), email: 'test@example.com' }
      };
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      return null;
    }
  }

  private handleMessage(userId: string, message: WebSocketMessage) {
    console.log(`📨 Сообщение от ${userId}:`, message.type);
    
    switch (message.type) {
      case 'chat_message':
        this.broadcastToRoom(`workspace:${message.data.workspaceId}`, {
          ...message,
          userId,
          timestamp: new Date()
        });
        break;
        
      case 'task_update':
        this.broadcastToRoom(`project:${message.data.projectId}`, {
          ...message,
          userId,
          timestamp: new Date()
        });
        break;
        
      case 'user_status':
        this.broadcastToRoom(`workspace:${message.data.workspaceId}`, {
          ...message,
          userId,
          timestamp: new Date()
        });
        break;
    }
  }

  private handleDisconnection(userId: string) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      // Удаляем из всех комнат
      this.rooms.forEach((userIds, roomId) => {
        userIds.delete(userId);
        if (userIds.size === 0) {
          this.rooms.delete(roomId);
        }
      });

      this.connectedUsers.delete(userId);
      console.log(`👋 Пользователь ${userId} отключился`);
    }
  }

  private joinRoom(roomId: string, userId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(userId);
  }

  private leaveRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(userId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  // Публичные методы для отправки сообщений
  sendToUser(userId: string, message: WebSocketMessage) {
    const user = this.connectedUsers.get(userId);
    if (user && user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(JSON.stringify(message));
    }
  }

  broadcastToRoom(roomId: string, message: WebSocketMessage) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.forEach(userId => {
        this.sendToUser(userId, message);
      });
    }
  }

  broadcastToAll(message: WebSocketMessage) {
    this.connectedUsers.forEach((user) => {
      this.sendToUser(user.userId, message);
    });
  }

  // Статистика
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      rooms: this.rooms.size,
      users: Array.from(this.connectedUsers.keys())
    };
  }

  private pingAll() {
    const now = new Date();
    this.connectedUsers.forEach((user, userId) => {
      if (now.getTime() - user.lastPing.getTime() > 60000) { // 1 минута
        this.handleDisconnection(userId);
      } else {
        user.lastPing = now;
        this.sendToUser(userId, {
          type: 'user_status',
          data: { status: 'ping' },
          timestamp: now
        });
      }
    });
  }
}

export const wsManager = new WebSocketManager();
