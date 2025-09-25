import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { issue, aiConversation } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'all';

    // Получаем последние задачи
    const recentTasks = await db
      .select()
      .from(issue)
      .orderBy(desc(issue.createdAt))
      .limit(limit);

    // Получаем последние разговоры с AI
    const recentConversations = await db
      .select()
      .from(aiConversation)
      .where(eq(aiConversation.userId, session.user.id))
      .orderBy(desc(aiConversation.createdAt))
      .limit(5);

    // Формируем активность
    const activities = [];

    // Добавляем задачи
    for (const task of recentTasks) {
      activities.push({
        id: `task-${task.id}`,
        type: task.status === "DONE" ? "task_completed" : "task_created",
        title: task.status === "DONE" ? "Задача завершена" : "Создана новая задача",
        description: task.title,
        user: session.user.name || "Пользователь",
        timestamp: task.updatedAt || task.createdAt,
        project: "DeadLine",
        priority: task.priority?.toLowerCase() || "medium"
      });
    }

    // Добавляем разговоры с AI
    for (const conversation of recentConversations) {
      activities.push({
        id: `ai-${conversation.id}`,
        type: "comment_added",
        title: "Общение с Василием",
        description: conversation.query,
        user: "Василий",
        timestamp: conversation.createdAt,
        project: "AI Assistant"
      });
    }

    // Сортируем по времени
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      activities: activities.slice(0, limit),
      total: activities.length
    });

  } catch (error) {
    console.error("Error getting activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
