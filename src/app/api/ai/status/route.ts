import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import { VasilyService } from "@/lib/ai/vasily-service";

import { requireAuth } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await requireAuth(request);

    // Получаем статус AI сервиса
    const aiStatus = AIService.getServiceStatus();
    
    // Получаем статус Василия
    const vasilyStatus = VasilyService.getStatus();

    return NextResponse.json({
      ...aiStatus,
      vasily: vasilyStatus
    });
  } catch (error) {
    console.error("Error getting AI status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
