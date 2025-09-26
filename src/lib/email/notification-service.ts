import { emailService } from './email-service';
import { LoggerService } from '@/lib/logger';
import { DatabaseService } from '@/lib/services/database-service';

interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  push: boolean;
  sms: boolean;
}

interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('email' | 'inApp' | 'push' | 'sms')[];
}

class NotificationService {
  private emailService = emailService;

  // Отправка уведомления
  async sendNotification(notification: NotificationData): Promise<boolean> {
    try {
      // Получаем настройки пользователя
      const user = await DatabaseService.getUserById(notification.userId);
      if (!user) {
        LoggerService.error.error('User not found for notification', { userId: notification.userId });
        return false;
      }

      // Получаем предпочтения уведомлений
      const preferences = this.getUserNotificationPreferences(user);
      
      let success = true;

      // Отправляем по выбранным каналам
      for (const channel of notification.channels) {
        if (preferences[channel]) {
          switch (channel) {
            case 'email':
              await this.sendEmailNotification(notification, user);
              break;
            case 'inApp':
              await this.sendInAppNotification(notification);
              break;
            case 'push':
              await this.sendPushNotification(notification);
              break;
            case 'sms':
              await this.sendSmsNotification(notification, user);
              break;
          }
        }
      }

      // Логируем уведомление
      LoggerService.api.info('Notification sent', {
        userId: notification.userId,
        type: notification.type,
        channels: notification.channels,
        priority: notification.priority
      });

      return success;
    } catch (error: any) {
      LoggerService.error.error('Failed to send notification', {
        error: error.message,
        notification
      });
      return false;
    }
  }

  // Email уведомления
  private async sendEmailNotification(notification: NotificationData, user: any): Promise<void> {
    const templates = this.emailService.getTemplates();
    
    let template;
    let templateData;

    switch (notification.type) {
      case 'task_assigned':
        template = templates.taskAssigned(
          user.name,
          notification.data.taskTitle,
          notification.data.projectName,
          notification.data.assignerName
        );
        break;
        
      case 'task_completed':
        template = templates.taskCompleted(
          user.name,
          notification.data.taskTitle,
          notification.data.projectName,
          notification.data.completedBy
        );
        break;
        
      case 'deadline_reminder':
        template = templates.deadlineReminder(
          user.name,
          notification.data.taskTitle,
          notification.data.projectName,
          notification.data.deadline
        );
        break;
        
      case 'project_update':
        template = templates.projectUpdate(
          user.name,
          notification.data.projectName,
          notification.data.updateType,
          notification.data.details
        );
        break;
        
      case 'vasily_notification':
        template = templates.vasilyNotification(
          user.name,
          notification.message,
          notification.data.actionType
        );
        break;
        
      case 'weekly_report':
        template = templates.weeklyReport(
          user.name,
          notification.data.workspaceName,
          notification.data.reportData
        );
        break;
        
      default:
        // Общее уведомление
        template = {
          subject: notification.title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1a1a1a;">${notification.title}</h1>
              <p>${notification.message}</p>
              <div style="margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
                   style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Открыть DeadLine
                </a>
              </div>
            </div>
          `,
          text: `${notification.title}\n\n${notification.message}`
        };
    }

    await this.emailService.sendEmail(template, {
      to: user.email,
      replyTo: process.env.SMTP_REPLY_TO
    });
  }

  // In-app уведомления
  private async sendInAppNotification(notification: NotificationData): Promise<void> {
    // Сохраняем в базу данных для in-app уведомлений
    // TODO: Создать таблицу notifications в схеме БД
    LoggerService.api.info('In-app notification created', {
      userId: notification.userId,
      type: notification.type,
      title: notification.title
    });
  }

  // Push уведомления
  private async sendPushNotification(notification: NotificationData): Promise<void> {
    // TODO: Интеграция с Firebase Cloud Messaging или аналогичным сервисом
    LoggerService.api.info('Push notification sent', {
      userId: notification.userId,
      type: notification.type,
      title: notification.title
    });
  }

  // SMS уведомления
  private async sendSmsNotification(notification: NotificationData, user: any): Promise<void> {
    // TODO: Интеграция с SMS провайдером (Twilio, etc.)
    LoggerService.api.info('SMS notification sent', {
      userId: notification.userId,
      type: notification.type,
      phone: user.phone // TODO: Добавить поле phone в схему пользователя
    });
  }

  // Получение предпочтений пользователя
  private getUserNotificationPreferences(user: any): NotificationPreferences {
    try {
      const preferences = user.preferences ? JSON.parse(user.preferences) : {};
      return {
        email: preferences.notifications?.email !== false,
        inApp: preferences.notifications?.inApp !== false,
        push: preferences.notifications?.push === true,
        sms: preferences.notifications?.sms === true
      };
    } catch (error) {
      // Возвращаем дефолтные настройки
      return {
        email: true,
        inApp: true,
        push: false,
        sms: false
      };
    }
  }

  // Уведомления о задачах
  async notifyTaskAssigned(taskId: string, assigneeId: string, assignerId: string): Promise<void> {
    const task = await DatabaseService.getIssuesByProjectId(''); // TODO: Получить задачу по ID
    const assignee = await DatabaseService.getUserById(assigneeId);
    const assigner = await DatabaseService.getUserById(assignerId);

    if (!task || !assignee || !assigner) return;

    await this.sendNotification({
      userId: assigneeId,
      type: 'task_assigned',
      title: 'Новая задача назначена',
      message: `Вам назначена задача: ${task.title}`,
      data: {
        taskTitle: task.title,
        projectName: task.project?.name || 'Неизвестный проект',
        assignerName: assigner.name
      },
      priority: 'medium',
      channels: ['email', 'inApp']
    });
  }

  async notifyTaskCompleted(taskId: string, completedBy: string, projectId: string): Promise<void> {
    const task = await DatabaseService.getIssuesByProjectId(projectId); // TODO: Получить задачу по ID
    const project = await DatabaseService.getProjectById(projectId);
    const user = await DatabaseService.getUserById(completedBy);

    if (!task || !project || !user) return;

    // Уведомляем всех участников проекта
    const projectMembers = await DatabaseService.getWorkspacesByUserId(''); // TODO: Получить участников проекта
    
    for (const member of projectMembers) {
      if (member.userId !== completedBy) {
        await this.sendNotification({
          userId: member.userId,
          type: 'task_completed',
          title: 'Задача завершена',
          message: `${user.name} завершил задачу: ${task.title}`,
          data: {
            taskTitle: task.title,
            projectName: project.name,
            completedBy: user.name
          },
          priority: 'low',
          channels: ['inApp']
        });
      }
    }
  }

  async notifyDeadlineReminder(taskId: string, assigneeId: string, deadline: Date): Promise<void> {
    const task = await DatabaseService.getIssuesByProjectId(''); // TODO: Получить задачу по ID
    const assignee = await DatabaseService.getUserById(assigneeId);

    if (!task || !assignee) return;

    await this.sendNotification({
      userId: assigneeId,
      type: 'deadline_reminder',
      title: 'Дедлайн приближается',
      message: `У вас есть задача с приближающимся дедлайном: ${task.title}`,
      data: {
        taskTitle: task.title,
        projectName: task.project?.name || 'Неизвестный проект',
        deadline: deadline.toLocaleDateString('ru-RU')
      },
      priority: 'high',
      channels: ['email', 'inApp', 'push']
    });
  }

  // Уведомления от Василия AI
  async notifyVasilyAction(userId: string, actionType: string, message: string, data?: any): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'vasily_notification',
      title: `Василий: ${actionType}`,
      message,
      data: {
        actionType,
        ...data
      },
      priority: 'medium',
      channels: ['email', 'inApp']
    });
  }

  // Еженедельные отчеты
  async sendWeeklyReport(workspaceId: string): Promise<void> {
    const workspace = await DatabaseService.getWorkspaceById(workspaceId);
    const members = await DatabaseService.getWorkspacesByUserId(''); // TODO: Получить участников workspace
    
    if (!workspace || !members.length) return;

    // Получаем статистику за неделю
    const reportData = {
      completedTasks: 0, // TODO: Подсчитать завершенные задачи
      activeProjects: 0, // TODO: Подсчитать активные проекты
      teamMembers: members.length,
      aiActions: 0 // TODO: Подсчитать AI действия
    };

    // Отправляем отчет всем участникам
    for (const member of members) {
      await this.sendNotification({
        userId: member.userId,
        type: 'weekly_report',
        title: 'Еженедельный отчет',
        message: `Отчет по рабочему пространству ${workspace.name}`,
        data: {
          workspaceName: workspace.name,
          reportData
        },
        priority: 'low',
        channels: ['email']
      });
    }
  }

  // Массовые уведомления
  async sendBulkNotification(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      const success = await this.sendNotification({
        userId,
        type,
        title,
        message,
        data,
        priority: 'medium',
        channels: ['email', 'inApp']
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { sent, failed };
  }
}

// Экспорт сервиса
export const notificationService = new NotificationService();
