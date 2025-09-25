import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { codeReview, aiTeamMember, qualityGate } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getWebSocketManager } from "@/lib/websocket-server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    let reviews = await db.select().from(codeReview).orderBy(desc(codeReview.createdAt));

    if (projectId) {
      reviews = reviews.filter(review => review.repositoryId === projectId);
    }

    if (status) {
      reviews = reviews.filter(review => review.status === status);
    }

    return NextResponse.json({
      success: true,
      reviews: reviews.map(review => ({
        ...review,
        issues: review.issues ? JSON.parse(review.issues) : [],
        suggestions: review.suggestions ? JSON.parse(review.suggestions) : [],
        blockingIssues: review.blockingIssues ? JSON.parse(review.blockingIssues) : [],
      })),
    });
  } catch (error) {
    console.error("Error fetching code reviews:", error);
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

    const {
      pullRequestId,
      repositoryId,
      codeContent,
      language,
      filePath,
    } = await request.json();

    if (!pullRequestId || !repositoryId || !codeContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Находим AI Code Reviewer (Владимир)
    const aiReviewer = await db
      .select()
      .from(aiTeamMember)
      .where(eq(aiTeamMember.role, "AI_CODE_REVIEWER"))
      .limit(1);

    if (!aiReviewer.length) {
      return NextResponse.json({ error: "AI Code Reviewer not found" }, { status: 404 });
    }

    // Анализируем код с помощью AI
    const analysis = await analyzeCodeWithAI(codeContent, language, filePath);

    // Создаем code review
    const newReview = await db.insert(codeReview).values({
      id: reviewId,
      pullRequestId,
      repositoryId,
      authorId: session.user.id,
      aiReviewerId: aiReviewer[0].id,
      status: "IN_PROGRESS",
      qualityScore: analysis.qualityScore,
      securityScore: analysis.securityScore,
      performanceScore: analysis.performanceScore,
      maintainabilityScore: analysis.maintainabilityScore,
      overallScore: analysis.overallScore,
      issues: JSON.stringify(analysis.issues),
      suggestions: JSON.stringify(analysis.suggestions),
      approved: analysis.overallScore >= 80,
      blockingIssues: JSON.stringify(analysis.blockingIssues),
    }).returning();

    // Проверяем Quality Gates
    const qualityGates = await db
      .select()
      .from(qualityGate)
      .where(eq(qualityGate.projectId, repositoryId));

    let shouldBlock = false;
    for (const gate of qualityGates) {
      if (gate.isActive && gate.autoBlock) {
        if (analysis.overallScore < (gate.minQualityScore || 80) ||
            analysis.securityScore < (gate.minSecurityScore || 90) ||
            analysis.performanceScore < (gate.minPerformanceScore || 70) ||
            analysis.maintainabilityScore < (gate.minMaintainabilityScore || 75)) {
          shouldBlock = true;
          break;
        }
      }
    }

    if (shouldBlock) {
      await db
        .update(codeReview)
        .set({ 
          status: "REJECTED",
          approved: false 
        })
        .where(eq(codeReview.id, reviewId));
    } else {
      await db
        .update(codeReview)
        .set({ 
          status: "APPROVED",
          approved: true 
        })
        .where(eq(codeReview.id, reviewId));
    }

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyCodeReview(repositoryId, newReview[0], shouldBlock);
    }

    return NextResponse.json({
      success: true,
      review: {
        ...newReview[0],
        issues: analysis.issues,
        suggestions: analysis.suggestions,
        blockingIssues: analysis.blockingIssues,
        approved: !shouldBlock,
        blocked: shouldBlock,
      },
    });
  } catch (error) {
    console.error("Error creating code review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId, status, approved } = await request.json();

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (approved !== undefined) updateData.approved = approved;

    const updatedReview = await db
      .update(codeReview)
      .set(updateData)
      .where(eq(codeReview.id, reviewId))
      .returning();

    if (!updatedReview.length) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyCodeReviewUpdate(updatedReview[0].repositoryId, updatedReview[0]);
    }

    return NextResponse.json({
      success: true,
      review: updatedReview[0],
    });
  } catch (error) {
    console.error("Error updating code review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// AI функция для анализа кода
async function analyzeCodeWithAI(codeContent: string, language: string, filePath: string) {
  // Симуляция AI анализа кода
  const qualityScore = Math.floor(Math.random() * 30) + 70; // 70-100
  const securityScore = Math.floor(Math.random() * 20) + 80; // 80-100
  const performanceScore = Math.floor(Math.random() * 40) + 60; // 60-100
  const maintainabilityScore = Math.floor(Math.random() * 35) + 65; // 65-100
  const overallScore = Math.floor((qualityScore + securityScore + performanceScore + maintainabilityScore) / 4);

  const issues = [
    {
      id: `issue_${Date.now()}_1`,
      type: "CODE_SMELL",
      severity: "MEDIUM",
      message: "Функция слишком длинная, рекомендуется разбить на более мелкие",
      line: Math.floor(Math.random() * 50) + 1,
      suggestion: "Разделить функцию на логические блоки",
    },
    {
      id: `issue_${Date.now()}_2`,
      type: "SECURITY",
      severity: "HIGH",
      message: "Потенциальная SQL-инъекция в запросе",
      line: Math.floor(Math.random() * 30) + 1,
      suggestion: "Использовать параметризованные запросы",
    },
  ];

  const suggestions = [
    "Добавить JSDoc комментарии для лучшей документации",
    "Рассмотреть использование TypeScript для типизации",
    "Оптимизировать алгоритм для лучшей производительности",
    "Добавить обработку ошибок для повышения надежности",
  ];

  const blockingIssues = overallScore < 80 ? [
    {
      id: `blocking_${Date.now()}`,
      type: "CRITICAL",
      message: "Критические проблемы безопасности требуют исправления",
      mustFix: true,
    }
  ] : [];

  return {
    qualityScore,
    securityScore,
    performanceScore,
    maintainabilityScore,
    overallScore,
    issues,
    suggestions,
    blockingIssues,
  };
}
