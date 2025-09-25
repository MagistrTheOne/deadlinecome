import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { issue, aiConversation } from "@/lib/db/schema";
import { OpenAIService, TaskContext } from "@/lib/ai/openai-service";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query, workspaceId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Поиск похожих задач для контекста
    let context: TaskContext[] = [];
    
    if (workspaceId) {
      // Получаем последние задачи из рабочего пространства
      const recentTasks = await db
        .select({
          id: issue.id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          assigneeId: issue.assigneeId,
          projectId: issue.projectId,
          createdAt: issue.createdAt,
        })
        .from(issue)
        .innerJoin(
          // Здесь нужно добавить join с project для получения workspaceId
          // Пока используем простой запрос
          issue,
          eq(issue.id, issue.id)
        )
        .orderBy(desc(issue.createdAt))
        .limit(5);

      context = recentTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority,
        assignee: task.assigneeId || undefined,
        projectName: task.projectId || undefined,
        createdAt: task.createdAt,
      }));
    }

    // Получаем ответ от AI
    const aiResponse = await OpenAIService.askAssistant(query, context);

    // Сохраняем разговор в историю
    await db.insert(aiConversation).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      workspaceId: workspaceId || null,
      query,
      response: aiResponse.response,
      context: JSON.stringify(context),
    });

    return NextResponse.json({
      response: aiResponse.response,
      context: context.length > 0 ? context : undefined,
    });
  } catch (error) {
    console.error("Error in AI ask endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
