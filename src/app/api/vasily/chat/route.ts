import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiConversation } from "@/lib/db/schema";
import { VasilyService } from "@/lib/ai/vasily-service";
import { eq, desc, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, workspaceId, projectId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Получаем контекст из последних разговоров
    const recentConversations = await db
      .select()
      .from(aiConversation)
      .where(eq(aiConversation.userId, session.user.id))
      .orderBy(desc(aiConversation.createdAt))
      .limit(5);

    // Формируем контекст для Василия
    const context = recentConversations.map(conv => ({
      query: conv.query,
      response: conv.response,
      timestamp: conv.createdAt
    }));

    // Симуляция работы Василия
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Получаем ответ от Василия
    const vasilyResponse = await VasilyService.generateResponse({
      message,
      context,
      workspaceId,
      projectId,
      userId: session.user.id
    });

    // Сохраняем разговор в БД
    const insertData: any = {
      id: `conv_${Date.now()}`,
      userId: session.user.id,
      query: message,
      response: vasilyResponse.message,
      context: JSON.stringify({
        workspaceId,
        projectId,
        previousContext: context
      })
    };

    if (workspaceId) {
      insertData.workspaceId = workspaceId;
    }

    await db.insert(aiConversation).values(insertData);

    return NextResponse.json({
      message: vasilyResponse.message,
      suggestions: vasilyResponse.suggestions || [],
      actions: vasilyResponse.actions || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in Vasily chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const workspaceId = searchParams.get("workspaceId");

    // Получаем историю разговоров
    const conversations = await db
      .select()
      .from(aiConversation)
      .where(
        workspaceId 
          ? and(eq(aiConversation.userId, session.user.id), eq(aiConversation.workspaceId, workspaceId))
          : eq(aiConversation.userId, session.user.id)
      )
      .orderBy(desc(aiConversation.createdAt))
      .limit(limit);

    return NextResponse.json({
      conversations: conversations.map(conv => ({
        id: conv.id,
        query: conv.query,
        response: conv.response,
        timestamp: conv.createdAt,
        workspaceId: conv.workspaceId
      }))
    });

  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
