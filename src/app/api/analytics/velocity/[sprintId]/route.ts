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

// GET /api/analytics/velocity/[sprintId] - Получить velocity chart
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

    // Получаем velocity chart
    const chart = await burndownChartsService.getVelocityChart(sprintId);

    LoggerService.api.info('Velocity chart retrieved', {
      sprintId,
      plannedVelocity: chart.plannedVelocity,
      actualVelocity: chart.actualVelocity
    });

    return ValidationService.createSuccessResponse(chart);

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'velocity-chart', sprintId: params.sprintId });
    return ValidationService.createErrorResponse('Failed to get velocity chart', 500);
  }
}
