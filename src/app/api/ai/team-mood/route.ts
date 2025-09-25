import { NextRequest, NextResponse } from "next/server";
import { TeamMoodMonitor } from "@/lib/ai/team-mood-monitor";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "report":
        const report = TeamMoodMonitor.getTeamMoodReport();
        return NextResponse.json(report);

      case "stats":
        const stats = TeamMoodMonitor.getMoodStats();
        return NextResponse.json(stats);

      case "user-mood":
        const userId = searchParams.get("userId");
        if (!userId) {
          return NextResponse.json({ error: "UserId parameter is required" }, { status: 400 });
        }
        const userMood = TeamMoodMonitor.getUserMood(userId);
        return NextResponse.json(userMood);

      case "user-history":
        const historyUserId = searchParams.get("userId");
        const days = parseInt(searchParams.get("days") || "7");
        if (!historyUserId) {
          return NextResponse.json({ error: "UserId parameter is required" }, { status: 400 });
        }
        const userHistory = TeamMoodMonitor.getUserMoodHistory(historyUserId, days);
        return NextResponse.json(userHistory);

      default:
        const teamMoodReport = TeamMoodMonitor.getTeamMoodReport();
        return NextResponse.json(teamMoodReport);
    }
  } catch (error) {
    console.error("Ошибка получения данных настроения команды:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных настроения команды" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "add-message":
        const { userId, userName, content, channel, type } = data;
        const message = TeamMoodMonitor.addMessage({
          userId,
          userName,
          content,
          channel,
          type: type || "text"
        });
        return NextResponse.json({
          success: true,
          data: message,
          message: "Сообщение добавлено для анализа настроения"
        });

      case "analyze-messages":
        const { messages } = data;
        const analyses = messages.map((msg: any) => {
          const teamMessage = TeamMoodMonitor.addMessage(msg);
          return teamMessage;
        });
        return NextResponse.json({
          success: true,
          analyses,
          message: `Проанализировано ${analyses.length} сообщений`
        });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки настроения команды:", error);
    return NextResponse.json(
      { error: "Ошибка обработки настроения команды" },
      { status: 500 }
    );
  }
}
