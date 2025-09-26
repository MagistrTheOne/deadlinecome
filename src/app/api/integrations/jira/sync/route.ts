import { NextRequest, NextResponse } from 'next/server';
import { jiraService } from '@/lib/integrations/jira-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// POST /api/integrations/jira/sync - Синхронизация с Jira
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { projectKey, deadLineProjectId } = body;

    if (!projectKey || !deadLineProjectId) {
      return ValidationService.createErrorResponse('Missing required fields', 400);
    }

    // Синхронизируем с DeadLine
    const result = await jiraService.syncWithDeadLine(projectKey, deadLineProjectId);

    LoggerService.logUserAction('jira-sync', 'system', {
      projectKey,
      deadLineProjectId,
      synced: result.synced,
      errors: result.errors
    });

    return ValidationService.createSuccessResponse({
      success: true,
      synced: result.synced,
      errors: result.errors,
      projectKey
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'jira-sync' });
    return ValidationService.createErrorResponse('Jira sync failed', 500);
  }
}
