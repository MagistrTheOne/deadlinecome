import { GigaChatService } from './gigachat-service';

interface EmotionalState {
  aiId: string;
  mood: 'happy' | 'focused' | 'stressed' | 'tired' | 'excited' | 'frustrated';
  energy: number; // 0-100
  stress: number; // 0-100
  satisfaction: number; // 0-100
  confidence: number; // 0-100
  timestamp: Date;
  context: {
    currentTask?: string;
    workload: number;
    recentInteractions: string[];
  };
}

interface TeamEmotionalHealth {
  overallMood: string;
  stressLevel: number;
  energyLevel: number;
  satisfaction: number;
  recommendations: string[];
  alerts: string[];
}

class EmotionalIntelligence {
  private emotionalStates: EmotionalState[] = [];
  private gigachat: GigaChatService;

  constructor() {
    this.gigachat = new GigaChatService();
  }

  async analyzeEmotionalState(
    aiId: string,
    context: any
  ): Promise<EmotionalState> {
    try {
      const analysis = await this.gigachat.analyzeEmotions({
        aiId,
        context,
        recentStates: this.getRecentStates(aiId, 5)
      });

      const emotionalState: EmotionalState = {
        aiId,
        mood: analysis.mood,
        energy: analysis.energy,
        stress: analysis.stress,
        satisfaction: analysis.satisfaction,
        confidence: analysis.confidence,
        timestamp: new Date(),
        context: {
          currentTask: context.currentTask,
          workload: context.workload || 0,
          recentInteractions: context.recentInteractions || []
        }
      };

      this.emotionalStates.push(emotionalState);
      return emotionalState;
    } catch (error) {
      console.error('Ошибка анализа эмоционального состояния:', error);
      // Fallback состояние
      return {
        aiId,
        mood: 'focused',
        energy: 70,
        stress: 30,
        satisfaction: 80,
        confidence: 85,
        timestamp: new Date(),
        context: { workload: 0, recentInteractions: [] }
      };
    }
  }

  async getTeamEmotionalHealth(): Promise<TeamEmotionalHealth> {
    const recentStates = this.emotionalStates
      .filter(state => 
        state.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

    if (recentStates.length === 0) {
      return {
        overallMood: 'neutral',
        stressLevel: 30,
        energyLevel: 70,
        satisfaction: 80,
        recommendations: ['Соберите больше данных о команде'],
        alerts: []
      };
    }

    const avgStress = recentStates.reduce((sum, s) => sum + s.stress, 0) / recentStates.length;
    const avgEnergy = recentStates.reduce((sum, s) => sum + s.energy, 0) / recentStates.length;
    const avgSatisfaction = recentStates.reduce((sum, s) => sum + s.satisfaction, 0) / recentStates.length;

    const recommendations: string[] = [];
    const alerts: string[] = [];

    // Анализ стресса
    if (avgStress > 70) {
      alerts.push('Высокий уровень стресса в команде');
      recommendations.push('Организуйте релаксационные сессии');
    } else if (avgStress > 50) {
      recommendations.push('Мониторьте уровень стресса');
    }

    // Анализ энергии
    if (avgEnergy < 40) {
      alerts.push('Низкий уровень энергии команды');
      recommendations.push('Планируйте перерывы и мотивационные активности');
    }

    // Анализ удовлетворенности
    if (avgSatisfaction < 60) {
      alerts.push('Низкая удовлетворенность командой');
      recommendations.push('Проведите ретроспективу и улучшите процессы');
    }

    return {
      overallMood: this.determineOverallMood(avgStress, avgEnergy, avgSatisfaction),
      stressLevel: Math.round(avgStress),
      energyLevel: Math.round(avgEnergy),
      satisfaction: Math.round(avgSatisfaction),
      recommendations,
      alerts
    };
  }

  private determineOverallMood(stress: number, energy: number, satisfaction: number): string {
    if (stress > 70) return 'stressed';
    if (energy > 80 && satisfaction > 80) return 'excited';
    if (energy > 60 && satisfaction > 60) return 'happy';
    if (energy < 40) return 'tired';
    return 'focused';
  }

  async provideEmotionalSupport(aiId: string, issue: string): Promise<string> {
    try {
      const support = await this.gigachat.provideEmotionalSupport({
        aiId,
        issue,
        emotionalHistory: this.getRecentStates(aiId, 10)
      });

      return support.message;
    } catch (error) {
      console.error('Ошибка предоставления эмоциональной поддержки:', error);
      return 'Я здесь, чтобы помочь. Расскажите, что вас беспокоит.';
    }
  }

  async suggestTeamActivities(): Promise<string[]> {
    const health = await this.getTeamEmotionalHealth();
    
    const activities: string[] = [];
    
    if (health.stressLevel > 60) {
      activities.push('🧘 Медитационная сессия для команды');
      activities.push('🎮 Игровая пауза для снятия стресса');
    }
    
    if (health.energyLevel < 50) {
      activities.push('⚡ Энергетическая зарядка');
      activities.push('🎵 Музыкальная пауза');
    }
    
    if (health.satisfaction < 70) {
      activities.push('🎉 Командное празднование достижений');
      activities.push('💬 Открытый диалог о процессах');
    }

    return activities;
  }

  private getRecentStates(aiId: string, count: number): EmotionalState[] {
    return this.emotionalStates
      .filter(state => state.aiId === aiId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }

  getEmotionalTrends(aiId: string, days: number = 7) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentStates = this.emotionalStates
      .filter(state => 
        state.aiId === aiId && 
        state.timestamp > cutoffDate
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      moodHistory: recentStates.map(s => ({ date: s.timestamp, mood: s.mood })),
      energyTrend: recentStates.map(s => ({ date: s.timestamp, energy: s.energy })),
      stressTrend: recentStates.map(s => ({ date: s.timestamp, stress: s.stress })),
      satisfactionTrend: recentStates.map(s => ({ date: s.timestamp, satisfaction: s.satisfaction }))
    };
  }
}

export const EmotionalIntelligenceInstance = new EmotionalIntelligence();
