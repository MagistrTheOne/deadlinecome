import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { issue, aiConversation } from "@/lib/db/schema";
import { AIService, TaskContext } from "@/lib/ai/ai-service";
import { VasilyService } from "@/lib/ai/vasily-service";
import { eq, desc } from "drizzle-orm";

import { requireAuth } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await requireAuth(request);

    const { query, workspaceId, projectId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Проверяем, является ли запрос специальной командой
    if (query.startsWith('/')) {
      const vasilyResponse = await VasilyService.handleSpecialCommand(query);
      return NextResponse.json(vasilyResponse);
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

    // Получаем ответ от Василия
    const vasilyResponse = await VasilyService.chat(query, {
      session.user.id: session.user.id,
      workspaceId: workspaceId || undefined,
      projectId: projectId || undefined,
      timeOfDay: new Date().getHours(),
      userActivity: context.length > 0 ? "project_management" : "general_chat"
    });

    // Сохраняем разговор в историю
    await db.insert(aiConversation).values({
      id: crypto.randomUUID(),
      session.user.id: session.user.id,
      workspaceId: workspaceId || null,
      query,
      response: vasilyResponse.response,
      context: JSON.stringify(context),
    });

    return NextResponse.json(vasilyResponse);
  } catch (error) {
    console.error("Error in AI ask endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
