import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/integrations/github-service';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// GET /api/integrations/github/auth - Авторизация GitHub
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return ValidationService.createErrorResponse(`GitHub authorization error: ${error}`, 400);
    }

    if (!code) {
      return ValidationService.createErrorResponse('Authorization code required', 400);
    }

    // Получаем access token
    const accessToken = await githubService.getAccessToken(code);
    
    // Получаем информацию о пользователе
    const userInfo = await githubService.getUserInfo(accessToken);

    LoggerService.api.info('GitHub authorization successful', {
      userId: userInfo.id,
      login: userInfo.login
    });

    return ValidationService.createSuccessResponse({
      accessToken,
      userInfo: {
        id: userInfo.id,
        login: userInfo.login,
        name: userInfo.name,
        email: userInfo.email,
        avatarUrl: userInfo.avatar_url,
        htmlUrl: userInfo.html_url
      }
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'github-auth' });
    return ValidationService.createErrorResponse('GitHub authorization failed', 500);
  }
}

// POST /api/integrations/github/auth - Инициация авторизации
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, workspaceId } = body;

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 400);
    }

    // Генерируем URL для авторизации GitHub
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/auth`;
    const state = `${userId}:${workspaceId || ''}`;
    const scope = 'repo,user:email';

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

    LoggerService.api.info('GitHub authorization URL generated', { userId, workspaceId });

    return ValidationService.createSuccessResponse({ authUrl });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'github-auth-init' });
    return ValidationService.createErrorResponse('Failed to initiate GitHub authorization', 500);
  }
}
