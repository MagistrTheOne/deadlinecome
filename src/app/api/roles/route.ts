import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workspaceMember } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getWebSocketManager } from "@/lib/websocket-server";

// IT-роли с описаниями и правами
const IT_ROLES = {
  DEVELOPER: {
    name: "Разработчик",
    description: "Разработка и поддержка кода",
    permissions: ["CREATE_TASK", "UPDATE_TASK", "VIEW_PROJECT", "COMMENT"],
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  TEAM_LEAD: {
    name: "Тим лид",
    description: "Руководство командой разработки",
    permissions: ["CREATE_TASK", "UPDATE_TASK", "ASSIGN_TASK", "VIEW_PROJECT", "COMMENT", "MANAGE_SPRINT"],
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  },
  CTO: {
    name: "CTO",
    description: "Технический директор",
    permissions: ["ALL"],
    color: "bg-red-500/20 text-red-400 border-red-500/30"
  },
  PM: {
    name: "Product Manager",
    description: "Управление продуктом и планирование",
    permissions: ["CREATE_TASK", "UPDATE_TASK", "ASSIGN_TASK", "VIEW_PROJECT", "COMMENT", "MANAGE_SPRINT", "VIEW_ANALYTICS"],
    color: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  QA: {
    name: "QA Engineer",
    description: "Тестирование и контроль качества",
    permissions: ["CREATE_TASK", "UPDATE_TASK", "VIEW_PROJECT", "COMMENT", "TEST_TASK"],
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  },
  DEVOPS: {
    name: "DevOps",
    description: "Инфраструктура и развертывание",
    permissions: ["CREATE_TASK", "UPDATE_TASK", "VIEW_PROJECT", "COMMENT", "DEPLOY_TASK"],
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30"
  },
  DESIGNER: {
    name: "Дизайнер",
    description: "UI/UX дизайн и прототипирование",
    permissions: ["CREATE_TASK", "UPDATE_TASK", "VIEW_PROJECT", "COMMENT", "DESIGN_TASK"],
    color: "bg-pink-500/20 text-pink-400 border-pink-500/30"
  },
  ANALYST: {
    name: "Аналитик",
    description: "Анализ требований и данных",
    permissions: ["CREATE_TASK", "UPDATE_TASK", "VIEW_PROJECT", "COMMENT", "ANALYZE_DATA"],
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
  }
} as const;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    // Получаем всех участников workspace с их IT-ролями
    const members = await db
      .select({
        id: workspaceMember.id,
        userId: workspaceMember.userId,
        role: workspaceMember.role,
        itRole: workspaceMember.itRole,
        skills: workspaceMember.skills,
        experience: workspaceMember.experience,
        createdAt: workspaceMember.createdAt,
      })
      .from(workspaceMember)
      .where(eq(workspaceMember.workspaceId, workspaceId));

    // Добавляем информацию о ролях
    const membersWithRoleInfo = members.map(member => ({
      ...member,
      itRoleInfo: member.itRole ? IT_ROLES[member.itRole as keyof typeof IT_ROLES] : null,
      skillsArray: member.skills ? JSON.parse(member.skills) : [],
    }));

    return NextResponse.json({
      members: membersWithRoleInfo,
      availableRoles: IT_ROLES,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId, userId, itRole, skills, experience } = await request.json();

    if (!workspaceId || !userId) {
      return NextResponse.json({ error: "Workspace ID and User ID are required" }, { status: 400 });
    }

    // Проверяем права на изменение ролей
    const member = await db
      .select()
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, session.user.id)
        )
      )
      .limit(1);

    if (!member.length || !["OWNER", "ADMIN"].includes(member[0].role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Обновляем IT-роль пользователя
    const updatedMember = await db
      .update(workspaceMember)
      .set({
        itRole: itRole || null,
        skills: skills ? JSON.stringify(skills) : null,
        experience: experience || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId)
        )
      )
      .returning();

    if (!updatedMember.length) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const updatedMemberData = {
      ...updatedMember[0],
      itRoleInfo: itRole ? IT_ROLES[itRole as keyof typeof IT_ROLES] : null,
      skillsArray: skills || [],
    };

    // Отправляем real-time уведомление
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyRoleUpdate(workspaceId, updatedMemberData);
    }

    return NextResponse.json({
      success: true,
      member: updatedMemberData,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
