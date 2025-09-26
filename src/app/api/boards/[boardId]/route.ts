import { NextRequest, NextResponse } from 'next/server';
import { BoardService } from '@/lib/services/board-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

import { requireAuth } from "@/lib/auth/guards";

// GET /api/boards/[boardId] - Получить доску по ID
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
    const session = await requireAuth(request);

    const board = await BoardService.getBoardById(boardId);
    
    if (!board) {
      return ValidationService.createErrorResponse('Board not found', 404);
    }

    // Получаем колонки доски
    const columns = await BoardService.getBoardColumns(boardId);
    
    // Получаем статистику доски
    const stats = await BoardService.getBoardStats(boardId);

    LoggerService.logUserAction('board-viewed', session.user.id, { boardId });

    return ValidationService.createSuccessResponse({
      ...board,
      columns,
      stats
    });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-get' });
    return ValidationService.createErrorResponse('Failed to fetch board', 500);
  }
}

// PUT /api/boards/[boardId] - Обновить доску
export async function PUT(
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
    const session = await requireAuth(request);

    const updatedBoard = await BoardService.updateBoard(boardId, body, session.user.id);

    LoggerService.logUserAction('board-updated', session.user.id, {
      boardId,
      changes: body
    });

    return ValidationService.createSuccessResponse(updatedBoard);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-update' });
    return ValidationService.createErrorResponse('Failed to update board', 500);
  }
}

// DELETE /api/boards/[boardId] - Удалить доску
export async function DELETE(
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
    const session = await requireAuth(request);

    await BoardService.deleteBoard(boardId, session.user.id);

    LoggerService.logUserAction('board-deleted', session.user.id, { boardId });

    return ValidationService.createSuccessResponse({ success: true });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-delete' });
    return ValidationService.createErrorResponse('Failed to delete board', 500);
  }
}
