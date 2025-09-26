import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { WorkspaceService } from "@/lib/api/workspaces";

import { requireAuth } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const workspaces = await WorkspaceService.getWorkspaces(session.user.id);
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const data = await request.json();
    const workspace = await WorkspaceService.createWorkspace(data, session.user.id);
    
    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}