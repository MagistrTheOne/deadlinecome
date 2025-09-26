import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/automation/workflow-engine';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

// GET /api/automation/rules - Получить правила workflow
export async function GET(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const workspaceId = searchParams.get('workspaceId');

    let rules;
    if (projectId) {
      rules = workflowEngine.getProjectRules(projectId);
    } else {
      rules = workflowEngine.getAllRules();
    }

    LoggerService.api.info('Workflow rules retrieved', {
      projectId,
      workspaceId,
      count: rules.length
    });

    return ValidationService.createSuccessResponse({ rules });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'workflow-rules' });
    return ValidationService.createErrorResponse('Failed to get workflow rules', 500);
  }
}

// POST /api/automation/rules - Создать правило workflow
export async function POST(request: NextRequest) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { name, description, projectId, workspaceId, isActive, trigger, conditions, actions } = body;

    if (!name || !trigger || !actions) {
      return ValidationService.createErrorResponse('Missing required fields', 400);
    }

    // Создаем правило
    const rule = await workflowEngine.createRule({
      name,
      description,
      projectId,
      workspaceId,
      isActive: isActive !== false,
      trigger,
      conditions: conditions || [],
      actions
    });

    LoggerService.api.info('Workflow rule created via API', {
      ruleId: rule.id,
      name: rule.name,
      triggerType: rule.trigger.type
    });

    return ValidationService.createSuccessResponse({ rule });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'workflow-rule-create' });
    return ValidationService.createErrorResponse('Failed to create workflow rule', 500);
  }
}
