import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, userId, timestamp } = body;

    // Отправляем событие в очередь обновлений
    const updateResponse = await fetch(`${request.nextUrl.origin}/api/realtime/updates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data,
        userId,
        timestamp
      }),
    });

    if (!updateResponse.ok) {
      throw new Error("Ошибка добавления события в очередь");
    }

    return NextResponse.json({
      success: true,
      message: "Событие отправлено"
    });
  } catch (error) {
    console.error("Ошибка отправки события:", error);
    return NextResponse.json(
      { error: "Ошибка отправки события" },
      { status: 500 }
    );
  }
}
