import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { VasilyService } from "@/lib/ai/vasily-service";

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
