import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { issue, project } from "@/lib/db/schema";
import { AIService } from "@/lib/ai/ai-service";
import { eq } from "drizzle-orm";

import { requireAuth } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await requireAuth(request);

    const { 
      title, 
      description, 
      projectId, 
      workspaceId,
      useAI = true 
    } = await request.json();

    if (!title || !projectId) {
      return NextResponse.json(
        { error: "Title and projectId are required" },
        { status: 400 }
      );
    }

    // Получаем информацию о проекте
    const projectInfo = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    if (projectInfo.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    let priority = "MEDIUM";
    let estimatedHours = 4;
    let reasoning = "Создано пользователем";

    // Если включено ИИ, получаем оценку приоритета и времени
    if (useAI) {
      try {
        // Получаем существующие задачи проекта для контекста
        const existingTasks = await db
          .select()
          .from(issue)
          .where(eq(issue.projectId, projectId))
          .limit(10);

        const taskContext = existingTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          status: task.status,
          priority: task.priority,
          assignee: task.assigneeId || undefined,
          projectName: projectInfo[0].name,
          createdAt: task.createdAt,
        }));

        const aiResponse = await AIService.chat([
          {
            role: "system",
            content: `Ты - AI-ассистент Василий, эксперт по оценке приоритетов и времени выполнения задач.
            Оцени задачу и верни ответ в формате JSON:
            {
              "priority": "LOWEST|LOW|MEDIUM|HIGH|HIGHEST",
              "estimatedHours": число_часов,
              "reasoning": "объяснение оценки"
            }`
          },
          {
            role: "user",
            content: `Оцени задачу:
            Название: ${title}
            Описание: ${description || "Нет описания"}
            Проект: ${projectInfo[0].name} - ${projectInfo[0].description || "Нет описания"}
            
            Контекст существующих задач: ${JSON.stringify(taskContext, null, 2)}`
          }
        ]);

        const aiEstimation = JSON.parse(aiResponse);

        priority = aiEstimation.priority;
        estimatedHours = aiEstimation.estimatedHours;
        reasoning = aiEstimation.reasoning;
      } catch (aiError) {
        console.error("AI estimation failed, using defaults:", aiError);
      }
    }

    // Генерируем ключ задачи
    const taskKey = `${projectInfo[0].key}-${Date.now()}`;

    // Создаем задачу
    const newTask = await db.insert(issue).values({
      id: crypto.randomUUID(),
      key: taskKey,
      title,
      description: description || null,
      status: "TODO",
      priority: priority as any,
      type: "TASK",
      projectId,
      reporterId: session.user.id,
      aiGenerated: useAI,
      estimatedHours,
    }).returning();

    return NextResponse.json({
      task: newTask[0],
      aiEstimation: useAI ? {
        priority,
        estimatedHours,
        reasoning,
      } : null,
    });
  } catch (error) {
    console.error("Error creating AI task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
