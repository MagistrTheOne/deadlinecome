import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { LoggerService } from '@/lib/logger';
import { DatabaseService } from '@/lib/services/database-service';

interface WebSocketClient extends WebSocket {
  id: string;
  userId: string;
  workspaceId?: string;
  projectId?: string;
  isAlive: boolean;
  lastPing: number;
}

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map(); // roomId -> Set of clientIds
  private pingInterval: NodeJS.Timeout;

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: false
    });

    this.setupEventHandlers();
    this.startPingInterval();
    
    LoggerService.websocket.info('WebSocket server started', { 
      port: server.address()?.port,
      path: '/ws'
    });
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocketClient, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      LoggerService.error.error('WebSocket server error', { error: error.message });
    });
  }

  private async handleConnection(ws: WebSocketClient, request: IncomingMessage) {
    const clientId = this.generateClientId();
    ws.id = clientId;
    ws.isAlive = true;
    ws.lastPing = Date.now();

    // Извлекаем userId из заголовков или query параметров
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const userId = url.searchParams.get('userId') || request.headers['x-user-id'] as string;
    const workspaceId = url.searchParams.get('workspaceId');
    const projectId = url.searchParams.get('projectId');

    if (!userId) {
      ws.close(1008, 'User ID required');
      return;
    }

    ws.userId = userId;
    ws.workspaceId = workspaceId || undefined;
    ws.projectId = projectId || undefined;

    this.clients.set(clientId, ws);
    
    // Добавляем в комнаты
    if (workspaceId) {
      this.joinRoom(ws, `workspace:${workspaceId}`);
    }
    if (projectId) {
      this.joinRoom(ws, `project:${projectId}`);
    }

    LoggerService.websocket.info('Client connected', {
      clientId,
      userId,
      workspaceId,
      projectId,
      totalClients: this.clients.size
    });

    // Отправляем приветственное сообщение
    this.sendToClient(ws, {
      type: 'connection_established',
      data: {
        clientId,
        userId,
        timestamp: Date.now()
      }
    });

    // Настраиваем обработчики событий
    ws.on('message', (data) => this.handleMessage(ws, data));
    ws.on('close', () => this.handleDisconnection(ws));
    ws.on('error', (error) => this.handleError(ws, error));
    ws.on('pong', () => {
      ws.isAlive = true;
      ws.lastPing = Date.now();
    });
  }

  private handleMessage(ws: WebSocketClient, data: Buffer) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      
      LoggerService.websocket.info('Message received', {
        clientId: ws.id,
        userId: ws.userId,
        type: message.type
      });

      switch (message.type) {
        case 'ping':
          this.sendToClient(ws, { type: 'pong', data: { timestamp: Date.now() } });
          break;
          
        case 'join_room':
          this.joinRoom(ws, message.data.roomId);
          break;
          
        case 'leave_room':
          this.leaveRoom(ws, message.data.roomId);
          break;
          
        case 'broadcast_to_room':
          this.broadcastToRoom(message.data.roomId, message.data.message, ws.id);
          break;
          
        case 'get_online_users':
          this.sendOnlineUsers(ws);
          break;
          
        case 'get_room_stats':
          this.sendRoomStats(ws, message.data.roomId);
          break;
          
        default:
          LoggerService.websocket.warn('Unknown message type', { type: message.type });
      }
    } catch (error) {
      LoggerService.error.error('Failed to handle WebSocket message', { 
        error: error.message,
        clientId: ws.id 
      });
    }
  }

  private handleDisconnection(ws: WebSocketClient) {
    LoggerService.websocket.info('Client disconnected', {
      clientId: ws.id,
      userId: ws.userId,
      totalClients: this.clients.size - 1
    });

    // Удаляем из всех комнат
    this.rooms.forEach((clients, roomId) => {
      clients.delete(ws.id);
      if (clients.size === 0) {
        this.rooms.delete(roomId);
      }
    });

    this.clients.delete(ws.id);
  }

  private handleError(ws: WebSocketClient, error: Error) {
    LoggerService.error.error('WebSocket client error', {
      error: error.message,
      clientId: ws.id,
      userId: ws.userId
    });
  }

  private joinRoom(ws: WebSocketClient, roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(ws.id);
    
    LoggerService.websocket.info('Client joined room', {
      clientId: ws.id,
      roomId,
      roomSize: this.rooms.get(roomId)!.size
    });

    this.sendToClient(ws, {
      type: 'room_joined',
      data: { roomId, timestamp: Date.now() }
    });
  }

  private leaveRoom(ws: WebSocketClient, roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(ws.id);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    LoggerService.websocket.info('Client left room', {
      clientId: ws.id,
      roomId
    });

    this.sendToClient(ws, {
      type: 'room_left',
      data: { roomId, timestamp: Date.now() }
    });
  }

  private broadcastToRoom(roomId: string, message: any, excludeClientId?: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const messageData = {
      type: 'room_broadcast',
      data: {
        roomId,
        message,
        timestamp: Date.now()
      }
    };

    room.forEach(clientId => {
      if (clientId !== excludeClientId) {
        const client = this.clients.get(clientId);
        if (client && client.readyState === WebSocket.OPEN) {
          this.sendToClient(client, messageData);
        }
      }
    });

    LoggerService.websocket.info('Broadcasted to room', {
      roomId,
      recipients: room.size - (excludeClientId ? 1 : 0)
    });
  }

  private async sendOnlineUsers(ws: WebSocketClient) {
    const onlineUsers = Array.from(this.clients.values())
      .filter(client => client.readyState === WebSocket.OPEN)
      .map(client => ({
        userId: client.userId,
        workspaceId: client.workspaceId,
        projectId: client.projectId,
        connectedAt: Date.now()
      }));

    this.sendToClient(ws, {
      type: 'online_users',
      data: { users: onlineUsers, timestamp: Date.now() }
    });
  }

  private async sendRoomStats(ws: WebSocketClient, roomId: string) {
    const room = this.rooms.get(roomId);
    const stats = {
      roomId,
      connectedUsers: room ? room.size : 0,
      totalClients: this.clients.size,
      totalRooms: this.rooms.size,
      timestamp: Date.now()
    };

    this.sendToClient(ws, {
      type: 'room_stats',
      data: stats
    });
  }

  private sendToClient(ws: WebSocketClient, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      this.clients.forEach((ws) => {
        if (!ws.isAlive) {
          LoggerService.websocket.info('Terminating inactive connection', {
            clientId: ws.id,
            userId: ws.userId
          });
          ws.terminate();
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // Ping каждые 30 секунд
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Публичные методы для внешнего использования
  public broadcastToWorkspace(workspaceId: string, message: any) {
    this.broadcastToRoom(`workspace:${workspaceId}`, message);
  }

  public broadcastToProject(projectId: string, message: any) {
    this.broadcastToRoom(`project:${projectId}`, message);
  }

  public broadcastToUser(userId: string, message: any) {
    const userClients = Array.from(this.clients.values())
      .filter(client => client.userId === userId && client.readyState === WebSocket.OPEN);

    userClients.forEach(client => {
      this.sendToClient(client, {
        type: 'user_message',
        data: { message, timestamp: Date.now() }
      });
    });
  }

  public getStats() {
    return {
      totalClients: this.clients.size,
      totalRooms: this.rooms.size,
      rooms: Array.from(this.rooms.entries()).map(([roomId, clients]) => ({
        roomId,
        clientCount: clients.size
      }))
    };
  }

  public close() {
    clearInterval(this.pingInterval);
    this.wss.close();
    LoggerService.websocket.info('WebSocket server closed');
  }
}

export { WebSocketManager };
