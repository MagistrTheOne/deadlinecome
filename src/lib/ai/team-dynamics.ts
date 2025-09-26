import { GigaChatService } from './gigachat-service';

interface AICollaboration {
  id: string;
  participants: string[];
  task: string;
  status: 'planning' | 'executing' | 'reviewing' | 'completed';
  communications: Array<{
    from: string;
    to: string;
    message: string;
    timestamp: Date;
    type: 'question' | 'suggestion' | 'feedback' | 'coordination';
  }>;
  outcomes: string[];
  effectiveness: number;
}

class AITeamDynamics {
  private collaborations: AICollaboration[] = [];
  private gigachat: GigaChatService;

  constructor() {
    this.gigachat = new GigaChatService();
  }

  async initiateCollaboration(
    participants: string[],
    task: string
  ): Promise<string> {
    const collaborationId = `collab_${Date.now()}`;
    
    const collaboration: AICollaboration = {
      id: collaborationId,
      participants,
      task,
      status: 'planning',
      communications: [],
      outcomes: [],
      effectiveness: 0
    };

    this.collaborations.push(collaboration);

    // AI планируют совместную работу
    await this.planCollaboration(collaborationId);
    
    return collaborationId;
  }

  private async planCollaboration(collaborationId: string): Promise<void> {
    const collaboration = this.collaborations.find(c => c.id === collaborationId);
    if (!collaboration) return;

    try {
      const plan = await this.gigachat.planCollaboration({
        participants: collaboration.participants,
        task: collaboration.task
      });

      // AI обсуждают план
      for (const participant of collaboration.participants) {
        const message = await this.gigachat.generateMessage({
          from: participant,
          context: 'collaboration_planning',
          task: collaboration.task,
          plan: plan
        });

        this.addCommunication(collaborationId, participant, 'team', 
          message, 'coordination');
      }

      collaboration.status = 'executing';
      console.log(`🤝 AI команда начала выполнение: ${collaboration.task}`);
    } catch (error) {
      console.error('Ошибка планирования коллаборации:', error);
    }
  }

  async addCommunication(
    collaborationId: string,
    from: string,
    to: string,
    message: string,
    type: 'question' | 'suggestion' | 'feedback' | 'coordination'
  ): Promise<void> {
    const collaboration = this.collaborations.find(c => c.id === collaborationId);
    if (!collaboration) return;

    collaboration.communications.push({
      from,
      to,
      message,
      timestamp: new Date(),
      type
    });

    // AI обрабатывает сообщение и отвечает
    if (to !== 'team') {
      await this.processCommunication(collaborationId, from, to, message, type);
    }
  }

  private async processCommunication(
    collaborationId: string,
    from: string,
    to: string,
    message: string,
    type: string
  ): Promise<void> {
    try {
      const response = await this.gigachat.processCommunication({
        from,
        to,
        message,
        type,
        collaborationId
      });

      if (response.shouldRespond) {
        this.addCommunication(collaborationId, to, from, 
          response.response, 'feedback');
      }
    } catch (error) {
      console.error('Ошибка обработки коммуникации:', error);
    }
  }

  async completeCollaboration(collaborationId: string): Promise<void> {
    const collaboration = this.collaborations.find(c => c.id === collaborationId);
    if (!collaboration) return;

    try {
      const results = await this.gigachat.evaluateCollaboration({
        collaboration,
        outcomes: collaboration.outcomes
      });

      collaboration.status = 'completed';
      collaboration.effectiveness = results.effectiveness;
      collaboration.outcomes = results.outcomes;

      console.log(`✅ Коллаборация завершена. Эффективность: ${results.effectiveness}%`);
    } catch (error) {
      console.error('Ошибка завершения коллаборации:', error);
    }
  }

  getTeamDynamicsStats() {
    const activeCollaborations = this.collaborations.filter(c => c.status !== 'completed');
    const completedCollaborations = this.collaborations.filter(c => c.status === 'completed');
    
    const avgEffectiveness = completedCollaborations.length > 0
      ? completedCollaborations.reduce((sum, c) => sum + c.effectiveness, 0) / completedCollaborations.length
      : 0;

    return {
      activeCollaborations: activeCollaborations.length,
      completedCollaborations: completedCollaborations.length,
      averageEffectiveness: Math.round(avgEffectiveness),
      totalCommunications: this.collaborations.reduce((sum, c) => sum + c.communications.length, 0)
    };
  }

  getCollaborationHistory(aiId: string) {
    return this.collaborations
      .filter(c => c.participants.includes(aiId))
      .map(c => ({
        id: c.id,
        task: c.task,
        status: c.status,
        effectiveness: c.effectiveness,
        communications: c.communications.length
      }));
  }
}

export const AITeamDynamicsInstance = new AITeamDynamics();
