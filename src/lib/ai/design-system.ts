export interface DesignToken {
  id: string;
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'border' | 'shadow' | 'animation';
  category: string;
  description: string;
  usage: string[];
  variants?: Record<string, string>;
}

export interface Component {
  id: string;
  name: string;
  description: string;
  category: 'button' | 'input' | 'card' | 'modal' | 'navigation' | 'layout' | 'feedback';
  props: {
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
    description: string;
  }[];
  variants: {
    name: string;
    props: Record<string, any>;
    description: string;
  }[];
  code: string;
  designTokens: string[];
  accessibility: {
    level: 'A' | 'AA' | 'AAA';
    guidelines: string[];
    testing: string[];
  };
}

export interface DesignSystem {
  id: string;
  name: string;
  description: string;
  version: string;
  tokens: DesignToken[];
  components: Component[];
  themes: {
    name: string;
    tokens: Record<string, string>;
    description: string;
  }[];
  guidelines: {
    category: string;
    title: string;
    content: string;
    examples: string[];
  }[];
}

export interface DesignGeneration {
  id: string;
  prompt: string;
  generatedComponents: Component[];
  generatedTokens: DesignToken[];
  style: 'modern' | 'minimalist' | 'corporate' | 'creative' | 'tech';
  colorScheme: 'light' | 'dark' | 'auto';
  accessibility: boolean;
  responsive: boolean;
  timestamp: Date;
}

export interface DesignAnalysis {
  id: string;
  componentId: string;
  issues: {
    type: 'accessibility' | 'usability' | 'consistency' | 'performance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    suggestion: string;
    line?: number;
  }[];
  score: number;
  recommendations: string[];
  timestamp: Date;
}

export class AIDesignSystem {
  private designSystems: DesignSystem[] = [];
  private designGenerations: DesignGeneration[] = [];
  private designAnalyses: DesignAnalysis[] = [];
  private templates: Component[] = [];

  constructor() {
    this.initializeTemplates();
    this.initializeDefaultSystem();
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: 'button-primary',
        name: 'Primary Button',
        description: 'Основная кнопка для важных действий',
        category: 'button',
        props: [
          { name: 'size', type: 'string', required: false, defaultValue: 'medium', description: 'Размер кнопки' },
          { name: 'disabled', type: 'boolean', required: false, defaultValue: false, description: 'Отключена ли кнопка' },
          { name: 'loading', type: 'boolean', required: false, defaultValue: false, description: 'Состояние загрузки' }
        ],
        variants: [
          { name: 'default', props: {}, description: 'Стандартная кнопка' },
          { name: 'small', props: { size: 'small' }, description: 'Маленькая кнопка' },
          { name: 'large', props: { size: 'large' }, description: 'Большая кнопка' },
          { name: 'disabled', props: { disabled: true }, description: 'Отключенная кнопка' }
        ],
        code: `import React from 'react';
import { Button } from '@/components/ui/button';

interface PrimaryButtonProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  size = 'medium',
  disabled = false,
  loading = false,
  onClick
}) => {
  return (
    <Button
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Загрузка...
        </>
      ) : (
        children
      )}
    </Button>
  );
};`,
        designTokens: ['color-primary', 'spacing-medium', 'border-radius-medium'],
        accessibility: {
          level: 'AA',
          guidelines: [
            'Минимальный контраст 4.5:1',
            'Фокус видимый',
            'Поддержка клавиатуры'
          ],
          testing: [
            'Проверка с помощью screen reader',
            'Тестирование только с клавиатуры',
            'Проверка цветового контраста'
          ]
        }
      },
      {
        id: 'card-basic',
        name: 'Basic Card',
        description: 'Базовая карточка для отображения контента',
        category: 'card',
        props: [
          { name: 'title', type: 'string', required: false, description: 'Заголовок карточки' },
          { name: 'subtitle', type: 'string', required: false, description: 'Подзаголовок' },
          { name: 'elevation', type: 'number', required: false, defaultValue: 1, description: 'Уровень тени' }
        ],
        variants: [
          { name: 'default', props: {}, description: 'Стандартная карточка' },
          { name: 'elevated', props: { elevation: 3 }, description: 'Карточка с тенью' },
          { name: 'flat', props: { elevation: 0 }, description: 'Плоская карточка' }
        ],
        code: `import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  elevation?: number;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  elevation = 1,
  className = ''
}) => {
  const shadowClass = elevation === 0 ? '' : \`shadow-\${elevation}\`;
  
  return (
    <div className={\`bg-white rounded-lg border border-gray-200 p-6 \${shadowClass} \${className}\`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};`,
        designTokens: ['color-background', 'color-text', 'spacing-medium', 'border-radius-medium'],
        accessibility: {
          level: 'AA',
          guidelines: [
            'Семантическая разметка',
            'Достаточный контраст',
            'Логический порядок чтения'
          ],
          testing: [
            'Проверка структуры заголовков',
            'Тестирование с screen reader'
          ]
        }
      }
    ];
  }

  private initializeDefaultSystem() {
    const defaultSystem: DesignSystem = {
      id: 'default-system',
      name: 'DeadLine Design System',
      description: 'Основная дизайн-система проекта DeadLine',
      version: '1.0.0',
      tokens: [
        {
          id: 'color-primary',
          name: 'Primary Color',
          value: '#3B82F6',
          type: 'color',
          category: 'brand',
          description: 'Основной цвет бренда',
          usage: ['buttons', 'links', 'accents'],
          variants: {
            '50': '#EFF6FF',
            '100': '#DBEAFE',
            '500': '#3B82F6',
            '600': '#2563EB',
            '700': '#1D4ED8'
          }
        },
        {
          id: 'spacing-small',
          name: 'Small Spacing',
          value: '8px',
          type: 'spacing',
          category: 'layout',
          description: 'Маленький отступ',
          usage: ['padding', 'margin', 'gap']
        },
        {
          id: 'spacing-medium',
          name: 'Medium Spacing',
          value: '16px',
          type: 'spacing',
          category: 'layout',
          description: 'Средний отступ',
          usage: ['padding', 'margin', 'gap']
        },
        {
          id: 'spacing-large',
          name: 'Large Spacing',
          value: '24px',
          type: 'spacing',
          category: 'layout',
          description: 'Большой отступ',
          usage: ['padding', 'margin', 'gap']
        }
      ],
      components: this.templates,
      themes: [
        {
          name: 'Light Theme',
          tokens: {
            'color-background': '#FFFFFF',
            'color-text': '#1F2937',
            'color-border': '#E5E7EB'
          },
          description: 'Светлая тема'
        },
        {
          name: 'Dark Theme',
          tokens: {
            'color-background': '#111827',
            'color-text': '#F9FAFB',
            'color-border': '#374151'
          },
          description: 'Темная тема'
        }
      ],
      guidelines: [
        {
          category: 'Color',
          title: 'Использование цветов',
          content: 'Используйте цвета последовательно для создания визуальной иерархии',
          examples: ['Primary для основных действий', 'Secondary для второстепенных действий']
        },
        {
          category: 'Typography',
          title: 'Типографика',
          content: 'Используйте четкую иерархию заголовков и текста',
          examples: ['H1 для главных заголовков', 'Body для основного текста']
        }
      ]
    };

    this.designSystems.push(defaultSystem);
  }

  // Генерация дизайн-системы
  async generateDesignSystem(prompt: string, style: string, colorScheme: string): Promise<DesignGeneration> {
    try {
      const generatedComponents = this.generateComponents(prompt, style);
      const generatedTokens = this.generateTokens(style, colorScheme);
      
      const generation: DesignGeneration = {
        id: `gen_${Date.now()}`,
        prompt,
        generatedComponents,
        generatedTokens,
        style: style as any,
        colorScheme: colorScheme as any,
        accessibility: true,
        responsive: true,
        timestamp: new Date()
      };

      this.designGenerations.push(generation);
      console.log(`🎨 Сгенерирована дизайн-система: ${prompt}`);
      return generation;
    } catch (error) {
      console.error('Ошибка генерации дизайн-системы:', error);
      throw error;
    }
  }

  private generateComponents(prompt: string, style: string): Component[] {
    // Симуляция генерации компонентов на основе промпта
    const components = [];
    
    if (prompt.includes('button') || prompt.includes('кнопка')) {
      components.push(this.generateButtonComponent(style));
    }
    
    if (prompt.includes('card') || prompt.includes('карточка')) {
      components.push(this.generateCardComponent(style));
    }
    
    if (prompt.includes('input') || prompt.includes('поле')) {
      components.push(this.generateInputComponent(style));
    }
    
    if (prompt.includes('modal') || prompt.includes('модальное')) {
      components.push(this.generateModalComponent(style));
    }
    
    return components;
  }

  private generateButtonComponent(style: string): Component {
    const styleConfigs = {
      modern: { borderRadius: '8px', padding: '12px 24px', fontSize: '14px' },
      minimalist: { borderRadius: '4px', padding: '8px 16px', fontSize: '12px' },
      corporate: { borderRadius: '6px', padding: '10px 20px', fontSize: '13px' },
      creative: { borderRadius: '20px', padding: '12px 24px', fontSize: '14px' },
      tech: { borderRadius: '0px', padding: '10px 20px', fontSize: '13px' }
    };
    
    const config = styleConfigs[style as keyof typeof styleConfigs] || styleConfigs.modern;
    
    return {
      id: `button-${style}`,
      name: `${style.charAt(0).toUpperCase() + style.slice(1)} Button`,
      description: `Кнопка в стиле ${style}`,
      category: 'button',
      props: [
        { name: 'variant', type: 'string', required: false, defaultValue: 'primary', description: 'Вариант кнопки' },
        { name: 'size', type: 'string', required: false, defaultValue: 'medium', description: 'Размер кнопки' }
      ],
      variants: [
        { name: 'primary', props: { variant: 'primary' }, description: 'Основная кнопка' },
        { name: 'secondary', props: { variant: 'secondary' }, description: 'Вторичная кнопка' }
      ],
      code: `export const Button = ({ variant = 'primary', size = 'medium', children, ...props }) => {
  const baseClasses = 'font-medium transition-colors focus:outline-none focus:ring-2';
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900'
  };
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]}\`}
      style={{
        borderRadius: '${config.borderRadius}',
        padding: '${config.padding}',
        fontSize: '${config.fontSize}'
      }}
      {...props}
    >
      {children}
    </button>
  );
};`,
      designTokens: ['color-primary', 'spacing-medium', 'border-radius-medium'],
      accessibility: {
        level: 'AA',
        guidelines: ['Минимальный контраст 4.5:1', 'Фокус видимый'],
        testing: ['Проверка с screen reader', 'Тестирование только с клавиатуры']
      }
    };
  }

  private generateCardComponent(style: string): Component {
    return {
      id: `card-${style}`,
      name: `${style.charAt(0).toUpperCase() + style.slice(1)} Card`,
      description: `Карточка в стиле ${style}`,
      category: 'card',
      props: [
        { name: 'elevation', type: 'number', required: false, defaultValue: 1, description: 'Уровень тени' }
      ],
      variants: [
        { name: 'default', props: {}, description: 'Стандартная карточка' },
        { name: 'elevated', props: { elevation: 3 }, description: 'Карточка с тенью' }
      ],
      code: `export const Card = ({ elevation = 1, children, ...props }) => {
  const shadowClass = elevation > 0 ? \`shadow-\${elevation}\` : '';
  
  return (
    <div className={\`bg-white rounded-lg border border-gray-200 p-6 \${shadowClass}\`} {...props}>
      {children}
    </div>
  );
};`,
      designTokens: ['color-background', 'color-border', 'spacing-medium'],
      accessibility: {
        level: 'AA',
        guidelines: ['Семантическая разметка', 'Достаточный контраст'],
        testing: ['Проверка структуры', 'Тестирование с screen reader']
      }
    };
  }

  private generateInputComponent(style: string): Component {
    return {
      id: `input-${style}`,
      name: `${style.charAt(0).toUpperCase() + style.slice(1)} Input`,
      description: `Поле ввода в стиле ${style}`,
      category: 'input',
      props: [
        { name: 'error', type: 'boolean', required: false, defaultValue: false, description: 'Состояние ошибки' },
        { name: 'disabled', type: 'boolean', required: false, defaultValue: false, description: 'Отключено ли поле' }
      ],
      variants: [
        { name: 'default', props: {}, description: 'Стандартное поле' },
        { name: 'error', props: { error: true }, description: 'Поле с ошибкой' }
      ],
      code: `export const Input = ({ error = false, disabled = false, ...props }) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2';
  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500' 
    : 'border-gray-300 focus:ring-blue-500';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  
  return (
    <input
      className={\`\${baseClasses} \${stateClasses} \${disabledClasses}\`}
      disabled={disabled}
      {...props}
    />
  );
};`,
      designTokens: ['color-border', 'color-text', 'spacing-small'],
      accessibility: {
        level: 'AA',
        guidelines: ['Правильные лейблы', 'Сообщения об ошибках'],
        testing: ['Проверка с screen reader', 'Тестирование валидации']
      }
    };
  }

  private generateModalComponent(style: string): Component {
    return {
      id: `modal-${style}`,
      name: `${style.charAt(0).toUpperCase() + style.slice(1)} Modal`,
      description: `Модальное окно в стиле ${style}`,
      category: 'modal',
      props: [
        { name: 'open', type: 'boolean', required: true, description: 'Открыто ли модальное окно' },
        { name: 'onClose', type: 'function', required: true, description: 'Функция закрытия' }
      ],
      variants: [
        { name: 'default', props: {}, description: 'Стандартное модальное окно' }
      ],
      code: `export const Modal = ({ open, onClose, children, ...props }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4" {...props}>
        {children}
      </div>
    </div>
  );
};`,
      designTokens: ['color-background', 'color-overlay', 'spacing-large'],
      accessibility: {
        level: 'AA',
        guidelines: ['Фокус на модальном окне', 'Закрытие по Escape'],
        testing: ['Проверка фокуса', 'Тестирование клавиатуры']
      }
    };
  }

  private generateTokens(style: string, colorScheme: string): DesignToken[] {
    const tokens = [];
    
    // Цвета
    if (colorScheme === 'dark') {
      tokens.push(
        { id: 'color-background', name: 'Background', value: '#111827', type: 'color', category: 'base', description: 'Основной фон', usage: ['backgrounds'] },
        { id: 'color-text', name: 'Text', value: '#F9FAFB', type: 'color', category: 'base', description: 'Основной текст', usage: ['text'] },
        { id: 'color-primary', name: 'Primary', value: '#3B82F6', type: 'color', category: 'brand', description: 'Основной цвет', usage: ['buttons', 'links'] }
      );
    } else {
      tokens.push(
        { id: 'color-background', name: 'Background', value: '#FFFFFF', type: 'color', category: 'base', description: 'Основной фон', usage: ['backgrounds'] },
        { id: 'color-text', name: 'Text', value: '#1F2937', type: 'color', category: 'base', description: 'Основной текст', usage: ['text'] },
        { id: 'color-primary', name: 'Primary', value: '#3B82F6', type: 'color', category: 'brand', description: 'Основной цвет', usage: ['buttons', 'links'] }
      );
    }
    
    // Отступы
    tokens.push(
      { id: 'spacing-xs', name: 'Extra Small', value: '4px', type: 'spacing', category: 'layout', description: 'Очень маленький отступ', usage: ['padding', 'margin'] },
      { id: 'spacing-sm', name: 'Small', value: '8px', type: 'spacing', category: 'layout', description: 'Маленький отступ', usage: ['padding', 'margin'] },
      { id: 'spacing-md', name: 'Medium', value: '16px', type: 'spacing', category: 'layout', description: 'Средний отступ', usage: ['padding', 'margin'] },
      { id: 'spacing-lg', name: 'Large', value: '24px', type: 'spacing', category: 'layout', description: 'Большой отступ', usage: ['padding', 'margin'] }
    );
    
    // Радиусы
    const radiusValues = {
      modern: '8px',
      minimalist: '4px',
      corporate: '6px',
      creative: '12px',
      tech: '0px'
    };
    
    tokens.push({
      id: 'border-radius',
      name: 'Border Radius',
      value: radiusValues[style as keyof typeof radiusValues] || '8px',
      type: 'border',
      category: 'shape',
      description: 'Радиус скругления',
      usage: ['buttons', 'cards', 'inputs']
    });
    
    return tokens;
  }

  // Анализ дизайна
  async analyzeDesign(componentId: string, code: string): Promise<DesignAnalysis> {
    const issues = this.findDesignIssues(code);
    const score = this.calculateDesignScore(issues);
    const recommendations = this.generateDesignRecommendations(issues);
    
    const analysis: DesignAnalysis = {
      id: `analysis_${Date.now()}`,
      componentId,
      issues,
      score,
      recommendations,
      timestamp: new Date()
    };
    
    this.designAnalyses.push(analysis);
    return analysis;
  }

  private findDesignIssues(code: string): any[] {
    const issues = [];
    
    // Проверка доступности
    if (!code.includes('aria-') && !code.includes('role=')) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        message: 'Отсутствуют ARIA атрибуты',
        suggestion: 'Добавьте aria-label, role и другие ARIA атрибуты'
      });
    }
    
    // Проверка контраста
    if (code.includes('text-gray-400') || code.includes('text-gray-500')) {
      issues.push({
        type: 'accessibility',
        severity: 'high',
        message: 'Низкий цветовой контраст',
        suggestion: 'Используйте более контрастные цвета (минимум 4.5:1)'
      });
    }
    
    // Проверка фокуса
    if (!code.includes('focus:') && !code.includes('focus-visible')) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        message: 'Отсутствуют стили фокуса',
        suggestion: 'Добавьте focus:outline-none и focus:ring для видимого фокуса'
      });
    }
    
    // Проверка отзывчивости
    if (!code.includes('sm:') && !code.includes('md:') && !code.includes('lg:')) {
      issues.push({
        type: 'usability',
        severity: 'low',
        message: 'Отсутствует адаптивность',
        suggestion: 'Добавьте responsive классы для разных размеров экрана'
      });
    }
    
    return issues;
  }

  private calculateDesignScore(issues: any[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 30; break;
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });
    
    return Math.max(0, score);
  }

  private generateDesignRecommendations(issues: any[]): string[] {
    const recommendations = [];
    
    const accessibilityIssues = issues.filter(i => i.type === 'accessibility');
    if (accessibilityIssues.length > 0) {
      recommendations.push('Улучшите доступность компонента');
      recommendations.push('Добавьте ARIA атрибуты и семантическую разметку');
    }
    
    const usabilityIssues = issues.filter(i => i.type === 'usability');
    if (usabilityIssues.length > 0) {
      recommendations.push('Сделайте компонент более отзывчивым');
      recommendations.push('Добавьте адаптивные стили');
    }
    
    recommendations.push('Протестируйте компонент с screen reader');
    recommendations.push('Проверьте цветовой контраст');
    recommendations.push('Убедитесь в поддержке клавиатуры');
    
    return recommendations;
  }

  // Получить дизайн-системы
  getDesignSystems(): DesignSystem[] {
    return this.designSystems;
  }

  // Получить шаблоны компонентов
  getComponentTemplates(): Component[] {
    return this.templates;
  }

  // Получить историю генерации
  getGenerationHistory(limit: number = 20): DesignGeneration[] {
    return this.designGenerations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Получить статистику
  getDesignStats() {
    const totalGenerations = this.designGenerations.length;
    const totalComponents = this.designGenerations.reduce((sum, gen) => sum + gen.generatedComponents.length, 0);
    const totalTokens = this.designGenerations.reduce((sum, gen) => sum + gen.generatedTokens.length, 0);
    const avgScore = this.designAnalyses.length > 0 
      ? this.designAnalyses.reduce((sum, analysis) => sum + analysis.score, 0) / this.designAnalyses.length 
      : 0;
    
    return {
      totalGenerations,
      totalComponents,
      totalTokens,
      avgScore: Math.round(avgScore),
      recentGenerations: this.designGenerations.slice(-5),
      topStyles: this.designGenerations
        .reduce((acc, gen) => {
          acc[gen.style] = (acc[gen.style] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    };
  }
}

export const AIDesignSystemInstance = new AIDesignSystem();
