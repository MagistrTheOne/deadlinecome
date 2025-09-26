import { LoggerService } from '@/lib/logger';

interface ExcelOptions {
  sheetName?: string;
  title?: string;
  author?: string;
  company?: string;
}

interface ExcelColumn {
  header: string;
  dataKey: string;
  width?: number;
  type?: 'string' | 'number' | 'date' | 'boolean';
  format?: string;
}

interface ExcelSheet {
  name: string;
  columns: ExcelColumn[];
  data: any[];
}

class ExcelGenerator {
  private options: ExcelOptions;

  constructor(options: ExcelOptions = {}) {
    this.options = {
      sheetName: 'Sheet1',
      title: 'DeadLine Export',
      author: 'DeadLine',
      company: 'DeadLine',
      ...options
    };
  }

  // Генерация Excel отчета по проекту
  async generateProjectReport(projectData: any): Promise<Buffer> {
    try {
      // Динамический импорт xlsx
      const XLSX = await import('xlsx');

      // Создаем рабочую книгу
      const workbook = XLSX.utils.book_new();

      // Лист с информацией о проекте
      const projectInfo = [
        ['Название', projectData.name || 'Не указано'],
        ['Описание', projectData.description || 'Не указано'],
        ['Статус', projectData.status || 'Активный'],
        ['Руководитель', projectData.lead?.name || 'Не назначен'],
        ['Дата создания', projectData.createdAt ? new Date(projectData.createdAt).toLocaleDateString('ru-RU') : 'Не указано'],
        ['Всего задач', projectData.totalTasks || 0],
        ['Завершено', projectData.completedTasks || 0],
        ['В работе', projectData.inProgressTasks || 0],
        ['Участников', projectData.teamMembers || 0]
      ];

      const projectSheet = XLSX.utils.aoa_to_sheet([
        ['Информация о проекте'],
        [],
        ...projectInfo
      ]);

      // Настройка ширины колонок
      projectSheet['!cols'] = [
        { width: 20 },
        { width: 40 }
      ];

      XLSX.utils.book_append_sheet(workbook, projectSheet, 'Информация о проекте');

      // Лист с задачами
      if (projectData.tasks && projectData.tasks.length > 0) {
        const tasksData = projectData.tasks.map((task: any) => [
          task.title || 'Без названия',
          task.status || 'TODO',
          task.priority || 'MEDIUM',
          task.assignee?.name || 'Не назначен',
          task.reporter?.name || 'Не указан',
          task.createdAt ? new Date(task.createdAt).toLocaleDateString('ru-RU') : 'Не указано',
          task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('ru-RU') : 'Не указано'
        ]);

        const tasksSheet = XLSX.utils.aoa_to_sheet([
          ['Название', 'Статус', 'Приоритет', 'Исполнитель', 'Создатель', 'Дата создания', 'Дата обновления'],
          ...tasksData
        ]);

        // Настройка ширины колонок
        tasksSheet['!cols'] = [
          { width: 30 },
          { width: 15 },
          { width: 15 },
          { width: 20 },
          { width: 20 },
          { width: 15 },
          { width: 15 }
        ];

        XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Задачи');
      }

      // Лист со статистикой
      const statsData = [
        ['Метрика', 'Значение'],
        ['Всего задач', projectData.totalTasks || 0],
        ['Завершено', projectData.completedTasks || 0],
        ['В работе', projectData.inProgressTasks || 0],
        ['В очереди', (projectData.totalTasks || 0) - (projectData.completedTasks || 0) - (projectData.inProgressTasks || 0)],
        ['Процент завершения', projectData.totalTasks > 0 ? Math.round(((projectData.completedTasks || 0) / projectData.totalTasks) * 100) + '%' : '0%'],
        ['Участников команды', projectData.teamMembers || 0]
      ];

      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      statsSheet['!cols'] = [
        { width: 25 },
        { width: 15 }
      ];

      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Статистика');

      // Генерируем буфер
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      LoggerService.api.info('Excel project report generated', {
        projectId: projectData.id,
        size: excelBuffer.length
      });

      return excelBuffer;
    } catch (error: any) {
      LoggerService.error.error('Failed to generate Excel project report', {
        error: error.message,
        projectId: projectData.id
      });
      throw error;
    }
  }

  // Генерация Excel отчета по задачам
  async generateTasksReport(tasksData: any[]): Promise<Buffer> {
    try {
      const XLSX = await import('xlsx');

      const workbook = XLSX.utils.book_new();

      // Основной лист с задачами
      const tasksSheetData = tasksData.map((task: any) => [
        task.title || 'Без названия',
        task.project?.name || 'Не указан',
        task.status || 'TODO',
        task.priority || 'MEDIUM',
        task.type || 'TASK',
        task.assignee?.name || 'Не назначен',
        task.reporter?.name || 'Не указан',
        task.createdAt ? new Date(task.createdAt).toLocaleDateString('ru-RU') : 'Не указано',
        task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('ru-RU') : 'Не указано',
        task.description || ''
      ]);

      const tasksSheet = XLSX.utils.aoa_to_sheet([
        ['Название', 'Проект', 'Статус', 'Приоритет', 'Тип', 'Исполнитель', 'Создатель', 'Дата создания', 'Дата обновления', 'Описание'],
        ...tasksSheetData
      ]);

      // Настройка ширины колонок
      tasksSheet['!cols'] = [
        { width: 30 },
        { width: 20 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 20 },
        { width: 20 },
        { width: 15 },
        { width: 15 },
        { width: 40 }
      ];

      XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Задачи');

      // Лист со статистикой
      const statusCounts = this.countByField(tasksData, 'status');
      const priorityCounts = this.countByField(tasksData, 'priority');
      const assigneeCounts = this.countByField(tasksData, 'assignee.name');

      const statsData = [
        ['Статистика по статусам'],
        ['Статус', 'Количество'],
        ...Object.entries(statusCounts).map(([status, count]) => [status, count]),
        [],
        ['Статистика по приоритетам'],
        ['Приоритет', 'Количество'],
        ...Object.entries(priorityCounts).map(([priority, count]) => [priority, count]),
        [],
        ['Статистика по исполнителям'],
        ['Исполнитель', 'Количество'],
        ...Object.entries(assigneeCounts).map(([assignee, count]) => [assignee, count])
      ];

      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      statsSheet['!cols'] = [
        { width: 25 },
        { width: 15 }
      ];

      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Статистика');

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      LoggerService.api.info('Excel tasks report generated', {
        tasksCount: tasksData.length,
        size: excelBuffer.length
      });

      return excelBuffer;
    } catch (error: any) {
      LoggerService.error.error('Failed to generate Excel tasks report', {
        error: error.message,
        tasksCount: tasksData.length
      });
      throw error;
    }
  }

  // Генерация Excel отчета по команде
  async generateTeamReport(teamData: any): Promise<Buffer> {
    try {
      const XLSX = await import('xlsx');

      const workbook = XLSX.utils.book_new();

      // Лист с участниками команды
      const membersData = (teamData.members || []).map((member: any) => [
        member.name || 'Не указано',
        member.email || 'Не указан',
        member.role || 'Участник',
        member.itRole || 'Не указана',
        member.completedTasks || 0,
        member.activeTasks || 0,
        member.totalHours || 0,
        member.lastActive ? new Date(member.lastActive).toLocaleDateString('ru-RU') : 'Не указано'
      ]);

      const membersSheet = XLSX.utils.aoa_to_sheet([
        ['Имя', 'Email', 'Роль', 'IT-роль', 'Завершено задач', 'Активных задач', 'Часов работы', 'Последняя активность'],
        ...membersData
      ]);

      membersSheet['!cols'] = [
        { width: 25 },
        { width: 30 },
        { width: 20 },
        { width: 20 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 20 }
      ];

      XLSX.utils.book_append_sheet(workbook, membersSheet, 'Участники команды');

      // Лист со статистикой команды
      const teamStats = [
        ['Метрика', 'Значение'],
        ['Всего участников', teamData.members?.length || 0],
        ['Активных участников', teamData.activeMembers || 0],
        ['Всего задач', teamData.totalTasks || 0],
        ['Завершено задач', teamData.completedTasks || 0],
        ['В работе задач', teamData.inProgressTasks || 0],
        ['Средняя производительность', teamData.avgProductivity || '0%'],
        ['Общее время работы', teamData.totalHours || 0]
      ];

      const statsSheet = XLSX.utils.aoa_to_sheet(teamStats);
      statsSheet['!cols'] = [
        { width: 25 },
        { width: 15 }
      ];

      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Статистика команды');

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      LoggerService.api.info('Excel team report generated', {
        teamSize: teamData.members?.length || 0,
        size: excelBuffer.length
      });

      return excelBuffer;
    } catch (error: any) {
      LoggerService.error.error('Failed to generate Excel team report', {
        error: error.message
      });
      throw error;
    }
  }

  // Генерация Excel отчета по времени
  async generateTimeReport(timeData: any[]): Promise<Buffer> {
    try {
      const XLSX = await import('xlsx');

      const workbook = XLSX.utils.book_new();

      // Лист с данными по времени
      const timeSheetData = timeData.map((entry: any) => [
        entry.user?.name || 'Не указан',
        entry.project?.name || 'Не указан',
        entry.task?.title || 'Не указана',
        entry.date ? new Date(entry.date).toLocaleDateString('ru-RU') : 'Не указано',
        entry.startTime || 'Не указано',
        entry.endTime || 'Не указано',
        entry.duration || 0,
        entry.description || ''
      ]);

      const timeSheet = XLSX.utils.aoa_to_sheet([
        ['Пользователь', 'Проект', 'Задача', 'Дата', 'Начало', 'Конец', 'Длительность (часы)', 'Описание'],
        ...timeSheetData
      ]);

      timeSheet['!cols'] = [
        { width: 20 },
        { width: 25 },
        { width: 30 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 20 },
        { width: 40 }
      ];

      XLSX.utils.book_append_sheet(workbook, timeSheet, 'Учет времени');

      // Лист со статистикой по времени
      const userStats = this.calculateUserTimeStats(timeData);
      const projectStats = this.calculateProjectTimeStats(timeData);

      const userStatsData = [
        ['Статистика по пользователям'],
        ['Пользователь', 'Часов работы', 'Задач выполнено'],
        ...userStats.map(stat => [stat.user, stat.totalHours, stat.tasksCount])
      ];

      const userStatsSheet = XLSX.utils.aoa_to_sheet(userStatsData);
      userStatsSheet['!cols'] = [
        { width: 25 },
        { width: 15 },
        { width: 15 }
      ];

      XLSX.utils.book_append_sheet(workbook, userStatsSheet, 'Статистика пользователей');

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      LoggerService.api.info('Excel time report generated', {
        entriesCount: timeData.length,
        size: excelBuffer.length
      });

      return excelBuffer;
    } catch (error: any) {
      LoggerService.error.error('Failed to generate Excel time report', {
        error: error.message,
        entriesCount: timeData.length
      });
      throw error;
    }
  }

  // Подсчет по полю
  private countByField(data: any[], field: string): Record<string, number> {
    const counts: Record<string, number> = {};
    
    data.forEach(item => {
      const value = this.getNestedValue(item, field) || 'Не указано';
      counts[value] = (counts[value] || 0) + 1;
    });

    return counts;
  }

  // Получение вложенного значения
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Расчет статистики по пользователям
  private calculateUserTimeStats(timeData: any[]): any[] {
    const userStats: Record<string, { totalHours: number; tasksCount: number }> = {};

    timeData.forEach(entry => {
      const userName = entry.user?.name || 'Не указан';
      if (!userStats[userName]) {
        userStats[userName] = { totalHours: 0, tasksCount: 0 };
      }
      userStats[userName].totalHours += entry.duration || 0;
      userStats[userName].tasksCount += 1;
    });

    return Object.entries(userStats).map(([user, stats]) => ({
      user,
      totalHours: stats.totalHours,
      tasksCount: stats.tasksCount
    }));
  }

  // Расчет статистики по проектам
  private calculateProjectTimeStats(timeData: any[]): any[] {
    const projectStats: Record<string, { totalHours: number; tasksCount: number }> = {};

    timeData.forEach(entry => {
      const projectName = entry.project?.name || 'Не указан';
      if (!projectStats[projectName]) {
        projectStats[projectName] = { totalHours: 0, tasksCount: 0 };
      }
      projectStats[projectName].totalHours += entry.duration || 0;
      projectStats[projectName].tasksCount += 1;
    });

    return Object.entries(projectStats).map(([project, stats]) => ({
      project,
      totalHours: stats.totalHours,
      tasksCount: stats.tasksCount
    }));
  }
}

// Экспорт генератора
export const excelGenerator = new ExcelGenerator();
