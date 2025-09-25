import { NextRequest, NextResponse } from "next/server";
import { ActivityMonitor } from "@/lib/ai/activity-monitor";
import { VasilyStatusSystem } from "@/lib/ai/vasily-status-system";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "metrics":
        const metrics = ActivityMonitor.getDashboardMetrics();
        return NextResponse.json(metrics);

      case "team-activity":
        const teamActivity = ActivityMonitor.getTeamActivity();
        return NextResponse.json(teamActivity);

      case "team-moods":
        const teamMoods = ActivityMonitor.getTeamMoods();
        return NextResponse.json(teamMoods);

      case "vasily-status":
        const vasilyStatus = VasilyStatusSystem.getCurrentStatus();
        return NextResponse.json(vasilyStatus);

      case "recommendations":
        const recommendations = ActivityMonitor.getRecommendations();
        return NextResponse.json({ recommendations });

      default:
        return NextResponse.json({
          metrics: ActivityMonitor.getDashboardMetrics(),
          teamActivity: ActivityMonitor.getTeamActivity(),
          vasilyStatus: VasilyStatusSystem.getCurrentStatus(),
          recommendations: ActivityMonitor.getRecommendations()
        });
    }
  } catch (error) {
    console.error("Ошибка получения метрик активности:", error);
    return NextResponse.json(
      { error: "Ошибка получения метрик активности" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, projectId, data, impact } = body;

    // Добавляем новую активность
    const activity = ActivityMonitor.addActivity({
      type,
      userId,
      projectId,
      data,
      impact: impact || "medium"
    });

    return NextResponse.json({
      success: true,
      activity,
      message: "Активность успешно добавлена"
    });
  } catch (error) {
    console.error("Ошибка добавления активности:", error);
    return NextResponse.json(
      { error: "Ошибка добавления активности" },
      { status: 500 }
    );
  }
}
