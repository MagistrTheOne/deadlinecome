import { NextRequest, NextResponse } from "next/server";
import { VasilyService } from "@/lib/ai/vasily-service";

import { requireAuth } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await requireAuth(request);

    // Получаем текущий статус Василия
    const status = VasilyService.getStatus();

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error getting Vasily mood:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await requireAuth(request);

    const { mood } = await request.json();

    if (!mood) {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    // Изменяем настроение Василия
    const response = VasilyService.changeMood(mood);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error changing Vasily mood:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
