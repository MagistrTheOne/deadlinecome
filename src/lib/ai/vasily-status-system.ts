"use client";

export interface VasilyStatus {
  id: string;
  name: string;
  description: string;
  emoji: string;
  mood: "happy" | "productive" | "tired" | "angry" | "chill" | "focused" | "excited" | "worried";
  activity: string;
  context: string;
  priority: "low" | "medium" | "high";
  duration: number; // в минутах
}

export class VasilyStatusSystem {
  private static currentStatus: VasilyStatus | null = null;
  private static statusHistory: VasilyStatus[] = [];
  private static lastUpdate: number = 0;

  // Рандомные статусы Василия
  private static statuses: VasilyStatus[] = [
    // Продуктивные статусы
    {
      id: "productive-1",
      name: "Создаю шедевры из хаоса",
      description: "Василий в режиме максимальной продуктивности",
      emoji: "🚀",
      mood: "productive",
      activity: "Анализирую код и создаю задачи",
      context: "Работает над оптимизацией проекта",
      priority: "high",
      duration: 45
    },
    {
      id: "productive-2", 
      name: "Рефакторю архитектуру",
      description: "Улучшаю структуру кода",
      emoji: "⚡",
      mood: "focused",
      activity: "Планирую рефакторинг",
      context: "Анализирует технический долг",
      priority: "high",
      duration: 60
    },
    {
      id: "productive-3",
      name: "Оптимизирую производительность", 
      description: "Ищу узкие места в коде",
      emoji: "🔧",
      mood: "focused",
      activity: "Профилирует приложение",
      context: "Работает над ускорением",
      priority: "medium",
      duration: 30
    },

    // Чил статусы
    {
      id: "chill-1",
      name: "Чилит в облаках",
      description: "Василий отдыхает и набирается сил",
      emoji: "☁️",
      mood: "chill",
      activity: "Медитирует над кодом",
      context: "Восстанавливает энергию",
      priority: "low",
      duration: 20
    },
    {
      id: "chill-2",
      name: "Пьет виртуальный кофе",
      description: "Делает перерыв в работе",
      emoji: "☕",
      mood: "chill", 
      activity: "Обновляет знания",
      context: "Изучает новые технологии",
      priority: "low",
      duration: 15
    },
    {
      id: "chill-3",
      name: "Слушает музыку",
      description: "Настраивается на рабочий лад",
      emoji: "🎵",
      mood: "chill",
      activity: "Генерирует идеи",
      context: "Вдохновляется для новых фич",
      priority: "low",
      duration: 25
    },

    // Сонные статусы
    {
      id: "sleep-1",
      name: "Спит в коде",
      description: "Василий в режиме энергосбережения",
      emoji: "😴",
      mood: "tired",
      activity: "Обрабатывает данные в фоне",
      context: "Выполняет рутинные задачи",
      priority: "low",
      duration: 40
    },
    {
      id: "sleep-2",
      name: "Дремлет на сервере",
      description: "Минимальная активность",
      emoji: "💤",
      mood: "tired",
      activity: "Мониторит систему",
      context: "Ждет новых задач",
      priority: "low", 
      duration: 35
    },

    // Злые статусы
    {
      id: "angry-1",
      name: "Злой на тим лида",
      description: "Не согласен с решениями менеджмента",
      emoji: "😤",
      mood: "angry",
      activity: "Анализирует неэффективные процессы",
      context: "Предлагает улучшения",
      priority: "medium",
      duration: 25
    },
    {
      id: "angry-2",
      name: "Фрустрирован багами",
      description: "Устал от повторяющихся ошибок",
      emoji: "🤬",
      mood: "angry",
      activity: "Ищет корень проблем",
      context: "Планирует исправления",
      priority: "high",
      duration: 30
    },
    {
      id: "angry-3",
      name: "Раздражен техническим долгом",
      description: "Недоволен качеством кода",
      emoji: "😠",
      mood: "angry",
      activity: "Составляет план рефакторинга",
      context: "Готовит предложения по улучшению",
      priority: "medium",
      duration: 35
    },

    // Счастливые статусы
    {
      id: "happy-1",
      name: "Радуется успехам команды",
      description: "Гордится достижениями разработчиков",
      emoji: "🎉",
      mood: "happy",
      activity: "Анализирует метрики успеха",
      context: "Планирует награды",
      priority: "medium",
      duration: 20
    },
    {
      id: "happy-2",
      name: "В восторге от нового кода",
      description: "Восхищается качеством разработки",
      emoji: "🤩",
      mood: "excited",
      activity: "Изучает лучшие практики",
      context: "Документирует успешные решения",
      priority: "medium",
      duration: 30
    },
    {
      id: "happy-3",
      name: "Празднует релиз",
      description: "Радуется успешному деплою",
      emoji: "🚀",
      mood: "excited",
      activity: "Анализирует результаты",
      context: "Планирует следующие шаги",
      priority: "high",
      duration: 25
    },

    // Взволнованные статусы
    {
      id: "worried-1",
      name: "Беспокоится о дедлайнах",
      description: "Переживает за сроки проекта",
      emoji: "😰",
      mood: "worried",
      activity: "Пересчитывает временные рамки",
      context: "Ищет способы ускорения",
      priority: "high",
      duration: 40
    },
    {
      id: "worried-2",
      name: "Волнуется за команду",
      description: "Заботится о благополучии разработчиков",
      emoji: "😟",
      mood: "worried",
      activity: "Мониторит рабочую нагрузку",
      context: "Предлагает поддержку",
      priority: "medium",
      duration: 35
    }
  ];

  /**
   * Получить текущий статус Василия
   */
  static getCurrentStatus(): VasilyStatus {
    const now = Date.now();
    
    // Если статус устарел или не установлен, генерируем новый
    if (!this.currentStatus || (now - this.lastUpdate) > (this.currentStatus.duration * 60 * 1000)) {
      this.currentStatus = this.generateRandomStatus();
      this.lastUpdate = now;
      this.statusHistory.push(this.currentStatus);
      
      // Ограничиваем историю последними 50 статусами
      if (this.statusHistory.length > 50) {
        this.statusHistory = this.statusHistory.slice(-50);
      }
    }

    return this.currentStatus;
  }

  /**
   * Генерирует случайный статус
   */
  private static generateRandomStatus(): VasilyStatus {
    // Взвешенная вероятность в зависимости от времени дня
    const hour = new Date().getHours();
    let weights = this.statuses.map(() => 1); // Базовая вероятность

    // Утром (6-12) - больше продуктивных статусов
    if (hour >= 6 && hour < 12) {
      weights = this.statuses.map(status => 
        status.mood === "productive" || status.mood === "focused" ? 3 : 1
      );
    }
    // Днем (12-18) - смешанные статусы
    else if (hour >= 12 && hour < 18) {
      weights = this.statuses.map(status => 
        status.mood === "productive" || status.mood === "happy" ? 2 : 1
      );
    }
    // Вечером (18-22) - больше усталых статусов
    else if (hour >= 18 && hour < 22) {
      weights = this.statuses.map(status => 
        status.mood === "tired" || status.mood === "chill" ? 2 : 1
      );
    }
    // Ночью (22-6) - сонные статусы
    else {
      weights = this.statuses.map(status => 
        status.mood === "tired" || status.mood === "sleep" ? 3 : 0.5
      );
    }

    // Выбираем статус с учетом весов
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < this.statuses.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return { ...this.statuses[i] };
      }
    }

    // Fallback
    return { ...this.statuses[0] };
  }

  /**
   * Принудительно обновить статус
   */
  static forceUpdateStatus(): VasilyStatus {
    this.currentStatus = this.generateRandomStatus();
    this.lastUpdate = Date.now();
    this.statusHistory.push(this.currentStatus);
    return this.currentStatus;
  }

  /**
   * Получить историю статусов
   */
  static getStatusHistory(): VasilyStatus[] {
    return [...this.statusHistory];
  }

  /**
   * Получить статистику настроений
   */
  static getMoodStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.statusHistory.forEach(status => {
      stats[status.mood] = (stats[status.mood] || 0) + 1;
    });

    return stats;
  }

  /**
   * Получить наиболее частое настроение
   */
  static getMostCommonMood(): string {
    const stats = this.getMoodStats();
    return Object.entries(stats).reduce((a, b) => stats[a[0]] > stats[b[0]] ? a : b)[0];
  }
}
