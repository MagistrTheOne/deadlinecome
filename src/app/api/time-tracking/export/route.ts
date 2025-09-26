import { NextRequest, NextResponse } from 'next/server';
import { timeTracker } from '@/lib/time-tracking/time-tracker';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// GET /api/time-tracking/export - Экспорт данных времени
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
    const format = searchParams.get('format') || 'csv';

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 400);
    }

    if (!startDate || !endDate) {
      return ValidationService.createErrorResponse('Start date and end date required', 400);
    }

    if (!['csv', 'json', 'excel'].includes(format)) {
      return ValidationService.createErrorResponse('Invalid export format', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Экспортируем данные
    const buffer = await timeTracker.exportTimeData(userId, start, end, format as any);

    const contentType = {
      csv: 'text/csv',
      json: 'application/json',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }[format];

    const filename = `time-tracking-${userId}-${startDate}-${endDate}.${format}`;

    LoggerService.api.info('Time tracking data exported', {
      userId,
      format,
      size: buffer.length,
      startDate,
      endDate
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'time-tracking-export' });
    return ValidationService.createErrorResponse('Failed to export time tracking data', 500);
  }
}
