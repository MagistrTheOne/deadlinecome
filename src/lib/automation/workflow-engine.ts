import { LoggerService } from '@/lib/logger';
import { notificationService } from '@/lib/email/notification-service';
import { slackService } from '@/lib/integrations/slack-service';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  projectId?: string;
  workspaceId?: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowTrigger {
  type: 'task_created' | 'task_updated' | 'task_completed' | 'task_assigned' | 'deadline_approaching' | 'project_created' | 'user_joined' | 'sprint_started' | 'sprint_ended' | 'custom';
  entity: 'task' | 'project' | 'user' | 'sprint' | 'team';
  filters?: Record<string, any>;
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface WorkflowAction {
  type: 'send_notification' | 'send_email' | 'send_slack_message' | 'assign_task' | 'change_status' | 'add_label' | 'create_task' | 'update_field' | 'webhook' | 'ai_action';
  config: Record<string, any>;
  delay?: number; // в минутах
}

interface WorkflowExecution {
  id: string;
  ruleId: string;
  entityId: string;
  entityType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  actions: WorkflowActionExecution[];
}

interface WorkflowActionExecution {
  actionId: string;
  actionType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
}

class WorkflowEngine {
  private rules: Map<string, WorkflowRule> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private isProcessing = false;

  // Создать правило workflow
  async createRule(rule: Omit<WorkflowRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowRule> {
    try {
      const workflowRule: WorkflowRule = {
        id: this.generateRuleId(),
        ...rule,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.rules.set(workflowRule.id, workflowRule);

      LoggerService.api.info('Workflow rule created', {
        ruleId: workflowRule.id,
        name: workflowRule.name,
        triggerType: workflowRule.trigger.type
      });

      return workflowRule;
    } catch (error: any) {
      LoggerService.error.error('Failed to create workflow rule', {
        error: error.message,
        name: rule.name
      });
      throw error;
    }
  }

  // Обновить правило workflow
  async updateRule(ruleId: string, updates: Partial<WorkflowRule>): Promise<WorkflowRule> {
    try {
      const rule = this.rules.get(ruleId);
      if (!rule) {
        throw new Error('Workflow rule not found');
      }

      const updatedRule = {
        ...rule,
        ...updates,
        updatedAt: new Date()
      };

      this.rules.set(ruleId, updatedRule);

      LoggerService.api.info('Workflow rule updated', {
        ruleId,
        name: updatedRule.name
      });

      return updatedRule;
    } catch (error: any) {
      LoggerService.error.error('Failed to update workflow rule', {
        error: error.message,
        ruleId
      });
      throw error;
    }
  }

  // Удалить правило workflow
  async deleteRule(ruleId: string): Promise<boolean> {
    try {
      const deleted = this.rules.delete(ruleId);
      
      if (deleted) {
        LoggerService.api.info('Workflow rule deleted', { ruleId });
      }

      return deleted;
    } catch (error: any) {
      LoggerService.error.error('Failed to delete workflow rule', {
        error: error.message,
        ruleId
      });
      return false;
    }
  }

  // Получить все правила
  getAllRules(): WorkflowRule[] {
    return Array.from(this.rules.values());
  }

  // Получить правила для проекта
  getProjectRules(projectId: string): WorkflowRule[] {
    return Array.from(this.rules.values()).filter(rule => 
      rule.isActive && (rule.projectId === projectId || !rule.projectId)
    );
  }

  // Обработать событие
  async processEvent(
    eventType: string,
    entityType: string,
    entityId: string,
    data: any
  ): Promise<void> {
    try {
      if (this.isProcessing) {
        LoggerService.api.warn('Workflow engine is already processing events');
        return;
      }

      this.isProcessing = true;

      // Находим подходящие правила
      const matchingRules = this.findMatchingRules(eventType, entityType, data);

      // Выполняем правила
      for (const rule of matchingRules) {
        await this.executeRule(rule, entityId, entityType, data);
      }

      this.isProcessing = false;

      LoggerService.api.info('Workflow event processed', {
        eventType,
        entityType,
        entityId,
        rulesExecuted: matchingRules.length
      });
    } catch (error: any) {
      this.isProcessing = false;
      LoggerService.error.error('Failed to process workflow event', {
        error: error.message,
        eventType,
        entityType,
        entityId
      });
      throw error;
    }
  }

  // Найти подходящие правила
  private findMatchingRules(eventType: string, entityType: string, data: any): WorkflowRule[] {
    return Array.from(this.rules.values()).filter(rule => {
      if (!rule.isActive) return false;
      if (rule.trigger.type !== eventType) return false;
      if (rule.trigger.entity !== entityType) return false;
      
      // Проверяем фильтры триггера
      if (rule.trigger.filters) {
        return this.evaluateFilters(rule.trigger.filters, data);
      }
      
      return true;
    });
  }

  // Выполнить правило
  private async executeRule(
    rule: WorkflowRule,
    entityId: string,
    entityType: string,
    data: any
  ): Promise<void> {
    try {
      const executionId = this.generateExecutionId();
      const execution: WorkflowExecution = {
        id: executionId,
        ruleId: rule.id,
        entityId,
        entityType,
        status: 'pending',
        startedAt: new Date(),
        actions: rule.actions.map(action => ({
          actionId: this.generateActionId(),
          actionType: action.type,
          status: 'pending',
          startedAt: new Date()
        }))
      };

      this.executions.set(executionId, execution);

      // Проверяем условия
      if (!this.evaluateConditions(rule.conditions, data)) {
        LoggerService.api.info('Workflow rule conditions not met', {
          ruleId: rule.id,
          executionId
        });
        return;
      }

      execution.status = 'running';

      // Выполняем действия
      for (const actionExecution of execution.actions) {
        const action = rule.actions.find(a => a.type === actionExecution.actionType);
        if (!action) continue;

        try {
          actionExecution.status = 'running';
          await this.executeAction(action, data, actionExecution);
          actionExecution.status = 'completed';
          actionExecution.completedAt = new Date();
        } catch (error: any) {
          actionExecution.status = 'failed';
          actionExecution.error = error.message;
          actionExecution.completedAt = new Date();
          
          LoggerService.error.error('Workflow action failed', {
            error: error.message,
            ruleId: rule.id,
            actionType: action.type,
            executionId
          });
        }
      }

      execution.status = 'completed';
      execution.completedAt = new Date();

      LoggerService.api.info('Workflow rule executed', {
        ruleId: rule.id,
        executionId,
        actionsCount: execution.actions.length
      });
    } catch (error: any) {
      LoggerService.error.error('Failed to execute workflow rule', {
        error: error.message,
        ruleId: rule.id,
        entityId
      });
      throw error;
    }
  }

  // Выполнить действие
  private async executeAction(
    action: WorkflowAction,
    data: any,
    execution: WorkflowActionExecution
  ): Promise<void> {
    switch (action.type) {
      case 'send_notification':
        await this.executeSendNotification(action, data);
        break;
        
      case 'send_email':
        await this.executeSendEmail(action, data);
        break;
        
      case 'send_slack_message':
        await this.executeSendSlackMessage(action, data);
        break;
        
      case 'assign_task':
        await this.executeAssignTask(action, data);
        break;
        
      case 'change_status':
        await this.executeChangeStatus(action, data);
        break;
        
      case 'add_label':
        await this.executeAddLabel(action, data);
        break;
        
      case 'create_task':
        await this.executeCreateTask(action, data);
        break;
        
      case 'update_field':
        await this.executeUpdateField(action, data);
        break;
        
      case 'webhook':
        await this.executeWebhook(action, data);
        break;
        
      case 'ai_action':
        await this.executeAIAction(action, data);
        break;
        
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Отправить уведомление
  private async executeSendNotification(action: WorkflowAction, data: any): Promise<void> {
    const { userId, title, message, channels } = action.config;
    
    await notificationService.sendNotification({
      userId,
      type: 'workflow_notification',
      title,
      message,
      data,
      priority: 'medium',
      channels: channels || ['inApp']
    });
  }

  // Отправить email
  private async executeSendEmail(action: WorkflowAction, data: any): Promise<void> {
    const { userId, subject, template, templateData } = action.config;
    
    await notificationService.sendNotification({
      userId,
      type: 'email',
      title: subject,
      message: template,
      data: { ...data, ...templateData },
      priority: 'medium',
      channels: ['email']
    });
  }

  // Отправить Slack сообщение
  private async executeSendSlackMessage(action: WorkflowAction, data: any): Promise<void> {
    const { channel, message, blocks } = action.config;
    
    await slackService.sendMessage({
      channel,
      text: message,
      blocks
    });
  }

  // Назначить задачу
  private async executeAssignTask(action: WorkflowAction, data: any): Promise<void> {
    const { taskId, assigneeId } = action.config;
    
    // TODO: Обновить задачу в базе данных
    LoggerService.api.info('Task assigned via workflow', {
      taskId,
      assigneeId
    });
  }

  // Изменить статус
  private async executeChangeStatus(action: WorkflowAction, data: any): Promise<void> {
    const { taskId, status } = action.config;
    
    // TODO: Обновить статус задачи в базе данных
    LoggerService.api.info('Task status changed via workflow', {
      taskId,
      status
    });
  }

  // Добавить лейбл
  private async executeAddLabel(action: WorkflowAction, data: any): Promise<void> {
    const { taskId, label } = action.config;
    
    // TODO: Добавить лейбл к задаче в базе данных
    LoggerService.api.info('Label added via workflow', {
      taskId,
      label
    });
  }

  // Создать задачу
  private async executeCreateTask(action: WorkflowAction, data: any): Promise<void> {
    const { projectId, title, description, assigneeId, priority } = action.config;
    
    // TODO: Создать задачу в базе данных
    LoggerService.api.info('Task created via workflow', {
      projectId,
      title,
      assigneeId
    });
  }

  // Обновить поле
  private async executeUpdateField(action: WorkflowAction, data: any): Promise<void> {
    const { entityId, field, value } = action.config;
    
    // TODO: Обновить поле в базе данных
    LoggerService.api.info('Field updated via workflow', {
      entityId,
      field,
      value
    });
  }

  // Выполнить webhook
  private async executeWebhook(action: WorkflowAction, data: any): Promise<void> {
    const { url, method, headers, body } = action.config;
    
    const response = await fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({ ...data, ...body })
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
  }

  // Выполнить AI действие
  private async executeAIAction(action: WorkflowAction, data: any): Promise<void> {
    const { actionType, message, userId } = action.config;
    
    await notificationService.notifyVasilyAction(
      userId,
      actionType,
      message,
      data
    );
  }

  // Оценить условия
  private evaluateConditions(conditions: WorkflowCondition[], data: any): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(conditions[0], data);

    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, data);
      
      if (condition.logicalOperator === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return result;
  }

  // Оценить одно условие
  private evaluateCondition(condition: WorkflowCondition, data: any): boolean {
    const fieldValue = this.getFieldValue(data, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'not_contains':
        return !String(fieldValue).includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  // Оценить фильтры
  private evaluateFilters(filters: Record<string, any>, data: any): boolean {
    for (const [field, value] of Object.entries(filters)) {
      const fieldValue = this.getFieldValue(data, field);
      if (fieldValue !== value) {
        return false;
      }
    }
    return true;
  }

  // Получить значение поля
  private getFieldValue(data: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], data);
  }

  // Генерация ID
  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Экспорт движка
export const workflowEngine = new WorkflowEngine();
