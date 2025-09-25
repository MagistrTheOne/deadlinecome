import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bugReport, aiQaAnalysis, aiTeamMember } from "@/lib/db/schema";
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
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");

    // Выполняем запрос с фильтрацией
    const bugs = await db.select().from(bugReport).orderBy(desc(bugReport.createdAt));

    // Фильтруем результаты на клиентской стороне
    let filteredBugs = bugs;
    
    if (projectId) {
      filteredBugs = filteredBugs.filter(bug => bug.projectId === projectId);
    }
    
    if (status) {
      filteredBugs = filteredBugs.filter(bug => bug.status === status);
    }
    
    if (priority) {
      filteredBugs = filteredBugs.filter(bug => bug.priority === priority);
    }
    
    if (category) {
      filteredBugs = filteredBugs.filter(bug => bug.category === category);
    }

    return NextResponse.json({
      success: true,
      bugs: filteredBugs.map(bug => ({
        ...bug,
        screenshots: bug.screenshots ? JSON.parse(bug.screenshots) : [],
        aiAnalysis: bug.aiAnalysis ? JSON.parse(bug.aiAnalysis) : null,
        aiRecommendations: bug.aiRecommendations ? JSON.parse(bug.aiRecommendations) : [],
      })),
    });
  } catch (error) {
    console.error("Error fetching bugs:", error);
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
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      priority = "MEDIUM",
      category,
      projectId,
      screenshots = [],
      environment,
      severity,
    } = await request.json();

    if (!title || !description || !category || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bugId = `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Создаем баг-репорт
    const newBug = await db.insert(bugReport).values({
      id: bugId,
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      priority: priority as any,
      category: category as any,
      projectId,
      reporterId: session.user.id,
      screenshots: JSON.stringify(screenshots),
      environment,
      severity: severity as any,
      status: "NEW",
    }).returning();

    // Назначаем AI QA для анализа
    const aiQa = await db
      .select()
      .from(aiTeamMember)
      .where(eq(aiTeamMember.role, "AI_QA"))
      .limit(1);

    if (aiQa.length > 0) {
      // Создаем AI анализ
      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(aiQaAnalysis).values({
        id: analysisId,
        bugReportId: bugId,
        aiQaId: aiQa[0].id,
        analysisType: "BUG_ANALYSIS",
        analysis: generateAIBugAnalysis(title, description, category, severity),
        confidence: 85,
        recommendations: JSON.stringify(generateAIRecommendations(category, severity)),
        testCases: JSON.stringify(generateTestCases(title, stepsToReproduce)),
        predictedRisk: calculateRiskLevel(severity, priority) as any,
      });

      // Обновляем баг с AI анализом
      await db
        .update(bugReport)
        .set({
          aiQaId: aiQa[0].id,
          aiAnalysis: JSON.stringify({
            analysis: generateAIBugAnalysis(title, description, category, severity),
            confidence: 85,
            recommendations: generateAIRecommendations(category, severity),
            testCases: generateTestCases(title, stepsToReproduce),
            predictedRisk: calculateRiskLevel(severity, priority) as any,
          }),
          aiRecommendations: JSON.stringify(generateAIRecommendations(category, severity)),
        })
        .where(eq(bugReport.id, bugId));
    }

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyBugCreated(projectId, newBug[0]);
    }

    return NextResponse.json({
      success: true,
      bug: {
        ...newBug[0],
        screenshots: screenshots,
        aiAnalysis: aiQa.length > 0 ? {
          analysis: generateAIBugAnalysis(title, description, category, severity),
          confidence: 85,
          recommendations: generateAIRecommendations(category, severity),
          testCases: generateTestCases(title, stepsToReproduce),
          predictedRisk: calculateRiskLevel(severity, priority) as any,
        } : null,
        aiRecommendations: generateAIRecommendations(category, severity),
      },
    });
  } catch (error) {
    console.error("Error creating bug:", error);
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

    const { bugId, status, assigneeId, estimatedFixTime, actualFixTime } = await request.json();

    if (!bugId) {
      return NextResponse.json({ error: "Bug ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assigneeId) updateData.assigneeId = assigneeId;
    if (estimatedFixTime) updateData.estimatedFixTime = estimatedFixTime;
    if (actualFixTime) updateData.actualFixTime = actualFixTime;

    const updatedBug = await db
      .update(bugReport)
      .set(updateData)
      .where(eq(bugReport.id, bugId))
      .returning();

    if (!updatedBug.length) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyBugUpdate(updatedBug[0].projectId, updatedBug[0]);
    }

    return NextResponse.json({
      success: true,
      bug: updatedBug[0],
    });
  } catch (error) {
    console.error("Error updating bug:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// AI функции для анализа багов
function generateAIBugAnalysis(title: string, description: string, category: string, severity: string): string {
  const analyses = {
    FRONTEND: "Анализ фронтенд бага: Проблема связана с пользовательским интерфейсом. Рекомендую проверить совместимость браузеров и responsive дизайн.",
    BACKEND: "Анализ бэкенд бага: Проблема в серверной логике. Рекомендую проверить API endpoints и обработку ошибок.",
    DATABASE: "Анализ базы данных: Проблема с запросами или структурой данных. Рекомендую проверить индексы и оптимизацию запросов.",
    API: "Анализ API: Проблема с интеграцией или форматом данных. Рекомендую проверить валидацию и обработку запросов.",
    UI_UX: "Анализ UX: Проблема с пользовательским опытом. Рекомендую провести пользовательское тестирование.",
    PERFORMANCE: "Анализ производительности: Проблема с скоростью работы. Рекомендую проверить кэширование и оптимизацию.",
    SECURITY: "Анализ безопасности: Критическая проблема безопасности. Рекомендую немедленное исправление.",
  };

  return analyses[category as keyof typeof analyses] || "Анализ бага: Требуется дополнительное исследование для определения причин.";
}

function generateAIRecommendations(category: string, severity: string): string[] {
  const recommendations = {
    FRONTEND: [
      "Проверить совместимость с различными браузерами",
      "Добавить error boundaries для обработки ошибок",
      "Оптимизировать загрузку компонентов",
    ],
    BACKEND: [
      "Добавить валидацию входных данных",
      "Улучшить обработку исключений",
      "Оптимизировать запросы к базе данных",
    ],
    DATABASE: [
      "Проверить индексы для оптимизации запросов",
      "Добавить constraints для целостности данных",
      "Рассмотреть партиционирование больших таблиц",
    ],
    API: [
      "Добавить rate limiting",
      "Улучшить error handling",
      "Добавить API versioning",
    ],
    UI_UX: [
      "Провести пользовательское тестирование",
      "Улучшить навигацию",
      "Добавить loading states",
    ],
    PERFORMANCE: [
      "Внедрить кэширование",
      "Оптимизировать изображения",
      "Использовать lazy loading",
    ],
    SECURITY: [
      "Провести security audit",
      "Добавить input sanitization",
      "Улучшить аутентификацию",
    ],
  };

  return recommendations[category as keyof typeof recommendations] || [
    "Провести дополнительное тестирование",
    "Документировать проблему",
    "Создать план исправления",
  ];
}

function generateTestCases(title: string, stepsToReproduce: string): any[] {
  return [
    {
      id: `test_${Date.now()}_1`,
      title: `Тест: ${title}`,
      steps: stepsToReproduce ? stepsToReproduce.split('\n') : ["Воспроизвести баг"],
      expectedResult: "Баг не воспроизводится",
      priority: "HIGH",
    },
    {
      id: `test_${Date.now()}_2`,
      title: `Регрессионный тест: ${title}`,
      steps: ["Проверить связанный функционал", "Убедиться в отсутствии побочных эффектов"],
      expectedResult: "Связанный функционал работает корректно",
      priority: "MEDIUM",
    },
  ];
}

function calculateRiskLevel(severity: string, priority: string): string {
  if (severity === "BLOCKER" || priority === "CRITICAL") return "CRITICAL";
  if (severity === "CRITICAL" || priority === "HIGH") return "HIGH";
  if (severity === "MAJOR" || priority === "MEDIUM") return "MEDIUM";
  return "LOW";
}
