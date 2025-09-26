import { LoggerService } from '@/lib/logger';

interface GitHubConfig {
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
  baseUrl?: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  language: string;
  stargazersCount: number;
  watchersCount: number;
  forksCount: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  assignees: Array<{
    id: number;
    login: string;
    avatarUrl: string;
  }>;
  user: {
    id: number;
    login: string;
    avatarUrl: string;
  };
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  user: {
    id: number;
    login: string;
    avatarUrl: string;
  };
  assignees: Array<{
    id: number;
    login: string;
    avatarUrl: string;
  }>;
  requestedReviewers: Array<{
    id: number;
    login: string;
    avatarUrl: string;
  }>;
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
  closedAt?: string;
}

interface GitHubWebhookPayload {
  action: string;
  repository: GitHubRepository;
  issue?: GitHubIssue;
  pull_request?: GitHubPullRequest;
  sender: {
    id: number;
    login: string;
    avatarUrl: string;
  };
}

class GitHubService {
  private config: GitHubConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || '',
      baseUrl: process.env.GITHUB_BASE_URL || 'https://api.github.com'
    };
    this.baseUrl = this.config.baseUrl;
  }

  // Получение access token
  async getAccessToken(code: string): Promise<string> {
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error_description || data.error);
      }

      LoggerService.api.info('GitHub access token obtained', { scope: data.scope });
      return data.access_token;
    } catch (error: any) {
      LoggerService.error.error('Failed to get GitHub access token', { error: error.message });
      throw error;
    }
  }

  // Получение информации о пользователе
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const user = await response.json();
      LoggerService.api.info('GitHub user info retrieved', { login: user.login, id: user.id });
      return user;
    } catch (error: any) {
      LoggerService.error.error('Failed to get GitHub user info', { error: error.message });
      throw error;
    }
  }

  // Получение репозиториев пользователя
  async getUserRepositories(accessToken: string, page: number = 1, perPage: number = 30): Promise<GitHubRepository[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/repos?page=${page}&per_page=${perPage}&sort=updated`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repositories = await response.json();
      LoggerService.api.info('GitHub repositories retrieved', { count: repositories.length, page });
      return repositories;
    } catch (error: any) {
      LoggerService.error.error('Failed to get GitHub repositories', { error: error.message });
      throw error;
    }
  }

  // Получение информации о репозитории
  async getRepository(accessToken: string, owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repository = await response.json();
      LoggerService.api.info('GitHub repository retrieved', { fullName: repository.full_name });
      return repository;
    } catch (error: any) {
      LoggerService.error.error('Failed to get GitHub repository', { error: error.message, owner, repo });
      throw error;
    }
  }

  // Получение issues репозитория
  async getRepositoryIssues(accessToken: string, owner: string, repo: string, state: 'all' | 'open' | 'closed' = 'all'): Promise<GitHubIssue[]> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues?state=${state}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const issues = await response.json();
      LoggerService.api.info('GitHub issues retrieved', { count: issues.length, owner, repo, state });
      return issues;
    } catch (error: any) {
      LoggerService.error.error('Failed to get GitHub issues', { error: error.message, owner, repo });
      throw error;
    }
  }

  // Получение pull requests репозитория
  async getRepositoryPullRequests(accessToken: string, owner: string, repo: string, state: 'all' | 'open' | 'closed' = 'all'): Promise<GitHubPullRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls?state=${state}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const pullRequests = await response.json();
      LoggerService.api.info('GitHub pull requests retrieved', { count: pullRequests.length, owner, repo, state });
      return pullRequests;
    } catch (error: any) {
      LoggerService.error.error('Failed to get GitHub pull requests', { error: error.message, owner, repo });
      throw error;
    }
  }

  // Создание issue
  async createIssue(accessToken: string, owner: string, repo: string, title: string, body: string, labels?: string[], assignees?: string[]): Promise<GitHubIssue> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          body,
          labels,
          assignees
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const issue = await response.json();
      LoggerService.api.info('GitHub issue created', { number: issue.number, title, owner, repo });
      return issue;
    } catch (error: any) {
      LoggerService.error.error('Failed to create GitHub issue', { error: error.message, title, owner, repo });
      throw error;
    }
  }

  // Обновление issue
  async updateIssue(accessToken: string, owner: string, repo: string, issueNumber: number, updates: Partial<{
    title: string;
    body: string;
    state: 'open' | 'closed';
    labels: string[];
    assignees: string[];
  }>): Promise<GitHubIssue> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const issue = await response.json();
      LoggerService.api.info('GitHub issue updated', { number: issueNumber, owner, repo });
      return issue;
    } catch (error: any) {
      LoggerService.error.error('Failed to update GitHub issue', { error: error.message, issueNumber, owner, repo });
      throw error;
    }
  }

  // Синхронизация issues с DeadLine задачами
  async syncIssuesWithDeadLine(accessToken: string, owner: string, repo: string, projectId: string): Promise<{ synced: number; errors: number }> {
    try {
      const issues = await this.getRepositoryIssues(accessToken, owner, repo);
      let synced = 0;
      let errors = 0;

      for (const issue of issues) {
        try {
          // TODO: Создать или обновить задачу в DeadLine
          // const deadLineTask = await DatabaseService.createIssue({
          //   title: issue.title,
          //   description: issue.body,
          //   status: issue.state === 'open' ? 'TODO' : 'DONE',
          //   projectId,
          //   githubIssueNumber: issue.number,
          //   githubIssueId: issue.id
          // });
          
          synced++;
        } catch (error) {
          errors++;
          LoggerService.error.error('Failed to sync GitHub issue', {
            error: error.message,
            issueNumber: issue.number,
            projectId
          });
        }
      }

      LoggerService.api.info('GitHub issues synced with DeadLine', {
        synced,
        errors,
        projectId,
        repository: `${owner}/${repo}`
      });

      return { synced, errors };
    } catch (error: any) {
      LoggerService.error.error('Failed to sync GitHub issues', {
        error: error.message,
        projectId,
        repository: `${owner}/${repo}`
      });
      throw error;
    }
  }

  // Обработка webhook от GitHub
  async handleWebhook(payload: GitHubWebhookPayload, signature: string): Promise<void> {
    try {
      // Валидация подписи webhook
      if (!this.validateWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const { action, repository, issue, pull_request, sender } = payload;

      LoggerService.api.info('GitHub webhook received', {
        action,
        repository: repository.full_name,
        sender: sender.login
      });

      switch (action) {
        case 'opened':
        case 'closed':
        case 'reopened':
          if (issue) {
            await this.handleIssueWebhook(issue, repository, action);
          }
          if (pull_request) {
            await this.handlePullRequestWebhook(pull_request, repository, action);
          }
          break;

        case 'assigned':
        case 'unassigned':
          if (issue) {
            await this.handleIssueAssignmentWebhook(issue, repository, action);
          }
          break;

        case 'labeled':
        case 'unlabeled':
          if (issue) {
            await this.handleIssueLabelWebhook(issue, repository, action);
          }
          break;

        default:
          LoggerService.api.info('Unhandled GitHub webhook action', { action });
      }
    } catch (error: any) {
      LoggerService.error.error('Failed to handle GitHub webhook', {
        error: error.message,
        action: payload.action
      });
      throw error;
    }
  }

  // Валидация подписи webhook
  private validateWebhookSignature(payload: any, signature: string): boolean {
    // TODO: Реализовать валидацию HMAC подписи
    return true;
  }

  // Обработка webhook для issues
  private async handleIssueWebhook(issue: GitHubIssue, repository: GitHubRepository, action: string): Promise<void> {
    // TODO: Обновить соответствующую задачу в DeadLine
    LoggerService.api.info('GitHub issue webhook handled', {
      issueNumber: issue.number,
      action,
      repository: repository.full_name
    });
  }

  // Обработка webhook для pull requests
  private async handlePullRequestWebhook(pullRequest: GitHubPullRequest, repository: GitHubRepository, action: string): Promise<void> {
    // TODO: Обновить соответствующий pull request в DeadLine
    LoggerService.api.info('GitHub pull request webhook handled', {
      pullRequestNumber: pullRequest.number,
      action,
      repository: repository.full_name
    });
  }

  // Обработка webhook для назначения issues
  private async handleIssueAssignmentWebhook(issue: GitHubIssue, repository: GitHubRepository, action: string): Promise<void> {
    // TODO: Обновить назначение задачи в DeadLine
    LoggerService.api.info('GitHub issue assignment webhook handled', {
      issueNumber: issue.number,
      action,
      repository: repository.full_name
    });
  }

  // Обработка webhook для лейблов issues
  private async handleIssueLabelWebhook(issue: GitHubIssue, repository: GitHubRepository, action: string): Promise<void> {
    // TODO: Обновить лейблы задачи в DeadLine
    LoggerService.api.info('GitHub issue label webhook handled', {
      issueNumber: issue.number,
      action,
      repository: repository.full_name
    });
  }

  // Получение статистики репозитория
  async getRepositoryStats(accessToken: string, owner: string, repo: string): Promise<any> {
    try {
      const [repository, issues, pullRequests] = await Promise.all([
        this.getRepository(accessToken, owner, repo),
        this.getRepositoryIssues(accessToken, owner, repo),
        this.getRepositoryPullRequests(accessToken, owner, repo)
      ]);

      const stats = {
        repository: {
          name: repository.name,
          fullName: repository.full_name,
          description: repository.description,
          language: repository.language,
          stars: repository.stargazersCount,
          forks: repository.forksCount,
          watchers: repository.watchersCount
        },
        issues: {
          total: issues.length,
          open: issues.filter(issue => issue.state === 'open').length,
          closed: issues.filter(issue => issue.state === 'closed').length
        },
        pullRequests: {
          total: pullRequests.length,
          open: pullRequests.filter(pr => pr.state === 'open').length,
          closed: pullRequests.filter(pr => pr.state === 'closed').length,
          merged: pullRequests.filter(pr => pr.state === 'merged').length
        }
      };

      LoggerService.api.info('GitHub repository stats retrieved', {
        repository: `${owner}/${repo}`,
        issues: stats.issues.total,
        pullRequests: stats.pullRequests.total
      });

      return stats;
    } catch (error: any) {
      LoggerService.error.error('Failed to get GitHub repository stats', {
        error: error.message,
        owner,
        repo
      });
      throw error;
    }
  }
}

// Экспорт сервиса
export const githubService = new GitHubService();
