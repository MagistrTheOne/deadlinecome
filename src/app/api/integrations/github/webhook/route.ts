import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/integrations/github-service';
import { LoggerService } from '@/lib/logger';

// POST /api/integrations/github/webhook - GitHub webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-hub-signature-256') || '';

    // Обрабатываем webhook
    await githubService.handleWebhook(body, signature);

    LoggerService.api.info('GitHub webhook processed', {
      action: body.action,
      repository: body.repository?.full_name
    });

    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'github-webhook' });
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}
