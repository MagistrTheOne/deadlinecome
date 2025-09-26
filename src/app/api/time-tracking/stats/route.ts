import { NextRequest, NextResponse } from 'next/server';
import { timeTracker } from '@/lib/time-tracking/time-tracker';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// GET /api/time-tracking/stats - Получить статистику времени
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 400);
    }

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // Получаем статистику
    const stats = await timeTracker.getTimeTrackingStats(userId, start, end);

    LoggerService.api.info('Time tracking stats retrieved', {
      userId,
      totalTime: stats.totalTime,
      billableTime: stats.billableTime
    });

    return ValidationService.createSuccessResponse(stats);

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'time-tracking-stats' });
    return ValidationService.createErrorResponse('Failed to get time tracking stats', 500);
  }
}
