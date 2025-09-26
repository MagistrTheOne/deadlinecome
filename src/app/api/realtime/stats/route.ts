import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { wsManager } from "@/lib/realtime/websocket-server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Получаем статистику WebSocket соединений
    const wsStats = wsManager.getStats();

    // Дополнительная статистика
    const stats = {
      websocket: {
        connectedUsers: wsStats.connectedUsers,
        activeRooms: wsStats.rooms,
        onlineUsers: wsStats.users
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Error fetching realtime stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
