import { GigaChatService } from './gigachat-service';

interface CustomAIConfig {
  id: string;
  name: string;
  companyId: string;
  specialization: string;
  trainingData: {
    documents: string[];
    codebases: string[];
    processes: string[];
    domainKnowledge: string[];
  };
  personality: {
    communicationStyle: string;
    expertise: string[];
    workingHours: string;
    collaborationStyle: string;
  };
  capabilities: string[];
  trainingStatus: 'pending' | 'training' | 'completed' | 'failed';
  accuracy: number;
  lastTraining: Date;
}

interface TrainingSession {
  id: string;
  customAIId: string;
  dataType: 'documents' | 'code' | 'processes' | 'domain';
  data: any;
  status: 'processing' | 'completed' | 'failed';
  results: {
    learnedConcepts: string[];
    accuracy: number;
    confidence: number;
  };
  timestamp: Date;
}

class CustomAISystem {
  private customAIs: CustomAIConfig[] = [];
  private trainingSessions: TrainingSession[] = [];
  private gigachat: GigaChatService;

  constructor() {
    this.gigachat = new GigaChatService();
  }

  async createCustomAI(
    companyId: string,
    name: string,
    specialization: string,
    trainingData: any
  ): Promise<string> {
    const customAIId = `custom_${companyId}_${Date.now()}`;
    
    const customAI: CustomAIConfig = {
      id: customAIId,
      name,
      companyId,
      specialization,
      trainingData,
      personality: {
        communicationStyle: 'Professional and company-specific',
        expertise: [],
        workingHours: 'Company hours',
        collaborationStyle: 'Integrated with company culture'
      },
      capabilities: [],
      trainingStatus: 'pending',
      accuracy: 0,
      lastTraining: new Date()
    };

    this.customAIs.push(customAI);
    
    // Начинаем обучение
    await this.startTraining(customAIId);
    
    return customAIId;
  }

  private async startTraining(customAIId: string): Promise<void> {
    const customAI = this.customAIs.find(ai => ai.id === customAIId);
    if (!customAI) return;

    customAI.trainingStatus = 'training';
    
    try {
      // Обрабатываем каждый тип данных
      for (const [dataType, data] of Object.entries(customAI.trainingData)) {
        if (Array.isArray(data) && data.length > 0) {
          await this.processTrainingData(customAIId, dataType as any, data);
        }
      }

      // Завершаем обучение
      await this.completeTraining(customAIId);
    } catch (error) {
      console.error('Ошибка обучения Custom AI:', error);
      customAI.trainingStatus = 'failed';
    }
  }

  private async processTrainingData(
    customAIId: string,
    dataType: 'documents' | 'code' | 'processes' | 'domain',
    data: any[]
  ): Promise<void> {
    const sessionId = `session_${Date.now()}`;
    
    const session: TrainingSession = {
      id: sessionId,
      customAIId,
      dataType,
      data,
      status: 'processing',
      results: {
        learnedConcepts: [],
        accuracy: 0,
        confidence: 0
      },
      timestamp: new Date()
    };

    this.trainingSessions.push(session);

    try {
      // Используем GigaChat для обучения
      const trainingResults = await this.gigachat.trainCustomAI({
        customAIId,
        dataType,
        data,
        companyContext: this.getCompanyContext(customAIId)
      });

      session.results = {
        learnedConcepts: trainingResults.concepts,
        accuracy: trainingResults.accuracy,
        confidence: trainingResults.confidence
      };
      session.status = 'completed';

      console.log(`🧠 Custom AI обучен на ${dataType}: ${trainingResults.concepts.length} концепций`);
    } catch (error) {
      console.error(`Ошибка обучения на ${dataType}:`, error);
      session.status = 'failed';
    }
  }

  private async completeTraining(customAIId: string): Promise<void> {
    const customAI = this.customAIs.find(ai => ai.id === customAIId);
    if (!customAI) return;

    // Анализируем результаты всех сессий обучения
    const sessions = this.trainingSessions.filter(s => s.customAIId === customAIId);
    const completedSessions = sessions.filter(s => s.status === 'completed');
    
    if (completedSessions.length === 0) {
      customAI.trainingStatus = 'failed';
      return;
    }

    // Вычисляем общую точность
    const totalAccuracy = completedSessions.reduce((sum, s) => sum + s.results.accuracy, 0);
    customAI.accuracy = totalAccuracy / completedSessions.length;

    // Формируем возможности на основе изученных концепций
    const allConcepts = completedSessions.flatMap(s => s.results.learnedConcepts);
    customAI.capabilities = [...new Set(allConcepts)];

    // Обновляем экспертизу
    customAI.personality.expertise = allConcepts.slice(0, 10); // Топ-10 концепций

    customAI.trainingStatus = 'completed';
    customAI.lastTraining = new Date();

    console.log(`✅ Custom AI "${customAI.name}" обучен успешно. Точность: ${Math.round(customAI.accuracy)}%`);
  }

  private getCompanyContext(customAIId: string): any {
    const customAI = this.customAIs.find(ai => ai.id === customAIId);
    if (!customAI) return {};

    return {
      companyId: customAI.companyId,
      specialization: customAI.specialization,
      existingKnowledge: customAI.personality.expertise
    };
  }

  async queryCustomAI(
    customAIId: string,
    question: string,
    context?: any
  ): Promise<{
    answer: string;
    confidence: number;
    sources: string[];
    suggestions: string[];
  }> {
    const customAI = this.customAIs.find(ai => ai.id === customAIId);
    if (!customAI) {
      throw new Error('Custom AI не найден');
    }

    if (customAI.trainingStatus !== 'completed') {
      throw new Error('Custom AI еще не обучен');
    }

    try {
      const response = await this.gigachat.queryCustomAI({
        customAIId,
        question,
        context: {
          ...context,
          companyContext: this.getCompanyContext(customAIId),
          capabilities: customAI.capabilities
        }
      });

      return {
        answer: response.answer,
        confidence: response.confidence,
        sources: response.sources || [],
        suggestions: response.suggestions || []
      };
    } catch (error) {
      console.error('Ошибка запроса к Custom AI:', error);
      return {
        answer: 'Извините, произошла ошибка при обработке запроса.',
        confidence: 0,
        sources: [],
        suggestions: []
      };
    }
  }

  async retrainCustomAI(
    customAIId: string,
    newData: any
  ): Promise<void> {
    const customAI = this.customAIs.find(ai => ai.id === customAIId);
    if (!customAI) {
      throw new Error('Custom AI не найден');
    }

    // Добавляем новые данные
    Object.assign(customAI.trainingData, newData);
    
    // Начинаем переобучение
    customAI.trainingStatus = 'training';
    await this.startTraining(customAIId);
    
    console.log(`🔄 Custom AI "${customAI.name}" переобучается с новыми данными`);
  }

  getCustomAI(customAIId: string): CustomAIConfig | null {
    return this.customAIs.find(ai => ai.id === customAIId) || null;
  }

  getCompanyCustomAIs(companyId: string): CustomAIConfig[] {
    return this.customAIs.filter(ai => ai.companyId === companyId);
  }

  getTrainingProgress(customAIId: string): {
    status: string;
    accuracy: number;
    completedSessions: number;
    totalSessions: number;
    learnedConcepts: number;
  } {
    const customAI = this.customAIs.find(ai => ai.id === customAIId);
    if (!customAI) {
      throw new Error('Custom AI не найден');
    }

    const sessions = this.trainingSessions.filter(s => s.customAIId === customAIId);
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const learnedConcepts = completedSessions.reduce((sum, s) => sum + s.results.learnedConcepts.length, 0);

    return {
      status: customAI.trainingStatus,
      accuracy: Math.round(customAI.accuracy),
      completedSessions: completedSessions.length,
      totalSessions: sessions.length,
      learnedConcepts
    };
  }

  getCustomAIStats(): {
    totalCustomAIs: number;
    trainedAIs: number;
    averageAccuracy: number;
    topSpecializations: string[];
  } {
    const totalCustomAIs = this.customAIs.length;
    const trainedAIs = this.customAIs.filter(ai => ai.trainingStatus === 'completed').length;
    const averageAccuracy = this.customAIs.length > 0
      ? this.customAIs.reduce((sum, ai) => sum + ai.accuracy, 0) / this.customAIs.length
      : 0;

    const specializations = this.customAIs.map(ai => ai.specialization);
    const specializationCounts: { [key: string]: number } = {};
    specializations.forEach(spec => {
      specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
    });

    const topSpecializations = Object.entries(specializationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([spec, _]) => spec);

    return {
      totalCustomAIs,
      trainedAIs,
      averageAccuracy: Math.round(averageAccuracy),
      topSpecializations
    };
  }
}

export const CustomAISystemInstance = new CustomAISystem();
