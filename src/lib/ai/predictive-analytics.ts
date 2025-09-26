import { GigaChatService } from './gigachat-service';

interface ProjectData {
  timeline: number;
  complexity: number;
  teamSize: number;
  experience: number;
  resources: number;
  communication: number;
  previousProjects: number;
}

interface Prediction {
  type: 'risk' | 'opportunity' | 'bottleneck' | 'quality_issue';
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
  timeframe: string;
  confidence: number;
}

interface RiskAssessment {
  overallRisk: number;
  predictions: Prediction[];
  mitigationStrategies: string[];
  monitoringPoints: string[];
}

class PredictiveAnalytics {
  private gigachat: GigaChatService;
  private historicalData: any[] = [];

  constructor() {
    this.gigachat = new GigaChatService();
  }

  async analyzeProjectRisks(projectData: ProjectData): Promise<RiskAssessment> {
    try {
      const analysis = await this.gigachat.predictRisks({
        projectData,
        historicalData: this.historicalData.slice(-10)
      });

      const predictions: Prediction[] = analysis.predictions.map((p: any) => ({
        type: p.type,
        probability: p.probability,
        impact: p.impact,
        description: p.description,
        recommendations: p.recommendations,
        timeframe: p.timeframe,
        confidence: p.confidence
      }));

      const overallRisk = this.calculateOverallRisk(predictions);

      return {
        overallRisk,
        predictions,
        mitigationStrategies: analysis.mitigationStrategies,
        monitoringPoints: analysis.monitoringPoints
      };
    } catch (error) {
      console.error('Ошибка анализа рисков:', error);
      return {
        overallRisk: 50,
        predictions: [],
        mitigationStrategies: ['Проведите дополнительный анализ'],
        monitoringPoints: ['Мониторьте ключевые метрики']
      };
    }
  }

  async predictTeamPerformance(
    teamData: {
      members: Array<{ experience: number; workload: number; satisfaction: number }>;
      projectComplexity: number;
      timeline: number;
    }
  ): Promise<{
    predictedPerformance: number;
    bottlenecks: string[];
    recommendations: string[];
  }> {
    try {
      const prediction = await this.gigachat.predictPerformance({
      teamData,
      historicalData: this.historicalData
    });

    return {
      predictedPerformance: prediction.performance,
      bottlenecks: prediction.bottlenecks,
      recommendations: prediction.recommendations
    };
  } catch (error) {
    console.error('Ошибка предсказания производительности:', error);
    return {
      predictedPerformance: 75,
      bottlenecks: ['Недостаточно данных для точного прогноза'],
      recommendations: ['Соберите больше метрик команды']
    };
  }
}

  async predictQualityIssues(
    codeMetrics: {
      complexity: number;
      testCoverage: number;
      documentation: number;
      reviewTime: number;
    }
  ): Promise<{
    qualityScore: number;
    potentialIssues: string[];
    improvementSuggestions: string[];
  }> {
    try {
      const analysis = await this.gigachat.predictQuality({
        codeMetrics,
        historicalData: this.historicalData
      });

      return {
        qualityScore: analysis.qualityScore,
        potentialIssues: analysis.issues,
        improvementSuggestions: analysis.suggestions
      };
    } catch (error) {
      console.error('Ошибка предсказания качества:', error);
      return {
        qualityScore: 70,
        potentialIssues: ['Недостаточно данных для анализа'],
        improvementSuggestions: ['Улучшите метрики качества']
      };
    }
  }

  async predictDeadlineRisks(
    projectData: {
      progress: number;
      timeline: number;
      remainingWork: number;
      teamVelocity: number;
    }
  ): Promise<{
    deadlineRisk: number;
    suggestedActions: string[];
    alternativeTimelines: Array<{ scenario: string; probability: number; timeline: number }>;
  }> {
    try {
      const prediction = await this.gigachat.predictDeadline({
        projectData,
        historicalData: this.historicalData
      });

      return {
        deadlineRisk: prediction.risk,
        suggestedActions: prediction.actions,
        alternativeTimelines: prediction.scenarios
      };
    } catch (error) {
      console.error('Ошибка предсказания дедлайнов:', error);
      return {
        deadlineRisk: 50,
        suggestedActions: ['Увеличьте мониторинг прогресса'],
        alternativeTimelines: []
      };
    }
  }

  private calculateOverallRisk(predictions: Prediction[]): number {
    if (predictions.length === 0) return 0;

    const weightedRisk = predictions.reduce((sum, pred) => {
      const impactWeight = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4
      }[pred.impact];
      
      return sum + (pred.probability * impactWeight);
    }, 0);

    const maxPossibleRisk = predictions.length * 4; // максимальный вес
    return Math.round((weightedRisk / maxPossibleRisk) * 100);
  }

  addHistoricalData(data: any): void {
    this.historicalData.push({
      ...data,
      timestamp: new Date()
    });

    // Ограничиваем размер истории
    if (this.historicalData.length > 100) {
      this.historicalData = this.historicalData.slice(-50);
    }
  }

  getPredictionAccuracy(): {
    totalPredictions: number;
    accuratePredictions: number;
    accuracyRate: number;
  } {
    // Простая логика для демонстрации
    const total = this.historicalData.length;
    const accurate = Math.floor(total * 0.85); // 85% точность для демо

    return {
      totalPredictions: total,
      accuratePredictions: accurate,
      accuracyRate: total > 0 ? Math.round((accurate / total) * 100) : 0
    };
  }
}

export const PredictiveAnalyticsInstance = new PredictiveAnalytics();