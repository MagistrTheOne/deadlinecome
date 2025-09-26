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