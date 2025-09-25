import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { TeamMoodMonitor } from './ai/team-mood-monitor';

interface WebSocketMessage {
  type: string;
  projectId?: string;
  workspaceId?: string;
  data?: any;
}

interface ClientConnection {
  ws: WebSocket;
  projectId?: string;
  workspaceId?: string;
  userId?: string;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();
  private projectSubscriptions: Map<string, Set<string>> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const clientId = this.generateClientId();
      const client: ClientConnection = { ws };
      
      this.clients.set(clientId, client);

      console.log(`WebSocket client connected: ${clientId}`);

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
        this.handleDisconnection(clientId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });

      // Отправляем приветственное сообщение
      this.sendMessage(ws, {
        type: 'connected',
        message: 'WebSocket connection established'
      });
    });
  }

  private handleMessage(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(clientId, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message);
        break;
      case 'message':
        this.handleTeamMessage(clientId, message);
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  private handleSubscribe(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { projectId, workspaceId, userId } = message;
    
    client.projectId = projectId;
    client.workspaceId = workspaceId;
    client.userId = userId;

    // Добавляем подписку на проект
    if (projectId) {
      if (!this.projectSubscriptions.has(projectId)) {
        this.projectSubscriptions.set(projectId, new Set());
      }
      this.projectSubscriptions.get(projectId)!.add(clientId);
    }

    this.sendMessage(client.ws, {
      type: 'subscribed',
      projectId,
      workspaceId,
      message: 'Successfully subscribed to project updates'
    });

    console.log(`Client ${clientId} subscribed to project ${projectId}`);
  }

  private handleUnsubscribe(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { projectId } = message;
    
    if (projectId && this.projectSubscriptions.has(projectId)) {
      this.projectSubscriptions.get(projectId)!.delete(clientId);
    }

    this.sendMessage(client.ws, {
      type: 'unsubscribed',
      projectId,
      message: 'Successfully unsubscribed from project updates'
    });
  }

  private handleTeamMessage(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { data } = message;
    if (!data) return;

    // Анализируем сообщение для мониторинга настроения
    const teamMessage = TeamMoodMonitor.addMessage({
      userId: data.userId || client.userId || 'unknown',
      userName: data.userName || 'Unknown User',
      content: data.content || '',
      channel: data.channel || 'general',
      type: data.type || 'text'
    });

    // Отправляем обновление настроения команды всем подписчикам
    this.broadcastToProject(client.projectId, {
      type: 'team_mood_updated',
      data: TeamMoodMonitor.getTeamMoodReport()
    });

    console.log(`Team message processed for client ${clientId}`);
  }

  private handleDisconnection(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Удаляем из подписок
    if (client.projectId && this.projectSubscriptions.has(client.projectId)) {
      this.projectSubscriptions.get(client.projectId)!.delete(clientId);
    }

    this.clients.delete(clientId);
  }

  // Методы для отправки уведомлений
  public broadcastToProject(projectId: string, message: any) {
    if (!this.projectSubscriptions.has(projectId)) return;

    const subscribers = this.projectSubscriptions.get(projectId)!;
    subscribers.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(client.ws, message);
      }
    });
  }

  public broadcastToWorkspace(workspaceId: string, message: any) {
    this.clients.forEach((client, clientId) => {
      if (client.workspaceId === workspaceId && client.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(client.ws, message);
      }
    });
  }

  public sendToUser(userId: string, message: any) {
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(client.ws, message);
      }
    });
  }

  // Уведомления о задачах
  public notifyTodoCreated(projectId: string, todo: any) {
    this.broadcastToProject(projectId, {
      type: 'todo_created',
      todo
    });
  }

  public notifyTodoUpdated(projectId: string, todo: any) {
    this.broadcastToProject(projectId, {
      type: 'todo_updated',
      todo
    });
  }

  public notifyTodoDeleted(projectId: string, todoId: string) {
    this.broadcastToProject(projectId, {
      type: 'todo_deleted',
      todoId
    });
  }

  // Уведомления о багах
  public notifyBugCreated(projectId: string, bug: any) {
    this.broadcastToProject(projectId, {
      type: 'bug_created',
      bug
    });
  }

  public notifyBugUpdated(projectId: string, bug: any) {
    this.broadcastToProject(projectId, {
      type: 'bug_updated',
      bug
    });
  }

  // Уведомления о настроении команды
  public notifyTeamMoodUpdate(projectId: string, moodData: any) {
    this.broadcastToProject(projectId, {
      type: 'team_mood_updated',
      data: moodData
    });
  }

  // Уведомления о психологической поддержке
  public notifySupportMessage(projectId: string, message: any) {
    this.broadcastToProject(projectId, {
      type: 'support_message',
      data: message
    });
  }

  public notifyCrisisDetected(projectId: string, crisis: any) {
    this.broadcastToProject(projectId, {
      type: 'crisis_detected',
      data: crisis
    });
  }

  private sendMessage(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.sendMessage(ws, {
      type: 'error',
      message: error
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Статистика подключений
  public getConnectionStats() {
    return {
      totalClients: this.clients.size,
      projectSubscriptions: Object.fromEntries(
        Array.from(this.projectSubscriptions.entries()).map(([projectId, clients]) => [
          projectId,
          clients.size
        ])
      )
    };
  }

  // Закрытие сервера
  public close() {
    this.wss.close();
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(server: any): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}