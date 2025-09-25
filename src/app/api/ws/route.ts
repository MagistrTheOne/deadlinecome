import { NextRequest } from "next/server";
import { getWebSocketManager } from "@/lib/websocket-server";

export async function GET(request: NextRequest) {
  try {
    const wsManager = getWebSocketManager();
    
    if (!wsManager) {
      return Response.json(
        { error: "WebSocket server not initialized" },
        { status: 500 }
      );
    }

    const stats = wsManager.getConnectionStats();
    
    return Response.json({
      status: "running",
      connections: stats.totalClients,
      projectSubscriptions: stats.projectSubscriptions
    });
  } catch (error) {
    console.error("WebSocket API error:", error);
    return Response.json(
      { error: "WebSocket server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, projectId, data } = body;
    
    const wsManager = getWebSocketManager();
    if (!wsManager) {
      return Response.json(
        { error: "WebSocket server not available" },
        { status: 500 }
      );
    }

    switch (action) {
      case "broadcast_todo":
        if (projectId && data) {
          wsManager.notifyTodoCreated(projectId, data);
        }
        break;
      
      case "broadcast_bug":
        if (projectId && data) {
          wsManager.notifyBugCreated(projectId, data);
        }
        break;
      
      case "broadcast_mood":
        if (projectId && data) {
          wsManager.notifyTeamMoodUpdate(projectId, data);
        }
        break;
      
      case "broadcast_support":
        if (projectId && data) {
          wsManager.notifySupportMessage(projectId, data);
        }
        break;
      
      default:
        return Response.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("WebSocket broadcast error:", error);
    return Response.json(
      { error: "Broadcast failed" },
      { status: 500 }
    );
  }
}
