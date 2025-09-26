export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: 'coding' | 'teamwork' | 'innovation' | 'leadership' | 'learning';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    value: number;
    description: string;
  }[];
  unlockedAt?: Date;
}

export interface UserStats {
  userId: string;
  level: number;
  experience: number;
  totalPoints: number;
  achievements: Achievement[];
  streak: number;
  lastActivity: Date;
  rank: string;
  badges: string[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  level: number;
  points: number;
  rank: number;
  achievements: number;
  streak: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  rewards: {
    points: number;
    experience: number;
    items?: string[];
  };
  requirements: {
    type: string;
    value: number;
    current: number;
  }[];
  expiresAt?: Date;
  completed: boolean;
  progress: number;
}

export class GamificationSystem {
  private achievements: Achievement[] = [];
  private userStats: Map<string, UserStats> = new Map();
  private leaderboard: LeaderboardEntry[] = [];
  private quests: Quest[] = [];
  private events: any[] = [];

  constructor() {
    this.initializeAchievements();
    this.initializeQuests();
  }

  private initializeAchievements() {
    this.achievements = [
      {
        id: 'first-commit',
        title: 'Первый коммит',
        description: 'Сделал первый коммит в проекте',
        icon: '🎯',
        points: 10,
        category: 'coding',
        rarity: 'common',
        requirements: [
          { type: 'commits', value: 1, description: 'Сделать 1 коммит' }
        ]
      },
      {
        id: 'code-master',
        title: 'Мастер кода',
        description: 'Написал 1000 строк кода',
        icon: '💻',
        points: 100,
        category: 'coding',
        rarity: 'rare',
        requirements: [
          { type: 'lines_of_code', value: 1000, description: 'Написать 1000 строк кода' }
        ]
      },
      {
        id: 'team-player',
        title: 'Командный игрок',
        description: 'Помог 10 коллегам',
        icon: '🤝',
        points: 50,
        category: 'teamwork',
        rarity: 'common',
        requirements: [
          { type: 'help_others', value: 10, description: 'Помочь 10 коллегам' }
        ]
      },
      {
        id: 'innovator',
        title: 'Инноватор',
        description: 'Предложил 5 новых идей',
        icon: '💡',
        points: 75,
        category: 'innovation',
        rarity: 'epic',
        requirements: [
          { type: 'ideas', value: 5, description: 'Предложить 5 новых идей' }
        ]
      },
      {
        id: 'mentor',
        title: 'Ментор',
        description: 'Обучил 3 новых сотрудников',
        icon: '🎓',
        points: 150,
        category: 'leadership',
        rarity: 'legendary',
        requirements: [
          { type: 'mentored', value: 3, description: 'Обучить 3 новых сотрудников' }
        ]
      }
    ];
  }

  private initializeQuests() {
    this.quests = [
      {
        id: 'daily-coding',
        title: 'Ежедневное кодирование',
        description: 'Написать код в течение дня',
        type: 'daily',
        difficulty: 'easy',
        rewards: { points: 20, experience: 10 },
        requirements: [
          { type: 'commits', value: 3, current: 0, description: 'Сделать 3 коммита' }
        ],
        completed: false,
        progress: 0
      },
      {
        id: 'weekly-collaboration',
        title: 'Недельное сотрудничество',
        description: 'Активно сотрудничать с командой',
        type: 'weekly',
        difficulty: 'medium',
        rewards: { points: 100, experience: 50 },
        requirements: [
          { type: 'code_reviews', value: 5, current: 0, description: 'Провести 5 код-ревью' },
          { type: 'meetings', value: 3, current: 0, description: 'Участвовать в 3 встречах' }
        ],
        completed: false,
        progress: 0
      }
    ];
  }

  // Получить статистику пользователя
  getUserStats(userId: string): UserStats {
    if (!this.userStats.has(userId)) {
      this.userStats.set(userId, {
        userId,
        level: 1,
        experience: 0,
        totalPoints: 0,
        achievements: [],
        streak: 0,
        lastActivity: new Date(),
        rank: 'Новичок',
        badges: []
      });
    }
    return this.userStats.get(userId)!;
  }

  // Добавить опыт пользователю
  addExperience(userId: string, experience: number, reason: string) {
    const stats = this.getUserStats(userId);
    stats.experience += experience;
    stats.totalPoints += experience;
    stats.lastActivity = new Date();

    // Проверяем повышение уровня
    const newLevel = Math.floor(stats.experience / 100) + 1;
    if (newLevel > stats.level) {
      stats.level = newLevel;
      this.updateRank(stats);
      this.events.push({
        type: 'level_up',
        userId,
        newLevel,
        timestamp: new Date()
      });
    }

    // Проверяем достижения
    this.checkAchievements(userId);
    
    console.log(`🎮 ${userId} получил ${experience} опыта за: ${reason}`);
  }

  // Проверить достижения
  private checkAchievements(userId: string) {
    const stats = this.getUserStats(userId);
    
    for (const achievement of this.achievements) {
      if (stats.achievements.some(a => a.id === achievement.id)) continue;
      
      let canUnlock = true;
      for (const req of achievement.requirements) {
        // Здесь должна быть логика проверки требований
        // Для демо просто разблокируем случайные достижения
        if (Math.random() < 0.1) {
          canUnlock = false;
          break;
        }
      }
      
      if (canUnlock) {
        const unlockedAchievement = { ...achievement, unlockedAt: new Date() };
        stats.achievements.push(unlockedAchievement);
        stats.totalPoints += achievement.points;
        
        this.events.push({
          type: 'achievement_unlocked',
          userId,
          achievement: unlockedAchievement,
          timestamp: new Date()
        });
        
        console.log(`🏆 ${userId} разблокировал достижение: ${achievement.title}`);
      }
    }
  }

  // Обновить ранг
  private updateRank(stats: UserStats) {
    if (stats.level >= 50) stats.rank = 'Легенда';
    else if (stats.level >= 30) stats.rank = 'Мастер';
    else if (stats.level >= 20) stats.rank = 'Эксперт';
    else if (stats.level >= 10) stats.rank = 'Продвинутый';
    else if (stats.level >= 5) stats.rank = 'Опытный';
    else stats.rank = 'Новичок';
  }

  // Получить лидерборд
  getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    const entries = Array.from(this.userStats.values())
      .map(stats => ({
        userId: stats.userId,
        username: `User ${stats.userId}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.userId}`,
        level: stats.level,
        points: stats.totalPoints,
        rank: 0,
        achievements: stats.achievements.length,
        streak: stats.streak
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    // Назначаем ранги
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  // Получить квесты
  getQuests(userId: string): Quest[] {
    return this.quests.map(quest => ({
      ...quest,
      progress: Math.floor(Math.random() * 100)
    }));
  }

  // Обновить прогресс квеста
  updateQuestProgress(userId: string, questId: string, progress: number) {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return;

    quest.progress = Math.min(100, progress);
    
    if (quest.progress >= 100 && !quest.completed) {
      quest.completed = true;
      this.addExperience(userId, quest.rewards.experience, `Квест: ${quest.title}`);
      
      this.events.push({
        type: 'quest_completed',
        userId,
        quest,
        timestamp: new Date()
      });
    }
  }

  // Получить события
  getEvents(limit: number = 20) {
    return this.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Получить достижения
  getAchievements() {
    return this.achievements;
  }

  // Получить статистику геймификации
  getGamificationStats() {
    const totalUsers = this.userStats.size;
    const totalAchievements = this.achievements.length;
    const totalQuests = this.quests.length;
    const recentEvents = this.getEvents(10);
    
    return {
      totalUsers,
      totalAchievements,
      totalQuests,
      recentEvents,
      topAchievements: this.achievements
        .sort((a, b) => b.points - a.points)
        .slice(0, 5),
      activeQuests: this.quests.filter(q => !q.completed).length
    };
  }
}

export const GamificationSystemInstance = new GamificationSystem();
