import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { cacheUtils } from '@/lib/cache/redis';
import { ValidationService } from '@/lib/validation/validator';
import { createCachedResponse } from '@/lib/api/cache-utils';
import { requireAuth } from "@/lib/auth/guards";
import { getDashboardStats } from '@/db/repositories/dashboard.repo';

// GET /api/dashboard/stats - Получение статистики дашборда
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const session = await requireAuth(request);
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');

    // Проверяем кэш
    const cacheKey = `dashboard:stats:${session.user.id}:${workspaceId || 'all'}`;
    const cachedStats = await cacheUtils.getApiResponse('dashboard-stats', {
      userId: session.user.id,
      workspaceId
    });

    if (cachedStats) {
      LoggerService.logCache('GET', cacheKey, true);
      // Используем новый cached response с ETag
      return createCachedResponse(cachedStats, request, {
        maxAge: 60, // 1 minute cache
        staleWhileRevalidate: 300 // 5 minutes stale
      });
    }

    // Получаем реальные данные из репозитория
    const stats = await getDashboardStats(session.user.id, workspaceId);

    // Кэшируем на 5 минут
    await cacheUtils.cacheApiResponse('dashboard-stats', {
      userId: session.user.id,
      workspaceId
    }, stats, 300);

    LoggerService.logCache('SET', cacheKey, false);
    LoggerService.logUserAction('dashboard_view', session.user.id, { workspaceId });

    // Возвращаем с ETag и кешированием
    return createCachedResponse(stats, request, {
      maxAge: 60, // 1 minute cache
      staleWhileRevalidate: 300 // 5 minutes stale
    });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'dashboard-stats' });
    return ValidationService.createErrorResponse('Failed to fetch dashboard statistics', 500);
  }
}