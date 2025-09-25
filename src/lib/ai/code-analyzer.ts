"use client";

export interface CodeAnalysis {
  id: string;
  filePath: string;
  timestamp: Date;
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  metrics: CodeMetrics;
  quality: number; // 0-1
}

export interface CodeIssue {
  type: "bug" | "performance" | "security" | "style" | "maintainability";
  severity: "low" | "medium" | "high" | "critical";
  line: number;
  message: string;
  suggestion: string;
  confidence: number; // 0-1
}

export interface CodeSuggestion {
  type: "refactor" | "optimize" | "document" | "test" | "security";
  priority: "low" | "medium" | "high";
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
}

export interface CodeMetrics {
  complexity: number;
  maintainability: number;
  testCoverage: number;
  documentation: number;
  performance: number;
}

export class CodeAnalyzer {
  private static analysisHistory: CodeAnalysis[] = [];

  /**
   * Анализирует код и возвращает рекомендации
   */
  static async analyzeCode(code: string, filePath: string): Promise<CodeAnalysis> {
    const analysis: CodeAnalysis = {
      id: crypto.randomUUID(),
      filePath,
      timestamp: new Date(),
      issues: [],
      suggestions: [],
      metrics: {
        complexity: 0,
        maintainability: 0,
        testCoverage: 0,
        documentation: 0,
        performance: 0
      },
      quality: 0
    };

    // Анализируем код на предмет проблем
    analysis.issues = this.detectIssues(code, filePath);
    
    // Генерируем предложения по улучшению
    analysis.suggestions = this.generateSuggestions(code, analysis.issues);
    
    // Вычисляем метрики
    analysis.metrics = this.calculateMetrics(code);
    
    // Определяем общее качество
    analysis.quality = this.calculateQuality(analysis);

    // Сохраняем анализ
    this.analysisHistory.push(analysis);
    
    // Ограничиваем историю
    if (this.analysisHistory.length > 100) {
      this.analysisHistory = this.analysisHistory.slice(-100);
    }

    return analysis;
  }

  /**
   * Обнаруживает проблемы в коде
   */
  private static detectIssues(code: string, filePath: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // Проверяем на потенциальные баги
      if (this.detectPotentialBugs(trimmedLine)) {
        issues.push({
          type: "bug",
          severity: "medium",
          line: lineNumber,
          message: "Потенциальная ошибка в логике",
          suggestion: "Проверьте условие и логику выполнения",
          confidence: 0.7
        });
      }

      // Проверяем производительность
      if (this.detectPerformanceIssues(trimmedLine)) {
        issues.push({
          type: "performance",
          severity: "high",
          line: lineNumber,
          message: "Проблема производительности",
          suggestion: "Оптимизируйте алгоритм или используйте более эффективные методы",
          confidence: 0.8
        });
      }

      // Проверяем безопасность
      if (this.detectSecurityIssues(trimmedLine)) {
        issues.push({
          type: "security",
          severity: "critical",
          line: lineNumber,
          message: "Потенциальная уязвимость безопасности",
          suggestion: "Используйте безопасные методы и валидацию данных",
          confidence: 0.9
        });
      }

      // Проверяем стиль кода
      if (this.detectStyleIssues(trimmedLine)) {
        issues.push({
          type: "style",
          severity: "low",
          line: lineNumber,
          message: "Нарушение стиля кода",
          suggestion: "Следуйте стандартам кодирования проекта",
          confidence: 0.6
        });
      }
    });

    return issues;
  }

  /**
   * Обнаруживает потенциальные баги
   */
  private static detectPotentialBugs(line: string): boolean {
    const bugPatterns = [
      /==\s*null/, // Сравнение с null через ==
      /!=\s*null/, // Сравнение с null через !=
      /\.length\s*==\s*0/, // Проверка длины через ==
      /undefined\s*==/, // Сравнение с undefined
      /console\.log/, // Оставленные console.log
      /debugger/, // Оставленные debugger
      /TODO|FIXME|HACK/, // Технический долг
    ];

    return bugPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Обнаруживает проблемы производительности
   */
  private static detectPerformanceIssues(line: string): boolean {
    const performancePatterns = [
      /for\s*\(\s*var\s+i/, // var в цикле
      /\.innerHTML\s*=/, // innerHTML
      /document\.getElementById/, // Прямые DOM запросы
      /eval\s*\(/, // eval
      /setInterval/, // setInterval без очистки
      /setTimeout.*0/, // setTimeout с 0
    ];

    return performancePatterns.some(pattern => pattern.test(line));
  }

  /**
   * Обнаруживает проблемы безопасности
   */
  private static detectSecurityIssues(line: string): boolean {
    const securityPatterns = [
      /innerHTML\s*=/, // XSS уязвимость
      /eval\s*\(/, // Code injection
      /document\.write/, // DOM manipulation
      /window\.location/, // Redirect manipulation
      /localStorage\.setItem/, // Небезопасное хранение
      /sessionStorage\.setItem/, // Небезопасное хранение
    ];

    return securityPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Обнаруживает проблемы стиля
   */
  private static detectStyleIssues(line: string): boolean {
    const stylePatterns = [
      /^\s*$/, // Пустые строки
      /[^\s]\s+$/, // Пробелы в конце строки
      /^\s+/, // Отступы табами вместо пробелов
      /;\s*$/, // Точка с запятой в конце
      /var\s+/, // Использование var
    ];

    return stylePatterns.some(pattern => pattern.test(line));
  }

  /**
   * Генерирует предложения по улучшению
   */
  private static generateSuggestions(code: string, issues: CodeIssue[]): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Анализируем сложность кода
    const complexity = this.calculateComplexity(code);
    if (complexity > 10) {
      suggestions.push({
        type: "refactor",
        priority: "high",
        description: "Высокая цикломатическая сложность",
        impact: "Улучшит читаемость и поддерживаемость кода",
        effort: "medium"
      });
    }

    // Проверяем покрытие тестами
    if (!code.includes("test") && !code.includes("spec")) {
      suggestions.push({
        type: "test",
        priority: "medium",
        description: "Добавить тесты для кода",
        impact: "Повысит надежность и предотвратит регрессии",
        effort: "high"
      });
    }

    // Проверяем документацию
    if (!code.includes("/**") && !code.includes("//")) {
      suggestions.push({
        type: "document",
        priority: "low",
        description: "Добавить документацию к функциям",
        impact: "Улучшит понимание кода другими разработчиками",
        effort: "low"
      });
    }

    // Анализируем производительность
    if (code.includes("for") && code.includes("length")) {
      suggestions.push({
        type: "optimize",
        priority: "medium",
        description: "Оптимизировать циклы",
        impact: "Улучшит производительность приложения",
        effort: "medium"
      });
    }

    return suggestions;
  }

  /**
   * Вычисляет метрики кода
   */
  private static calculateMetrics(code: string): CodeMetrics {
    const lines = code.split('\n');
    const totalLines = lines.length;
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*')
    ).length;

    return {
      complexity: this.calculateComplexity(code),
      maintainability: this.calculateMaintainability(code),
      testCoverage: this.calculateTestCoverage(code),
      documentation: commentLines / totalLines,
      performance: this.calculatePerformanceScore(code)
    };
  }

  /**
   * Вычисляет цикломатическую сложность
   */
  private static calculateComplexity(code: string): number {
    const complexityPatterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g
    ];

    let complexity = 1; // Базовая сложность
    complexityPatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * Вычисляет поддерживаемость кода
   */
  private static calculateMaintainability(code: string): number {
    const lines = code.split('\n');
    const totalLines = lines.length;
    
    // Факторы, снижающие поддерживаемость
    let issues = 0;
    
    // Длинные функции
    if (totalLines > 50) issues += 0.3;
    
    // Много вложенности
    const maxIndentation = Math.max(...lines.map(line => 
      (line.match(/^\s*/)?.[0]?.length || 0) / 2
    ));
    if (maxIndentation > 4) issues += 0.2;
    
    // Дублирование кода
    const duplicateLines = this.findDuplicateLines(lines);
    if (duplicateLines > 5) issues += 0.2;
    
    // Технический долг
    const techDebt = (code.match(/TODO|FIXME|HACK/g) || []).length;
    if (techDebt > 3) issues += 0.3;

    return Math.max(0, 1 - issues);
  }

  /**
   * Вычисляет покрытие тестами
   */
  private static calculateTestCoverage(code: string): number {
    // Упрощенная оценка покрытия тестами
    const hasTests = code.includes("test") || code.includes("spec");
    const hasAssertions = code.includes("expect") || code.includes("assert");
    
    if (hasTests && hasAssertions) return 0.8;
    if (hasTests) return 0.5;
    return 0.1;
  }

  /**
   * Вычисляет оценку производительности
   */
  private static calculatePerformanceScore(code: string): number {
    let score = 1.0;
    
    // Штрафы за неэффективные паттерны
    if (code.includes("eval")) score -= 0.5;
    if (code.includes("innerHTML")) score -= 0.3;
    if (code.includes("document.write")) score -= 0.4;
    if (code.includes("setInterval")) score -= 0.2;
    
    return Math.max(0, score);
  }

  /**
   * Вычисляет общее качество кода
   */
  private static calculateQuality(analysis: CodeAnalysis): number {
    const { metrics, issues } = analysis;
    
    // Базовое качество на основе метрик
    let quality = (
      metrics.maintainability * 0.3 +
      metrics.testCoverage * 0.2 +
      metrics.documentation * 0.1 +
      metrics.performance * 0.2 +
      (1 - Math.min(1, metrics.complexity / 20)) * 0.2
    );
    
    // Штрафы за критические проблемы
    const criticalIssues = issues.filter(issue => issue.severity === "critical").length;
    const highIssues = issues.filter(issue => issue.severity === "high").length;
    
    quality -= criticalIssues * 0.2;
    quality -= highIssues * 0.1;
    
    return Math.max(0, Math.min(1, quality));
  }

  /**
   * Находит дублирующиеся строки
   */
  private static findDuplicateLines(lines: string[]): number {
    const lineCounts: Record<string, number> = {};
    let duplicates = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 10) { // Игнорируем короткие строки
        lineCounts[trimmed] = (lineCounts[trimmed] || 0) + 1;
        if (lineCounts[trimmed] === 2) {
          duplicates++;
        }
      }
    });
    
    return duplicates;
  }

  /**
   * Получить историю анализов
   */
  static getAnalysisHistory(): CodeAnalysis[] {
    return [...this.analysisHistory];
  }

  /**
   * Получить статистику качества кода
   */
  static getQualityStats(): {
    averageQuality: number;
    totalIssues: number;
    criticalIssues: number;
    suggestionsCount: number;
  } {
    if (this.analysisHistory.length === 0) {
      return {
        averageQuality: 0,
        totalIssues: 0,
        criticalIssues: 0,
        suggestionsCount: 0
      };
    }

    const totalQuality = this.analysisHistory.reduce((sum, analysis) => sum + analysis.quality, 0);
    const totalIssues = this.analysisHistory.reduce((sum, analysis) => sum + analysis.issues.length, 0);
    const criticalIssues = this.analysisHistory.reduce((sum, analysis) => 
      sum + analysis.issues.filter(issue => issue.severity === "critical").length, 0
    );
    const suggestionsCount = this.analysisHistory.reduce((sum, analysis) => sum + analysis.suggestions.length, 0);

    return {
      averageQuality: totalQuality / this.analysisHistory.length,
      totalIssues,
      criticalIssues,
      suggestionsCount
    };
  }
}
