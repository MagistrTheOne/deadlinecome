import { NextRequest, NextResponse } from 'next/server';
import { withValidation, ValidationService } from '@/lib/validation/validator';
import { schemas } from '@/lib/validation/schemas';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { cacheUtils } from '@/lib/cache/redis';

// POST /api/vasily/chat - Чат с AI ассистентом Василием
export const POST = withValidation(schemas.aiChat, async (data, request) => {
  try {
    // Применяем rate limiting для AI запросов
    const rateLimitResult = await rateLimiters.ai.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    // Проверяем кэш для похожих запросов
    const cacheKey = `ai:chat:${userId}:${Buffer.from(data.message).toString('base64').slice(0, 20)}`;
    const cachedResponse = await cacheUtils.getApiResponse('vasily-chat', {
      message: data.message,
      userId,
      workspaceId: data.workspaceId,
      projectId: data.projectId
    });

    if (cachedResponse) {
      LoggerService.logCache('GET', cacheKey, true);
      return ValidationService.createSuccessResponse(cachedResponse);
    }

    // Симулируем ответ от Василия (здесь должна быть реальная интеграция с GigaChat)
    const vasilyResponse = {
      message: `Привет! Я Василий, ваш AI ассистент. Вы написали: "${data.message}". Как я могу помочь вам с проектом?`,
      mood: 'friendly',
      suggestions: [
        'Создать новую задачу',
        'Просмотреть статистику проекта',
        'Настроить уведомления'
      ],
      actions: [
        {
          type: 'create_task',
          label: 'Создать задачу',
          data: { projectId: data.projectId }
        },
        {
          type: 'view_analytics',
          label: 'Аналитика',
          data: { workspaceId: data.workspaceId }
        }
      ],
      timestamp: new Date().toISOString(),
      context: {
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        userActivity: data.context?.userActivity || 'chat'
      }
    };

    // Кэшируем ответ на 5 минут
    await cacheUtils.cacheApiResponse('vasily-chat', {
      message: data.message,
      userId,
      workspaceId: data.workspaceId,
      projectId: data.projectId
    }, vasilyResponse, 300);

    LoggerService.logCache('SET', cacheKey, false);
    LoggerService.logAI('chat_interaction', {
      message: data.message,
      responseLength: vasilyResponse.message.length,
      suggestionsCount: vasilyResponse.suggestions.length,
      actionsCount: vasilyResponse.actions.length
    }, userId);

    return ValidationService.createSuccessResponse(vasilyResponse);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'vasily-chat' });
    return ValidationService.createErrorResponse('AI service temporarily unavailable', 503);
  }
});