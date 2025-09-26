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

// GET /api/analytics/cumulative-flow/[sprintId] - Получить cumulative flow chart
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

    // Получаем cumulative flow chart
    const chart = await burndownChartsService.getCumulativeFlowChart(sprintId);

    LoggerService.api.info('Cumulative flow chart retrieved', {
      sprintId,
      totalDays: chart.dates.length
    });

    return ValidationService.createSuccessResponse(chart);

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'cumulative-flow-chart', sprintId: params.sprintId });
    return ValidationService.createErrorResponse('Failed to get cumulative flow chart', 500);
  }
}
