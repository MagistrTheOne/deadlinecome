import { NextRequest, NextResponse } from 'next/server';
import { BoardService } from '@/lib/services/board-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// GET /api/boards - Получить доски пользователя
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id');
    const workspaceId = searchParams.get('workspaceId');

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    const boards = await BoardService.getUserBoards(userId, workspaceId || undefined);

    LoggerService.logUserAction('boards-fetched', userId, { 
      count: boards.length,
      workspaceId 
    });

    return ValidationService.createSuccessResponse(boards);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'boards-get' });
    return ValidationService.createErrorResponse('Failed to fetch boards', 500);
  }
}

// POST /api/boards - Создать новую доску
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { name, description, type, workspaceId, projectId, templateId } = body;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    if (!name || !type || !workspaceId) {
      return ValidationService.createErrorResponse('Missing required fields', 400);
    }

    const newBoard = await BoardService.createBoard({
      name,
      description,
      type,
      workspaceId,
      projectId,
      createdById: userId,
      templateId
    });

    LoggerService.logUserAction('board-created', userId, {
      boardId: newBoard.id,
      name: newBoard.name,
      type: newBoard.type
    });

    return ValidationService.createSuccessResponse(newBoard);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'boards-create' });
    return ValidationService.createErrorResponse('Failed to create board', 500);
  }
}
