import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/integrations/github-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// POST /api/integrations/github/sync - Синхронизация с GitHub
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { accessToken, owner, repo, projectId } = body;

    if (!accessToken || !owner || !repo || !projectId) {
      return ValidationService.createErrorResponse('Missing required fields', 400);
    }

    // Синхронизируем issues с DeadLine задачами
    const result = await githubService.syncIssuesWithDeadLine(accessToken, owner, repo, projectId);

    LoggerService.api.info('GitHub sync completed', {
      projectId,
      repository: `${owner}/${repo}`,
      synced: result.synced,
      errors: result.errors
    });

    return ValidationService.createSuccessResponse({
      success: true,
      synced: result.synced,
      errors: result.errors,
      repository: `${owner}/${repo}`
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'github-sync' });
    return ValidationService.createErrorResponse('GitHub sync failed', 500);
  }
}
