import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workspace, workspaceMember } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Получаем рабочие пространства пользователя
    const userWorkspaces = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        role: workspaceMember.role,
      })
      .from(workspace)
      .innerJoin(workspaceMember, eq(workspace.id, workspaceMember.workspaceId))
      .where(eq(workspaceMember.userId, session.user.id));

    return NextResponse.json(userWorkspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const workspaceId = generateId();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Создаем рабочее пространство
    const newWorkspace = {
      id: workspaceId,
      name,
      slug,
      description: description || null,
      ownerId: session.user.id,
    };

    await db.insert(workspace).values(newWorkspace);

    // Добавляем пользователя как владельца
    const memberId = generateId();
    await db.insert(workspaceMember).values({
      id: memberId,
      workspaceId,
      userId: session.user.id,
      role: "OWNER",
    });

    return NextResponse.json({
      ...newWorkspace,
      role: "OWNER",
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
