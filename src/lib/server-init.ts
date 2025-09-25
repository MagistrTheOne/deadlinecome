import { initializeWebSocketServer } from './websocket-init';

export function setupServer(server: any) {
  // Инициализируем WebSocket сервер
  initializeWebSocketServer(server);
  
  console.log('Server setup completed');
}
