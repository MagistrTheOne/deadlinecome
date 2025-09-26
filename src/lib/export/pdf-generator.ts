import { LoggerService } from '@/lib/logger';

interface PDFOptions {
  title: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageSize?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

interface TableColumn {
  header: string;
  dataKey: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

interface TableData {
  columns: TableColumn[];
  rows: any[];
}

class PDFGenerator {
  private options: PDFOptions;

  constructor(options: PDFOptions = { title: 'Document' }) {
    this.options = {
      author: 'DeadLine',
      subject: 'Project Report',
      creator: 'DeadLine Export Service',
      producer: 'DeadLine',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      pageSize: 'A4',
      orientation: 'portrait',
      ...options
    };
  }

  // Генерация PDF отчета по проекту
  async generateProjectReport(projectData: any): Promise<Buffer> {
    try {
      // Динамический импорт puppeteer
      const puppeteer = await import('puppeteer');
      
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Устанавливаем размер страницы
      await page.setViewport({
        width: this.options.orientation === 'landscape' ? 1024 : 768,
        height: this.options.orientation === 'landscape' ? 768 : 1024
      });

      // Генерируем HTML контент
      const html = this.generateProjectReportHTML(projectData);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Генерируем PDF
      const pdfBuffer = await page.pdf({
        format: this.options.pageSize,
        printBackground: true,
        margin: this.options.margins,
        displayHeaderFooter: true,
        headerTemplate: this.getHeaderTemplate(),
        footerTemplate: this.getFooterTemplate(),
        preferCSSPageSize: true
      });

      await browser.close();

      LoggerService.api.info('PDF project report generated', {
        projectId: projectData.id,
        size: pdfBuffer.length
      });

      return pdfBuffer;
    } catch (error: any) {
      LoggerService.error.error('Failed to generate PDF project report', {
        error: error.message,
        projectId: projectData.id
      });
      throw error;
    }
  }

  // Генерация PDF отчета по задачам
  async generateTasksReport(tasksData: any[]): Promise<Buffer> {
    try {
      const puppeteer = await import('puppeteer');
      
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1024, height: 768 });

      const html = this.generateTasksReportHTML(tasksData);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: this.options.pageSize,
        printBackground: true,
        margin: this.options.margins,
        displayHeaderFooter: true,
        headerTemplate: this.getHeaderTemplate(),
        footerTemplate: this.getFooterTemplate()
      });

      await browser.close();

      LoggerService.api.info('PDF tasks report generated', {
        tasksCount: tasksData.length,
        size: pdfBuffer.length
      });

      return pdfBuffer;
    } catch (error: any) {
      LoggerService.error.error('Failed to generate PDF tasks report', {
        error: error.message,
        tasksCount: tasksData.length
      });
      throw error;
    }
  }

  // Генерация PDF отчета по команде
  async generateTeamReport(teamData: any): Promise<Buffer> {
    try {
      const puppeteer = await import('puppeteer');
      
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1024, height: 768 });

      const html = this.generateTeamReportHTML(teamData);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: this.options.pageSize,
        printBackground: true,
        margin: this.options.margins,
        displayHeaderFooter: true,
        headerTemplate: this.getHeaderTemplate(),
        footerTemplate: this.getFooterTemplate()
      });

      await browser.close();

      LoggerService.api.info('PDF team report generated', {
        teamSize: teamData.members?.length || 0,
        size: pdfBuffer.length
      });

      return pdfBuffer;
    } catch (error: any) {
      LoggerService.error.error('Failed to generate PDF team report', {
        error: error.message
      });
      throw error;
    }
  }

  // HTML для отчета по проекту
  private generateProjectReportHTML(projectData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${this.options.title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #1a1a1a;
            background: #ffffff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #6366f1;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .project-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .project-info h2 {
            color: #1a1a1a;
            margin: 0 0 15px 0;
            font-size: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value {
            color: #1a1a1a;
            font-size: 14px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #6366f1;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
            margin: 0;
          }
          .stat-label {
            color: #666;
            font-size: 12px;
            margin: 5px 0 0 0;
            text-transform: uppercase;
          }
          .tasks-section {
            margin-top: 30px;
          }
          .tasks-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .tasks-table th,
          .tasks-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .tasks-table th {
            background: #f8f9fa;
            font-weight: bold;
            color: #1a1a1a;
            font-size: 12px;
            text-transform: uppercase;
          }
          .tasks-table td {
            font-size: 14px;
          }
          .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-todo { background: #fef3c7; color: #92400e; }
          .status-in-progress { background: #dbeafe; color: #1e40af; }
          .status-done { background: #d1fae5; color: #065f46; }
          .priority-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .priority-lowest { background: #f3f4f6; color: #374151; }
          .priority-low { background: #dbeafe; color: #1e40af; }
          .priority-medium { background: #fef3c7; color: #92400e; }
          .priority-high { background: #fed7aa; color: #c2410c; }
          .priority-highest { background: #fecaca; color: #dc2626; }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${projectData.name || 'Отчет по проекту'}</h1>
          <p>Сгенерировано ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div class="project-info">
          <h2>Информация о проекте</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Название</div>
              <div class="info-value">${projectData.name || 'Не указано'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Описание</div>
              <div class="info-value">${projectData.description || 'Не указано'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Статус</div>
              <div class="info-value">${projectData.status || 'Активный'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Руководитель</div>
              <div class="info-value">${projectData.lead?.name || 'Не назначен'}</div>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${projectData.totalTasks || 0}</div>
            <div class="stat-label">Всего задач</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${projectData.completedTasks || 0}</div>
            <div class="stat-label">Завершено</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${projectData.inProgressTasks || 0}</div>
            <div class="stat-label">В работе</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${projectData.teamMembers || 0}</div>
            <div class="stat-label">Участников</div>
          </div>
        </div>

        ${projectData.tasks && projectData.tasks.length > 0 ? `
          <div class="tasks-section">
            <h2>Задачи проекта</h2>
            <table class="tasks-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Статус</th>
                  <th>Приоритет</th>
                  <th>Исполнитель</th>
                  <th>Создана</th>
                </tr>
              </thead>
              <tbody>
                ${projectData.tasks.map((task: any) => `
                  <tr>
                    <td>${task.title || 'Без названия'}</td>
                    <td><span class="status-badge status-${task.status?.toLowerCase().replace('_', '-') || 'todo'}">${task.status || 'TODO'}</span></td>
                    <td><span class="priority-badge priority-${task.priority?.toLowerCase() || 'medium'}">${task.priority || 'MEDIUM'}</span></td>
                    <td>${task.assignee?.name || 'Не назначен'}</td>
                    <td>${task.createdAt ? new Date(task.createdAt).toLocaleDateString('ru-RU') : 'Не указано'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="footer">
          <p>Отчет сгенерирован системой DeadLine • ${new Date().toLocaleString('ru-RU')}</p>
        </div>
      </body>
      </html>
    `;
  }

  // HTML для отчета по задачам
  private generateTasksReportHTML(tasksData: any[]): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Отчет по задачам</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #1a1a1a;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #6366f1;
            margin: 0;
            font-size: 28px;
          }
          .tasks-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .tasks-table th,
          .tasks-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .tasks-table th {
            background: #f8f9fa;
            font-weight: bold;
            color: #1a1a1a;
            font-size: 12px;
            text-transform: uppercase;
          }
          .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-todo { background: #fef3c7; color: #92400e; }
          .status-in-progress { background: #dbeafe; color: #1e40af; }
          .status-done { background: #d1fae5; color: #065f46; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Отчет по задачам</h1>
          <p>Всего задач: ${tasksData.length} • Сгенерировано ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <table class="tasks-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Проект</th>
              <th>Статус</th>
              <th>Приоритет</th>
              <th>Исполнитель</th>
              <th>Создана</th>
            </tr>
          </thead>
          <tbody>
            ${tasksData.map((task: any) => `
              <tr>
                <td>${task.title || 'Без названия'}</td>
                <td>${task.project?.name || 'Не указан'}</td>
                <td><span class="status-badge status-${task.status?.toLowerCase().replace('_', '-') || 'todo'}">${task.status || 'TODO'}</span></td>
                <td>${task.priority || 'MEDIUM'}</td>
                <td>${task.assignee?.name || 'Не назначен'}</td>
                <td>${task.createdAt ? new Date(task.createdAt).toLocaleDateString('ru-RU') : 'Не указано'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  // HTML для отчета по команде
  private generateTeamReportHTML(teamData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Отчет по команде</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #1a1a1a;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #6366f1;
            margin: 0;
            font-size: 28px;
          }
          .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .member-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #6366f1;
          }
          .member-name {
            font-size: 18px;
            font-weight: bold;
            color: #1a1a1a;
            margin: 0 0 10px 0;
          }
          .member-role {
            color: #6366f1;
            font-size: 14px;
            margin: 0 0 15px 0;
          }
          .member-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-number {
            font-size: 20px;
            font-weight: bold;
            color: #6366f1;
            margin: 0;
          }
          .stat-label {
            color: #666;
            font-size: 12px;
            margin: 5px 0 0 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Отчет по команде</h1>
          <p>Участников: ${teamData.members?.length || 0} • Сгенерировано ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div class="team-grid">
          ${(teamData.members || []).map((member: any) => `
            <div class="member-card">
              <div class="member-name">${member.name || 'Не указано'}</div>
              <div class="member-role">${member.role || 'Участник'}</div>
              <div class="member-stats">
                <div class="stat-item">
                  <div class="stat-number">${member.completedTasks || 0}</div>
                  <div class="stat-label">Задач завершено</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">${member.activeTasks || 0}</div>
                  <div class="stat-label">Активных задач</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
  }

  // Шаблон заголовка
  private getHeaderTemplate(): string {
    return `
      <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0 20px;">
        <span>${this.options.title}</span>
      </div>
    `;
  }

  // Шаблон подвала
  private getFooterTemplate(): string {
    return `
      <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0 20px;">
        <span>Страница <span class="pageNumber"></span> из <span class="totalPages"></span></span>
        <span style="float: right;">${new Date().toLocaleDateString('ru-RU')}</span>
      </div>
    `;
  }
}

// Экспорт генератора
export const pdfGenerator = new PDFGenerator();
