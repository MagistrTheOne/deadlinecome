import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

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
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    const userAnalytics = await AnalyticsService.getUserAnalytics(boardId);

    LoggerService.logUserAction('board-user-analytics-viewed', userId, { boardId });

    return ValidationService.createSuccessResponse(userAnalytics);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-user-analytics-get' });
    return ValidationService.createErrorResponse('Failed to fetch user analytics', 500);
  }
}
