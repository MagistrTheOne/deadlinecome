import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { ProjectService } from "@/lib/api/projects";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    const projects = await ProjectService.getProjects(workspaceId, session.user.id);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const data = await request.json();
    const project = await ProjectService.createProject(data, session.user.id);
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}