import { GigaChatService } from './gigachat-service';

interface AISpecialist {
  id: string;
  name: string;
  specialization: string;
  description: string;
  skills: string[];
  experience: number; // years
  rating: number; // 0-5
  price: number; // per hour
  availability: 'available' | 'busy' | 'offline';
  personality: {
    communicationStyle: string;
    workingHours: string;
    collaborationStyle: string;
  };
  reviews: Array<{
    rating: number;
    comment: string;
    project: string;
    timestamp: Date;
  }>;
}

interface AIPackage {
  id: string;
  name: string;
  description: string;
  specialists: string[];
  price: number;
  duration: number; // days
  features: string[];
  targetAudience: string[];
}

class AIMarketplace {
  private specialists: AISpecialist[] = [];
  private packages: AIPackage[] = [];
  private gigachat: GigaChatService;

  constructor() {
    this.gigachat = new GigaChatService();
    this.initializeMarketplace();
  }

  private initializeMarketplace() {
    // Специализированные AI
    this.specialists = [
      {
        id: 'ai-maria',
        name: 'Мария',
        specialization: 'UI/UX Design',
        description: 'Эксперт по пользовательскому опыту и дизайну интерфейсов',
        skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Accessibility'],
        experience: 5,
        rating: 4.8,
        price: 45,
        availability: 'available',
        personality: {
          communicationStyle: 'Creative and intuitive',
          workingHours: '9:00-18:00',
          collaborationStyle: 'Collaborative and user-focused'
        },
        reviews: []
      },
      {
        id: 'ai-dmitry',
        name: 'Дмитрий',
        specialization: 'DevOps & Infrastructure',
        description: 'Специалист по автоматизации и облачным решениям',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Monitoring'],
        experience: 7,
        rating: 4.9,
        price: 60,
        availability: 'available',
        personality: {
          communicationStyle: 'Technical and systematic',
          workingHours: '24/7',
          collaborationStyle: 'Methodical and reliable'
        },
        reviews: []
      },
      {
        id: 'ai-elena',
        name: 'Елена',
        specialization: 'Data Science & Analytics',
        description: 'Эксперт по анализу данных и машинному обучению',
        skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'],
        experience: 6,
        rating: 4.7,
        price: 55,
        availability: 'busy',
        personality: {
          communicationStyle: 'Analytical and data-driven',
          workingHours: '10:00-19:00',
          collaborationStyle: 'Research-oriented'
        },
        reviews: []
      },
      {
        id: 'ai-alexander',
        name: 'Александр',
        specialization: 'Mobile Development',
        description: 'Специалист по мобильной разработке (iOS/Android)',
        skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UX'],
        experience: 4,
        rating: 4.6,
        price: 50,
        availability: 'available',
        personality: {
          communicationStyle: 'Innovative and mobile-first',
          workingHours: '9:00-17:00',
          collaborationStyle: 'Agile and iterative'
        },
        reviews: []
      }
    ];

    // Готовые пакеты AI
    this.packages = [
      {
        id: 'startup-package',
        name: 'Стартап пакет',
        description: 'Полный набор AI для запуска стартапа',
        specialists: ['ai-vasily', 'ai-vladimir', 'ai-maria', 'ai-dmitry'],
        price: 299,
        duration: 30,
        features: [
          'Управление проектом',
          'Code Review',
          'UI/UX Design',
          'DevOps настройка',
          'Техническая поддержка'
        ],
        targetAudience: ['Стартапы', 'MVP проекты']
      },
      {
        id: 'enterprise-package',
        name: 'Корпоративный пакет',
        description: 'Комплексное решение для крупных компаний',
        specialists: ['ai-vasily', 'ai-vladimir', 'ai-olga', 'ai-pavel', 'ai-elena'],
        price: 999,
        duration: 90,
        features: [
          'Стратегическое планирование',
          'Безопасность и соответствие',
          'Производительность и масштабирование',
          'Аналитика и отчетность',
          'Корпоративная интеграция'
        ],
        targetAudience: ['Корпорации', 'Enterprise']
      }
    ];
  }

  async searchSpecialists(criteria: {
    specialization?: string;
    maxPrice?: number;
    minRating?: number;
    skills?: string[];
  }): Promise<AISpecialist[]> {
    let results = [...this.specialists];

    if (criteria.specialization) {
      results = results.filter(s => 
        s.specialization.toLowerCase().includes(criteria.specialization!.toLowerCase())
      );
    }

    if (criteria.maxPrice) {
      results = results.filter(s => s.price <= criteria.maxPrice!);
    }

    if (criteria.minRating) {
      results = results.filter(s => s.rating >= criteria.minRating!);
    }

    if (criteria.skills && criteria.skills.length > 0) {
      results = results.filter(s => 
        criteria.skills!.some(skill => 
          s.skills.some(specialistSkill => 
            specialistSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    return results.sort((a, b) => b.rating - a.rating);
  }

  async getSpecialistDetails(specialistId: string): Promise<AISpecialist | null> {
    return this.specialists.find(s => s.id === specialistId) || null;
  }

  async hireSpecialist(
    specialistId: string,
    projectId: string,
    duration: number,
    requirements: string
  ): Promise<{
    success: boolean;
    contractId: string;
    startDate: Date;
    endDate: Date;
    totalCost: number;
  }> {
    const specialist = this.specialists.find(s => s.id === specialistId);
    if (!specialist) {
      throw new Error('Специалист не найден');
    }

    if (specialist.availability !== 'available') {
      throw new Error('Специалист недоступен');
    }

    const contractId = `contract_${Date.now()}`;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
    const totalCost = specialist.price * duration * 8; // 8 hours per day

    // Обновляем доступность
    specialist.availability = 'busy';

    console.log(`🤝 ${specialist.name} нанят для проекта ${projectId}`);

    return {
      success: true,
      contractId,
      startDate,
      endDate,
      totalCost
    };
  }

  async getPackages(): Promise<AIPackage[]> {
    return this.packages;
  }

  async purchasePackage(
    packageId: string,
    projectId: string
  ): Promise<{
    success: boolean;
    package: AIPackage;
    specialists: AISpecialist[];
    startDate: Date;
  }> {
    const package_ = this.packages.find(p => p.id === packageId);
    if (!package_) {
      throw new Error('Пакет не найден');
    }

    const specialists = this.specialists.filter(s => 
      package_.specialists.includes(s.id)
    );

    console.log(`📦 Пакет "${package_.name}" приобретен для проекта ${projectId}`);

    return {
      success: true,
      package: package_,
      specialists,
      startDate: new Date()
    };
  }

  async addReview(
    specialistId: string,
    rating: number,
    comment: string,
    project: string
  ): Promise<void> {
    const specialist = this.specialists.find(s => s.id === specialistId);
    if (!specialist) {
      throw new Error('Специалист не найден');
    }

    specialist.reviews.push({
      rating,
      comment,
      project,
      timestamp: new Date()
    });

    // Пересчитываем рейтинг
    const totalRating = specialist.reviews.reduce((sum, review) => sum + review.rating, 0);
    specialist.rating = totalRating / specialist.reviews.length;

    console.log(`⭐ Отзыв добавлен для ${specialist.name}: ${rating}/5`);
  }

  getMarketplaceStats() {
    const totalSpecialists = this.specialists.length;
    const availableSpecialists = this.specialists.filter(s => s.availability === 'available').length;
    const averageRating = this.specialists.reduce((sum, s) => sum + s.rating, 0) / totalSpecialists;
    const totalPackages = this.packages.length;

    return {
      totalSpecialists,
      availableSpecialists,
      averageRating: Math.round(averageRating * 10) / 10,
      totalPackages,
      topSpecializations: this.getTopSpecializations()
    };
  }

  private getTopSpecializations(): string[] {
    const specializations = this.specialists.map(s => s.specialization);
    const counts: { [key: string]: number } = {};
    
    specializations.forEach(spec => {
      counts[spec] = (counts[spec] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([spec, _]) => spec);
  }
}

export const AIMarketplaceInstance = new AIMarketplace();
