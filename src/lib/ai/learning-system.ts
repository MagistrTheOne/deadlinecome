"use client";

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: "frontend" | "backend" | "devops" | "mobile" | "ai" | "design" | "management";
  estimatedTime: number; // в часах
  modules: LearningModule[];
  prerequisites: string[];
  skills: string[];
  createdAt: Date;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: "video" | "article" | "tutorial" | "project" | "quiz" | "exercise";
  duration: number; // в минутах
  content: string;
  resources: string[];
  exercises: Exercise[];
  completed: boolean;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: "coding" | "multiple_choice" | "fill_blank" | "project";
  difficulty: "easy" | "medium" | "hard";
  solution?: string;
  hints: string[];
  points: number;
}

export interface UserProgress {
  userId: string;
  userName: string;
  currentPath?: string;
  completedModules: string[];
  completedExercises: string[];
  totalPoints: number;
  level: "junior" | "middle" | "senior" | "lead";
  skills: UserSkill[];
  achievements: Achievement[];
  learningStreak: number;
  lastActivity: Date;
}

export interface UserSkill {
  name: string;
  level: number; // 0-100
  category: string;
  lastUpdated: Date;
  experience: number; // в часах
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: "learning" | "coding" | "teamwork" | "leadership";
}

export interface PersonalizedRecommendation {
  id: string;
  userId: string;
  type: "course" | "article" | "project" | "skill" | "mentor";
  title: string;
  description: string;
  reason: string;
  priority: "low" | "medium" | "high";
  estimatedTime: number;
  createdAt: Date;
}

export class LearningSystem {
  private static learningPaths: LearningPath[] = [];
  private static userProgress: Map<string, UserProgress> = new Map();
  private static recommendations: PersonalizedRecommendation[] = [];

  /**
   * Инициализирует систему обучения с базовыми путями
   */
  static initializeLearningPaths(): void {
    if (this.learningPaths.length > 0) return;

    // Frontend Development Path
    this.learningPaths.push({
      id: "frontend-basics",
      title: "Основы Frontend разработки",
      description: "Изучите HTML, CSS, JavaScript и современные фреймворки",
      level: "beginner",
      category: "frontend",
      estimatedTime: 120,
      modules: [
        {
          id: "html-fundamentals",
          title: "HTML основы",
          description: "Изучение структуры и семантики HTML",
          type: "tutorial",
          duration: 180,
          content: "HTML - это основа веб-разработки...",
          resources: ["MDN HTML Guide", "HTML5 Semantic Elements"],
          exercises: [
            {
              id: "html-structure",
              title: "Создание структуры страницы",
              description: "Создайте HTML структуру для блога",
              type: "coding",
              difficulty: "easy",
              hints: ["Используйте семантические теги", "Добавьте мета-теги"],
              points: 10
            }
          ],
          completed: false
        },
        {
          id: "css-styling",
          title: "CSS стилизация",
          description: "Изучение CSS и современных подходов к стилизации",
          type: "tutorial",
          duration: 240,
          content: "CSS позволяет создавать красивые интерфейсы...",
          resources: ["CSS Grid Guide", "Flexbox Tutorial"],
          exercises: [
            {
              id: "responsive-layout",
              title: "Адаптивная верстка",
              description: "Создайте адаптивный макет с CSS Grid",
              type: "coding",
              difficulty: "medium",
              hints: ["Используйте CSS Grid", "Добавьте медиа-запросы"],
              points: 20
            }
          ],
          completed: false
        }
      ],
      prerequisites: [],
      skills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
      createdAt: new Date()
    });

    // React Development Path
    this.learningPaths.push({
      id: "react-development",
      title: "React разработка",
      description: "Изучите React, хуки, состояние и современные практики",
      level: "intermediate",
      category: "frontend",
      estimatedTime: 80,
      modules: [
        {
          id: "react-components",
          title: "React компоненты",
          description: "Создание и использование React компонентов",
          type: "tutorial",
          duration: 120,
          content: "React компоненты - это строительные блоки приложений...",
          resources: ["React Official Docs", "Component Patterns"],
          exercises: [
            {
              id: "todo-component",
              title: "Компонент Todo",
              description: "Создайте компонент списка задач",
              type: "coding",
              difficulty: "medium",
              hints: ["Используйте useState", "Добавьте обработчики событий"],
              points: 25
            }
          ],
          completed: false
        }
      ],
      prerequisites: ["frontend-basics"],
      skills: ["React", "JSX", "Hooks", "State Management"],
      createdAt: new Date()
    });

    // Backend Development Path
    this.learningPaths.push({
      id: "backend-development",
      title: "Backend разработка",
      description: "Изучите Node.js, Express, базы данных и API",
      level: "intermediate",
      category: "backend",
      estimatedTime: 100,
      modules: [
        {
          id: "nodejs-basics",
          title: "Node.js основы",
          description: "Изучение Node.js и асинхронного программирования",
          type: "tutorial",
          duration: 150,
          content: "Node.js позволяет использовать JavaScript на сервере...",
          resources: ["Node.js Docs", "Async/Await Guide"],
          exercises: [
            {
              id: "rest-api",
              title: "REST API",
              description: "Создайте REST API с Express",
              type: "coding",
              difficulty: "hard",
              hints: ["Используйте Express", "Добавьте валидацию"],
              points: 30
            }
          ],
          completed: false
        }
      ],
      prerequisites: ["frontend-basics"],
      skills: ["Node.js", "Express", "REST API", "Databases"],
      createdAt: new Date()
    });

    // AI/ML Path
    this.learningPaths.push({
      id: "ai-ml-basics",
      title: "Основы AI и Machine Learning",
      description: "Изучите основы искусственного интеллекта и машинного обучения",
      level: "intermediate",
      category: "ai",
      estimatedTime: 60,
      modules: [
        {
          id: "ml-concepts",
          title: "Концепции ML",
          description: "Основные концепции машинного обучения",
          type: "tutorial",
          duration: 90,
          content: "Машинное обучение - это подраздел AI...",
          resources: ["ML Basics", "Python for ML"],
          exercises: [
            {
              id: "linear-regression",
              title: "Линейная регрессия",
              description: "Реализуйте простую линейную регрессию",
              type: "coding",
              difficulty: "medium",
              hints: ["Используйте NumPy", "Визуализируйте данные"],
              points: 25
            }
          ],
          completed: false
        }
      ],
      prerequisites: [],
      skills: ["Python", "Machine Learning", "Data Analysis", "Statistics"],
      createdAt: new Date()
    });
  }

  /**
   * Инициализирует прогресс пользователя
   */
  static initializeUserProgress(userId: string, userName: string): UserProgress {
    const progress: UserProgress = {
      userId,
      userName,
      completedModules: [],
      completedExercises: [],
      totalPoints: 0,
      level: "junior",
      skills: [],
      achievements: [],
      learningStreak: 0,
      lastActivity: new Date()
    };

    this.userProgress.set(userId, progress);
    return progress;
  }

  /**
   * Получает персонализированные рекомендации
   */
  static getPersonalizedRecommendations(userId: string): PersonalizedRecommendation[] {
    const userProgress = this.userProgress.get(userId);
    if (!userProgress) return [];

    const recommendations: PersonalizedRecommendation[] = [];

    // Анализируем навыки пользователя
    const weakSkills = userProgress.skills.filter(skill => skill.level < 50);
    const strongSkills = userProgress.skills.filter(skill => skill.level > 80);

    // Рекомендации по слабым навыкам
    weakSkills.forEach(skill => {
      const relevantPaths = this.learningPaths.filter(path => 
        path.skills.includes(skill.name)
      );

      relevantPaths.forEach(path => {
        recommendations.push({
          id: crypto.randomUUID(),
          userId,
          type: "course",
          title: `Улучшите навык: ${skill.name}`,
          description: `Изучите ${path.title} для развития навыка ${skill.name}`,
          reason: `Ваш уровень навыка ${skill.name}: ${skill.level}%`,
          priority: "high",
          estimatedTime: path.estimatedTime,
          createdAt: new Date()
        });
      });
    });

    // Рекомендации по развитию сильных навыков
    strongSkills.forEach(skill => {
      recommendations.push({
        id: crypto.randomUUID(),
        userId,
        type: "project",
        title: `Проект для эксперта: ${skill.name}`,
        description: `Создайте сложный проект, используя ваш опыт в ${skill.name}`,
        reason: `Отличный уровень навыка ${skill.name}: ${skill.level}%`,
        priority: "medium",
        estimatedTime: 20,
        createdAt: new Date()
      });
    });

    // Рекомендации на основе уровня
    if (userProgress.level === "junior") {
      recommendations.push({
        id: crypto.randomUUID(),
        userId,
        type: "course",
        title: "Основы программирования",
        description: "Изучите фундаментальные концепции программирования",
        reason: "Рекомендуется для junior разработчиков",
        priority: "high",
        estimatedTime: 40,
        createdAt: new Date()
      });
    }

    // Рекомендации на основе активности
    if (userProgress.learningStreak < 3) {
      recommendations.push({
        id: crypto.randomUUID(),
        userId,
        type: "article",
        title: "Короткая статья для поддержания streak",
        description: "Прочитайте статью за 10 минут",
        reason: "Поддержите серию обучения",
        priority: "medium",
        estimatedTime: 0.2,
        createdAt: new Date()
      });
    }

    this.recommendations.push(...recommendations);
    return recommendations.slice(0, 5); // Возвращаем топ-5 рекомендаций
  }

  /**
   * Отмечает модуль как завершенный
   */
  static completeModule(userId: string, moduleId: string): boolean {
    const userProgress = this.userProgress.get(userId);
    if (!userProgress) return false;

    if (!userProgress.completedModules.includes(moduleId)) {
      userProgress.completedModules.push(moduleId);
      userProgress.lastActivity = new Date();
      userProgress.learningStreak += 1;

      // Обновляем навыки
      const module = this.learningPaths
        .flatMap(path => path.modules)
        .find(mod => mod.id === moduleId);

      if (module) {
        const path = this.learningPaths.find(p => 
          p.modules.some(m => m.id === moduleId)
        );

        if (path) {
          path.skills.forEach(skillName => {
            const existingSkill = userProgress.skills.find(s => s.name === skillName);
            if (existingSkill) {
              existingSkill.level = Math.min(100, existingSkill.level + 10);
              existingSkill.experience += module.duration / 60;
            } else {
              userProgress.skills.push({
                name: skillName,
                level: 20,
                category: path.category,
                lastUpdated: new Date(),
                experience: module.duration / 60
              });
            }
          });
        }
      }

      // Проверяем достижения
      this.checkAchievements(userId);
      return true;
    }

    return false;
  }

  /**
   * Отмечает упражнение как завершенное
   */
  static completeExercise(userId: string, exerciseId: string): boolean {
    const userProgress = this.userProgress.get(userId);
    if (!userProgress) return false;

    if (!userProgress.completedExercises.includes(exerciseId)) {
      userProgress.completedExercises.push(exerciseId);
      userProgress.lastActivity = new Date();

      // Находим упражнение и добавляем очки
      const exercise = this.learningPaths
        .flatMap(path => path.modules)
        .flatMap(module => module.exercises)
        .find(ex => ex.id === exerciseId);

      if (exercise) {
        userProgress.totalPoints += exercise.points;
      }

      // Проверяем достижения
      this.checkAchievements(userId);
      return true;
    }

    return false;
  }

  /**
   * Проверяет и выдает достижения
   */
  private static checkAchievements(userId: string): void {
    const userProgress = this.userProgress.get(userId);
    if (!userProgress) return;

    const achievements: Achievement[] = [];

    // Достижение за количество завершенных модулей
    if (userProgress.completedModules.length >= 5 && 
        !userProgress.achievements.some(a => a.title === "Первые шаги")) {
      achievements.push({
        id: crypto.randomUUID(),
        title: "Первые шаги",
        description: "Завершено 5 модулей обучения",
        icon: "🎓",
        earnedAt: new Date(),
        category: "learning"
      });
    }

    // Достижение за streak
    if (userProgress.learningStreak >= 7 && 
        !userProgress.achievements.some(a => a.title === "Неделя обучения")) {
      achievements.push({
        id: crypto.randomUUID(),
        title: "Неделя обучения",
        description: "7 дней подряд активного обучения",
        icon: "🔥",
        earnedAt: new Date(),
        category: "learning"
      });
    }

    // Достижение за очки
    if (userProgress.totalPoints >= 100 && 
        !userProgress.achievements.some(a => a.title === "Сотня очков")) {
      achievements.push({
        id: crypto.randomUUID(),
        title: "Сотня очков",
        description: "Заработано 100 очков",
        icon: "💯",
        earnedAt: new Date(),
        category: "learning"
      });
    }

    // Достижение за навыки
    const expertSkills = userProgress.skills.filter(skill => skill.level >= 90);
    if (expertSkills.length >= 3 && 
        !userProgress.achievements.some(a => a.title === "Эксперт")) {
      achievements.push({
        id: crypto.randomUUID(),
        title: "Эксперт",
        description: "3 навыка на уровне эксперта",
        icon: "🏆",
        earnedAt: new Date(),
        category: "learning"
      });
    }

    userProgress.achievements.push(...achievements);
  }

  /**
   * Получает прогресс пользователя
   */
  static getUserProgress(userId: string): UserProgress | null {
    return this.userProgress.get(userId) || null;
  }

  /**
   * Получает все пути обучения
   */
  static getLearningPaths(): LearningPath[] {
    return [...this.learningPaths];
  }

  /**
   * Получает путь обучения по ID
   */
  static getLearningPath(pathId: string): LearningPath | null {
    return this.learningPaths.find(path => path.id === pathId) || null;
  }

  /**
   * Получает статистику обучения
   */
  static getLearningStats(): {
    totalPaths: number;
    totalModules: number;
    totalExercises: number;
    activeUsers: number;
    totalPoints: number;
    averageProgress: number;
  } {
    const totalModules = this.learningPaths.reduce((sum, path) => sum + path.modules.length, 0);
    const totalExercises = this.learningPaths.reduce((sum, path) => 
      sum + path.modules.reduce((modSum, module) => modSum + module.exercises.length, 0), 0
    );

    const userProgresses = Array.from(this.userProgress.values());
    const totalPoints = userProgresses.reduce((sum, progress) => sum + progress.totalPoints, 0);
    const averageProgress = userProgresses.length > 0 ? 
      userProgresses.reduce((sum, progress) => sum + progress.completedModules.length, 0) / userProgresses.length : 0;

    return {
      totalPaths: this.learningPaths.length,
      totalModules,
      totalExercises,
      activeUsers: userProgresses.length,
      totalPoints,
      averageProgress
    };
  }

  /**
   * Получает топ пользователей по очкам
   */
  static getTopUsers(limit: number = 10): UserProgress[] {
    return Array.from(this.userProgress.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
  }

  /**
   * Получает рекомендации для пользователя
   */
  static getUserRecommendations(userId: string): PersonalizedRecommendation[] {
    return this.recommendations.filter(rec => rec.userId === userId);
  }
}
