export interface ProjectPrediction {
  id: string;
  projectId: string;
  prediction: {
    successProbability: number;
    estimatedDuration: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    budgetEstimate: number;
    teamSizeRecommendation: number;
    technologyStack: string[];
    potentialChallenges: string[];
    successFactors: string[];
    recommendations: string[];
  };
  confidence: number;
  timestamp: Date;
  basedOn: {
    similarProjects: number;
    historicalData: number;
    teamExperience: number;
  };
}

export interface ProjectMetrics {
  projectId: string;
  complexity: number;
  teamSize: number;
  budget: number;
  timeline: number;
  technologyStack: string[];
  teamExperience: number;
  clientRequirements: string[];
  marketConditions: number;
  competition: number;
}

export interface RiskAssessment {
  id: string;
  projectId: string;
  risks: {
    category: 'technical' | 'business' | 'team' | 'external';
    risk: string;
    probability: number;
    impact: number;
    mitigation: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
  overallRiskScore: number;
  recommendations: string[];
  timestamp: Date;
}

export interface MarketAnalysis {
  id: string;
  projectId: string;
  marketSize: number;
  growthRate: number;
  competition: {
    level: 'low' | 'medium' | 'high';
    competitors: string[];
    marketShare: number;
  };
  trends: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface TechnologyTrend {
  name: string;
  popularity: number;
  growthRate: number;
  adoptionRate: number;
  futurePotential: number;
  category: 'frontend' | 'backend' | 'database' | 'cloud' | 'mobile' | 'ai';
  description: string;
}

export class AIProjectPredictor {
  private predictions: ProjectPrediction[] = [];
  private riskAssessments: RiskAssessment[] = [];
  private marketAnalyses: MarketAnalysis[] = [];
  private technologyTrends: TechnologyTrend[] = [];
  private historicalData: any[] = [];

  constructor() {
    this.initializeTechnologyTrends();
    this.initializeHistoricalData();
  }

  private initializeTechnologyTrends() {
    this.technologyTrends = [
      {
        name: 'React',
        popularity: 85,
        growthRate: 12,
        adoptionRate: 78,
        futurePotential: 90,
        category: 'frontend',
        description: 'Популярная библиотека для создания пользовательских интерфейсов'
      },
      {
        name: 'Next.js',
        popularity: 75,
        growthRate: 25,
        adoptionRate: 65,
        futurePotential: 85,
        category: 'frontend',
        description: 'React фреймворк для продакшена'
      },
      {
        name: 'Node.js',
        popularity: 80,
        growthRate: 8,
        adoptionRate: 70,
        futurePotential: 75,
        category: 'backend',
        description: 'JavaScript runtime для серверной разработки'
      },
      {
        name: 'TypeScript',
        popularity: 70,
        growthRate: 20,
        adoptionRate: 60,
        futurePotential: 85,
        category: 'frontend',
        description: 'Типизированный JavaScript'
      },
      {
        name: 'Python',
        popularity: 90,
        growthRate: 15,
        adoptionRate: 80,
        futurePotential: 95,
        category: 'backend',
        description: 'Универсальный язык программирования'
      },
      {
        name: 'PostgreSQL',
        popularity: 75,
        growthRate: 10,
        adoptionRate: 70,
        futurePotential: 80,
        category: 'database',
        description: 'Мощная реляционная база данных'
      },
      {
        name: 'AWS',
        popularity: 85,
        growthRate: 18,
        adoptionRate: 75,
        futurePotential: 90,
        category: 'cloud',
        description: 'Облачная платформа Amazon'
      },
      {
        name: 'Docker',
        popularity: 80,
        growthRate: 22,
        adoptionRate: 65,
        futurePotential: 85,
        category: 'cloud',
        description: 'Контейнеризация приложений'
      }
    ];
  }

  private initializeHistoricalData() {
    this.historicalData = [
      {
        projectId: 'proj_1',
        type: 'web-app',
        complexity: 7,
        teamSize: 5,
        budget: 50000,
        duration: 120,
        success: true,
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        teamExperience: 8
      },
      {
        projectId: 'proj_2',
        type: 'mobile-app',
        complexity: 6,
        teamSize: 4,
        budget: 75000,
        duration: 90,
        success: true,
        technologies: ['React Native', 'Firebase'],
        teamExperience: 7
      },
      {
        projectId: 'proj_3',
        type: 'e-commerce',
        complexity: 9,
        teamSize: 8,
        budget: 150000,
        duration: 180,
        success: false,
        technologies: ['Vue.js', 'Laravel', 'MySQL'],
        teamExperience: 6
      }
    ];
  }

  // Предсказание успеха проекта
  async predictProjectSuccess(metrics: ProjectMetrics): Promise<ProjectPrediction> {
    try {
      const similarProjects = this.findSimilarProjects(metrics);
      const riskLevel = this.calculateRiskLevel(metrics);
      const successProbability = this.calculateSuccessProbability(metrics, similarProjects);
      const estimatedDuration = this.estimateDuration(metrics, similarProjects);
      const budgetEstimate = this.estimateBudget(metrics, similarProjects);
      
      const prediction: ProjectPrediction = {
        id: `pred_${Date.now()}`,
        projectId: metrics.projectId,
        prediction: {
          successProbability,
          estimatedDuration,
          riskLevel,
          budgetEstimate,
          teamSizeRecommendation: this.recommendTeamSize(metrics),
          technologyStack: this.recommendTechnologies(metrics),
          potentialChallenges: this.identifyChallenges(metrics),
          successFactors: this.identifySuccessFactors(metrics),
          recommendations: this.generateRecommendations(metrics, riskLevel)
        },
        confidence: this.calculateConfidence(metrics, similarProjects),
        timestamp: new Date(),
        basedOn: {
          similarProjects: similarProjects.length,
          historicalData: this.historicalData.length,
          teamExperience: metrics.teamExperience
        }
      };

      this.predictions.push(prediction);
      console.log(`🔮 Предсказание для проекта ${metrics.projectId}: ${successProbability}% успеха`);
      return prediction;
    } catch (error) {
      console.error('Ошибка предсказания проекта:', error);
      throw error;
    }
  }

  private findSimilarProjects(metrics: ProjectMetrics): any[] {
    return this.historicalData.filter(project => {
      const complexityDiff = Math.abs(project.complexity - metrics.complexity);
      const teamSizeDiff = Math.abs(project.teamSize - metrics.teamSize);
      const experienceDiff = Math.abs(project.teamExperience - metrics.teamExperience);
      
      return complexityDiff <= 2 && teamSizeDiff <= 2 && experienceDiff <= 2;
    });
  }

  private calculateRiskLevel(metrics: ProjectMetrics): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;
    
    // Сложность проекта
    if (metrics.complexity >= 8) riskScore += 3;
    else if (metrics.complexity >= 6) riskScore += 2;
    else if (metrics.complexity >= 4) riskScore += 1;
    
    // Опыт команды
    if (metrics.teamExperience < 5) riskScore += 3;
    else if (metrics.teamExperience < 7) riskScore += 2;
    else if (metrics.teamExperience < 9) riskScore += 1;
    
    // Размер команды
    if (metrics.teamSize < 3) riskScore += 2;
    else if (metrics.teamSize > 10) riskScore += 2;
    
    // Бюджет
    if (metrics.budget < 20000) riskScore += 2;
    else if (metrics.budget > 200000) riskScore += 1;
    
    if (riskScore >= 8) return 'critical';
    if (riskScore >= 6) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  }

  private calculateSuccessProbability(metrics: ProjectMetrics, similarProjects: any[]): number {
    let baseProbability = 50;
    
    // Опыт команды
    if (metrics.teamExperience >= 8) baseProbability += 20;
    else if (metrics.teamExperience >= 6) baseProbability += 10;
    else if (metrics.teamExperience < 4) baseProbability -= 20;
    
    // Сложность проекта
    if (metrics.complexity <= 4) baseProbability += 15;
    else if (metrics.complexity >= 8) baseProbability -= 15;
    
    // Размер команды
    if (metrics.teamSize >= 4 && metrics.teamSize <= 8) baseProbability += 10;
    else if (metrics.teamSize < 3) baseProbability -= 15;
    else if (metrics.teamSize > 10) baseProbability -= 10;
    
    // Анализ похожих проектов
    if (similarProjects.length > 0) {
      const successRate = similarProjects.filter(p => p.success).length / similarProjects.length;
      baseProbability = (baseProbability + successRate * 100) / 2;
    }
    
    return Math.max(10, Math.min(95, Math.round(baseProbability)));
  }

  private estimateDuration(metrics: ProjectMetrics, similarProjects: any[]): number {
    let baseDuration = metrics.timeline;
    
    // Корректировка на основе сложности
    if (metrics.complexity >= 8) baseDuration *= 1.5;
    else if (metrics.complexity >= 6) baseDuration *= 1.2;
    else if (metrics.complexity <= 3) baseDuration *= 0.8;
    
    // Корректировка на основе опыта команды
    if (metrics.teamExperience < 5) baseDuration *= 1.3;
    else if (metrics.teamExperience >= 8) baseDuration *= 0.9;
    
    // Анализ похожих проектов
    if (similarProjects.length > 0) {
      const avgDuration = similarProjects.reduce((sum, p) => sum + p.duration, 0) / similarProjects.length;
      baseDuration = (baseDuration + avgDuration) / 2;
    }
    
    return Math.round(baseDuration);
  }

  private estimateBudget(metrics: ProjectMetrics, similarProjects: any[]): number {
    let baseBudget = metrics.budget;
    
    // Корректировка на основе сложности
    if (metrics.complexity >= 8) baseBudget *= 1.4;
    else if (metrics.complexity >= 6) baseBudget *= 1.1;
    else if (metrics.complexity <= 3) baseBudget *= 0.9;
    
    // Корректировка на основе размера команды
    baseBudget *= (metrics.teamSize / 5); // Базовая команда 5 человек
    
    // Анализ похожих проектов
    if (similarProjects.length > 0) {
      const avgBudget = similarProjects.reduce((sum, p) => sum + p.budget, 0) / similarProjects.length;
      baseBudget = (baseBudget + avgBudget) / 2;
    }
    
    return Math.round(baseBudget);
  }

  private recommendTeamSize(metrics: ProjectMetrics): number {
    if (metrics.complexity <= 3) return 2;
    if (metrics.complexity <= 5) return 4;
    if (metrics.complexity <= 7) return 6;
    if (metrics.complexity <= 9) return 8;
    return 10;
  }

  private recommendTechnologies(metrics: ProjectMetrics): string[] {
    const recommendations = [];
    
    // Рекомендации на основе сложности
    if (metrics.complexity <= 4) {
      recommendations.push('React', 'Node.js', 'PostgreSQL');
    } else if (metrics.complexity <= 7) {
      recommendations.push('Next.js', 'TypeScript', 'Prisma', 'PostgreSQL');
    } else {
      recommendations.push('Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Redis', 'Docker');
    }
    
    // Добавляем популярные технологии
    const popularTechs = this.technologyTrends
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 3)
      .map(t => t.name);
    
    recommendations.push(...popularTechs);
    
    return [...new Set(recommendations)];
  }

  private identifyChallenges(metrics: ProjectMetrics): string[] {
    const challenges = [];
    
    if (metrics.complexity >= 8) {
      challenges.push('Высокая техническая сложность');
      challenges.push('Необходимость глубокой экспертизы');
    }
    
    if (metrics.teamExperience < 5) {
      challenges.push('Недостаточный опыт команды');
      challenges.push('Необходимость обучения');
    }
    
    if (metrics.teamSize < 3) {
      challenges.push('Недостаток ресурсов');
    }
    
    if (metrics.budget < 30000) {
      challenges.push('Ограниченный бюджет');
    }
    
    if (metrics.technologyStack.length > 5) {
      challenges.push('Сложность интеграции технологий');
    }
    
    return challenges;
  }

  private identifySuccessFactors(metrics: ProjectMetrics): string[] {
    const factors = [];
    
    if (metrics.teamExperience >= 8) {
      factors.push('Высокий опыт команды');
    }
    
    if (metrics.teamSize >= 4 && metrics.teamSize <= 8) {
      factors.push('Оптимальный размер команды');
    }
    
    if (metrics.complexity <= 6) {
      factors.push('Умеренная сложность проекта');
    }
    
    if (metrics.budget >= 50000) {
      factors.push('Достаточное финансирование');
    }
    
    factors.push('Четкие требования клиента');
    factors.push('Регулярная коммуникация');
    
    return factors;
  }

  private generateRecommendations(metrics: ProjectMetrics, riskLevel: string): string[] {
    const recommendations = [];
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Рассмотрите разбиение проекта на этапы');
      recommendations.push('Увеличьте опыт команды или добавьте экспертов');
      recommendations.push('Создайте резервный план');
    }
    
    if (metrics.teamExperience < 6) {
      recommendations.push('Инвестируйте в обучение команды');
      recommendations.push('Наймите опытного ментора');
    }
    
    if (metrics.complexity >= 7) {
      recommendations.push('Проведите техническое исследование (PoC)');
      recommendations.push('Создайте детальную архитектуру');
    }
    
    if (metrics.teamSize < 4) {
      recommendations.push('Рассмотрите расширение команды');
    }
    
    recommendations.push('Установите четкие метрики успеха');
    recommendations.push('Планируйте регулярные ретроспективы');
    
    return recommendations;
  }

  private calculateConfidence(metrics: ProjectMetrics, similarProjects: any[]): number {
    let confidence = 50;
    
    // Больше данных = выше уверенность
    if (similarProjects.length >= 5) confidence += 20;
    else if (similarProjects.length >= 3) confidence += 10;
    
    // Опыт команды влияет на уверенность
    if (metrics.teamExperience >= 8) confidence += 15;
    else if (metrics.teamExperience >= 6) confidence += 10;
    
    // Четкие требования
    if (metrics.clientRequirements.length >= 5) confidence += 10;
    
    return Math.min(95, confidence);
  }

  // Анализ рисков
  async assessRisks(projectId: string, metrics: ProjectMetrics): Promise<RiskAssessment> {
    const risks = this.identifyRisks(metrics);
    const overallRiskScore = this.calculateOverallRiskScore(risks);
    
    const assessment: RiskAssessment = {
      id: `risk_${Date.now()}`,
      projectId,
      risks,
      overallRiskScore,
      recommendations: this.generateRiskMitigationRecommendations(risks),
      timestamp: new Date()
    };
    
    this.riskAssessments.push(assessment);
    return assessment;
  }

  private identifyRisks(metrics: ProjectMetrics): any[] {
    const risks = [];
    
    // Технические риски
    if (metrics.complexity >= 8) {
      risks.push({
        category: 'technical',
        risk: 'Высокая техническая сложность',
        probability: 0.8,
        impact: 0.9,
        mitigation: 'Проведение технического исследования и создание прототипа',
        priority: 'high'
      });
    }
    
    if (metrics.technologyStack.length > 5) {
      risks.push({
        category: 'technical',
        risk: 'Сложность интеграции множества технологий',
        probability: 0.7,
        impact: 0.8,
        mitigation: 'Поэтапная интеграция и тестирование',
        priority: 'medium'
      });
    }
    
    // Командные риски
    if (metrics.teamExperience < 5) {
      risks.push({
        category: 'team',
        risk: 'Недостаточный опыт команды',
        probability: 0.9,
        impact: 0.8,
        mitigation: 'Обучение команды и привлечение экспертов',
        priority: 'high'
      });
    }
    
    if (metrics.teamSize < 3) {
      risks.push({
        category: 'team',
        risk: 'Недостаток ресурсов',
        probability: 0.8,
        impact: 0.7,
        mitigation: 'Расширение команды или аутсорсинг',
        priority: 'medium'
      });
    }
    
    // Бизнес риски
    if (metrics.budget < 30000) {
      risks.push({
        category: 'business',
        risk: 'Ограниченный бюджет',
        probability: 0.7,
        impact: 0.8,
        mitigation: 'Оптимизация ресурсов и приоритизация функций',
        priority: 'high'
      });
    }
    
    // Внешние риски
    if (metrics.marketConditions < 5) {
      risks.push({
        category: 'external',
        risk: 'Неблагоприятные рыночные условия',
        probability: 0.6,
        impact: 0.7,
        mitigation: 'Адаптация стратегии под рынок',
        priority: 'medium'
      });
    }
    
    return risks;
  }

  private calculateOverallRiskScore(risks: any[]): number {
    if (risks.length === 0) return 0;
    
    const weightedScore = risks.reduce((sum, risk) => {
      const weight = risk.priority === 'critical' ? 4 : 
                    risk.priority === 'high' ? 3 : 
                    risk.priority === 'medium' ? 2 : 1;
      return sum + (risk.probability * risk.impact * weight);
    }, 0);
    
    const maxPossibleScore = risks.length * 4; // Максимальный вес
    return Math.round((weightedScore / maxPossibleScore) * 100);
  }

  private generateRiskMitigationRecommendations(risks: any[]): string[] {
    const recommendations = [];
    
    const highPriorityRisks = risks.filter(r => r.priority === 'high' || r.priority === 'critical');
    if (highPriorityRisks.length > 0) {
      recommendations.push('Создайте план управления рисками');
      recommendations.push('Назначьте ответственных за каждый риск');
    }
    
    const technicalRisks = risks.filter(r => r.category === 'technical');
    if (technicalRisks.length > 0) {
      recommendations.push('Проведите техническое исследование');
      recommendations.push('Создайте архитектурный план');
    }
    
    const teamRisks = risks.filter(r => r.category === 'team');
    if (teamRisks.length > 0) {
      recommendations.push('Инвестируйте в развитие команды');
      recommendations.push('Рассмотрите привлечение внешних экспертов');
    }
    
    return recommendations;
  }

  // Анализ рынка
  async analyzeMarket(projectId: string, projectType: string): Promise<MarketAnalysis> {
    const marketSize = this.estimateMarketSize(projectType);
    const growthRate = this.estimateGrowthRate(projectType);
    const competition = this.analyzeCompetition(projectType);
    const trends = this.identifyMarketTrends(projectType);
    
    const analysis: MarketAnalysis = {
      id: `market_${Date.now()}`,
      projectId,
      marketSize,
      growthRate,
      competition,
      trends,
      opportunities: this.identifyOpportunities(projectType, trends),
      threats: this.identifyThreats(projectType, competition),
      recommendations: this.generateMarketRecommendations(projectType, marketSize, competition),
      timestamp: new Date()
    };
    
    this.marketAnalyses.push(analysis);
    return analysis;
  }

  private estimateMarketSize(projectType: string): number {
    const marketSizes = {
      'web-app': 50000000000,
      'mobile-app': 30000000000,
      'e-commerce': 40000000000,
      'saas': 60000000000,
      'ai-ml': 20000000000
    };
    
    return marketSizes[projectType as keyof typeof marketSizes] || 10000000000;
  }

  private estimateGrowthRate(projectType: string): number {
    const growthRates = {
      'web-app': 8,
      'mobile-app': 12,
      'e-commerce': 15,
      'saas': 20,
      'ai-ml': 25
    };
    
    return growthRates[projectType as keyof typeof growthRates] || 10;
  }

  private analyzeCompetition(projectType: string): any {
    const competitionLevels = {
      'web-app': { level: 'high', competitors: ['Google', 'Microsoft', 'Amazon'], marketShare: 70 },
      'mobile-app': { level: 'high', competitors: ['Apple', 'Google', 'Facebook'], marketShare: 80 },
      'e-commerce': { level: 'medium', competitors: ['Amazon', 'Shopify', 'WooCommerce'], marketShare: 60 },
      'saas': { level: 'medium', competitors: ['Salesforce', 'Microsoft', 'Oracle'], marketShare: 50 },
      'ai-ml': { level: 'low', competitors: ['OpenAI', 'Google', 'Microsoft'], marketShare: 30 }
    };
    
    return competitionLevels[projectType as keyof typeof competitionLevels] || { level: 'medium', competitors: [], marketShare: 50 };
  }

  private identifyMarketTrends(projectType: string): string[] {
    const trends = {
      'web-app': ['Progressive Web Apps', 'Serverless Architecture', 'Microservices'],
      'mobile-app': ['Cross-platform Development', 'AI Integration', 'IoT Connectivity'],
      'e-commerce': ['Personalization', 'Voice Commerce', 'Social Commerce'],
      'saas': ['No-code/Low-code', 'AI Automation', 'Vertical SaaS'],
      'ai-ml': ['Generative AI', 'Edge Computing', 'Federated Learning']
    };
    
    return trends[projectType as keyof typeof trends] || ['Digital Transformation', 'Cloud Migration'];
  }

  private identifyOpportunities(projectType: string, trends: string[]): string[] {
    const opportunities = [];
    
    trends.forEach(trend => {
      opportunities.push(`Раннее внедрение тренда: ${trend}`);
    });
    
    opportunities.push('Улучшение пользовательского опыта');
    opportunities.push('Оптимизация процессов');
    opportunities.push('Автоматизация рутинных задач');
    
    return opportunities;
  }

  private identifyThreats(projectType: string, competition: any): string[] {
    const threats = [];
    
    if (competition.level === 'high') {
      threats.push('Высокая конкуренция на рынке');
      threats.push('Сложность дифференциации');
    }
    
    threats.push('Быстрые технологические изменения');
    threats.push('Изменения в регулировании');
    threats.push('Экономическая нестабильность');
    
    return threats;
  }

  private generateMarketRecommendations(projectType: string, marketSize: number, competition: any): string[] {
    const recommendations = [];
    
    if (competition.level === 'high') {
      recommendations.push('Сфокусируйтесь на нишевом рынке');
      recommendations.push('Создайте уникальное ценностное предложение');
    }
    
    if (marketSize > 50000000000) {
      recommendations.push('Рынок достаточно большой для масштабирования');
      recommendations.push('Рассмотрите международную экспансию');
    }
    
    recommendations.push('Изучите потребности целевой аудитории');
    recommendations.push('Разработайте стратегию выхода на рынок');
    
    return recommendations;
  }

  // Получить тренды технологий
  getTechnologyTrends(): TechnologyTrend[] {
    return this.technologyTrends;
  }

  // Получить статистику предсказаний
  getPredictionStats() {
    const totalPredictions = this.predictions.length;
    const avgConfidence = this.predictions.length > 0 
      ? this.predictions.reduce((sum, p) => sum + p.confidence, 0) / this.predictions.length 
      : 0;
    
    const riskDistribution = this.riskAssessments.reduce((acc, assessment) => {
      const level = assessment.overallRiskScore >= 80 ? 'critical' :
                   assessment.overallRiskScore >= 60 ? 'high' :
                   assessment.overallRiskScore >= 40 ? 'medium' : 'low';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalPredictions,
      avgConfidence: Math.round(avgConfidence),
      riskDistribution,
      recentPredictions: this.predictions.slice(-5),
      topTechnologies: this.technologyTrends
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5)
    };
  }
}

export const AIProjectPredictorInstance = new AIProjectPredictor();
