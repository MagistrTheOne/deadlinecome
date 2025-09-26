import { NextRequest, NextResponse } from 'next/server';
import { timeTracker } from '@/lib/time-tracking/time-tracker';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// POST /api/time-tracking/stop - Остановить отслеживание времени
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 400);
    }

    // Останавливаем отслеживание
    const timeEntry = await timeTracker.stopTracking(userId);

    if (!timeEntry) {
      return ValidationService.createErrorResponse('No active time tracking session found', 404);
    }

    LoggerService.api.info('Time tracking stopped via API', {
      entryId: timeEntry.id,
      userId,
      duration: timeEntry.duration
    });

    return ValidationService.createSuccessResponse({
      entryId: timeEntry.id,
      duration: timeEntry.duration,
      startTime: timeEntry.startTime,
      endTime: timeEntry.endTime
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'time-tracking-stop' });
    return ValidationService.createErrorResponse('Failed to stop time tracking', 500);
  }
}
