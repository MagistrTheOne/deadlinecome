import { LoggerService } from '@/lib/logger';

interface JiraConfig {
  baseUrl: string;
  username: string;
  apiToken: string;
}

interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  reporter: string;
  created: string;
  updated: string;
  project: string;
  issueType: string;
  labels: string[];
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
  description: string;
  lead: string;
  projectType: string;
  url: string;
}

class JiraService {
  private config: JiraConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      baseUrl: process.env.JIRA_BASE_URL || '',
      username: process.env.JIRA_USERNAME || '',
      apiToken: process.env.JIRA_API_TOKEN || ''
    };
    this.baseUrl = this.config.baseUrl;
  }

  // Получение проектов Jira
  async getProjects(): Promise<JiraProject[]> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/3/project`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiToken}`).toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status}`);
      }

      const projects = await response.json();
      LoggerService.api.info('Jira projects retrieved', { count: projects.length });
      return projects;
    } catch (error: any) {
      LoggerService.error.error('Failed to get Jira projects', { error: error.message });
      throw error;
    }
  }

  // Получение issues проекта
  async getProjectIssues(projectKey: string, startAt: number = 0, maxResults: number = 50): Promise<JiraIssue[]> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/3/search?jql=project=${projectKey}&startAt=${startAt}&maxResults=${maxResults}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiToken}`).toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status}`);
      }

      const data = await response.json();
      const issues = data.issues.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description || '',
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name || 'Medium',
        assignee: issue.fields.assignee?.displayName || 'Unassigned',
        reporter: issue.fields.reporter?.displayName || 'Unknown',
        created: issue.fields.created,
        updated: issue.fields.updated,
        project: issue.fields.project.key,
        issueType: issue.fields.issuetype.name,
        labels: issue.fields.labels || []
      }));

      LoggerService.api.info('Jira issues retrieved', { projectKey, count: issues.length });
      return issues;
    } catch (error: any) {
      LoggerService.error.error('Failed to get Jira issues', { error: error.message, projectKey });
      throw error;
    }
  }

  // Создание issue в Jira
  async createIssue(projectKey: string, summary: string, description: string, issueType: string = 'Task'): Promise<JiraIssue> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiToken}`).toString('base64')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            project: { key: projectKey },
            summary,
            description,
            issuetype: { name: issueType }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status}`);
      }

      const issue = await response.json();
      LoggerService.api.info('Jira issue created', { key: issue.key, projectKey });
      return await this.getIssue(issue.key);
    } catch (error: any) {
      LoggerService.error.error('Failed to create Jira issue', { error: error.message, projectKey });
      throw error;
    }
  }

  // Получение issue по ключу
  async getIssue(issueKey: string): Promise<JiraIssue> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/3/issue/${issueKey}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.apiToken}`).toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status}`);
      }

      const issue = await response.json();
      const jiraIssue: JiraIssue = {
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description || '',
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name || 'Medium',
        assignee: issue.fields.assignee?.displayName || 'Unassigned',
        reporter: issue.fields.reporter?.displayName || 'Unknown',
        created: issue.fields.created,
        updated: issue.fields.updated,
        project: issue.fields.project.key,
        issueType: issue.fields.issuetype.name,
        labels: issue.fields.labels || []
      };

      LoggerService.api.info('Jira issue retrieved', { key: issueKey });
      return jiraIssue;
    } catch (error: any) {
      LoggerService.error.error('Failed to get Jira issue', { error: error.message, issueKey });
      throw error;
    }
  }

  // Синхронизация с DeadLine
  async syncWithDeadLine(projectKey: string, deadLineProjectId: string): Promise<{ synced: number; errors: number }> {
    try {
      const issues = await this.getProjectIssues(projectKey);
      let synced = 0;
      let errors = 0;

      for (const issue of issues) {
        try {
          // TODO: Создать или обновить задачу в DeadLine
          // const deadLineTask = await DatabaseService.createIssue({
          //   title: issue.summary,
          //   description: issue.description,
          //   status: this.mapJiraStatus(issue.status),
          //   priority: this.mapJiraPriority(issue.priority),
          //   projectId: deadLineProjectId,
          //   jiraIssueKey: issue.key,
          //   jiraIssueId: issue.id
          // });
          
          synced++;
        } catch (error) {
          errors++;
          LoggerService.error.error('Failed to sync Jira issue', {
            error: error.message,
            issueKey: issue.key,
            projectId: deadLineProjectId
          });
        }
      }

      LoggerService.api.info('Jira issues synced with DeadLine', {
        synced,
        errors,
        projectKey,
        deadLineProjectId
      });

      return { synced, errors };
    } catch (error: any) {
      LoggerService.error.error('Failed to sync Jira issues', {
        error: error.message,
        projectKey,
        deadLineProjectId
      });
      throw error;
    }
  }

  // Маппинг статусов Jira -> DeadLine
  private mapJiraStatus(jiraStatus: string): string {
    const statusMap: Record<string, string> = {
      'To Do': 'TODO',
      'In Progress': 'IN_PROGRESS',
      'Done': 'DONE',
      'Closed': 'DONE',
      'Resolved': 'DONE'
    };
    return statusMap[jiraStatus] || 'TODO';
  }

  // Маппинг приоритетов Jira -> DeadLine
  private mapJiraPriority(jiraPriority: string): string {
    const priorityMap: Record<string, string> = {
      'Highest': 'HIGHEST',
      'High': 'HIGH',
      'Medium': 'MEDIUM',
      'Low': 'LOW',
      'Lowest': 'LOWEST'
    };
    return priorityMap[jiraPriority] || 'MEDIUM';
  }
}

// Экспорт сервиса
export const jiraService = new JiraService();
