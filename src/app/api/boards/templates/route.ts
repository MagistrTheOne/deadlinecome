import { NextRequest, NextResponse } from 'next/server';
import { BoardService } from '@/lib/services/board-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

import { requireAuth } from "@/lib/auth/guards";

// GET /api/boards/templates - Получить шаблоны досок
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const session = await requireAuth(request);

    const templates = await BoardService.getBoardTemplates(type || undefined);

    LoggerService.logUserAction('board-templates-fetched', session.user.id, { 
      count: templates.length,
      type 
    });

    return ValidationService.createSuccessResponse(templates);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-templates-get' });
    return ValidationService.createErrorResponse('Failed to fetch board templates', 500);
  }
}

// POST /api/boards/templates - Создать шаблон доски
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { name, description, type, template, isPublic } = body;
    const session = await requireAuth(request);

    if (!name || !type || !template) {
      return ValidationService.createErrorResponse('Missing required fields', 400);
    }

    const newTemplate = await BoardService.createBoardTemplate({
      name,
      description,
      type,
      template,
      createdById: session.user.id,
      isPublic
    });

    LoggerService.logUserAction('board-template-created', session.user.id, {
      templateId: newTemplate.id,
      name: newTemplate.name,
      type: newTemplate.type
    });

    return ValidationService.createSuccessResponse(newTemplate);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'board-template-create' });
    return ValidationService.createErrorResponse('Failed to create board template', 500);
  }
}
