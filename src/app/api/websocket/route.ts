import { NextRequest } from 'next/server';
import { WebSocketManager } from '@/lib/websocket/websocket-server';

// WebSocket upgrade handler
export async function GET(request: NextRequest) {
  // This will be handled by the WebSocket server setup
  return new Response('WebSocket endpoint', { status: 200 });
}
