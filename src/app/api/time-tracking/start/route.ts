import { NextRequest, NextResponse } from 'next/server';
import { timeTracker } from '@/lib/time-tracking/time-tracker';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// POST /api/time-tracking/start - Начать отслеживание времени
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { userId, taskId, projectId, description, category, tags } = body;

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 400);
    }

    // Начинаем отслеживание
    const session = await timeTracker.startTracking(
      userId,
      taskId,
      projectId,
      description,
      category,
      tags
    );

    LoggerService.api.info('Time tracking started via API', {
      sessionId: session.id,
      userId,
      taskId,
      projectId
    });

    return ValidationService.createSuccessResponse({
      sessionId: session.id,
      startTime: session.startTime,
      isActive: session.isActive
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'time-tracking-start' });
    return ValidationService.createErrorResponse('Failed to start time tracking', 500);
  }
}
