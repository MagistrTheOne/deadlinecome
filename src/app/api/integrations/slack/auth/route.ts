import { NextRequest, NextResponse } from 'next/server';
import { slackService } from '@/lib/integrations/slack-service';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// GET /api/integrations/slack/auth - Авторизация Slack
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return ValidationService.createErrorResponse(`Slack authorization error: ${error}`, 400);
    }

    if (!code) {
      return ValidationService.createErrorResponse('Authorization code required', 400);
    }

    // Получаем access token
    const accessToken = await slackService.getAccessToken(code);
    
    // Получаем информацию о команде
    const teamInfo = await slackService.getTeamInfo(accessToken);

    LoggerService.api.info('Slack authorization successful', {
      teamId: teamInfo.id,
      teamName: teamInfo.name
    });

    return ValidationService.createSuccessResponse({
      accessToken,
      teamInfo: {
        id: teamInfo.id,
        name: teamInfo.name,
        domain: teamInfo.domain,
        icon: teamInfo.icon?.image_132
      }
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'slack-auth' });
    return ValidationService.createErrorResponse('Slack authorization failed', 500);
  }
}

// POST /api/integrations/slack/auth - Инициация авторизации
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, workspaceId } = body;

    if (!userId) {
      return ValidationService.createErrorResponse('User ID required', 400);
    }

    // Генерируем URL для авторизации Slack
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/auth`;
    const state = `${userId}:${workspaceId || ''}`;
    const scope = 'channels:read,chat:write,users:read,team:read';

    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

    LoggerService.api.info('Slack authorization URL generated', { userId, workspaceId });

    return ValidationService.createSuccessResponse({ authUrl });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'slack-auth-init' });
    return ValidationService.createErrorResponse('Failed to initiate Slack authorization', 500);
  }
}
