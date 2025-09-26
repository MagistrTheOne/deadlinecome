import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { issue, workspaceMember, vasilyAction } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getWebSocketManager } from "@/lib/websocket-server";

import { requireAuth } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const { projectId, taskId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Получаем неназначенные задачи
    const unassignedTasks = await db
      .select()
      .from(issue)
      .where(
        and(
          eq(issue.projectId, projectId),
          isNull(issue.assigneeId)
        )
      );

    // Получаем участников команды с их ролями и навыками
    const teamMembers = await db
      .select()
      .from(workspaceMember)
      .where(eq(workspaceMember.workspaceId, projectId)); // Нужно будет исправить на правильный workspaceId

    const assignments = [];

    for (const task of unassignedTasks) {
      const bestAssignee = findBestAssignee(task, teamMembers);
      
      if (bestAssignee) {
        // Назначаем задачу
        await db
          .update(issue)
          .set({
            assigneeId: bestAssignee.session.user.id,
            updatedAt: new Date(),
          })
          .where(eq(issue.id, task.id));

        // Логируем действие Василия
        const action = await db.insert(vasilyAction).values({
          id: crypto.randomUUID(),
          projectId,
          actionType: "TASK_ASSIGNED",
          description: `Василий назначил задачу "${task.title}" на ${bestAssignee.itRole}`,
          targetUserId: bestAssignee.session.user.id,
          metadata: JSON.stringify({
            taskId: task.id,
            taskTitle: task.title,
            assigneeRole: bestAssignee.itRole,
            reasoning: bestAssignee.reasoning,
          }),
        }).returning();

        // Отправляем real-time уведомления
        const wsManager = getWebSocketManager();
        if (wsManager) {
          wsManager.notifyVasilyAction(projectId, action[0]);
          wsManager.notifyTaskUpdate(projectId, {
            ...task,
            assigneeId: bestAssignee.session.user.id,
            assigneeName: bestAssignee.itRole,
          });
        }

        assignments.push({
          taskId: task.id,
          taskTitle: task.title,
          assigneeId: bestAssignee.session.user.id,
          assigneeRole: bestAssignee.itRole,
          reasoning: bestAssignee.reasoning,
        });
      }
    }

    return NextResponse.json({
      success: true,
      assignments,
      message: `Василий назначил ${assignments.length} задач`,
    });
  } catch (error) {
    console.error("Error auto-assigning tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Функция поиска лучшего исполнителя для задачи
function findBestAssignee(task: any, teamMembers: any[]) {
  const taskType = task.type;
  const priority = task.priority;
  
  // Матрица соответствия типов задач и IT-ролей
  const roleMapping = {
    "BUG": ["QA", "DEVELOPER"],
    "TASK": ["DEVELOPER", "TEAM_LEAD"],
    "STORY": ["DEVELOPER", "PM"],
    "EPIC": ["PM", "CTO", "TEAM_LEAD"],
  };

  const suitableRoles = roleMapping[taskType as keyof typeof roleMapping] || ["DEVELOPER"];
  
  // Фильтруем участников по подходящим ролям
  const suitableMembers = teamMembers.filter(member => 
    member.itRole && suitableRoles.includes(member.itRole)
  );

  if (suitableMembers.length === 0) {
    return null;
  }

  // Сортируем по опыту и загрузке
  const scoredMembers = suitableMembers.map(member => {
    let score = 0;
    
    // Базовый счет по опыту
    score += (member.experience || 0) * 10;
    
    // Бонус за соответствие роли
    if (member.itRole === suitableRoles[0]) {
      score += 50;
    } else if (member.itRole === suitableRoles[1]) {
      score += 30;
    }
    
    // Бонус за высокий приоритет задачи
    if (priority === "HIGH" || priority === "HIGHEST") {
      if (member.itRole === "TEAM_LEAD" || member.itRole === "CTO") {
        score += 20;
      }
    }

    return {
      ...member,
      score,
      reasoning: `Назначен как ${member.itRole} с опытом ${member.experience || 0} лет`,
    };
  });

  // Возвращаем лучшего кандидата
  return scoredMembers.sort((a, b) => b.score - a.score)[0];
}
