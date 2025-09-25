import { NextRequest, NextResponse } from "next/server";
import { PsychologicalSupport } from "@/lib/ai/psychological-support";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "messages":
        const messages = PsychologicalSupport.getSupportMessages();
        return NextResponse.json({ messages });

      case "crises":
        const crises = PsychologicalSupport.getActiveCrises();
        return NextResponse.json({ activeCrises: crises });

      case "recommendations":
        const recommendations = PsychologicalSupport.getRecommendations();
        return NextResponse.json({ recommendations });

      default:
        const supportData = PsychologicalSupport.getSupportData();
        return NextResponse.json(supportData);
    }
  } catch (error) {
    console.error("Ошибка получения данных психологической поддержки:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных поддержки" },
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
        const { type, content, tone, priority, targetUser, context } = data;
        const message = PsychologicalSupport.addSupportMessage({
          type,
          content,
          tone,
          priority,
          targetUser,
          context
        });
        return NextResponse.json({
          success: true,
          data: message,
          message: "Сообщение поддержки добавлено"
        });

      case "detect-crisis":
        const { userId, severity, description, affectedUsers } = data;
        const crisis = PsychologicalSupport.detectCrisis({
          userId,
          severity,
          description,
          affectedUsers
        });
        return NextResponse.json({
          success: true,
          data: crisis,
          message: "Кризис обнаружен и зарегистрирован"
        });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки психологической поддержки:", error);
    return NextResponse.json(
      { error: "Ошибка обработки поддержки" },
      { status: 500 }
    );
  }
}