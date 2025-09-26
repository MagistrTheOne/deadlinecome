import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectStatus, vasilyAction, issue, workspaceMember } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { getWebSocketManager } from "@/lib/websocket-server";

import { requireAuth } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Получаем текущий статус проекта
    const status = await db
      .select()
      .from(projectStatus)
      .where(eq(projectStatus.projectId, projectId))
      .orderBy(desc(projectStatus.updatedAt))
      .limit(1);

    // Получаем последние действия Василия
    const actions = await db
      .select()
      .from(vasilyAction)
      .where(eq(vasilyAction.projectId, projectId))
      .orderBy(desc(vasilyAction.createdAt))
      .limit(10);

    return NextResponse.json({
      status: status[0] || null,
      recentActions: actions,
    });
  } catch (error) {
    console.error("Error fetching project status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const { projectId, action } = await request.json();

    if (!projectId || !action) {
      return NextResponse.json({ error: "Project ID and action are required" }, { status: 400 });
    }

    // Анализируем проект и обновляем статус
    const analysis = await analyzeProjectStatus(projectId);
    
    // Создаем или обновляем статус проекта
    const existingStatus = await db
      .select()
      .from(projectStatus)
      .where(eq(projectStatus.projectId, projectId))
      .limit(1);

    let statusRecord;
    if (existingStatus.length > 0) {
      statusRecord = await db
        .update(projectStatus)
        .set({
          status: analysis.status,
          healthScore: analysis.healthScore,
          progress: analysis.progress,
          aiAnalysis: JSON.stringify(analysis.analysis),
          recommendations: JSON.stringify(analysis.recommendations),
          lastAnalyzed: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(projectStatus.projectId, projectId))
        .returning();
    } else {
      statusRecord = await db
        .insert(projectStatus)
        .values({
          id: crypto.randomUUID(),
          projectId,
          status: analysis.status,
          healthScore: analysis.healthScore,
          progress: analysis.progress,
          aiAnalysis: JSON.stringify(analysis.analysis),
          recommendations: JSON.stringify(analysis.recommendations),
          lastAnalyzed: new Date(),
        })
        .returning();
    }

    // Логируем действие Василия
    const vasilyActionRecord = await db.insert(vasilyAction).values({
      id: crypto.randomUUID(),
      projectId,
      actionType: "STATUS_UPDATE",
      description: `Василий обновил статус проекта: ${analysis.status}`,
      metadata: JSON.stringify(analysis),
    }).returning();

    // Отправляем real-time уведомления
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyProjectStatusUpdate(projectId, statusRecord[0]);
      wsManager.notifyVasilyAction(projectId, vasilyActionRecord[0]);
    }

    return NextResponse.json({
      success: true,
      status: statusRecord[0],
      analysis,
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Функция анализа статуса проекта
async function analyzeProjectStatus(projectId: string) {
  // Получаем статистику по задачам
  const tasksStats = await db
    .select({
      status: issue.status,
      count: count(),
    })
    .from(issue)
    .where(eq(issue.projectId, projectId))
    .groupBy(issue.status);

  // Получаем участников проекта
  const members = await db
    .select()
    .from(workspaceMember)
    .where(eq(workspaceMember.workspaceId, projectId)); // Нужно будет исправить на правильный workspaceId

  // Анализируем статус
  const totalTasks = tasksStats.reduce((sum, stat) => sum + stat.count, 0);
  const completedTasks = tasksStats.find(stat => stat.status === "DONE")?.count || 0;
  const inProgressTasks = tasksStats.find(stat => stat.status === "IN_PROGRESS")?.count || 0;
  const todoTasks = tasksStats.find(stat => stat.status === "TODO")?.count || 0;

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Определяем статус проекта
  let status: "ON_TRACK" | "AT_RISK" | "BEHIND" | "BLOCKED" | "COMPLETED";
  let healthScore: number;

  if (progress >= 90) {
    status = "COMPLETED";
    healthScore = 100;
  } else if (progress >= 70) {
    status = "ON_TRACK";
    healthScore = 85;
  } else if (progress >= 50) {
    status = "AT_RISK";
    healthScore = 65;
  } else if (progress >= 25) {
    status = "BEHIND";
    healthScore = 45;
  } else {
    status = "BLOCKED";
    healthScore = 25;
  }

  // Генерируем рекомендации
  const recommendations = [];
  
  if (status === "AT_RISK") {
    recommendations.push("Увеличить количество участников команды");
    recommendations.push("Пересмотреть приоритеты задач");
  } else if (status === "BEHIND") {
    recommendations.push("Критический анализ блокеров");
    recommendations.push("Перераспределение ресурсов");
  } else if (status === "BLOCKED") {
    recommendations.push("Немедленное вмешательство руководства");
    recommendations.push("Пересмотр технических требований");
  }

  return {
    status,
    healthScore,
    progress,
    analysis: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      teamSize: members.length,
      lastAnalyzed: new Date().toISOString(),
    },
    recommendations,
  };
}
