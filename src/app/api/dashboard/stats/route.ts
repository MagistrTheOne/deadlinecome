import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, project, issue, workspace } from "@/lib/db/schema";
import { eq, count, and, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Получаем статистику пользователя
    const userStats = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userStats.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Получаем количество рабочих пространств
    const workspacesCount = await db
      .select({ count: count() })
      .from(workspace)
      .where(eq(workspace.ownerId, userId));

    // Получаем количество проектов
    const projectsCount = await db
      .select({ count: count() })
      .from(project)
      .where(eq(project.leadId, userId));

    // Получаем количество задач (issues)
    const tasksCount = await db
      .select({ count: count() })
      .from(issue)
      .where(eq(issue.assigneeId, userId));

    // Получаем количество выполненных задач за последние 30 дней
    const completedTasksCount = await db
      .select({ count: count() })
      .from(issue)
      .where(
        and(
          eq(issue.assigneeId, userId),
          eq(issue.status, 'DONE'),
          gte(issue.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        )
      );

    // Получаем текущие задачи
    const currentTasks = await db
      .select()
      .from(issue)
      .where(eq(issue.assigneeId, userId))
      .orderBy(issue.createdAt)
      .limit(5);

    return NextResponse.json({
      user: userStats[0],
      stats: {
        workspaces: workspacesCount[0]?.count || 0,
        projects: projectsCount[0]?.count || 0,
        tasks: tasksCount[0]?.count || 0,
        completedTasks: completedTasksCount[0]?.count || 0,
        productivity: Math.min(100, Math.round((completedTasksCount[0]?.count || 0) / Math.max(1, tasksCount[0]?.count || 1) * 100)),
        streak: 12, // TODO: Calculate from actual data
        rating: 4.9 // TODO: Calculate from actual data
      },
      currentTasks: currentTasks.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        project: issue.projectId
      }))
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
