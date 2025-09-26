import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

import { requireAuth } from "@/lib/auth/guards";

// GET /api/boards/[boardId]/analytics - Получить аналитику доски
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { boardId } = await params;
    const { searchParams } = new URL(request.url);
    const session = await requireAuth(request);

    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const analytics = await AnalyticsService.getBoardAnalytics(boardId, startDate, endDate);

    LoggerService.logUserAction('board-analytics-viewed', session.user.id, { boardId });

    return ValidationService.createSuccessResponse(analytics);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-analytics-get' });
    return ValidationService.createErrorResponse('Failed to fetch board analytics', 500);
  }
}

// POST /api/boards/[boardId]/analytics/update - Обновить метрики доски
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { boardId } = await params;
    const session = await requireAuth(request);

    await AnalyticsService.updateBoardMetrics(boardId);

    LoggerService.logUserAction('board-metrics-updated', session.user.id, { boardId });

    return ValidationService.createSuccessResponse({ success: true });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-analytics-update' });
    return ValidationService.createErrorResponse('Failed to update board metrics', 500);
  }
}
