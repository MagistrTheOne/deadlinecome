import { NextRequest, NextResponse } from 'next/server';
import { slackService } from '@/lib/integrations/slack-service';
import { LoggerService } from '@/lib/logger';

// POST /api/integrations/slack/commands - Обработка slash команд Slack
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const command = formData.get('command') as string;
    const text = formData.get('text') as string;
    const userId = formData.get('user_id') as string;
    const channelId = formData.get('channel_id') as string;
    const teamId = formData.get('team_id') as string;

    if (!command || !userId || !channelId) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Обрабатываем slash команду
    const response = await slackService.handleSlashCommand(command, text || '', userId, channelId);

    LoggerService.api.info('Slack slash command processed', {
      command,
      text,
      userId,
      channelId,
      teamId
    });

    return new NextResponse(response, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'slack-commands' });
    return new NextResponse('Command processing failed', { status: 500 });
  }
}
