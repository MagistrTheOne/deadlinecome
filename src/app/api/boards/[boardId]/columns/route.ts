import { NextRequest, NextResponse } from 'next/server';
import { BoardService } from '@/lib/services/board-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// GET /api/boards/[boardId]/columns - Получить колонки доски
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { boardId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    const columns = await BoardService.getBoardColumns(boardId);

    LoggerService.logUserAction('board-columns-fetched', userId, { boardId });

    return ValidationService.createSuccessResponse(columns);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-columns-get' });
    return ValidationService.createErrorResponse('Failed to fetch board columns', 500);
  }
}

// POST /api/boards/[boardId]/columns - Создать новую колонку
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { boardId } = await params;
    const body = await request.json();
    const { name, status, color, isDone, isWip, wipLimit } = body;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    if (!name || !status) {
      return ValidationService.createErrorResponse('Missing required fields', 400);
    }

    // Получаем текущие колонки для определения порядка
    const existingColumns = await BoardService.getBoardColumns(boardId);
    const maxOrder = existingColumns.length > 0 
      ? Math.max(...existingColumns.map(col => col.order)) 
      : 0;

    const newColumn = await BoardService.createBoardColumn({
      boardId,
      name,
      status,
      color,
      order: maxOrder + 1,
      isDone: isDone || false,
      isWip: isWip || false,
      wipLimit: wipLimit || null
    });

    LoggerService.logUserAction('board-column-created', userId, {
      boardId,
      columnId: newColumn.id,
      name: newColumn.name
    });

    return ValidationService.createSuccessResponse(newColumn);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-column-create' });
    return ValidationService.createErrorResponse('Failed to create board column', 500);
  }
}
