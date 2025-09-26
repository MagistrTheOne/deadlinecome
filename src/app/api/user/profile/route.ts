import { NextRequest, NextResponse } from 'next/server';
import { withValidation, ValidationService } from '@/lib/validation/validator';
import { schemas } from '@/lib/validation/schemas';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { cacheUtils } from '@/lib/cache/redis';

import { requireAuth } from "@/lib/auth/guards";

// GET /api/user/profile - Получение профиля пользователя
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const session = await requireAuth(request);

    // Пытаемся получить из кэша
    const cachedProfile = await cacheUtils.getUserData(session.user.id);
    if (cachedProfile) {
      LoggerService.logCache('GET', `user:${session.user.id}`, true);
      return ValidationService.createSuccessResponse(cachedProfile);
    }

    // Получаем данные из БД (здесь должна быть реальная логика)
    const profile = {
      id: session.user.id,
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      bio: 'Software developer',
      location: 'New York',
      website: 'https://johndoe.com',
      timezone: 'UTC',
      language: 'en',
      theme: 'DARK',
      status: 'ONLINE',
      statusMessage: 'Available',
      lastActive: new Date().toISOString()
    };

    // Кэшируем на 1 час
    await cacheUtils.cacheUserData(session.user.id, profile, 3600);
    LoggerService.logCache('SET', `user:${session.user.id}`, false);

    LoggerService.logUserAction('profile_view', session.user.id);
    return ValidationService.createSuccessResponse(profile);

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'user-profile-get' });
    return ValidationService.createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/user/profile - Обновление профиля пользователя
export const PUT = withValidation(schemas.userUpdate, async (data, request) => {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const session = await requireAuth(request);

    // Обновляем профиль в БД (здесь должна быть реальная логика)
    const updatedProfile = {
      id: session.user.id,
      ...data,
      updatedAt: new Date().toISOString()
    };

    // Инвалидируем кэш
    await cacheUtils.invalidatePattern(`user:${session.user.id}*`);
    LoggerService.logCache('DELETE', `user:${session.user.id}`, false);

    LoggerService.logUserAction('profile_update', session.user.id, { fields: Object.keys(data) });
    return ValidationService.createSuccessResponse(updatedProfile, 'Profile updated successfully');

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'user-profile-update' });
    return ValidationService.createErrorResponse('Internal server error', 500);
  }
});