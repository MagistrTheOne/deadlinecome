import { NextRequest, NextResponse } from 'next/server';
import { SwimlaneService } from '@/lib/services/swimlane-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

import { requireAuth } from "@/lib/auth/guards";

// GET /api/boards/[boardId]/swimlanes - Получить swimlanes доски
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

    const swimlanes = await SwimlaneService.getBoardSwimlanes(boardId);

    LoggerService.logUserAction('board-swimlanes-fetched', session.user.id, { boardId });

    return ValidationService.createSuccessResponse(swimlanes);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-swimlanes-get' });
    return ValidationService.createErrorResponse('Failed to fetch board swimlanes', 500);
  }
}

// POST /api/boards/[boardId]/swimlanes - Создать новый swimlane
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
    const { name, type, field, color, settings } = body;
    const session = await requireAuth(request);

    if (!name || !type) {
      return ValidationService.createErrorResponse('Missing required fields', 400);
    }

    // Получаем текущие swimlanes для определения порядка
    const existingSwimlanes = await SwimlaneService.getBoardSwimlanes(boardId);
    const maxOrder = existingSwimlanes.length > 0 
      ? Math.max(...existingSwimlanes.map(s => s.order)) 
      : 0;

    const newSwimlane = await SwimlaneService.createSwimlane({
      boardId,
      name,
      type,
      field,
      color,
      order: maxOrder + 1,
      settings
    });

    LoggerService.logUserAction('board-swimlane-created', session.user.id, {
      boardId,
      swimlaneId: newSwimlane.id,
      name: newSwimlane.name,
      type: newSwimlane.type
    });

    return ValidationService.createSuccessResponse(newSwimlane);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-swimlane-create' });
    return ValidationService.createErrorResponse('Failed to create board swimlane', 500);
  }
}
