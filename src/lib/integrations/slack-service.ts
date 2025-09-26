import { LoggerService } from '@/lib/logger';

interface SlackConfig {
  clientId: string;
  clientSecret: string;
  signingSecret: string;
  botToken?: string;
  appToken?: string;
}

interface SlackMessage {
  channel: string;
  text?: string;
  blocks?: any[];
  attachments?: any[];
  threadTs?: string;
  replyBroadcast?: boolean;
}

interface SlackUser {
  id: string;
  name: string;
  realName: string;
  email: string;
  avatar: string;
  isBot: boolean;
  isAdmin: boolean;
  isOwner: boolean;
}

interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  isArchived: boolean;
  members: string[];
  topic: string;
  purpose: string;
}

class SlackService {
  private config: SlackConfig;
  private baseUrl = 'https://slack.com/api';

  constructor() {
    this.config = {
      clientId: process.env.SLACK_CLIENT_ID || '',
      clientSecret: process.env.SLACK_CLIENT_SECRET || '',
      signingSecret: process.env.SLACK_SIGNING_SECRET || '',
      botToken: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN
    };
  }

  // Получение access token
  async getAccessToken(code: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth.v2.access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code
        })
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to get access token');
      }

      LoggerService.api.info('Slack access token obtained', { 
        team: data.team?.name,
        scope: data.scope 
      });
      return data.access_token;
    } catch (error: any) {
      LoggerService.error.error('Failed to get Slack access token', { error: error.message });
      throw error;
    }
  }

  // Получение информации о команде
  async getTeamInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/team.info`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to get team info');
      }

      LoggerService.api.info('Slack team info retrieved', { 
        teamName: data.team?.name,
        teamId: data.team?.id 
      });
      return data.team;
    } catch (error: any) {
      LoggerService.error.error('Failed to get Slack team info', { error: error.message });
      throw error;
    }
  }

  // Получение списка пользователей
  async getUsers(accessToken: string): Promise<SlackUser[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users.list`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to get users');
      }

      const users = data.members.map((member: any) => ({
        id: member.id,
        name: member.name,
        realName: member.real_name,
        email: member.profile?.email || '',
        avatar: member.profile?.image_192 || '',
        isBot: member.is_bot,
        isAdmin: member.is_admin,
        isOwner: member.is_owner
      }));

      LoggerService.api.info('Slack users retrieved', { count: users.length });
      return users;
    } catch (error: any) {
      LoggerService.error.error('Failed to get Slack users', { error: error.message });
      throw error;
    }
  }

  // Получение списка каналов
  async getChannels(accessToken: string): Promise<SlackChannel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations.list?types=public_channel,private_channel`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to get channels');
      }

      const channels = data.channels.map((channel: any) => ({
        id: channel.id,
        name: channel.name,
        isPrivate: channel.is_private,
        isArchived: channel.is_archived,
        members: channel.members || [],
        topic: channel.topic?.value || '',
        purpose: channel.purpose?.value || ''
      }));

      LoggerService.api.info('Slack channels retrieved', { count: channels.length });
      return channels;
    } catch (error: any) {
      LoggerService.error.error('Failed to get Slack channels', { error: error.message });
      throw error;
    }
  }

  // Отправка сообщения
  async sendMessage(message: SlackMessage, botToken?: string): Promise<boolean> {
    try {
      const token = botToken || this.config.botToken;
      if (!token) {
        throw new Error('Bot token required');
      }

      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      LoggerService.api.info('Slack message sent', {
        channel: message.channel,
        messageTs: data.ts
      });
      return true;
    } catch (error: any) {
      LoggerService.error.error('Failed to send Slack message', {
        error: error.message,
        channel: message.channel
      });
      return false;
    }
  }

  // Отправка уведомления о задаче
  async notifyTaskAssigned(task: any, assignee: any, channel: string): Promise<boolean> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 Новая задача назначена'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Задача:*\n${task.title}`
          },
          {
            type: 'mrkdwn',
            text: `*Исполнитель:*\n${assignee.name}`
          },
          {
            type: 'mrkdwn',
            text: `*Проект:*\n${task.project?.name || 'Не указан'}`
          },
          {
            type: 'mrkdwn',
            text: `*Приоритет:*\n${task.priority || 'MEDIUM'}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Описание:*\n${task.description || 'Описание отсутствует'}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Открыть в DeadLine'
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`,
            style: 'primary'
          }
        ]
      }
    ];

    return await this.sendMessage({
      channel,
      blocks
    });
  }

  // Отправка уведомления о завершении задачи
  async notifyTaskCompleted(task: any, completedBy: any, channel: string): Promise<boolean> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '✅ Задача завершена'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Задача:*\n${task.title}`
          },
          {
            type: 'mrkdwn',
            text: `*Завершил:*\n${completedBy.name}`
          },
          {
            type: 'mrkdwn',
            text: `*Проект:*\n${task.project?.name || 'Не указан'}`
          },
          {
            type: 'mrkdwn',
            text: `*Время завершения:*\n${new Date().toLocaleString('ru-RU')}`
          }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Посмотреть проект'
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${task.projectId}`,
            style: 'primary'
          }
        ]
      }
    ];

    return await this.sendMessage({
      channel,
      blocks
    });
  }

  // Отправка уведомления о дедлайне
  async notifyDeadlineReminder(task: any, assignee: any, channel: string): Promise<boolean> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '⏰ Напоминание о дедлайне'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Задача:*\n${task.title}`
          },
          {
            type: 'mrkdwn',
            text: `*Исполнитель:*\n${assignee.name}`
          },
          {
            type: 'mrkdwn',
            text: `*Дедлайн:*\n${task.deadline ? new Date(task.deadline).toLocaleDateString('ru-RU') : 'Не указан'}`
          },
          {
            type: 'mrkdwn',
            text: `*Приоритет:*\n${task.priority || 'MEDIUM'}`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '⚠️ Внимание! Дедлайн приближается'
          }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Открыть задачу'
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`,
            style: 'danger'
          }
        ]
      }
    ];

    return await this.sendMessage({
      channel,
      blocks
    });
  }

  // Отправка уведомления от Василия AI
  async notifyVasilyAction(action: any, channel: string): Promise<boolean> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🤖 Сообщение от Василия AI'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${action.type}*\n${action.message}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Василий AI • ${new Date().toLocaleString('ru-RU')}`
          }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Поговорить с Василием'
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/ai`,
            style: 'primary'
          }
        ]
      }
    ];

    return await this.sendMessage({
      channel,
      blocks
    });
  }

  // Отправка ежедневного отчета
  async sendDailyReport(reportData: any, channel: string): Promise<boolean> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Ежедневный отчет DeadLine'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Дата:* ${new Date().toLocaleDateString('ru-RU')}\n*Команда:* ${reportData.teamName || 'DeadLine'}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Задач завершено:*\n${reportData.completedTasks || 0}`
          },
          {
            type: 'mrkdwn',
            text: `*Задач в работе:*\n${reportData.inProgressTasks || 0}`
          },
          {
            type: 'mrkdwn',
            text: `*Новых задач:*\n${reportData.newTasks || 0}`
          },
          {
            type: 'mrkdwn',
            text: `*Активных проектов:*\n${reportData.activeProjects || 0}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Топ исполнители:*\n${(reportData.topPerformers || []).map((performer: any, index: number) => 
            `${index + 1}. ${performer.name} - ${performer.completedTasks} задач`
          ).join('\n')}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Открыть дашборд'
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            style: 'primary'
          }
        ]
      }
    ];

    return await this.sendMessage({
      channel,
      blocks
    });
  }

  // Создание канала
  async createChannel(name: string, isPrivate: boolean = false, botToken?: string): Promise<string | null> {
    try {
      const token = botToken || this.config.botToken;
      if (!token) {
        throw new Error('Bot token required');
      }

      const response = await fetch(`${this.baseUrl}/conversations.create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          is_private: isPrivate
        })
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to create channel');
      }

      LoggerService.api.info('Slack channel created', {
        channelId: data.channel.id,
        channelName: data.channel.name
      });
      return data.channel.id;
    } catch (error: any) {
      LoggerService.error.error('Failed to create Slack channel', {
        error: error.message,
        channelName: name
      });
      return null;
    }
  }

  // Приглашение пользователей в канал
  async inviteToChannel(channelId: string, userIds: string[], botToken?: string): Promise<boolean> {
    try {
      const token = botToken || this.config.botToken;
      if (!token) {
        throw new Error('Bot token required');
      }

      const response = await fetch(`${this.baseUrl}/conversations.invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: channelId,
          users: userIds.join(',')
        })
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to invite users');
      }

      LoggerService.api.info('Users invited to Slack channel', {
        channelId,
        userIds
      });
      return true;
    } catch (error: any) {
      LoggerService.error.error('Failed to invite users to Slack channel', {
        error: error.message,
        channelId,
        userIds
      });
      return false;
    }
  }

  // Валидация подписи webhook
  validateWebhookSignature(payload: string, signature: string, timestamp: string): boolean {
    // TODO: Реализовать валидацию HMAC подписи Slack
    return true;
  }

  // Обработка slash команд
  async handleSlashCommand(command: string, text: string, userId: string, channelId: string): Promise<string> {
    try {
      switch (command) {
        case '/deadline':
          return await this.handleDeadlineCommand(text, userId, channelId);
        case '/task':
          return await this.handleTaskCommand(text, userId, channelId);
        case '/vasily':
          return await this.handleVasilyCommand(text, userId, channelId);
        default:
          return 'Неизвестная команда. Доступные команды: /deadline, /task, /vasily';
      }
    } catch (error: any) {
      LoggerService.error.error('Failed to handle Slack slash command', {
        error: error.message,
        command,
        text,
        userId
      });
      return 'Произошла ошибка при обработке команды';
    }
  }

  // Обработка команды /deadline
  private async handleDeadlineCommand(text: string, userId: string, channelId: string): Promise<string> {
    // TODO: Реализовать обработку команды /deadline
    return 'Команда /deadline в разработке';
  }

  // Обработка команды /task
  private async handleTaskCommand(text: string, userId: string, channelId: string): Promise<string> {
    // TODO: Реализовать обработку команды /task
    return 'Команда /task в разработке';
  }

  // Обработка команды /vasily
  private async handleVasilyCommand(text: string, userId: string, channelId: string): Promise<string> {
    // TODO: Реализовать обработку команды /vasily
    return 'Команда /vasily в разработке';
  }
}

// Экспорт сервиса
export const slackService = new SlackService();
