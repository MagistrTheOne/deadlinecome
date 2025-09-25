import { NextRequest, NextResponse } from "next/server";
import { getWebSocketManager } from "@/lib/websocket-server";

export async function GET(request: NextRequest) {
  try {
    const wsManager = getWebSocketManager();
    
    if (!wsManager) {
      return NextResponse.json({ 
        error: "WebSocket server not initialized" 
      }, { status: 503 });
    }

    const stats = wsManager.getStats();
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting WebSocket stats:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
