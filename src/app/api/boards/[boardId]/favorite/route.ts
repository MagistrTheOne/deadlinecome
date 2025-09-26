import { NextRequest, NextResponse } from 'next/server';
import { BoardService } from '@/lib/services/board-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

import { requireAuth } from "@/lib/auth/guards";

// POST /api/boards/[boardId]/favorite - Добавить доску в избранное
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

    await BoardService.addToFavorites(boardId, session.user.id);

    LoggerService.logUserAction('board-favorited', session.user.id, { boardId });

    return ValidationService.createSuccessResponse({ success: true });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-favorite' });
    return ValidationService.createErrorResponse('Failed to add board to favorites', 500);
  }
}

// DELETE /api/boards/[boardId]/favorite - Удалить доску из избранного
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

    await BoardService.removeFromFavorites(boardId, session.user.id);

    LoggerService.logUserAction('board-unfavorited', session.user.id, { boardId });

    return ValidationService.createSuccessResponse({ success: true });

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-unfavorite' });
    return ValidationService.createErrorResponse('Failed to remove board from favorites', 500);
  }
}
