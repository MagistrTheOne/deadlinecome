import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { issue, project } from "@/lib/db/schema";
import { AIService } from "@/lib/ai/ai-service";
import { eq, gte } from "drizzle-orm";

import { requireAuth } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await requireAuth(request);

    const { projectId, timeRange = "month" } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "ProjectId is required" },
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

    // Определяем временной диапазон
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Получаем задачи за указанный период
    const tasks = await db
      .select()
      .from(issue)
      .where(
        eq(issue.projectId, projectId)
        // Добавить фильтр по дате, если нужно
      );

    const taskContext = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
      assignee: task.assigneeId || undefined,
      projectName: projectInfo[0].name,
      createdAt: task.createdAt,
    }));

    // Генерируем отчёт через ИИ
    const report = await AIService.generateProjectReport({
      projectName: projectInfo[0].name,
      projectDescription: projectInfo[0].description,
      tasks: taskContext,
      timeRange: timeRange === "week" ? "последнюю неделю" : 
                timeRange === "month" ? "последний месяц" : 
                timeRange === "quarter" ? "последний квартал" : "последний месяц"
    });

    // Дополнительная статистика
    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === "DONE").length,
      inProgressTasks: tasks.filter(t => t.status === "IN_PROGRESS").length,
      todoTasks: tasks.filter(t => t.status === "TODO").length,
      highPriorityTasks: tasks.filter(t => t.priority === "HIGH" || t.priority === "HIGHEST").length,
      aiGeneratedTasks: tasks.filter(t => t.aiGenerated).length,
      averageEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0) / tasks.length || 0,
    };

    return NextResponse.json({
      report,
      stats,
      project: projectInfo[0],
      timeRange,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating AI report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
