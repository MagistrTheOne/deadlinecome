import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");

    // Получаем события из очереди обновлений
    const updatesResponse = await fetch(`${request.nextUrl.origin}/api/realtime/updates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!updatesResponse.ok) {
      throw new Error("Ошибка получения событий");
    }

    const updatesData = await updatesResponse.json();
    let events = updatesData.events || [];

    // Фильтруем по типу
    if (type) {
      events = events.filter((e: any) => e.type === type);
    }

    // Фильтруем по пользователю
    if (userId) {
      events = events.filter((e: any) => !e.userId || e.userId === userId);
    }

    // Ограничиваем количество
    events = events.slice(-limit);

    return NextResponse.json({
      events,
      total: events.length,
      limit
    });
  } catch (error) {
    console.error("Ошибка получения истории событий:", error);
    return NextResponse.json(
      { error: "Ошибка получения истории событий" },
      { status: 500 }
    );
  }
}
