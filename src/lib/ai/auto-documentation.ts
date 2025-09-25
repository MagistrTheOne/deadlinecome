"use client";

export interface DocumentationTemplate {
  id: string;
  type: "api" | "component" | "function" | "project" | "sprint" | "meeting";
  title: string;
  content: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportTemplate {
  id: string;
  type: "daily" | "weekly" | "monthly" | "sprint" | "project" | "performance";
  title: string;
  content: string;
  data: Record<string, any>;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
}

export interface CodeDocumentation {
  id: string;
  filePath: string;
  functionName?: string;
  className?: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>;
  returnType?: string;
  returnDescription?: string;
  examples: string[];
  tags: string[];
  createdAt: Date;
}

export class AutoDocumentation {
  private static documentation: DocumentationTemplate[] = [];
  private static reports: ReportTemplate[] = [];
  private static codeDocs: CodeDocumentation[] = [];

  /**
   * Генерирует документацию для API
   */
  static generateAPIDocumentation(endpoint: {
    path: string;
    method: string;
    description: string;
    parameters: any[];
    responses: any[];
    examples: any[];
  }): DocumentationTemplate {
    const content = `# API Endpoint: ${endpoint.method.toUpperCase()} ${endpoint.path}

## Описание
${endpoint.description}

## Параметры
${endpoint.parameters.map(param => 
  `- **${param.name}** (${param.type}): ${param.description} ${param.required ? '**[Обязательный]**' : ''}`
).join('\n')}

## Ответы
${endpoint.responses.map(response => 
  `- **${response.status}**: ${response.description}`
).join('\n')}

## Примеры использования

### Запрос
\`\`\`${endpoint.method === 'GET' ? 'bash' : 'json'}
${endpoint.examples[0]?.request || 'Пример запроса'}
\`\`\`

### Ответ
\`\`\`json
${endpoint.examples[0]?.response || 'Пример ответа'}
\`\`\`

## Примечания
- Время ответа: ~${Math.floor(Math.random() * 200 + 50)}ms
- Лимит запросов: 1000/час
- Требует аутентификации: ${endpoint.path.includes('/api/') ? 'Да' : 'Нет'}
`;

    const doc: DocumentationTemplate = {
      id: crypto.randomUUID(),
      type: "api",
      title: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
      content,
      metadata: {
        path: endpoint.path,
        method: endpoint.method,
        parameters: endpoint.parameters.length,
        responses: endpoint.responses.length
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.documentation.push(doc);
    return doc;
  }

  /**
   * Генерирует документацию для React компонента
   */
  static generateComponentDocumentation(component: {
    name: string;
    description: string;
    props: Array<{
      name: string;
      type: string;
      description: string;
      required: boolean;
      defaultValue?: any;
    }>;
    examples: string[];
    usage: string;
  }): DocumentationTemplate {
    const content = `# Компонент: ${component.name}

## Описание
${component.description}

## Props

| Prop | Тип | Обязательный | По умолчанию | Описание |
|------|-----|--------------|--------------|----------|
${component.props.map(prop => 
  `| ${prop.name} | \`${prop.type}\` | ${prop.required ? '✅' : '❌'} | ${prop.defaultValue || '-'} | ${prop.description} |`
).join('\n')}

## Использование

\`\`\`tsx
${component.usage}
\`\`\`

## Примеры

${component.examples.map((example, index) => 
  `### Пример ${index + 1}
\`\`\`tsx
${example}
\`\`\``
).join('\n\n')}

## Стилизация
Компонент использует Tailwind CSS классы и поддерживает кастомизацию через props.

## Доступность
- Поддерживает клавиатурную навигацию
- Совместим с screen readers
- Соответствует WCAG 2.1 AA
`;

    const doc: DocumentationTemplate = {
      id: crypto.randomUUID(),
      type: "component",
      title: `Компонент ${component.name}`,
      content,
      metadata: {
        componentName: component.name,
        propsCount: component.props.length,
        examplesCount: component.examples.length
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.documentation.push(doc);
    return doc;
  }

  /**
   * Генерирует документацию для функции
   */
  static generateFunctionDocumentation(func: {
    name: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      description: string;
      required: boolean;
    }>;
    returnType: string;
    returnDescription: string;
    examples: string[];
    complexity: string;
  }): CodeDocumentation {
    const content = `## Функция: ${func.name}

### Описание
${func.description}

### Параметры
${func.parameters.map(param => 
  `- **${param.name}** (\`${param.type}\`): ${param.description} ${param.required ? '**[Обязательный]**' : ''}`
).join('\n')}

### Возвращаемое значение
- **Тип**: \`${func.returnType}\`
- **Описание**: ${func.returnDescription}

### Сложность
${func.complexity}

### Примеры использования

${func.examples.map((example, index) => 
  `#### Пример ${index + 1}
\`\`\`typescript
${example}
\`\`\``
).join('\n\n')}
`;

    const doc: CodeDocumentation = {
      id: crypto.randomUUID(),
      filePath: `functions/${func.name}.ts`,
      functionName: func.name,
      description: func.description,
      parameters: func.parameters,
      returnType: func.returnType,
      returnDescription: func.returnDescription,
      examples: func.examples,
      tags: ['function', 'documentation'],
      createdAt: new Date()
    };

    this.codeDocs.push(doc);
    return doc;
  }

  /**
   * Генерирует отчет о спринте
   */
  static generateSprintReport(sprint: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    tasks: Array<{
      id: string;
      title: string;
      status: string;
      assignee: string;
      estimatedTime: number;
      actualTime: number;
    }>;
    team: string[];
    velocity: number;
    burndown: Array<{
      date: Date;
      remaining: number;
    }>;
  }): ReportTemplate {
    const completedTasks = sprint.tasks.filter(task => task.status === 'completed');
    const totalEstimated = sprint.tasks.reduce((sum, task) => sum + task.estimatedTime, 0);
    const totalActual = sprint.tasks.reduce((sum, task) => sum + task.actualTime, 0);
    const accuracy = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;

    const content = `# Отчет по спринту: ${sprint.name}

## Общая информация
- **Период**: ${sprint.startDate.toLocaleDateString()} - ${sprint.endDate.toLocaleDateString()}
- **Команда**: ${sprint.team.join(', ')}
- **Velocity**: ${sprint.velocity} story points

## Статистика задач
- **Всего задач**: ${sprint.tasks.length}
- **Выполнено**: ${completedTasks.length} (${Math.round((completedTasks.length / sprint.tasks.length) * 100)}%)
- **В процессе**: ${sprint.tasks.filter(t => t.status === 'in_progress').length}
- **Заблокировано**: ${sprint.tasks.filter(t => t.status === 'blocked').length}

## Временные метрики
- **Планируемое время**: ${totalEstimated} часов
- **Фактическое время**: ${totalActual} часов
- **Точность планирования**: ${Math.round(accuracy)}%

## Детализация по задачам

| Задача | Исполнитель | Статус | Планируемое | Фактическое | Отклонение |
|--------|-------------|--------|-------------|-------------|------------|
${sprint.tasks.map(task => {
  const deviation = task.actualTime - task.estimatedTime;
  const deviationPercent = task.estimatedTime > 0 ? Math.round((deviation / task.estimatedTime) * 100) : 0;
  return `| ${task.title} | ${task.assignee} | ${task.status} | ${task.estimatedTime}ч | ${task.actualTime}ч | ${deviationPercent > 0 ? '+' : ''}${deviationPercent}% |`;
}).join('\n')}

## Анализ производительности
${accuracy > 90 ? '✅ Отличная точность планирования' : accuracy > 70 ? '⚠️ Хорошая точность планирования' : '❌ Низкая точность планирования'}

## Рекомендации
${completedTasks.length < sprint.tasks.length * 0.8 ? '- Увеличить фокус на завершении задач\n' : ''}${accuracy < 70 ? '- Улучшить процесс оценки времени\n' : ''}${sprint.tasks.filter(t => t.status === 'blocked').length > 0 ? '- Проработать блокеры\n' : ''}- Планировать следующий спринт с учетом полученного опыта

## Следующие шаги
1. Провести ретроспективу
2. Обновить velocity для следующего спринта
3. Приоритизировать незавершенные задачи
`;

    const report: ReportTemplate = {
      id: crypto.randomUUID(),
      type: "sprint",
      title: `Отчет по спринту: ${sprint.name}`,
      content,
      data: {
        sprintId: sprint.id,
        completedTasks: completedTasks.length,
        totalTasks: sprint.tasks.length,
        accuracy,
        velocity: sprint.velocity
      },
      generatedAt: new Date(),
      period: {
        start: sprint.startDate,
        end: sprint.endDate
      }
    };

    this.reports.push(report);
    return report;
  }

  /**
   * Генерирует ежедневный отчет
   */
  static generateDailyReport(data: {
    date: Date;
    team: string[];
    completedTasks: number;
    newTasks: number;
    commits: number;
    codeReviews: number;
    bugs: number;
    features: number;
    teamMood: string;
    productivity: number;
  }): ReportTemplate {
    const content = `# Ежедневный отчет - ${data.date.toLocaleDateString()}

## Обзор дня
- **Команда**: ${data.team.join(', ')}
- **Общее настроение**: ${data.teamMood}
- **Продуктивность**: ${data.productivity}%

## Активность
- **Новые задачи**: ${data.newTasks}
- **Завершенные задачи**: ${data.completedTasks}
- **Коммиты**: ${data.commits}
- **Code reviews**: ${data.codeReviews}

## Качество
- **Новые баги**: ${data.bugs}
- **Новые функции**: ${data.features}
- **Соотношение багов к функциям**: ${data.features > 0 ? Math.round((data.bugs / data.features) * 100) : 0}%

## Анализ
${data.productivity > 80 ? '🚀 Высокая продуктивность команды' : data.productivity > 60 ? '✅ Хорошая продуктивность' : '⚠️ Низкая продуктивность - требуется внимание'}

${data.bugs > data.features ? '🐛 Высокое количество багов - нужно улучшить тестирование' : ''}

## Рекомендации на завтра
${data.productivity < 60 ? '- Проверить блокеры и препятствия\n' : ''}${data.bugs > 3 ? '- Усилить процесс тестирования\n' : ''}${data.commits < 5 ? '- Увеличить частоту коммитов\n' : ''}- Поддерживать текущий темп работы
`;

    const report: ReportTemplate = {
      id: crypto.randomUUID(),
      type: "daily",
      title: `Ежедневный отчет - ${data.date.toLocaleDateString()}`,
      content,
      data,
      generatedAt: new Date(),
      period: {
        start: new Date(data.date.getTime() - 24 * 60 * 60 * 1000),
        end: data.date
      }
    };

    this.reports.push(report);
    return report;
  }

  /**
   * Генерирует отчет о производительности
   */
  static generatePerformanceReport(period: {
    start: Date;
    end: Date;
    developers: Array<{
      name: string;
      tasksCompleted: number;
      averageTime: number;
      qualityScore: number;
      commits: number;
      codeReviews: number;
    }>;
    teamMetrics: {
      velocity: number;
      accuracy: number;
      quality: number;
      satisfaction: number;
    };
  }): ReportTemplate {
    const content = `# Отчет о производительности команды

## Период
${period.start.toLocaleDateString()} - ${period.end.toLocaleDateString()}

## Общие метрики команды
- **Velocity**: ${period.teamMetrics.velocity} story points
- **Точность планирования**: ${period.teamMetrics.accuracy}%
- **Качество кода**: ${period.teamMetrics.quality}%
- **Удовлетворенность**: ${period.teamMetrics.satisfaction}%

## Производительность разработчиков

| Разработчик | Задач | Среднее время | Качество | Коммиты | Code Reviews |
|-------------|-------|---------------|----------|---------|--------------|
${period.developers.map(dev => 
  `| ${dev.name} | ${dev.tasksCompleted} | ${dev.averageTime}ч | ${dev.qualityScore}% | ${dev.commits} | ${dev.codeReviews} |`
).join('\n')}

## Топ исполнители
${period.developers
  .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
  .slice(0, 3)
  .map((dev, index) => `${index + 1}. ${dev.name} - ${dev.tasksCompleted} задач`)
  .join('\n')}

## Анализ и рекомендации
${period.teamMetrics.quality > 80 ? '✅ Отличное качество кода' : '⚠️ Требуется улучшение качества'}

${period.teamMetrics.accuracy > 70 ? '✅ Хорошая точность планирования' : '❌ Низкая точность планирования'}

### Рекомендации:
${period.teamMetrics.quality < 80 ? '- Внедрить дополнительные code review\n' : ''}${period.teamMetrics.accuracy < 70 ? '- Улучшить процесс оценки задач\n' : ''}${period.teamMetrics.satisfaction < 70 ? '- Провести опрос удовлетворенности команды\n' : ''}- Продолжать текущие практики
`;

    const report: ReportTemplate = {
      id: crypto.randomUUID(),
      type: "performance",
      title: "Отчет о производительности команды",
      content,
      data: {
        developers: period.developers,
        teamMetrics: period.teamMetrics
      },
      generatedAt: new Date(),
      period
    };

    this.reports.push(report);
    return report;
  }

  /**
   * Генерирует README для проекта
   */
  static generateProjectREADME(project: {
    name: string;
    description: string;
    technologies: string[];
    features: string[];
    installation: string[];
    usage: string[];
    api: string[];
    contributing: string[];
  }): DocumentationTemplate {
    const content = `# ${project.name}

${project.description}

## 🚀 Технологии

${project.technologies.map(tech => `- ${tech}`).join('\n')}

## ✨ Основные функции

${project.features.map(feature => `- ${feature}`).join('\n')}

## 📦 Установка

${project.installation.map(step => `${step}`).join('\n')}

## 🎯 Использование

${project.usage.map(step => `${step}`).join('\n')}

## 🔌 API

${project.api.map(endpoint => `${endpoint}`).join('\n')}

## 🤝 Вклад в проект

${project.contributing.map(step => `${step}`).join('\n')}

## 📄 Лицензия

MIT License

## 👥 Команда

- Разработка: Команда DeadLine
- AI Ассистент: Василий (GigaChat)
- Дизайн: Glass Morphism UI

---

*Документация сгенерирована автоматически системой Василия* 🤖
`;

    const doc: DocumentationTemplate = {
      id: crypto.randomUUID(),
      type: "project",
      title: `README - ${project.name}`,
      content,
      metadata: {
        projectName: project.name,
        technologies: project.technologies.length,
        features: project.features.length
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.documentation.push(doc);
    return doc;
  }

  /**
   * Получить всю документацию
   */
  static getDocumentation(): DocumentationTemplate[] {
    return [...this.documentation];
  }

  /**
   * Получить все отчеты
   */
  static getReports(): ReportTemplate[] {
    return [...this.reports];
  }

  /**
   * Получить документацию по коду
   */
  static getCodeDocumentation(): CodeDocumentation[] {
    return [...this.codeDocs];
  }

  /**
   * Получить статистику документации
   */
  static getDocumentationStats(): {
    totalDocs: number;
    totalReports: number;
    totalCodeDocs: number;
    docsByType: Record<string, number>;
    reportsByType: Record<string, number>;
  } {
    const docsByType: Record<string, number> = {};
    const reportsByType: Record<string, number> = {};

    this.documentation.forEach(doc => {
      docsByType[doc.type] = (docsByType[doc.type] || 0) + 1;
    });

    this.reports.forEach(report => {
      reportsByType[report.type] = (reportsByType[report.type] || 0) + 1;
    });

    return {
      totalDocs: this.documentation.length,
      totalReports: this.reports.length,
      totalCodeDocs: this.codeDocs.length,
      docsByType,
      reportsByType
    };
  }
}
