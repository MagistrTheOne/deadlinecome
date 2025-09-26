import { NextRequest, NextResponse } from "next/server";
import { EmotionalIntelligenceInstance } from "@/lib/ai/emotional-intelligence";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, aiId, context, issue } = body;

    switch (action) {
      case "analyze":
        if (!aiId || !context) {
          return NextResponse.json(
            { error: "aiId и context обязательны" },
            { status: 400 }
          );
        }
        const emotionalState = await EmotionalIntelligenceInstance.analyzeEmotionalState(aiId, context);
        return NextResponse.json(emotionalState);

      case "support":
        if (!aiId || !issue) {
          return NextResponse.json(
            { error: "aiId и issue обязательны" },
            { status: 400 }
          );
        }
        const supportMessage = await EmotionalIntelligenceInstance.provideEmotionalSupport(aiId, issue);
        return NextResponse.json({ message: supportMessage });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка emotional intelligence:", error);
    return NextResponse.json(
      { error: "Ошибка emotional intelligence" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aiId = searchParams.get("aiId");
    const days = parseInt(searchParams.get("days") || "7");

    if (aiId) {
        const trends = EmotionalIntelligenceInstance.getEmotionalTrends(aiId, days);
      return NextResponse.json(trends);
    } else {
      const health = await EmotionalIntelligenceInstance.getTeamEmotionalHealth();
      const activities = await EmotionalIntelligenceInstance.suggestTeamActivities();
      return NextResponse.json({ health, activities });
    }
  } catch (error) {
    console.error("Ошибка получения emotional intelligence:", error);
    return NextResponse.json(
      { error: "Ошибка получения emotional intelligence" },
      { status: 500 }
    );
  }
}
