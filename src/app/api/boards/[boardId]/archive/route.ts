import { NextRequest, NextResponse } from 'next/server';
import { BoardService } from '@/lib/services/board-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

import { requireAuth } from "@/lib/auth/guards";

// POST /api/boards/[boardId]/archive - Архивировать доску
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
    const session = await requireAuth(request);

    const archivedBoard = await BoardService.archiveBoard(boardId, session.user.id);

    LoggerService.logUserAction('board-archived', session.user.id, { boardId });

    return ValidationService.createSuccessResponse(archivedBoard);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-archive' });
    return ValidationService.createErrorResponse('Failed to archive board', 500);
  }
}

// POST /api/boards/[boardId]/restore - Восстановить доску из архива
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
    const session = await requireAuth(request);

    const restoredBoard = await BoardService.restoreBoard(boardId, session.user.id);

    LoggerService.logUserAction('board-restored', session.user.id, { boardId });

    return ValidationService.createSuccessResponse(restoredBoard);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-restore' });
    return ValidationService.createErrorResponse('Failed to restore board', 500);
  }
}
