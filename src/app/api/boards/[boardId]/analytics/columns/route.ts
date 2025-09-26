import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// GET /api/boards/[boardId]/analytics/columns - Получить аналитику колонок
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
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    const columnAnalytics = await AnalyticsService.getColumnAnalytics(boardId);

    LoggerService.logUserAction('board-column-analytics-viewed', userId, { boardId });

    return ValidationService.createSuccessResponse(columnAnalytics);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-column-analytics-get' });
    return ValidationService.createErrorResponse('Failed to fetch column analytics', 500);
  }
}
