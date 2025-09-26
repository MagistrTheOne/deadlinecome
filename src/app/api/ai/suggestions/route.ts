import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { issue, project, aiTaskSuggestion } from "@/lib/db/schema";
import { OpenAIService } from "@/lib/ai/openai-service";
import { eq } from "drizzle-orm";

import { requireAuth } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await requireAuth(request);

    const { workspaceId, projectId } = await request.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "WorkspaceId is required" },
        { status: 400 }
      );
    }

    // Получаем информацию о проекте
    let projectInfo = null;
    if (projectId) {
      const projectData = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);
      
      if (projectData.length > 0) {
        projectInfo = projectData[0];
      }
    }

    // Получаем существующие задачи для контекста
    const existingTasks = await db
      .select()
      .from(issue)
      .where(projectId ? eq(issue.projectId, projectId) : undefined)
      .limit(20);

    const taskContext = existingTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
      assignee: task.assigneeId || undefined,
      projectName: projectInfo?.name || "Неизвестный проект",
      createdAt: task.createdAt,
    }));

    // Генерируем предложения через ИИ
    const projectContext = projectInfo 
      ? `Проект: ${projectInfo.name}. ${projectInfo.description || ""}`
      : "Общее рабочее пространство";

    const suggestions = await OpenAIService.generateTaskSuggestions(
      projectContext,
      taskContext
    );

    // Сохраняем предложения в базу данных
    const savedSuggestions = [];
    for (const suggestion of suggestions) {
      const saved = await db.insert(aiTaskSuggestion).values({
        id: crypto.randomUUID(),
        workspaceId,
        projectId: projectId || null,
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        estimatedHours: suggestion.estimatedHours,
        reasoning: suggestion.reasoning,
        status: "PENDING",
      }).returning();
      
      savedSuggestions.push(saved[0]);
    }

    return NextResponse.json({
      suggestions: savedSuggestions,
      context: {
        projectName: projectInfo?.name || "Общее пространство",
        existingTasksCount: taskContext.length,
      },
    });
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const status = searchParams.get("status") || "PENDING";

    if (!workspaceId) {
      return NextResponse.json(
        { error: "WorkspaceId is required" },
        { status: 400 }
      );
    }

    // Получаем предложения
    const suggestions = await db
      .select()
      .from(aiTaskSuggestion)
      .where(eq(aiTaskSuggestion.workspaceId, workspaceId))
      .orderBy(aiTaskSuggestion.createdAt);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
