import { NextRequest } from 'next/server';
import { withValidation, ValidationService } from '@/lib/validation/validator';
import { schemas } from '@/lib/validation/schemas';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { aiTeamManager, AISpecialistType } from '@/lib/ai/core/ai-team-manager';

import { requireAuth } from "@/lib/auth/guards";

// POST /api/ai/team-chat - Universal chat with any AI specialist
export const POST = withValidation(schemas.aiTeamChat, async (data, request) => {
  try {
    // Apply rate limiting for AI requests
    const rateLimitResult = await rateLimiters.ai.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const session = await requireAuth(request);

    // Validate specialist exists and is available
    const specialist = aiTeamManager.getSpecialist(data.specialist as AISpecialistType);
    if (!specialist) {
      return ValidationService.createErrorResponse(`AI specialist ${data.specialist} not found`, 404);
    }

    if (!specialist.available) {
      return ValidationService.createErrorResponse(`AI specialist ${specialist.name} is currently unavailable`, 503);
    }

    // Chat with the selected specialist
    const response = await aiTeamManager.chat({
      message: data.message,
      specialist: data.specialist as AISpecialistType,
      context: {
        session.user.id,
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        timeOfDay: new Date().getHours(),
        userActivity: data.context?.userActivity || 'chat'
      }
    });

    LoggerService.logAI('team_chat_interaction', {
      specialist: data.specialist,
      messageLength: data.message.length,
      responseLength: response.message.length,
      suggestionsCount: response.suggestions?.length || 0,
      actionsCount: response.actions?.length || 0
    }, session.user.id);

    return ValidationService.createSuccessResponse(response);

  } catch (error: any) {
    LoggerService.logError(error as Error, {
      context: 'ai-team-chat',
      specialist: (request as any).body?.specialist
    });

    if (error.message === 'rate-limited') {
      return ValidationService.createErrorResponse('Too many requests. Please try again later.', 429);
    }

    if (error.message?.includes('Circuit breaker')) {
      return ValidationService.createErrorResponse('AI service temporarily unavailable. Please try again.', 503);
    }

    return ValidationService.createErrorResponse('AI service temporarily unavailable', 503);
  }
});

// GET /api/ai/team-chat/specialists - Get all available AI specialists
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const session = await requireAuth(request);

    // Get all specialists info
    const allSpecialists = aiTeamManager.getAllSpecialists();
    const availableSpecialists = aiTeamManager.getAvailableSpecialists();

    const response = {
      all: allSpecialists,
      available: availableSpecialists,
      count: {
        total: allSpecialists.length,
        available: availableSpecialists.length,
        unavailable: allSpecialists.length - availableSpecialists.length
      }
    };

    LoggerService.logUserAction('ai-specialists-viewed', session.user.id, {
      totalCount: allSpecialists.length,
      availableCount: availableSpecialists.length
    });

    return ValidationService.createSuccessResponse(response);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'ai-team-specialists' });
    return ValidationService.createErrorResponse('Failed to fetch AI specialists', 500);
  }
}
