import nodemailer from 'nodemailer';
import { LoggerService } from '@/lib/logger';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.transporter = nodemailer.createTransporter(this.config);
      
      // Проверяем подключение
      await this.transporter.verify();
      
      this.isInitialized = true;
      LoggerService.api.info('Email service initialized', {
        host: this.config.host,
        port: this.config.port
      });
    } catch (error: any) {
      LoggerService.error.error('Failed to initialize email service', {
        error: error.message,
        config: {
          host: this.config.host,
          port: this.config.port,
          user: this.config.auth.user
        }
      });
      throw error;
    }
  }

  async sendEmail(
    template: EmailTemplate,
    options: EmailOptions
  ): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    try {
      const mailOptions = {
        from: `"DeadLine" <${this.config.auth.user}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        replyTo: options.replyTo,
        subject: template.subject,
        text: template.text,
        html: template.html,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      LoggerService.api.info('Email sent successfully', {
        messageId: result.messageId,
        to: options.to,
        subject: template.subject
      });

      return true;
    } catch (error: any) {
      LoggerService.error.error('Failed to send email', {
        error: error.message,
        to: options.to,
        subject: template.subject
      });
      return false;
    }
  }

  // Шаблоны писем
  getTemplates() {
    return {
      // Приветственное письмо
      welcome: (userName: string, workspaceName: string): EmailTemplate => ({
        subject: `Добро пожаловать в ${workspaceName}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Добро пожаловать в DeadLine!</h1>
            <p>Привет, ${userName}!</p>
            <p>Вы были добавлены в рабочее пространство <strong>${workspaceName}</strong>.</p>
            <p>Теперь вы можете:</p>
            <ul>
              <li>Создавать и управлять проектами</li>
              <li>Назначать задачи команде</li>
              <li>Использовать AI-ассистента Василия</li>
              <li>Отслеживать прогресс в реальном времени</li>
            </ul>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Открыть DeadLine
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Если у вас есть вопросы, обратитесь к администратору рабочего пространства.
            </p>
          </div>
        `,
        text: `Добро пожаловать в DeadLine! Вы были добавлены в рабочее пространство ${workspaceName}.`
      }),

      // Уведомление о назначении задачи
      taskAssigned: (userName: string, taskTitle: string, projectName: string, assignerName: string): EmailTemplate => ({
        subject: `Новая задача: ${taskTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Новая задача назначена</h1>
            <p>Привет, ${userName}!</p>
            <p><strong>${assignerName}</strong> назначил вам новую задачу в проекте <strong>${projectName}</strong>:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">${taskTitle}</h3>
              <p style="margin: 0; color: #666;">Проект: ${projectName}</p>
            </div>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/tasks" 
                 style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Посмотреть задачу
              </a>
            </div>
          </div>
        `,
        text: `Новая задача: ${taskTitle} в проекте ${projectName} назначена ${assignerName}.`
      }),

      // Уведомление о завершении задачи
      taskCompleted: (userName: string, taskTitle: string, projectName: string, completedBy: string): EmailTemplate => ({
        subject: `Задача завершена: ${taskTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Задача завершена!</h1>
            <p>Привет, ${userName}!</p>
            <p><strong>${completedBy}</strong> завершил задачу в проекте <strong>${projectName}</strong>:</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">${taskTitle}</h3>
              <p style="margin: 0; color: #666;">Проект: ${projectName}</p>
            </div>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/tasks" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Посмотреть проект
              </a>
            </div>
          </div>
        `,
        text: `Задача ${taskTitle} в проекте ${projectName} завершена ${completedBy}.`
      }),

      // Уведомление о дедлайне
      deadlineReminder: (userName: string, taskTitle: string, projectName: string, deadline: string): EmailTemplate => ({
        subject: `⚠️ Дедлайн приближается: ${taskTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Дедлайн приближается!</h1>
            <p>Привет, ${userName}!</p>
            <p>У вас есть задача с приближающимся дедлайном:</p>
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">${taskTitle}</h3>
              <p style="margin: 0; color: #666;">Проект: ${projectName}</p>
              <p style="margin: 10px 0 0 0; color: #f59e0b; font-weight: bold;">Дедлайн: ${deadline}</p>
            </div>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/tasks" 
                 style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Посмотреть задачу
              </a>
            </div>
          </div>
        `,
        text: `Дедлайн приближается для задачи ${taskTitle} в проекте ${projectName}. Дедлайн: ${deadline}.`
      }),

      // Уведомление о проекте
      projectUpdate: (userName: string, projectName: string, updateType: string, details: string): EmailTemplate => ({
        subject: `Обновление проекта: ${projectName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Обновление проекта</h1>
            <p>Привет, ${userName}!</p>
            <p>В проекте <strong>${projectName}</strong> произошло обновление:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">${updateType}</h3>
              <p style="margin: 0; color: #666;">${details}</p>
            </div>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects" 
                 style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Посмотреть проект
              </a>
            </div>
          </div>
        `,
        text: `Обновление проекта ${projectName}: ${updateType} - ${details}.`
      }),

      // Уведомление от Василия AI
      vasilyNotification: (userName: string, message: string, actionType: string): EmailTemplate => ({
        subject: `🤖 Василий: ${actionType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Сообщение от Василия AI</h1>
            <p>Привет, ${userName}!</p>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">${actionType}</h3>
              <p style="margin: 0; color: #666;">${message}</p>
            </div>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/ai" 
                 style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Поговорить с Василием
              </a>
            </div>
          </div>
        `,
        text: `Василий AI: ${actionType} - ${message}.`
      }),

      // Еженедельный отчет
      weeklyReport: (userName: string, workspaceName: string, reportData: any): EmailTemplate => ({
        subject: `📊 Еженедельный отчет - ${workspaceName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Еженедельный отчет</h1>
            <p>Привет, ${userName}!</p>
            <p>Вот что происходило в <strong>${workspaceName}</strong> на этой неделе:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1a1a1a;">Статистика</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <p style="margin: 0; font-size: 24px; font-weight: bold; color: #10b981;">${reportData.completedTasks || 0}</p>
                  <p style="margin: 0; color: #666;">Задач завершено</p>
                </div>
                <div>
                  <p style="margin: 0; font-size: 24px; font-weight: bold; color: #6366f1;">${reportData.activeProjects || 0}</p>
                  <p style="margin: 0; color: #666;">Активных проектов</p>
                </div>
                <div>
                  <p style="margin: 0; font-size: 24px; font-weight: bold; color: #f59e0b;">${reportData.teamMembers || 0}</p>
                  <p style="margin: 0; color: #666;">Участников команды</p>
                </div>
                <div>
                  <p style="margin: 0; font-size: 24px; font-weight: bold; color: #8b5cf6;">${reportData.aiActions || 0}</p>
                  <p style="margin: 0; color: #666;">AI действий</p>
                </div>
              </div>
            </div>
            
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Открыть дашборд
              </a>
            </div>
          </div>
        `,
        text: `Еженедельный отчет для ${workspaceName}: ${reportData.completedTasks} задач завершено, ${reportData.activeProjects} активных проектов.`
      })
    };
  }

  // Массовая отправка
  async sendBulkEmails(
    template: EmailTemplate,
    recipients: Array<{ email: string; data: any }>,
    options: Omit<EmailOptions, 'to'> = {}
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        const personalizedTemplate = this.personalizeTemplate(template, recipient.data);
        const success = await this.sendEmail(personalizedTemplate, {
          ...options,
          to: recipient.email
        });
        
        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        LoggerService.error.error('Bulk email failed', {
          error: error.message,
          email: recipient.email
        });
      }
    }

    LoggerService.api.info('Bulk email completed', { sent, failed, total: recipients.length });
    return { sent, failed };
  }

  // Персонализация шаблона
  private personalizeTemplate(template: EmailTemplate, data: any): EmailTemplate {
    let html = template.html;
    let text = template.text || '';
    let subject = template.subject;

    // Заменяем плейсхолдеры
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
      text = text.replace(new RegExp(placeholder, 'g'), String(value));
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return { html, text, subject };
  }

  // Проверка статуса сервиса
  async healthCheck(): Promise<{ status: string; latency: number }> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        return { status: 'unhealthy', latency: -1 };
      }
    }

    try {
      const start = Date.now();
      await this.transporter!.verify();
      const latency = Date.now() - start;
      
      return { status: 'healthy', latency };
    } catch (error) {
      return { status: 'unhealthy', latency: -1 };
    }
  }
}

// Экспорт сервиса
export const emailService = new EmailService();
