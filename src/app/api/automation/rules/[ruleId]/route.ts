import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/automation/workflow-engine';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

interface RouteParams {
  params: {
    ruleId: string;
  };
}

// GET /api/automation/rules/[ruleId] - Получить правило workflow
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { ruleId } = params;

    const rules = workflowEngine.getAllRules();
    const rule = rules.find(r => r.id === ruleId);

    if (!rule) {
      return ValidationService.createErrorResponse('Workflow rule not found', 404);
    }

    LoggerService.api.info('Workflow rule retrieved', { ruleId });

    return ValidationService.createSuccessResponse({ rule });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'workflow-rule-get', ruleId: params.ruleId });
    return ValidationService.createErrorResponse('Failed to get workflow rule', 500);
  }
}

// PUT /api/automation/rules/[ruleId] - Обновить правило workflow
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { ruleId } = params;
    const body = await request.json();

    // Обновляем правило
    const rule = await workflowEngine.updateRule(ruleId, body);

    LoggerService.api.info('Workflow rule updated via API', {
      ruleId,
      name: rule.name
    });

    return ValidationService.createSuccessResponse({ rule });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'workflow-rule-update', ruleId: params.ruleId });
    return ValidationService.createErrorResponse('Failed to update workflow rule', 500);
  }
}

// DELETE /api/automation/rules/[ruleId] - Удалить правило workflow
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { ruleId } = params;

    // Удаляем правило
    const deleted = await workflowEngine.deleteRule(ruleId);

    if (!deleted) {
      return ValidationService.createErrorResponse('Workflow rule not found', 404);
    }

    LoggerService.api.info('Workflow rule deleted via API', { ruleId });

    return ValidationService.createSuccessResponse({ success: true });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'workflow-rule-delete', ruleId: params.ruleId });
    return ValidationService.createErrorResponse('Failed to delete workflow rule', 500);
  }
}
