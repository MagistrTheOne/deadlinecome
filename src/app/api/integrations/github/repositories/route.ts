import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/integrations/github-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// GET /api/integrations/github/repositories - Получение репозиториев
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '30');

    if (!accessToken) {
      return ValidationService.createErrorResponse('Access token required', 400);
    }

    // Получаем репозитории
    const repositories = await githubService.getUserRepositories(accessToken, page, perPage);

    LoggerService.api.info('GitHub repositories retrieved', {
      count: repositories.length,
      page,
      perPage
    });

    return ValidationService.createSuccessResponse({
      repositories: repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        private: repo.private,
        htmlUrl: repo.htmlUrl,
        cloneUrl: repo.cloneUrl,
        defaultBranch: repo.defaultBranch,
        language: repo.language,
        stars: repo.stargazersCount,
        forks: repo.forksCount,
        watchers: repo.watchersCount,
        createdAt: repo.createdAt,
        updatedAt: repo.updatedAt,
        pushedAt: repo.pushedAt
      })),
      pagination: {
        page,
        perPage,
        hasMore: repositories.length === perPage
      }
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'github-repositories' });
    return ValidationService.createErrorResponse('Failed to get GitHub repositories', 500);
  }
}
