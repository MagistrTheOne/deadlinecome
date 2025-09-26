import { NextRequest, NextResponse } from "next/server";
import { GamificationSystemInstance } from "@/lib/gamification/gamification-system";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");

    switch (action) {
      case "stats":
        if (!userId) {
          return NextResponse.json(
            { error: "userId обязателен" },
            { status: 400 }
          );
        }
        const stats = GamificationSystemInstance.getUserStats(userId);
        return NextResponse.json({ stats });

      case "leaderboard":
        const leaderboard = GamificationSystemInstance.getLeaderboard(limit);
        return NextResponse.json({ leaderboard });

      case "quests":
        if (!userId) {
          return NextResponse.json(
            { error: "userId обязателен" },
            { status: 400 }
          );
        }
        const quests = GamificationSystemInstance.getQuests(userId);
        return NextResponse.json({ quests });

      case "achievements":
        const achievements = GamificationSystemInstance.getAchievements();
        return NextResponse.json({ achievements });

      case "events":
        const events = GamificationSystemInstance.getEvents(limit);
        return NextResponse.json({ events });

      case "overview":
        const overview = GamificationSystemInstance.getGamificationStats();
        return NextResponse.json(overview);

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка получения данных геймификации:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных геймификации" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, experience, reason, questId, progress } = body;

    switch (action) {
      case "add-experience":
        if (!userId || !experience || !reason) {
          return NextResponse.json(
            { error: "userId, experience и reason обязательны" },
            { status: 400 }
          );
        }
        GamificationSystemInstance.addExperience(userId, experience, reason);
        return NextResponse.json({ success: true });

      case "update-quest":
        if (!userId || !questId || progress === undefined) {
          return NextResponse.json(
            { error: "userId, questId и progress обязательны" },
            { status: 400 }
          );
        }
        GamificationSystemInstance.updateQuestProgress(userId, questId, progress);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки действия геймификации:", error);
    return NextResponse.json(
      { error: "Ошибка обработки действия геймификации" },
      { status: 500 }
    );
  }
}
