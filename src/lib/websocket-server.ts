import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  workspaceId?: string;
  projectId?: string;
  subscriptions: Set<string>;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  projectId?: string;
  workspaceId?: string;
  userId?: string;
  todo?: any;
  todoId?: string;
  status?: any;
  action?: any;
  member?: any;
  bug?: any;
  bugId?: string;
  aiMember?: any;
  message?: string;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // projectId -> Set of clientIds

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    
    console.log('🚀 WebSocket server started on /ws');
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    const url = parse(request.url || '', true);
    const clientId = crypto.randomUUID();
    
    console.log(`📡 New WebSocket connection: ${clientId}`);

    const connection: ClientConnection = {
      ws,
      userId: url.query.userId as string || 'anonymous',
      subscriptions: new Set(),
    };

    this.clients.set(clientId, connection);

    ws.on('message', (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(clientId, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });

    ws.on('close', () => {
      console.log(`📡 WebSocket connection closed: ${clientId}`);
      this.handleDisconnection(clientId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    });

    // Отправляем приветственное сообщение
    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
      message: 'Connected to DeadLine real-time updates'
    }));
  }

  private handleMessage(clientId: string, message: WebSocketMessage) {
    const connection = this.clients.get(clientId);
    if (!connection) return;

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(clientId, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message);
        break;
      case 'ping':
        connection.ws.send(JSON.stringify({ type: 'pong' }));
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  private handleSubscribe(clientId: string, message: WebSocketMessage) {
    const connection = this.clients.get(clientId);
    if (!connection) return;

    if (message.projectId) {
      connection.projectId = message.projectId;
      connection.subscriptions.add(`project:${message.projectId}`);
      
      // Добавляем в подписки проекта
      if (!this.subscriptions.has(message.projectId)) {
        this.subscriptions.set(message.projectId, new Set());
      }
      this.subscriptions.get(message.projectId)!.add(clientId);
    }

    if (message.workspaceId) {
      connection.workspaceId = message.workspaceId;
      connection.subscriptions.add(`workspace:${message.workspaceId}`);
    }

    console.log(`📡 Client ${clientId} subscribed to:`, Array.from(connection.subscriptions));
    
    connection.ws.send(JSON.stringify({
      type: 'subscribed',
      subscriptions: Array.from(connection.subscriptions)
    }));
  }

  private handleUnsubscribe(clientId: string, message: WebSocketMessage) {
    const connection = this.clients.get(clientId);
    if (!connection) return;

    if (message.projectId) {
      connection.subscriptions.delete(`project:${message.projectId}`);
      this.subscriptions.get(message.projectId)?.delete(clientId);
    }

    if (message.workspaceId) {
      connection.subscriptions.delete(`workspace:${message.workspaceId}`);
    }

    console.log(`📡 Client ${clientId} unsubscribed from:`, Array.from(connection.subscriptions));
  }

  private handleDisconnection(clientId: string) {
    const connection = this.clients.get(clientId);
    if (!connection) return;

    // Удаляем из всех подписок
    for (const subscription of Array.from(connection.subscriptions)) {
      if (subscription.startsWith('project:')) {
        const projectId = subscription.replace('project:', '');
        this.subscriptions.get(projectId)?.delete(clientId);
      }
    }

    this.clients.delete(clientId);
  }

  // Публичные методы для отправки уведомлений
  public broadcastToProject(projectId: string, message: WebSocketMessage) {
    const subscribers = this.subscriptions.get(projectId);
    if (!subscribers) return;

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const clientId of Array.from(subscribers)) {
      const connection = this.clients.get(clientId);
      if (connection && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(messageStr);
        sentCount++;
      }
    }

    console.log(`📡 Broadcasted to ${sentCount} clients in project ${projectId}`);
  }

  public broadcastToWorkspace(workspaceId: string, message: WebSocketMessage) {
    let sentCount = 0;

    for (const [clientId, connection] of Array.from(this.clients.entries())) {
      if (connection.workspaceId === workspaceId && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
        sentCount++;
      }
    }

    console.log(`📡 Broadcasted to ${sentCount} clients in workspace ${workspaceId}`);
  }

  public broadcastToUser(userId: string, message: WebSocketMessage) {
    let sentCount = 0;

    for (const [clientId, connection] of Array.from(this.clients.entries())) {
      if (connection.userId === userId && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
        sentCount++;
      }
    }

    console.log(`📡 Broadcasted to ${sentCount} clients for user ${userId}`);
  }

  public broadcastToAll(message: WebSocketMessage) {
    let sentCount = 0;

    for (const [clientId, connection] of Array.from(this.clients.entries())) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
        sentCount++;
      }
    }

    console.log(`📡 Broadcasted to ${sentCount} clients globally`);
  }

  // Специфичные методы для DeadLine
  public notifyTaskUpdate(projectId: string, task: any) {
    this.broadcastToProject(projectId, {
      type: 'todo_updated',
      todo: task,
      projectId,
    });
  }

  public notifyTaskCreated(projectId: string, task: any) {
    this.broadcastToProject(projectId, {
      type: 'todo_created',
      todo: task,
      projectId,
    });
  }

  public notifyTaskDeleted(projectId: string, taskId: string) {
    this.broadcastToProject(projectId, {
      type: 'todo_deleted',
      todoId: taskId,
      projectId,
    });
  }

  public notifyProjectStatusUpdate(projectId: string, status: any) {
    this.broadcastToProject(projectId, {
      type: 'project_status_updated',
      status,
      projectId,
    });
  }

  public notifyVasilyAction(projectId: string, action: any) {
    this.broadcastToProject(projectId, {
      type: 'vasily_action',
      action,
      projectId,
    });
  }

  public notifyRoleUpdate(workspaceId: string, member: any) {
    this.broadcastToWorkspace(workspaceId, {
      type: 'role_updated',
      member,
      workspaceId,
    });
  }

  public notifyBugCreated(projectId: string, bug: any) {
    this.broadcastToProject(projectId, {
      type: 'bug_created',
      bug,
      projectId,
    });
  }

  public notifyBugUpdate(projectId: string, bug: any) {
    this.broadcastToProject(projectId, {
      type: 'bug_updated',
      bug,
      projectId,
    });
  }

  public notifyAITeamMessage(workspaceId: string, aiMember: any, message: string) {
    this.broadcastToWorkspace(workspaceId, {
      type: 'ai_team_message',
      aiMember,
      message,
      workspaceId,
    });
  }

  public getStats() {
    return {
      totalClients: this.clients.size,
      activeSubscriptions: this.subscriptions.size,
      clientsByProject: Object.fromEntries(
        Array.from(this.subscriptions.entries()).map(([projectId, clients]) => [
          projectId,
          clients.size
        ])
      ),
    };
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

export { WebSocketManager };
