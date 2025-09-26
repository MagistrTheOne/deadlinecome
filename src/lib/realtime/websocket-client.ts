"use client";

import { useEffect, useRef, useState } from 'react';

export interface WebSocketMessage {
  type: 'task_update' | 'project_update' | 'team_update' | 'ai_notification' | 'chat_message' | 'user_status';
  data: any;
  timestamp: string;
  userId?: string;
  workspaceId?: string;
  projectId?: string;
}

export interface WebSocketClient {
  isConnected: boolean;
  send: (message: Omit<WebSocketMessage, 'timestamp'>) => void;
  subscribe: (callback: (message: WebSocketMessage) => void) => () => void;
  connect: (workspaceId?: string, projectId?: string) => void;
  disconnect: () => void;
}

export function useWebSocket(workspaceId?: string, projectId?: string): WebSocketClient {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const callbacksRef = useRef<Set<(message: WebSocketMessage) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = (wsId?: string, projId?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const params = new URLSearchParams();
      if (wsId) params.append('workspaceId', wsId);
      if (projId) params.append('projectId', projId);
      params.append('token', 'demo-token'); // В реальном приложении брать из сессии

      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws?${params.toString()}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🔗 WebSocket подключен');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          callbacksRef.current.forEach(callback => callback(message));
        } catch (error) {
          console.error('Ошибка парсинга WebSocket сообщения:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket отключен:', event.code, event.reason);
        setIsConnected(false);
        
        // Автоматическое переподключение
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          console.log(`🔄 Переподключение через ${delay}ms (попытка ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect(wsId, projId);
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket ошибка:', error);
      };

    } catch (error) {
      console.error('Ошибка создания WebSocket соединения:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  const send = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString()
      };
      wsRef.current.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket не подключен, сообщение не отправлено');
    }
  };

  const subscribe = (callback: (message: WebSocketMessage) => void) => {
    callbacksRef.current.add(callback);
    
    return () => {
      callbacksRef.current.delete(callback);
    };
  };

  useEffect(() => {
    connect(workspaceId, projectId);
    
    return () => {
      disconnect();
    };
  }, [workspaceId, projectId]);

  return {
    isConnected,
    send,
    subscribe,
    connect,
    disconnect
  };
}

// Хук для real-time уведомлений
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const ws = useWebSocket();

  useEffect(() => {
    const unsubscribe = ws.subscribe((message) => {
      if (message.type === 'ai_notification' || message.type === 'task_update') {
        setNotifications(prev => [message, ...prev.slice(0, 9)]); // Храним последние 10
      }
    });

    return unsubscribe;
  }, [ws]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    clearNotifications,
    isConnected: ws.isConnected
  };
}

// Хук для real-time чата
export function useRealtimeChat(workspaceId?: string) {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const ws = useWebSocket(workspaceId);

  useEffect(() => {
    const unsubscribe = ws.subscribe((message) => {
      if (message.type === 'chat_message') {
        setMessages(prev => [...prev, message]);
      }
    });

    return unsubscribe;
  }, [ws]);

  const sendMessage = (content: string, projectId?: string) => {
    ws.send({
      type: 'chat_message',
      data: {
        content,
        workspaceId,
        projectId
      }
    });
  };

  return {
    messages,
    sendMessage,
    isConnected: ws.isConnected
  };
}
