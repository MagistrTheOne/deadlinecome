import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { project, workspaceMember } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    // Проверяем, что пользователь имеет доступ к рабочему пространству
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

    if (!member[0]) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Получаем проекты рабочего пространства
    const projects = await db
      .select()
      .from(project)
      .where(eq(project.workspaceId, workspaceId));

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    const body = await request.json();
    const { name, key, description, workspaceId, leadId } = body;

    if (!name || !key || !workspaceId) {
      return NextResponse.json(
        { error: "Name, key, and workspaceId are required" },
        { status: 400 }
      );
    }

    // Проверяем доступ к рабочему пространству
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

    if (!member[0]) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const projectId = generateId();

    const newProject = {
      id: projectId,
      key: key.toUpperCase(),
      name,
      description: description || null,
      workspaceId,
      leadId: leadId || session.user.id,
    };

    await db.insert(project).values(newProject);

    return NextResponse.json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
