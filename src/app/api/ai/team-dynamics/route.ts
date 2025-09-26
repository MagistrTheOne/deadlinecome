import { NextRequest, NextResponse } from "next/server";
import { AITeamDynamicsInstance } from "@/lib/ai/team-dynamics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, participants, task, collaborationId, from, to, message, type } = body;

    switch (action) {
      case "initiate":
        if (!participants || !task) {
          return NextResponse.json(
            { error: "participants и task обязательны" },
            { status: 400 }
          );
        }
        const collaborationId = await AITeamDynamicsInstance.initiateCollaboration(participants, task);
        return NextResponse.json({ collaborationId });

      case "communicate":
        if (!collaborationId || !from || !to || !message || !type) {
          return NextResponse.json(
            { error: "collaborationId, from, to, message и type обязательны" },
            { status: 400 }
          );
        }
        await AITeamDynamicsInstance.addCommunication(collaborationId, from, to, message, type);
        return NextResponse.json({ success: true });

      case "complete":
        if (!collaborationId) {
          return NextResponse.json(
            { error: "collaborationId обязателен" },
            { status: 400 }
          );
        }
        await AITeamDynamicsInstance.completeCollaboration(collaborationId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка team dynamics:", error);
    return NextResponse.json(
      { error: "Ошибка team dynamics" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aiId = searchParams.get("aiId");

    if (aiId) {
      const history = AITeamDynamicsInstance.getCollaborationHistory(aiId);
      return NextResponse.json({ history });
    } else {
      const stats = AITeamDynamicsInstance.getTeamDynamicsStats();
      return NextResponse.json(stats);
    }
  } catch (error) {
    console.error("Ошибка получения team dynamics:", error);
    return NextResponse.json(
      { error: "Ошибка получения team dynamics" },
      { status: 500 }
    );
  }
}
