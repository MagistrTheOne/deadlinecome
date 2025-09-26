import { NextRequest } from 'next/server';
import { BoardService } from '@/lib/services/board-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';
import { requireAuth } from '@/lib/auth/guards';
import {
  parsePagination,
  createPaginatedResponse,
  createCachedResponse,
  handleIdempotentPost
} from '@/lib/api/cache-utils';

// GET /api/boards - Получить доски пользователя с пагинацией и кешированием
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    // Парсим параметры пагинации
    const { page, limit, offset } = parsePagination(request, { maxLimit: 50 });

    // Получаем все доски пользователя (для подсчета total)
    const allBoards = await BoardService.getUserBoards(session.user.id, workspaceId || undefined);
    const total = allBoards.length;

    // Применяем пагинацию
    const paginatedBoards = allBoards.slice(offset, offset + limit);

    const result = createPaginatedResponse(paginatedBoards, total, { page, limit });

    LoggerService.logUserAction('boards-fetched', session.user.id, {
      count: paginatedBoards.length,
      total,
      page,
      limit,
      workspaceId
    });

    // Возвращаем с ETag и кешированием
    return createCachedResponse(result, request, {
      maxAge: 120, // 2 minutes cache
      staleWhileRevalidate: 600 // 10 minutes stale
    });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'boards-get' });
    return ValidationService.createErrorResponse('Failed to fetch boards', 500);
  }
}

// POST /api/boards - Создать новую доску с идемпотентностью
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const session = await requireAuth(request);

    // Используем идемпотентность для создания доски
    return await handleIdempotentPost(request, async () => {
      const body = await request.json();
      const { name, description, type, workspaceId, projectId, templateId } = body;

      if (!name || !type || !workspaceId) {
        throw new Error('Missing required fields');
      }

      const newBoard = await BoardService.createBoard({
        name,
        description,
        type,
        workspaceId,
        projectId,
        createdById: session.user.id,
        templateId
      });

      LoggerService.logUserAction('board-created', session.user.id, {
        boardId: newBoard.id,
        name: newBoard.name,
        type: newBoard.type
      });

      return newBoard;
    });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'boards-create' });
    return ValidationService.createErrorResponse('Failed to create board', 500);
  }
}
