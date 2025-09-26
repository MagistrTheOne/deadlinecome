import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { aiAnalytics } from "@/lib/db/schema";
import { getWebSocketManager } from "@/lib/websocket-server";
import {
  parsePagination,
  createPaginatedResponse,
  createCachedResponse,
  handleIdempotentPost
} from "@/lib/api/cache-utils";
import {
  getAIAnalyticsExpert,
  createAnalyticsRecord,
  generateAnalytics
} from "@/db/repositories/analytics.repo";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    // Используем идемпотентность для создания аналитики
    return await handleIdempotentPost(request, async () => {
      const {
        projectId,
        analyticsType,
        timeRange,
        metrics,
      } = await request.json();

      if (!projectId || !analyticsType) {
        throw new Error("Missing required fields");
      }

      // Находим AI Analytics эксперта
      const aiAnalyst = await getAIAnalyticsExpert();
      if (!aiAnalyst) {
        throw new Error("AI Analytics Expert not found");
      }

      // Генерируем аналитику на основе реальных данных
      const analytics = await generateAnalytics(analyticsType, projectId);

      // Сохраняем в базу данных
      const newAnalytics = await createAnalyticsRecord(
        projectId,
        analyticsType,
        analytics,
        aiAnalyst.id
      );

      // Отправляем уведомление через WebSocket
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.broadcast({
          type: 'analytics-update',
          data: {
            projectId,
            analytics: newAnalytics[0]
          },
          timestamp: Date.now()
        });
      }

      return {
        success: true,
        analytics: newAnalytics[0],
      };
    });

  } catch (error) {
    console.error("Error performing analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const analyticsType = searchParams.get("analyticsType");

    // Парсим параметры пагинации
    const { page, limit, offset } = parsePagination(request, { maxLimit: 20 });

    // Получаем все записи для подсчета total (простая реализация)
    // В продакшене можно оптимизировать с SQL COUNT
    let allAnalytics = await db.select().from(aiAnalytics);

    if (projectId) {
      allAnalytics = allAnalytics.filter(a => a.projectId === projectId);
    }

    if (analyticsType) {
      allAnalytics = allAnalytics.filter(a => a.analyticsType === analyticsType);
    }

    const total = allAnalytics.length;

    // Применяем пагинацию
    const paginatedAnalytics = allAnalytics.slice(offset, offset + limit);

    const result = createPaginatedResponse(
      paginatedAnalytics.map(a => ({
        ...a,
        data: a.data ? JSON.parse(a.data) : {},
        insights: a.insights ? JSON.parse(a.insights) : [],
        recommendations: a.recommendations ? JSON.parse(a.recommendations) : [],
      })),
      total,
      { page, limit }
    );

    // Возвращаем с ETag и кешированием
    return createCachedResponse(result, request, {
      maxAge: 180, // 3 minutes cache for analytics
      staleWhileRevalidate: 900 // 15 minutes stale
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

