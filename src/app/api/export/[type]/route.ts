import { NextRequest, NextResponse } from 'next/server';
import { pdfGenerator } from '@/lib/export/pdf-generator';
import { excelGenerator } from '@/lib/export/excel-generator';
import { DatabaseService } from '@/lib/services/database-service';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { LoggerService } from '@/lib/logger';
import { ValidationService } from '@/lib/validation/validator';

interface RouteParams {
  params: {
    type: string;
  };
}

// GET /api/export/[type] - Экспорт данных
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Применяем rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { type } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';
    const projectId = searchParams.get('projectId');
    const workspaceId = searchParams.get('workspaceId');

    if (!['project', 'tasks', 'team', 'time'].includes(type)) {
      return ValidationService.createErrorResponse('Invalid export type', 400);
    }

    if (!['pdf', 'excel'].includes(format)) {
      return ValidationService.createErrorResponse('Invalid export format', 400);
    }

    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    switch (type) {
      case 'project':
        if (!projectId) {
          return ValidationService.createErrorResponse('Project ID required', 400);
        }
        
        const project = await DatabaseService.getProjectById(projectId);
        if (!project) {
          return ValidationService.createErrorResponse('Project not found', 404);
        }

        const projectIssues = await DatabaseService.getIssuesByProjectId(projectId);
        const projectStats = await DatabaseService.getProjectStats(projectId);
        
        const projectData = {
          ...project,
          tasks: projectIssues,
          totalTasks: projectIssues.length,
          completedTasks: projectIssues.filter(issue => issue.issue.status === 'DONE').length,
          inProgressTasks: projectIssues.filter(issue => issue.issue.status === 'IN_PROGRESS').length,
          teamMembers: 0 // TODO: Получить количество участников проекта
        };

        if (format === 'pdf') {
          buffer = await pdfGenerator.generateProjectReport(projectData);
          filename = `project-report-${project.key || project.id}.pdf`;
          contentType = 'application/pdf';
        } else {
          buffer = await excelGenerator.generateProjectReport(projectData);
          filename = `project-report-${project.key || project.id}.xlsx`;
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        break;

      case 'tasks':
        const tasks = await DatabaseService.getIssuesByProjectId(projectId || '');
        
        if (format === 'pdf') {
          buffer = await pdfGenerator.generateTasksReport(tasks);
          filename = `tasks-report-${new Date().toISOString().split('T')[0]}.pdf`;
          contentType = 'application/pdf';
        } else {
          buffer = await excelGenerator.generateTasksReport(tasks);
          filename = `tasks-report-${new Date().toISOString().split('T')[0]}.xlsx`;
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        break;

      case 'team':
        if (!workspaceId) {
          return ValidationService.createErrorResponse('Workspace ID required', 400);
        }

        const workspace = await DatabaseService.getWorkspaceById(workspaceId);
        const members = await DatabaseService.getWorkspacesByUserId(workspaceId);
        
        const teamData = {
          workspace,
          members: members.map(member => ({
            ...member,
            completedTasks: 0, // TODO: Подсчитать завершенные задачи
            activeTasks: 0, // TODO: Подсчитать активные задачи
            totalHours: 0 // TODO: Подсчитать общее время
          }))
        };

        if (format === 'pdf') {
          buffer = await pdfGenerator.generateTeamReport(teamData);
          filename = `team-report-${workspace?.slug || workspaceId}.pdf`;
          contentType = 'application/pdf';
        } else {
          buffer = await excelGenerator.generateTeamReport(teamData);
          filename = `team-report-${workspace?.slug || workspaceId}.xlsx`;
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        break;

      case 'time':
        // TODO: Получить данные по учету времени
        const timeData: any[] = [];
        
        if (format === 'pdf') {
          return ValidationService.createErrorResponse('PDF format not supported for time reports', 400);
        } else {
          buffer = await excelGenerator.generateTimeReport(timeData);
          filename = `time-report-${new Date().toISOString().split('T')[0]}.xlsx`;
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        break;

      default:
        return ValidationService.createErrorResponse('Invalid export type', 400);
    }

    LoggerService.api.info('Export generated', {
      type,
      format,
      size: buffer.length,
      filename
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error: any) {
    LoggerService.logError(error as Error, { context: 'export', type: params.type });
    return ValidationService.createErrorResponse('Export failed', 500);
  }
}
