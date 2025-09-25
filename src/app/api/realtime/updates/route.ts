import { NextRequest, NextResponse } from "next/server";

// Простое хранилище событий в памяти (в продакшене использовать Redis или базу данных)
let eventQueue: Array<{
  id: string;
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}> = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lastEventId = searchParams.get("lastEventId");
    const userId = searchParams.get("userId");

    // Фильтруем события
    let events = eventQueue;

    // Если указан lastEventId, возвращаем только новые события
    if (lastEventId) {
      const lastEventIndex = events.findIndex(e => e.id === lastEventId);
      if (lastEventIndex !== -1) {
        events = events.slice(lastEventIndex + 1);
      }
    }

    // Если указан userId, фильтруем по пользователю
    if (userId) {
      events = events.filter(e => !e.userId || e.userId === userId);
    }

    // Ограничиваем количество событий
    events = events.slice(-50);

    return NextResponse.json({
      events,
      lastEventId: events.length > 0 ? events[events.length - 1].id : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Ошибка получения обновлений:", error);
    return NextResponse.json(
      { error: "Ошибка получения обновлений" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, userId, timestamp } = body;

    const event = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: timestamp || new Date().toISOString(),
      userId
    };

    eventQueue.push(event);

    // Ограничиваем размер очереди
    if (eventQueue.length > 1000) {
      eventQueue = eventQueue.slice(-500);
    }

    return NextResponse.json({
      success: true,
      event,
      message: "Событие добавлено в очередь"
    });
  } catch (error) {
    console.error("Ошибка добавления события:", error);
    return NextResponse.json(
      { error: "Ошибка добавления события" },
      { status: 500 }
    );
  }
}
