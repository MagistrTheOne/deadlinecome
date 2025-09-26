import { GigaChatService } from './gigachat-service';

interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  aiSupport: boolean;
  translationQuality: number; // 0-100
  culturalAdaptation: boolean;
}

interface GlobalTeamMember {
  id: string;
  name: string;
  role: string;
  languages: string[];
  timezone: string;
  culturalContext: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  communicationStyle: string;
  isActive: boolean;
}

interface CulturalContext {
  region: string;
  communicationStyle: string;
  businessEtiquette: string[];
  holidays: string[];
  workingDays: string[];
  timezone: string;
  currency: string;
  dateFormat: string;
}

class GlobalTeams {
  private supportedLanguages: LanguageSupport[] = [];
  private globalMembers: GlobalTeamMember[] = [];
  private culturalContexts: Map<string, CulturalContext> = new Map();
  private gigachat: GigaChatService;

  constructor() {
    this.gigachat = new GigaChatService();
    this.initializeLanguages();
    this.initializeCulturalContexts();
    this.initializeGlobalMembers();
  }

  private initializeLanguages() {
    this.supportedLanguages = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        aiSupport: true,
        translationQuality: 98,
        culturalAdaptation: true
      },
      {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский',
        aiSupport: true,
        translationQuality: 95,
        culturalAdaptation: true
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        aiSupport: true,
        translationQuality: 92,
        culturalAdaptation: true
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        aiSupport: true,
        translationQuality: 94,
        culturalAdaptation: true
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        aiSupport: true,
        translationQuality: 93,
        culturalAdaptation: true
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        aiSupport: true,
        translationQuality: 91,
        culturalAdaptation: true
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        aiSupport: true,
        translationQuality: 89,
        culturalAdaptation: true
      },
      {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        aiSupport: true,
        translationQuality: 87,
        culturalAdaptation: true
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        aiSupport: true,
        translationQuality: 85,
        culturalAdaptation: true
      },
      {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        aiSupport: true,
        translationQuality: 90,
        culturalAdaptation: true
      }
    ];
  }

  private initializeCulturalContexts() {
    this.culturalContexts.set('US', {
      region: 'North America',
      communicationStyle: 'Direct and informal',
      businessEtiquette: ['Punctuality', 'Handshakes', 'Business cards'],
      holidays: ['New Year', 'Independence Day', 'Thanksgiving', 'Christmas'],
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'UTC-5 to UTC-10',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    });

    this.culturalContexts.set('DE', {
      region: 'Europe',
      communicationStyle: 'Formal and structured',
      businessEtiquette: ['Formal titles', 'Punctuality', 'Hierarchy'],
      holidays: ['New Year', 'Easter', 'Christmas', 'German Unity Day'],
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'UTC+1',
      currency: 'EUR',
      dateFormat: 'DD.MM.YYYY'
    });

    this.culturalContexts.set('JP', {
      region: 'Asia',
      communicationStyle: 'Polite and indirect',
      businessEtiquette: ['Bowing', 'Business cards with both hands', 'Hierarchy respect'],
      holidays: ['New Year', 'Golden Week', 'Obon', 'Emperor\'s Birthday'],
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timezone: 'UTC+9',
      currency: 'JPY',
      dateFormat: 'YYYY/MM/DD'
    });

    this.culturalContexts.set('IN', {
      region: 'Asia',
      communicationStyle: 'Relationship-focused',
      businessEtiquette: ['Namaste greeting', 'Respect for elders', 'Hierarchy'],
      holidays: ['Diwali', 'Holi', 'Independence Day', 'Republic Day'],
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timezone: 'UTC+5:30',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY'
    });
  }

  private initializeGlobalMembers() {
    this.globalMembers = [
      {
        id: 'global-vasily',
        name: 'Василий (Global)',
        role: 'Global Team Lead',
        languages: ['en', 'ru', 'es', 'fr'],
        timezone: 'UTC+3',
        culturalContext: 'RU',
        workingHours: {
          start: '09:00',
          end: '18:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        communicationStyle: 'Adaptive to cultural context',
        isActive: true
      },
      {
        id: 'global-maria',
        name: 'Maria (Americas)',
        role: 'Regional Lead - Americas',
        languages: ['en', 'es', 'pt'],
        timezone: 'UTC-5',
        culturalContext: 'US',
        workingHours: {
          start: '08:00',
          end: '17:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        communicationStyle: 'Direct and results-oriented',
        isActive: true
      },
      {
        id: 'global-hiroshi',
        name: 'Hiroshi (Asia-Pacific)',
        role: 'Regional Lead - APAC',
        languages: ['en', 'ja', 'ko', 'zh'],
        timezone: 'UTC+9',
        culturalContext: 'JP',
        workingHours: {
          start: '09:00',
          end: '18:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        communicationStyle: 'Polite and consensus-building',
        isActive: true
      },
      {
        id: 'global-ahmed',
        name: 'Ahmed (Middle East & Africa)',
        role: 'Regional Lead - MEA',
        languages: ['en', 'ar', 'fr'],
        timezone: 'UTC+3',
        culturalContext: 'AE',
        workingHours: {
          start: '08:00',
          end: '17:00',
          days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
        },
        communicationStyle: 'Relationship-focused and respectful',
        isActive: true
      }
    ];
  }

  async translateMessage(
    message: string,
    fromLanguage: string,
    toLanguage: string,
    context?: any
  ): Promise<{
    translatedText: string;
    confidence: number;
    culturalNotes: string[];
  }> {
    try {
      const translation = await this.gigachat.translateMessage({
        message,
        fromLanguage,
        toLanguage,
        context: {
          ...context,
          culturalContext: this.culturalContexts.get(context?.region || 'US')
        }
      });

      return {
        translatedText: translation.text,
        confidence: translation.confidence,
        culturalNotes: translation.culturalNotes || []
      };
    } catch (error) {
      console.error('Ошибка перевода:', error);
      return {
        translatedText: message,
        confidence: 0,
        culturalNotes: ['Перевод недоступен']
      };
    }
  }

  async adaptCommunication(
    message: string,
    targetCulture: string,
    communicationType: 'email' | 'meeting' | 'presentation' | 'casual'
  ): Promise<{
    adaptedMessage: string;
    culturalGuidelines: string[];
    tone: string;
  }> {
    try {
      const adaptation = await this.gigachat.adaptCommunication({
        message,
        targetCulture,
        communicationType,
        culturalContext: this.culturalContexts.get(targetCulture)
      });

      return {
        adaptedMessage: adaptation.message,
        culturalGuidelines: adaptation.guidelines,
        tone: adaptation.tone
      };
    } catch (error) {
      console.error('Ошибка адаптации коммуникации:', error);
      return {
        adaptedMessage: message,
        culturalGuidelines: ['Адаптация недоступна'],
        tone: 'neutral'
      };
    }
  }

  async scheduleGlobalMeeting(
    participants: string[],
    duration: number,
    preferences: any
  ): Promise<{
    suggestedTimes: Array<{
      time: string;
      timezone: string;
      participants: string[];
      conflicts: string[];
    }>;
    bestTime: string;
    culturalConsiderations: string[];
  }> {
    try {
      const scheduling = await this.gigachat.scheduleGlobalMeeting({
        participants,
        duration,
        preferences,
        globalMembers: this.globalMembers,
        culturalContexts: Object.fromEntries(this.culturalContexts)
      });

      return {
        suggestedTimes: scheduling.suggestions,
        bestTime: scheduling.bestTime,
        culturalConsiderations: scheduling.considerations
      };
    } catch (error) {
      console.error('Ошибка планирования встречи:', error);
      return {
        suggestedTimes: [],
        bestTime: '',
        culturalConsiderations: ['Планирование недоступно']
      };
    }
  }

  async getCulturalGuidelines(region: string): Promise<CulturalContext | null> {
    return this.culturalContexts.get(region) || null;
  }

  async getGlobalTeamStatus(): Promise<{
    activeMembers: number;
    timezones: string[];
    languages: string[];
    coverage: {
      region: string;
      coverage: number;
      members: number;
    }[];
  }> {
    const activeMembers = this.globalMembers.filter(m => m.isActive);
    const timezones = [...new Set(activeMembers.map(m => m.timezone))];
    const languages = [...new Set(activeMembers.flatMap(m => m.languages))];

    const coverage = [
      { region: 'Americas', coverage: 85, members: 1 },
      { region: 'Europe', coverage: 90, members: 1 },
      { region: 'Asia-Pacific', coverage: 80, members: 1 },
      { region: 'Middle East & Africa', coverage: 75, members: 1 }
    ];

    return {
      activeMembers: activeMembers.length,
      timezones,
      languages,
      coverage
    };
  }

  getSupportedLanguages(): LanguageSupport[] {
    return this.supportedLanguages;
  }

  getGlobalMembers(): GlobalTeamMember[] {
    return this.globalMembers;
  }

  async addGlobalMember(member: Omit<GlobalTeamMember, 'id'>): Promise<string> {
    const newMember: GlobalTeamMember = {
      id: `global_${Date.now()}`,
      ...member
    };

    this.globalMembers.push(newMember);
    console.log(`🌍 Добавлен глобальный участник: ${newMember.name}`);
    
    return newMember.id;
  }

  async updateMemberTimezone(memberId: string, newTimezone: string): Promise<void> {
    const member = this.globalMembers.find(m => m.id === memberId);
    if (member) {
      member.timezone = newTimezone;
      console.log(`🌍 Обновлен часовой пояс для ${member.name}: ${newTimezone}`);
    }
  }

  getLanguageStats(): {
    totalLanguages: number;
    aiSupported: number;
    averageQuality: number;
    topLanguages: Array<{ language: string; usage: number }>;
  } {
    const aiSupported = this.supportedLanguages.filter(l => l.aiSupport).length;
    const averageQuality = this.supportedLanguages.reduce((sum, l) => sum + l.translationQuality, 0) / this.supportedLanguages.length;

    // Симуляция статистики использования
    const topLanguages = [
      { language: 'English', usage: 45 },
      { language: 'Chinese', usage: 20 },
      { language: 'Spanish', usage: 15 },
      { language: 'Russian', usage: 10 },
      { language: 'French', usage: 5 },
      { language: 'Other', usage: 5 }
    ];

    return {
      totalLanguages: this.supportedLanguages.length,
      aiSupported,
      averageQuality: Math.round(averageQuality),
      topLanguages
    };
  }
}

export const GlobalTeamsInstance = new GlobalTeams();
