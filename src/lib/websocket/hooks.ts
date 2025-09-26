'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient } from './websocket-client';

interface UseWebSocketOptions {
  userId: string;
  workspaceId?: string;
  projectId?: string;
  autoConnect?: boolean;
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface UseWebSocketReturn {
  client: WebSocketClient | null;
  isConnected: boolean;
  connectionState: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  send: (message: any) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  broadcastToRoom: (roomId: string, message: any) => void;
  getOnlineUsers: () => void;
  getRoomStats: (roomId: string) => void;
  ping: () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const [client, setClient] = useState<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState(WebSocket.CLOSED);
  const clientRef = useRef<WebSocketClient | null>(null);

  const connect = useCallback(async () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }

    const wsClient = new WebSocketClient({
      url: `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'}/ws`,
      userId: options.userId,
      workspaceId: options.workspaceId,
      projectId: options.projectId,
      onMessage: options.onMessage,
      onConnect: () => {
        setIsConnected(true);
        setConnectionState(WebSocket.OPEN);
        options.onConnect?.();
      },
      onDisconnect: () => {
        setIsConnected(false);
        setConnectionState(WebSocket.CLOSED);
        options.onDisconnect?.();
      },
      onError: options.onError
    });

    clientRef.current = wsClient;
    setClient(wsClient);

    try {
      await wsClient.connect();
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
      setClient(null);
      setIsConnected(false);
      setConnectionState(WebSocket.CLOSED);
    }
  }, []);

  const send = useCallback((message: any) => {
    if (clientRef.current) {
      clientRef.current.send(message);
    }
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (clientRef.current) {
      clientRef.current.joinRoom(roomId);
    }
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    if (clientRef.current) {
      clientRef.current.leaveRoom(roomId);
    }
  }, []);

  const broadcastToRoom = useCallback((roomId: string, message: any) => {
    if (clientRef.current) {
      clientRef.current.broadcastToRoom(roomId, message);
    }
  }, []);

  const getOnlineUsers = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.getOnlineUsers();
    }
  }, []);

  const getRoomStats = useCallback((roomId: string) => {
    if (clientRef.current) {
      clientRef.current.getRoomStats(roomId);
    }
  }, []);

  const ping = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.ping();
    }
  }, []);

  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, options.autoConnect]);

  return {
    client,
    isConnected,
    connectionState,
    connect,
    disconnect,
    send,
    joinRoom,
    leaveRoom,
    broadcastToRoom,
    getOnlineUsers,
    getRoomStats,
    ping
  };
}

// Хук для real-time уведомлений
export function useRealtimeNotifications(userId: string, workspaceId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  const { client, isConnected, joinRoom, leaveRoom } = useWebSocket({
    userId,
    workspaceId,
    autoConnect: true,
    onMessage: (message) => {
      switch (message.type) {
        case 'notification':
          setNotifications(prev => [message.data, ...prev.slice(0, 49)]); // Keep last 50
          break;
        case 'online_users':
          setOnlineUsers(message.data.users);
          break;
        case 'user_joined':
          setOnlineUsers(prev => [...prev, message.data.user]);
          break;
        case 'user_left':
          setOnlineUsers(prev => prev.filter(user => user.userId !== message.data.userId));
          break;
      }
    }
  });

  useEffect(() => {
    if (workspaceId && isConnected) {
      joinRoom(`workspace:${workspaceId}`);
      return () => leaveRoom(`workspace:${workspaceId}`);
    }
  }, [workspaceId, isConnected, joinRoom, leaveRoom]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    onlineUsers,
    isConnected,
    markAsRead,
    clearNotifications
  };
}

// Хук для real-time чата
export function useRealtimeChat(workspaceId: string, projectId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const { client, isConnected, joinRoom, leaveRoom, send } = useWebSocket({
    userId: 'current-user', // TODO: Get from auth context
    workspaceId,
    projectId,
    autoConnect: true,
    onMessage: (message) => {
      switch (message.type) {
        case 'chat_message':
          setMessages(prev => [...prev, message.data]);
          break;
        case 'user_typing':
          setTypingUsers(prev => [...new Set([...prev, message.data.userId])]);
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(id => id !== message.data.userId));
          }, 3000);
          break;
        case 'user_stopped_typing':
          setTypingUsers(prev => prev.filter(id => id !== message.data.userId));
          break;
      }
    }
  });

  useEffect(() => {
    if (isConnected) {
      joinRoom(`workspace:${workspaceId}`);
      if (projectId) {
        joinRoom(`project:${projectId}`);
      }
      return () => {
        leaveRoom(`workspace:${workspaceId}`);
        if (projectId) {
          leaveRoom(`project:${projectId}`);
        }
      };
    }
  }, [workspaceId, projectId, isConnected, joinRoom, leaveRoom]);

  const sendMessage = useCallback((content: string, type: string = 'text') => {
    send({
      type: 'chat_message',
      data: { content, type, timestamp: Date.now() },
      timestamp: Date.now()
    });
  }, [send]);

  const sendTyping = useCallback(() => {
    send({
      type: 'user_typing',
      data: { userId: 'current-user' }, // TODO: Get from auth context
      timestamp: Date.now()
    });
  }, [send]);

  const sendStoppedTyping = useCallback(() => {
    send({
      type: 'user_stopped_typing',
      data: { userId: 'current-user' }, // TODO: Get from auth context
      timestamp: Date.now()
    });
  }, [send]);

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    sendTyping,
    sendStoppedTyping
  };
}
