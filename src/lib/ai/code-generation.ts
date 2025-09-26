export interface CodeGenerationRequest {
  prompt: string;
  language: string;
  framework?: string;
  style?: 'functional' | 'object-oriented' | 'procedural';
  complexity?: 'simple' | 'medium' | 'complex';
  includeTests?: boolean;
  includeComments?: boolean;
  includeDocumentation?: boolean;
}

export interface GeneratedCode {
  id: string;
  code: string;
  language: string;
  framework?: string;
  tests?: string;
  documentation?: string;
  complexity: number;
  quality: number;
  timestamp: Date;
  prompt: string;
  suggestions: string[];
}

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  framework?: string;
  category: 'component' | 'function' | 'class' | 'api' | 'database' | 'test';
  template: string;
  variables: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface CodeReview {
  id: string;
  codeId: string;
  issues: {
    type: 'error' | 'warning' | 'suggestion';
    line: number;
    message: string;
    severity: 'low' | 'medium' | 'high';
    fix?: string;
  }[];
  score: number;
  suggestions: string[];
  timestamp: Date;
}

export class AICodeGeneration {
  private generatedCode: GeneratedCode[] = [];
  private templates: CodeTemplate[] = [];
  private codeReviews: CodeReview[] = [];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: 'react-component',
        name: 'React Component',
        description: 'Базовый React компонент с TypeScript',
        language: 'typescript',
        framework: 'react',
        category: 'component',
        template: `import React from 'react';

interface {{componentName}}Props {
  // Добавьте пропсы здесь
}

const {{componentName}}: React.FC<{{componentName}}Props> = ({ }) => {
  return (
    <div>
      <h1>{{componentName}}</h1>
      {/* Ваш контент здесь */}
    </div>
  );
};

export default {{componentName}};`,
        variables: ['componentName'],
        difficulty: 'beginner'
      },
      {
        id: 'api-endpoint',
        name: 'API Endpoint',
        description: 'REST API endpoint с валидацией',
        language: 'typescript',
        framework: 'express',
        category: 'api',
        template: `import { Request, Response } from 'express';
import { z } from 'zod';

const {{endpointName}}Schema = z.object({
  // Определите схему валидации
});

export const {{endpointName}} = async (req: Request, res: Response) => {
  try {
    const validatedData = {{endpointName}}Schema.parse(req.body);
    
    // Ваша логика здесь
    
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
};`,
        variables: ['endpointName'],
        difficulty: 'intermediate'
      },
      {
        id: 'database-model',
        name: 'Database Model',
        description: 'Модель базы данных с Prisma',
        language: 'typescript',
        framework: 'prisma',
        category: 'database',
        template: `model {{modelName}} {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Добавьте поля модели
  
  @@map("{{tableName}}")
}`,
        variables: ['modelName', 'tableName'],
        difficulty: 'beginner'
      }
    ];
  }

  // Генерация кода на основе промпта
  async generateCode(request: CodeGenerationRequest): Promise<GeneratedCode> {
    try {
      // Симуляция AI генерации кода
      const generatedCode = this.simulateCodeGeneration(request);
      
      const codeId = `code_${Date.now()}`;
      const newCode: GeneratedCode = {
        id: codeId,
        code: generatedCode.code,
        language: request.language,
        framework: request.framework,
        tests: request.includeTests ? generatedCode.tests : undefined,
        documentation: request.includeDocumentation ? generatedCode.documentation : undefined,
        complexity: this.calculateComplexity(generatedCode.code),
        quality: this.calculateQuality(generatedCode.code),
        timestamp: new Date(),
        prompt: request.prompt,
        suggestions: this.generateSuggestions(generatedCode.code, request.language)
      };

      this.generatedCode.push(newCode);
      
      console.log(`🤖 Сгенерирован код: ${request.language} - ${request.prompt}`);
      return newCode;
    } catch (error) {
      console.error('Ошибка генерации кода:', error);
      throw error;
    }
  }

  private simulateCodeGeneration(request: CodeGenerationRequest): any {
    const { language, framework, prompt } = request;
    
    // Симуляция различных типов кода
    const codeExamples = {
      typescript: {
        code: `// ${prompt}
interface User {
  id: string;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const user: User = {
      id: \`user_\${Date.now()}\`,
      ...userData
    };
    this.users.push(user);
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }
}

export default UserService;`,
        tests: `import UserService from './UserService';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should create a user', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    const user = await userService.createUser(userData);
    
    expect(user.id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
  });

  it('should get a user by id', async () => {
    const userData = { name: 'Jane Doe', email: 'jane@example.com' };
    const user = await userService.createUser(userData);
    const foundUser = await userService.getUser(user.id);
    
    expect(foundUser).toEqual(user);
  });
});`,
        documentation: `# UserService

Сервис для управления пользователями.

## Методы

### createUser(userData)
Создает нового пользователя.

**Параметры:**
- \`userData\` - данные пользователя без id

**Возвращает:** Promise<User>

### getUser(id)
Получает пользователя по id.

**Параметры:**
- \`id\` - идентификатор пользователя

**Возвращает:** Promise<User | undefined>`
      },
      python: {
        code: `# ${prompt}
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class UserService:
    def __init__(self):
        self.users: List[Dict[str, Any]] = []
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создает нового пользователя"""
        user = {
            'id': str(uuid.uuid4()),
            'created_at': datetime.now().isoformat(),
            **user_data
        }
        self.users.append(user)
        return user
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Получает пользователя по id"""
        return next((user for user in self.users if user['id'] == user_id), None)
    
    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Обновляет пользователя"""
        for i, user in enumerate(self.users):
            if user['id'] == user_id:
                self.users[i].update(updates)
                return self.users[i]
        return None
    
    async def delete_user(self, user_id: str) -> bool:
        """Удаляет пользователя"""
        for i, user in enumerate(self.users):
            if user['id'] == user_id:
                del self.users[i]
                return True
        return False`,
        tests: `import pytest
from user_service import UserService

@pytest.fixture
def user_service():
    return UserService()

@pytest.mark.asyncio
async def test_create_user(user_service):
    user_data = {'name': 'John Doe', 'email': 'john@example.com'}
    user = await user_service.create_user(user_data)
    
    assert user['id'] is not None
    assert user['name'] == user_data['name']
    assert user['email'] == user_data['email']

@pytest.mark.asyncio
async def test_get_user(user_service):
    user_data = {'name': 'Jane Doe', 'email': 'jane@example.com'}
    user = await user_service.create_user(user_data)
    found_user = await user_service.get_user(user['id'])
    
    assert found_user == user`,
        documentation: `# UserService

Сервис для управления пользователями.

## Методы

### create_user(user_data)
Создает нового пользователя.

**Параметры:**
- \`user_data\` - словарь с данными пользователя

**Возвращает:** Dict[str, Any]

### get_user(user_id)
Получает пользователя по id.

**Параметры:**
- \`user_id\` - строка с идентификатором пользователя

**Возвращает:** Optional[Dict[str, Any]]`
      }
    };

    return codeExamples[language as keyof typeof codeExamples] || codeExamples.typescript;
  }

  private calculateComplexity(code: string): number {
    const lines = code.split('\n').length;
    const functions = (code.match(/function|def|async|class/g) || []).length;
    const complexity = Math.min(100, (lines * 0.1 + functions * 5));
    return Math.round(complexity);
  }

  private calculateQuality(code: string): number {
    const hasComments = code.includes('//') || code.includes('#');
    const hasErrorHandling = code.includes('try') || code.includes('catch');
    const hasTypeAnnotations = code.includes(':') && code.includes('string') || code.includes('number');
    
    let quality = 50; // Базовое качество
    if (hasComments) quality += 20;
    if (hasErrorHandling) quality += 20;
    if (hasTypeAnnotations) quality += 10;
    
    return Math.min(100, quality);
  }

  private generateSuggestions(code: string, language: string): string[] {
    const suggestions = [];
    
    if (!code.includes('//') && !code.includes('#')) {
      suggestions.push('Добавьте комментарии для лучшего понимания кода');
    }
    
    if (!code.includes('try') && !code.includes('catch')) {
      suggestions.push('Рассмотрите добавление обработки ошибок');
    }
    
    if (language === 'typescript' && !code.includes('interface') && !code.includes('type')) {
      suggestions.push('Добавьте типизацию для лучшей безопасности типов');
    }
    
    if (code.includes('console.log')) {
      suggestions.push('Замените console.log на более подходящий логгер');
    }
    
    return suggestions;
  }

  // Получить шаблоны кода
  getTemplates(category?: string, language?: string): CodeTemplate[] {
    let filteredTemplates = this.templates;
    
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    
    if (language) {
      filteredTemplates = filteredTemplates.filter(t => t.language === language);
    }
    
    return filteredTemplates;
  }

  // Применить шаблон
  applyTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Шаблон не найден');
    }
    
    let result = template.template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return result;
  }

  // Анализ кода
  async analyzeCode(code: string, language: string): Promise<CodeReview> {
    const issues = this.findCodeIssues(code, language);
    const score = this.calculateCodeScore(code, issues);
    const suggestions = this.generateCodeSuggestions(code, language);
    
    const review: CodeReview = {
      id: `review_${Date.now()}`,
      codeId: `code_${Date.now()}`,
      issues,
      score,
      suggestions,
      timestamp: new Date()
    };
    
    this.codeReviews.push(review);
    return review;
  }

  private findCodeIssues(code: string, language: string): any[] {
    const issues = [];
    
    // Проверка на console.log
    if (code.includes('console.log')) {
      issues.push({
        type: 'warning',
        line: code.split('\n').findIndex(line => line.includes('console.log')) + 1,
        message: 'Использование console.log в продакшене',
        severity: 'medium',
        fix: 'Замените на логгер'
      });
    }
    
    // Проверка на TODO
    if (code.includes('TODO') || code.includes('FIXME')) {
      issues.push({
        type: 'warning',
        line: code.split('\n').findIndex(line => line.includes('TODO') || line.includes('FIXME')) + 1,
        message: 'Найдены TODO или FIXME комментарии',
        severity: 'low',
        fix: 'Завершите реализацию'
      });
    }
    
    // Проверка на длинные функции
    const functions = code.split(/function|def|async/);
    functions.forEach((func, index) => {
      const lines = func.split('\n').length;
      if (lines > 50) {
        issues.push({
          type: 'suggestion',
          line: index * 10, // Примерная строка
          message: 'Функция слишком длинная',
          severity: 'medium',
          fix: 'Разбейте на более мелкие функции'
        });
      }
    });
    
    return issues;
  }

  private calculateCodeScore(code: string, issues: any[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });
    
    return Math.max(0, score);
  }

  private generateCodeSuggestions(code: string, language: string): string[] {
    const suggestions = [];
    
    if (language === 'typescript') {
      if (!code.includes('interface') && !code.includes('type')) {
        suggestions.push('Добавьте типизацию TypeScript');
      }
      if (!code.includes('async') && code.includes('Promise')) {
        suggestions.push('Используйте async/await вместо Promise');
      }
    }
    
    if (!code.includes('try') && !code.includes('catch')) {
      suggestions.push('Добавьте обработку ошибок');
    }
    
    if (!code.includes('//') && !code.includes('/*')) {
      suggestions.push('Добавьте комментарии к коду');
    }
    
    return suggestions;
  }

  // Получить историю генерации
  getGenerationHistory(limit: number = 20): GeneratedCode[] {
    return this.generatedCode
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Получить статистику
  getGenerationStats() {
    const totalGenerated = this.generatedCode.length;
    // Используем Array.prototype.filter для получения уникальных языков без Set
    const languagesArr = this.generatedCode.map(code => code.language);
    const languages: string[] = languagesArr.filter((lang, idx) => languagesArr.indexOf(lang) === idx);
    const averageQuality = totalGenerated > 0
      ? this.generatedCode.reduce((sum, code) => sum + code.quality, 0) / totalGenerated
      : 0;
    return {
      totalGenerated,
      languages,
      averageQuality: Math.round(averageQuality),
      recentGenerations: this.generatedCode.slice(-5),
      topLanguages: languages.map(lang => ({
        language: lang,
        count: this.generatedCode.filter(code => code.language === lang).length
      })).sort((a, b) => b.count - a.count)
    };
  }
}

export const AICodeGenerationInstance = new AICodeGeneration();
