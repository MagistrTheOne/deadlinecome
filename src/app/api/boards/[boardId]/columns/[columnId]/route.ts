import { NextRequest, NextResponse } from 'next/server';
import { BoardService } from '@/lib/services/board-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

import { requireAuth } from "@/lib/auth/guards";

// GET /api/boards/[boardId]/columns/[columnId] - Получить колонку
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { columnId } = await params;
    const session = await requireAuth(request);

    const column = await BoardService.getBoardColumnById(columnId);

    if (!column) {
      return ValidationService.createErrorResponse('Column not found', 404);
    }

    LoggerService.logUserAction('board-column-viewed', session.user.id, { columnId });

    return ValidationService.createSuccessResponse(column);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-column-get' });
    return ValidationService.createErrorResponse('Failed to fetch board column', 500);
  }
}

// PUT /api/boards/[boardId]/columns/[columnId] - Обновить колонку
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { columnId } = await params;
    const body = await request.json();
    const session = await requireAuth(request);

    const updatedColumn = await BoardService.updateBoardColumn(columnId, body);

    LoggerService.logUserAction('board-column-updated', session.user.id, {
      columnId,
      changes: body
    });

    return ValidationService.createSuccessResponse(updatedColumn);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-column-update' });
    return ValidationService.createErrorResponse('Failed to update board column', 500);
  }
}

// DELETE /api/boards/[boardId]/columns/[columnId] - Удалить колонку
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { columnId } = await params;
    const session = await requireAuth(request);

    await BoardService.deleteBoardColumn(columnId);

    LoggerService.logUserAction('board-column-deleted', session.user.id, { columnId });

    return ValidationService.createSuccessResponse({ success: true });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-column-delete' });
    return ValidationService.createErrorResponse('Failed to delete board column', 500);
  }
}
