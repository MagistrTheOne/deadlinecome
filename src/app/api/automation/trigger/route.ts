import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/automation/workflow-engine';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// POST /api/automation/trigger - Запустить workflow
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { eventType, entityType, entityId, data } = body;

    if (!eventType || !entityType || !entityId) {
      return ValidationService.createErrorResponse('Missing required fields', 400);
    }

    // Обрабатываем событие
    await workflowEngine.processEvent(eventType, entityType, entityId, data);

    LoggerService.api.info('Workflow triggered via API', {
      eventType,
      entityType,
      entityId
    });

    return ValidationService.createSuccessResponse({ success: true });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'workflow-trigger' });
    return ValidationService.createErrorResponse('Failed to trigger workflow', 500);
  }
}
