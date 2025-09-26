import { NextRequest, NextResponse } from 'next/server';
import { slackService } from '@/lib/integrations/slack-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// POST /api/integrations/slack/notify - Отправка уведомления в Slack
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { type, data, channel, botToken } = body;

    if (!type || !data || !channel) {
      return ValidationService.createErrorResponse('Missing required fields', 400);
    }

    let success = false;

    switch (type) {
      case 'task_assigned':
        success = await slackService.notifyTaskAssigned(data.task, data.assignee, channel);
        break;
        
      case 'task_completed':
        success = await slackService.notifyTaskCompleted(data.task, data.completedBy, channel);
        break;
        
      case 'deadline_reminder':
        success = await slackService.notifyDeadlineReminder(data.task, data.assignee, channel);
        break;
        
      case 'vasily_action':
        success = await slackService.notifyVasilyAction(data.action, channel);
        break;
        
      case 'daily_report':
        success = await slackService.sendDailyReport(data.report, channel);
        break;
        
      default:
        return ValidationService.createErrorResponse('Invalid notification type', 400);
    }

    if (success) {
      LoggerService.api.info('Slack notification sent', { type, channel });
      return ValidationService.createSuccessResponse({ success: true });
    } else {
      return ValidationService.createErrorResponse('Failed to send Slack notification', 500);
    }

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'slack-notify' });
    return ValidationService.createErrorResponse('Slack notification failed', 500);
  }
}
