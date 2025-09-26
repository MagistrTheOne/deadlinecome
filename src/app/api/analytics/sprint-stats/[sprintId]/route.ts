import { NextRequest, NextResponse } from 'next/server';
import { burndownChartsService } from '@/lib/analytics/burndown-charts';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

interface RouteParams {
  params: {
    sprintId: string;
  };
}

// GET /api/analytics/sprint-stats/[sprintId] - Получить статистику спринта
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { sprintId } = params;

    if (!sprintId) {
      return ValidationService.createErrorResponse('Sprint ID required', 400);
    }

    // Получаем статистику спринта
    const stats = await burndownChartsService.getSprintStats(sprintId);

    LoggerService.api.info('Sprint stats retrieved', {
      sprintId,
      progressPercentage: stats.progress.progressPercentage,
      riskLevel: stats.status.riskLevel
    });

    return ValidationService.createSuccessResponse(stats);

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'sprint-stats', sprintId: params.sprintId });
    return ValidationService.createErrorResponse('Failed to get sprint stats', 500);
  }
}

// PUT /api/analytics/sprint-stats/[sprintId] - Обновить прогресс спринта
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { sprintId } = params;
    const body = await request.json();
    const { completedStoryPoints } = body;

    if (!sprintId) {
      return ValidationService.createErrorResponse('Sprint ID required', 400);
    }

    if (typeof completedStoryPoints !== 'number') {
      return ValidationService.createErrorResponse('Completed story points must be a number', 400);
    }

    // Обновляем прогресс спринта
    await burndownChartsService.updateSprintProgress(sprintId, completedStoryPoints);

    LoggerService.api.info('Sprint progress updated', {
      sprintId,
      completedStoryPoints
    });

    return ValidationService.createSuccessResponse({ success: true });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'sprint-progress-update', sprintId: params.sprintId });
    return ValidationService.createErrorResponse('Failed to update sprint progress', 500);
  }
}
