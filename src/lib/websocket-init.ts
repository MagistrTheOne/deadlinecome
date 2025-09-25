import { initializeWebSocket } from './websocket-server';

let isWebSocketInitialized = false;

export function initializeWebSocketServer(server: any) {
  if (!isWebSocketInitialized && server) {
    try {
      initializeWebSocket(server);
      isWebSocketInitialized = true;
      console.log('WebSocket server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebSocket server:', error);
    }
  }
}

export function isWebSocketReady(): boolean {
  return isWebSocketInitialized;
}
