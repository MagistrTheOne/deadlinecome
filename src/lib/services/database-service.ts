import { db } from '@/lib/db';
import { user, workspace, project, issue, aiConversation, aiTaskSuggestion, projectStatus, vasilyAction, aiTeamMember, bugReport, aiQaAnalysis, codeReview, qualityGate, aiAnalytics, aiDocumentation } from '@/lib/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { LoggerService } from '@/lib/logger';

export class DatabaseService {
  // ===== USER OPERATIONS =====
  static async getUserById(userId: string) {
    try {
      const result = await db.select().from(user).where(eq(user.id, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      LoggerService.error.error('Failed to get user by ID', { error: error.message, userId });
      throw error;
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const result = await db.select().from(user).where(eq(user.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      LoggerService.error.error('Failed to get user by email', { error: error.message, email });
      throw error;
    }
  }

  static async updateUser(userId: string, data: Partial<typeof user.$inferInsert>) {
    try {
      const result = await db.update(user)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(user.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      LoggerService.error.error('Failed to update user', { error: error.message, userId, data });
      throw error;
    }
  }

  // ===== WORKSPACE OPERATIONS =====
  static async getWorkspacesByUserId(userId: string) {
    try {
      const result = await db
        .select({
          workspace: workspace,
          role: workspaceMember.role,
          itRole: workspaceMember.itRole
        })
        .from(workspace)
        .innerJoin(workspaceMember, eq(workspace.id, workspaceMember.workspaceId))
        .where(eq(workspaceMember.userId, userId));
      return result;
    } catch (error) {
      LoggerService.error.error('Failed to get workspaces by user ID', { error: error.message, userId });
      throw error;
    }
  }

  static async getWorkspaceById(workspaceId: string) {
    try {
      const result = await db.select().from(workspace).where(eq(workspace.id, workspaceId)).limit(1);
      return result[0] || null;
    } catch (error) {
      LoggerService.error.error('Failed to get workspace by ID', { error: error.message, workspaceId });
      throw error;
    }
  }

  // ===== PROJECT OPERATIONS =====
  static async getProjectsByWorkspaceId(workspaceId: string) {
    try {
      const result = await db
        .select({
          project: project,
          lead: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          }
        })
        .from(project)
        .leftJoin(user, eq(project.leadId, user.id))
        .where(eq(project.workspaceId, workspaceId))
        .orderBy(desc(project.createdAt));
      return result;
    } catch (error) {
      LoggerService.error.error('Failed to get projects by workspace ID', { error: error.message, workspaceId });
      throw error;
    }
  }

  static async getProjectById(projectId: string) {
    try {
      const result = await db.select().from(project).where(eq(project.id, projectId)).limit(1);
      return result[0] || null;
    } catch (error) {
      LoggerService.error.error('Failed to get project by ID', { error: error.message, projectId });
      throw error;
    }
  }

  // ===== ISSUE/TASK OPERATIONS =====
  static async getIssuesByProjectId(projectId: string) {
    try {
      const result = await db
        .select({
          issue: issue,
          assignee: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          },
          reporter: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          }
        })
        .from(issue)
        .leftJoin(user, eq(issue.assigneeId, user.id))
        .leftJoin(user, eq(issue.reporterId, user.id))
        .where(eq(issue.projectId, projectId))
        .orderBy(asc(issue.order));
      return result;
    } catch (error) {
      LoggerService.error.error('Failed to get issues by project ID', { error: error.message, projectId });
      throw error;
    }
  }

  static async createIssue(data: typeof issue.$inferInsert) {
    try {
      const result = await db.insert(issue).values(data).returning();
      LoggerService.api.info('Issue created', { issueId: result[0].id, projectId: data.projectId });
      return result[0];
    } catch (error) {
      LoggerService.error.error('Failed to create issue', { error: error.message, data });
      throw error;
    }
  }

  static async updateIssue(issueId: string, data: Partial<typeof issue.$inferInsert>) {
    try {
      const result = await db
        .update(issue)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(issue.id, issueId))
        .returning();
      LoggerService.api.info('Issue updated', { issueId, data });
      return result[0];
    } catch (error) {
      LoggerService.error.error('Failed to update issue', { error: error.message, issueId, data });
      throw error;
    }
  }

  // ===== AI CONVERSATION OPERATIONS =====
  static async saveAIConversation(data: typeof aiConversation.$inferInsert) {
    try {
      const result = await db.insert(aiConversation).values(data).returning();
      LoggerService.ai.info('AI conversation saved', { conversationId: result[0].id, userId: data.userId });
      return result[0];
    } catch (error) {
      LoggerService.error.error('Failed to save AI conversation', { error: error.message, data });
      throw error;
    }
  }

  static async getAIConversationsByUserId(userId: string, limit: number = 50) {
    try {
      const result = await db
        .select()
        .from(aiConversation)
        .where(eq(aiConversation.userId, userId))
        .orderBy(desc(aiConversation.createdAt))
        .limit(limit);
      return result;
    } catch (error) {
      LoggerService.error.error('Failed to get AI conversations by user ID', { error: error.message, userId });
      throw error;
    }
  }

  // ===== AI TASK SUGGESTIONS =====
  static async getAITaskSuggestions(workspaceId: string, status?: string) {
    try {
      let query = db.select().from(aiTaskSuggestion).where(eq(aiTaskSuggestion.workspaceId, workspaceId));
      
      if (status) {
        query = query.where(eq(aiTaskSuggestion.status, status as any));
      }
      
      const result = await query.orderBy(desc(aiTaskSuggestion.createdAt));
      return result;
    } catch (error) {
      LoggerService.error.error('Failed to get AI task suggestions', { error: error.message, workspaceId, status });
      throw error;
    }
  }

  static async createAITaskSuggestion(data: typeof aiTaskSuggestion.$inferInsert) {
    try {
      const result = await db.insert(aiTaskSuggestion).values(data).returning();
      LoggerService.ai.info('AI task suggestion created', { suggestionId: result[0].id, workspaceId: data.workspaceId });
      return result[0];
    } catch (error) {
      LoggerService.error.error('Failed to create AI task suggestion', { error: error.message, data });
      throw error;
    }
  }

  // ===== PROJECT STATUS =====
  static async getProjectStatus(projectId: string) {
    try {
      const result = await db
        .select()
        .from(projectStatus)
        .where(eq(projectStatus.projectId, projectId))
        .orderBy(desc(projectStatus.lastAnalyzed))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      LoggerService.error.error('Failed to get project status', { error: error.message, projectId });
      throw error;
    }
  }

  static async updateProjectStatus(data: typeof projectStatus.$inferInsert) {
    try {
      const result = await db.insert(projectStatus).values(data).returning();
      LoggerService.ai.info('Project status updated', { statusId: result[0].id, projectId: data.projectId });
      return result[0];
    } catch (error) {
      LoggerService.error.error('Failed to update project status', { error: error.message, data });
      throw error;
    }
  }

  // ===== VASILY ACTIONS =====
  static async getVasilyActions(projectId: string, limit: number = 20) {
    try {
      const result = await db
        .select()
        .from(vasilyAction)
        .where(eq(vasilyAction.projectId, projectId))
        .orderBy(desc(vasilyAction.createdAt))
        .limit(limit);
      return result;
    } catch (error) {
      LoggerService.error.error('Failed to get Vasily actions', { error: error.message, projectId });
      throw error;
    }
  }

  static async createVasilyAction(data: typeof vasilyAction.$inferInsert) {
    try {
      const result = await db.insert(vasilyAction).values(data).returning();
      LoggerService.ai.info('Vasily action created', { actionId: result[0].id, projectId: data.projectId });
      return result[0];
    } catch (error) {
      LoggerService.error.error('Failed to create Vasily action', { error: error.message, data });
      throw error;
    }
  }

  // ===== AI TEAM MEMBERS =====
  static async getAITeamMembers() {
    try {
      const result = await db
        .select()
        .from(aiTeamMember)
        .where(eq(aiTeamMember.isActive, true))
        .orderBy(asc(aiTeamMember.name));
      return result;
    } catch (error) {
      LoggerService.error.error('Failed to get AI team members', { error: error.message });
      throw error;
    }
  }

  // ===== BUG REPORTS =====
  static async getBugReports(projectId: string, status?: string) {
    try {
      let query = db
        .select({
          bugReport: bugReport,
          reporter: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          },
          assignee: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          }
        })
        .from(bugReport)
        .leftJoin(user, eq(bugReport.reporterId, user.id))
        .leftJoin(user, eq(bugReport.assigneeId, user.id))
        .where(eq(bugReport.projectId, projectId));
      
      if (status) {
        query = query.where(eq(bugReport.status, status as any));
      }
      
      const result = await query.orderBy(desc(bugReport.createdAt));
      return result;
    } catch (error) {
      LoggerService.error.error('Failed to get bug reports', { error: error.message, projectId, status });
      throw error;
    }
  }

  static async createBugReport(data: typeof bugReport.$inferInsert) {
    try {
      const result = await db.insert(bugReport).values(data).returning();
      LoggerService.api.info('Bug report created', { bugReportId: result[0].id, projectId: data.projectId });
      return result[0];
    } catch (error) {
      LoggerService.error.error('Failed to create bug report', { error: error.message, data });
      throw error;
    }
  }

  // ===== ANALYTICS =====
  static async getProjectAnalytics(projectId: string, analyticsType?: string) {
    try {
      let query = db
        .select()
        .from(aiAnalytics)
        .where(eq(aiAnalytics.projectId, projectId));
      
      if (analyticsType) {
        query = query.where(eq(aiAnalytics.analyticsType, analyticsType as any));
      }
      
      const result = await query.orderBy(desc(aiAnalytics.createdAt));
      return result;
    } catch (error) {
      LoggerService.error.error('Failed to get project analytics', { error: error.message, projectId, analyticsType });
      throw error;
    }
  }

  // ===== STATISTICS =====
  static async getProjectStats(projectId: string) {
    try {
      const [issueStats, bugStats, aiStats] = await Promise.all([
        db.select({
          status: issue.status,
          count: sql<number>`count(*)`
        })
        .from(issue)
        .where(eq(issue.projectId, projectId))
        .groupBy(issue.status),
        
        db.select({
          status: bugReport.status,
          count: sql<number>`count(*)`
        })
        .from(bugReport)
        .where(eq(bugReport.projectId, projectId))
        .groupBy(bugReport.status),
        
        db.select({
          type: aiAnalytics.analyticsType,
          count: sql<number>`count(*)`
        })
        .from(aiAnalytics)
        .where(eq(aiAnalytics.projectId, projectId))
        .groupBy(aiAnalytics.analyticsType)
      ]);

      return {
        issues: issueStats,
        bugs: bugStats,
        analytics: aiStats
      };
    } catch (error) {
      LoggerService.error.error('Failed to get project stats', { error: error.message, projectId });
      throw error;
    }
  }
}
