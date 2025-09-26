import { NextRequest, NextResponse } from 'next/server';
import { withValidation, ValidationService } from '@/lib/validation/validator';
import { schemas } from '@/lib/validation/schemas';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { cacheUtils } from '@/lib/cache/redis';

// GET /api/user/profile - Получение профиля пользователя
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    // Пытаемся получить из кэша
    const cachedProfile = await cacheUtils.getUserData(userId);
    if (cachedProfile) {
      LoggerService.logCache('GET', `user:${userId}`, true);
      return ValidationService.createSuccessResponse(cachedProfile);
    }

    // Получаем данные из БД (здесь должна быть реальная логика)
    const profile = {
      id: userId,
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
    await cacheUtils.cacheUserData(userId, profile, 3600);
    LoggerService.logCache('SET', `user:${userId}`, false);

    LoggerService.logUserAction('profile_view', userId);
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

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 401);
    }

    // Обновляем профиль в БД (здесь должна быть реальная логика)
    const updatedProfile = {
      id: userId,
      ...data,
      updatedAt: new Date().toISOString()
    };

    // Инвалидируем кэш
    await cacheUtils.invalidatePattern(`user:${userId}*`);
    LoggerService.logCache('DELETE', `user:${userId}`, false);

    LoggerService.logUserAction('profile_update', userId, { fields: Object.keys(data) });
    return ValidationService.createSuccessResponse(updatedProfile, 'Profile updated successfully');

  } catch (error) {
    LoggerService.logError(error as Error, { context: 'user-profile-update' });
    return ValidationService.createErrorResponse('Internal server error', 500);
  }
});