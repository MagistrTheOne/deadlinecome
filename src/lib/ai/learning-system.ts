import { GigaChatService } from './gigachat-service';

interface LearningExperience {
  id: string;
  aiId: string;
  projectId: string;
  experience: string;
  outcome: 'success' | 'failure' | 'partial';
  lessons: string[];
  confidence: number;
  timestamp: Date;
}

class AILearningSystem {
  private experiences: LearningExperience[] = [];
  private gigachat: GigaChatService;

  constructor() {
    this.gigachat = new GigaChatService();
  }

  async learnFromExperience(
    aiId: string,
    projectId: string,
    experience: string,
    outcome: 'success' | 'failure' | 'partial'
  ): Promise<void> {
    try {
      const analysis = await this.gigachat.analyzeExperience({
        experience,
        outcome,
        aiId
      });

      const learningExperience: LearningExperience = {
        id: `exp_${Date.now()}`,
        aiId,
        projectId,
        experience,
        outcome,
        lessons: analysis.lessons || [],
        confidence: analysis.confidence || 0.8,
        timestamp: new Date()
      };

      this.experiences.push(learningExperience);
      console.log(`🧠 AI ${aiId} извлек уроки:`, analysis.lessons);
    } catch (error) {
      console.error('Ошибка в системе обучения:', error);
    }
  }

  async getAILearningInsights(aiId: string) {
    const aiExperiences = this.experiences.filter(exp => exp.aiId === aiId);
    const recentExperiences = aiExperiences.slice(-10);
    
    return {
      aiId,
      totalExperiences: aiExperiences.length,
      recentLessons: recentExperiences.flatMap(exp => exp.lessons),
      averageConfidence: aiExperiences.length > 0 
        ? aiExperiences.reduce((sum, exp) => sum + exp.confidence, 0) / aiExperiences.length 
        : 0,
      learningTrend: recentExperiences.map(exp => ({
        timestamp: exp.timestamp,
        lessonsCount: exp.lessons.length,
        confidence: exp.confidence
      })),
      topSkills: this.experiences
        .filter(exp => exp.aiId === aiId)
        .flatMap(exp => exp.lessons)
        .reduce((acc, lesson) => {
          acc[lesson] = (acc[lesson] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      recommendations: this.generateRecommendations(aiId)
    };
  }

  private generateRecommendations(aiId: string): string[] {
    const aiExperiences = this.experiences.filter(exp => exp.aiId === aiId);
    if (aiExperiences.length === 0) {
      return ["Начните с простых задач для накопления опыта"];
    }
    
    const recentConfidence = aiExperiences.slice(-3).reduce((sum, exp) => sum + exp.confidence, 0) / 3;
    if (recentConfidence < 0.6) {
      return ["Рекомендуется больше практики в текущей области", "Рассмотрите дополнительные ресурсы для обучения"];
    }
    
    return ["Отличный прогресс! Можете переходить к более сложным задачам", "Поделитесь опытом с другими AI"];
  }

  getLearningStats() {
    return {
      totalExperiences: this.experiences.length,
      recentLessons: this.experiences
        .slice(-5)
        .flatMap(exp => exp.lessons)
    };
  }
}

export const AILearningSystemInstance = new AILearningSystem();