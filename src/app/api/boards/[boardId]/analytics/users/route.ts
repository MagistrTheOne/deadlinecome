import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

import { requireAuth } from "@/lib/auth/guards";

// GET /api/boards/[boardId]/analytics/users - Получить аналитику пользователей
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
    const session = await requireAuth(request);

    const userAnalytics = await AnalyticsService.getUserAnalytics(boardId);

    LoggerService.logUserAction('board-user-analytics-viewed', session.user.id, { boardId });

    return ValidationService.createSuccessResponse(userAnalytics);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-user-analytics-get' });
    return ValidationService.createErrorResponse('Failed to fetch user analytics', 500);
  }
}
