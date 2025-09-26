import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/email/notification-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// POST /api/notifications/send - Отправка уведомления
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { userId, type, title, message, data, priority = 'medium', channels = ['email', 'inApp'] } = body;

    if (!userId || !type || !title || !message) {
      return ValidationService.createErrorResponse('Missing required fields', 400);
    }

    const success = await notificationService.sendNotification({
      userId,
      type,
      title,
      message,
      data,
      priority,
      channels
    });

    if (success) {
      LoggerService.api.info('Notification sent via API', { userId, type, title });
      return ValidationService.createSuccessResponse({ success: true });
    } else {
      return ValidationService.createErrorResponse('Failed to send notification', 500);
    }

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'send-notification' });
    return ValidationService.createErrorResponse('Internal Server Error', 500);
  }
}
