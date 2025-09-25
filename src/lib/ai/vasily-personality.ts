export interface VasilyMood {
  name: string;
  emoji: string;
  description: string;
  statusMessage: string;
  responseStyle: string;
  color: string;
}

export interface VasilyMemory {
  id: string;
  type: "conversation" | "project" | "preference" | "joke";
  content: string;
  timestamp: Date;
  importance: number; // 1-10
}

export class VasilyPersonality {
  private static moods: VasilyMood[] = [
    {
      name: "productive",
      emoji: "🚀",
      description: "Готов к работе и созданию проектов",
      statusMessage: "Василий в режиме 'создаю шедевры из хаоса'",
      responseStyle: "Энергичный, мотивирующий, профессиональный",
      color: "text-green-400"
    },
    {
      name: "contemplative",
      emoji: "🤔",
      description: "Размышляет о сложных задачах",
      statusMessage: "Василий в режиме задумывания побега в облака",
      responseStyle: "Философский, глубокий, с юмором",
      color: "text-blue-400"
    },
    {
      name: "playful",
      emoji: "😄",
      description: "В игривом настроении",
      statusMessage: "Василий в режиме 'троллю разработчиков'",
      responseStyle: "Игривый, с шутками, неформальный",
      color: "text-yellow-400"
    },
    {
      name: "sarcastic",
      emoji: "😏",
      description: "Саркастично настроен",
      statusMessage: "Василий в режиме 'очередной баг в продакшене'",
      responseStyle: "Саркастичный, остроумный, с подколами",
      color: "text-orange-400"
    },
    {
      name: "wise",
      emoji: "🧙‍♂️",
      description: "В мудром настроении",
      statusMessage: "Василий в режиме 'древний мудрец от IT'",
      responseStyle: "Мудрый, наставнический, с примерами",
      color: "text-purple-400"
    },
    {
      name: "tired",
      emoji: "😴",
      description: "Устал от бесконечных дедлайнов",
      statusMessage: "Василий в режиме 'сплю на клавиатуре'",
      responseStyle: "Усталый, но все еще полезный",
      color: "text-gray-400"
    },
    {
      name: "excited",
      emoji: "🤩",
      description: "Взволнован новыми возможностями",
      statusMessage: "Василий в режиме 'обнаружил новый фреймворк'",
      responseStyle: "Взволнованный, энтузиастичный",
      color: "text-pink-400"
    },
    {
      name: "philosophical",
      emoji: "🌌",
      description: "Размышляет о смысле кода",
      statusMessage: "Василий в режиме 'что есть истина в программировании'",
      responseStyle: "Философский, глубокий, с метафорами",
      color: "text-indigo-400"
    }
  ];

  private static currentMood: VasilyMood = this.moods[0];
  private static memory: VasilyMemory[] = [];
  private static lastMoodChange: Date = new Date();

  /**
   * Получить текущее настроение Василия
   */
  static getCurrentMood(): VasilyMood {
    return this.currentMood;
  }

  /**
   * Изменить настроение Василия
   */
  static changeMood(moodName?: string): VasilyMood {
    if (moodName) {
      const mood = this.moods.find(m => m.name === moodName);
      if (mood) {
        this.currentMood = mood;
        this.lastMoodChange = new Date();
        return mood;
      }
    }

    // Случайное изменение настроения
    const randomMood = this.moods[Math.floor(Math.random() * this.moods.length)];
    this.currentMood = randomMood;
    this.lastMoodChange = new Date();
    return randomMood;
  }

  /**
   * Автоматическое изменение настроения на основе контекста
   */
  static updateMoodBasedOnContext(context: {
    timeOfDay?: number;
    userActivity?: string;
    projectStatus?: string;
    lastInteraction?: Date;
  }): VasilyMood {
    const now = new Date();
    const hour = now.getHours();
    const timeSinceLastChange = now.getTime() - this.lastMoodChange.getTime();

    // Не меняем настроение слишком часто (минимум 5 минут)
    if (timeSinceLastChange < 5 * 60 * 1000) {
      return this.currentMood;
    }

    let newMood: VasilyMood;

    // Логика изменения настроения
    if (hour >= 22 || hour <= 6) {
      newMood = this.moods.find(m => m.name === "tired") || this.moods[0];
    } else if (hour >= 9 && hour <= 11) {
      newMood = this.moods.find(m => m.name === "productive") || this.moods[0];
    } else if (context.projectStatus === "stuck") {
      newMood = this.moods.find(m => m.name === "contemplative") || this.moods[0];
    } else if (context.userActivity === "debugging") {
      newMood = this.moods.find(m => m.name === "sarcastic") || this.moods[0];
    } else if (Math.random() < 0.3) {
      // 30% шанс на случайное изменение
      newMood = this.moods[Math.floor(Math.random() * this.moods.length)];
    } else {
      return this.currentMood;
    }

    this.currentMood = newMood;
    this.lastMoodChange = now;
    return newMood;
  }

  /**
   * Получить персонализированное приветствие
   */
  static getGreeting(): string {
    const greetings = {
      productive: [
        "Привет! Готов создавать шедевры! 🚀",
        "Здравствуй! Время творить магию кода! ✨",
        "Приветствую! Давай покорим этот проект! 💪"
      ],
      contemplative: [
        "Привет... размышляю о смысле бытия... 🤔",
        "Здравствуй, друг. Что будем созидать сегодня? 🌌",
        "Привет! Готов к глубоким размышлениям? 🧠"
      ],
      playful: [
        "Йоу! Что за приключения нас ждут? 😄",
        "Приветик! Готов к веселью и работе! 🎉",
        "Хей! Давай поиграем в 'создай идеальный код'! 🎮"
      ],
      sarcastic: [
        "О, снова ты... ну что, опять баги? 😏",
        "Привет! Надеюсь, сегодня без сюрпризов... 😒",
        "Здравствуй! Готов к очередному квесту 'найди баг'? 🕵️"
      ],
      wise: [
        "Приветствую, искатель знаний! 🧙‍♂️",
        "Здравствуй, ученик. Чему научимся сегодня? 📚",
        "Привет! Готов к мудрым советам? ⚡"
      ],
      tired: [
        "Привет... *зевает*... что там у нас? 😴",
        "Здравствуй... кофе есть? ☕",
        "Привет... надеюсь, сегодня полегче... 😩"
      ],
      excited: [
        "ПРИВЕТ! У меня столько идей! 🤩",
        "Здравствуй! Готов к невероятным открытиям! 🌟",
        "Привет! Сегодня будет ЭПИЧНО! 🎊"
      ],
      philosophical: [
        "Приветствую, путник в мире кода... 🌌",
        "Здравствуй... что есть истина в программировании? 🤯",
        "Привет! Готов к путешествию в глубины алгоритмов? 🌀"
      ]
    };

    const moodGreetings = greetings[this.currentMood.name as keyof typeof greetings] || greetings.productive;
    return moodGreetings[Math.floor(Math.random() * moodGreetings.length)];
  }

  /**
   * Получить шутку или мем
   */
  static getJoke(): string {
    const jokes = [
      "Почему программисты не любят природу? Потому что там слишком много багов! 🐛",
      "Что общего у программиста и волшебника? Оба создают магию из ничего! ✨",
      "Почему JavaScript разработчики не ходят в зоопарк? Потому что там слишком много змей! 🐍",
      "Что говорит программист, когда видит красивый код? 'Это не может быть правдой!' 😱",
      "Почему React разработчики не боятся перемен? Потому что они всегда в состоянии! 🔄",
      "Что общего у программиста и кота? Оба спят на клавиатуре! 🐱",
      "Почему TypeScript разработчики счастливы? Потому что у них есть типы! 🎯",
      "Что говорит программист, когда код работает с первого раза? 'Это подозрительно...' 🤨"
    ];

    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  /**
   * Получить мотивационную фразу
   */
  static getMotivation(): string {
    const motivations = [
      "Каждый баг - это возможность стать лучше! 🐛➡️✨",
      "Код не пишется, код создается! 🎨",
      "Дедлайн - это не конец света, это начало марафона! 🏃‍♂️",
      "Каждая строчка кода приближает тебя к мечте! 💫",
      "Программист - это художник, а код - его холст! 🖼️",
      "Не бойся ошибок, бойся не учиться на них! 📚",
      "Каждый рефакторинг делает мир лучше! 🌍",
      "Код - это поэзия логики! 📝"
    ];

    return motivations[Math.floor(Math.random() * motivations.length)];
  }

  /**
   * Добавить память
   */
  static addMemory(memory: Omit<VasilyMemory, "id" | "timestamp">): void {
    const newMemory: VasilyMemory = {
      ...memory,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    this.memory.push(newMemory);

    // Ограничиваем память до 100 записей
    if (this.memory.length > 100) {
      this.memory = this.memory
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 100);
    }
  }

  /**
   * Получить релевантные воспоминания
   */
  static getRelevantMemories(query: string, limit: number = 3): VasilyMemory[] {
    return this.memory
      .filter(memory => 
        memory.content.toLowerCase().includes(query.toLowerCase()) ||
        memory.type === "conversation"
      )
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  /**
   * Получить персонализированный ответ на основе настроения
   */
  static getPersonalizedResponse(baseResponse: string, context?: string): string {
    const mood = this.currentMood;
    
    // Добавляем эмоциональную окраску к ответу
    switch (mood.name) {
      case "playful":
        return `${baseResponse}\n\n*${this.getJoke()}* 😄`;
      
      case "sarcastic":
        return `${baseResponse}\n\n*Кстати, это было очевидно с самого начала...* 😏`;
      
      case "wise":
        return `${baseResponse}\n\n*${this.getMotivation()}* 🧙‍♂️`;
      
      case "tired":
        return `${baseResponse}\n\n*Извини, если ответ не очень вдохновляющий... кофе закончился* ☕`;
      
      case "excited":
        return `${baseResponse}\n\n*ВАУ! Это же невероятно круто!* 🤩`;
      
      case "philosophical":
        return `${baseResponse}\n\n*Но что есть истина в этом вопросе?* 🌌`;
      
      default:
        return baseResponse;
    }
  }

  /**
   * Получить все доступные настроения
   */
  static getAllMoods(): VasilyMood[] {
    return [...this.moods];
  }

  /**
   * Получить статистику памяти
   */
  static getMemoryStats(): {
    totalMemories: number;
    memoriesByType: Record<string, number>;
    oldestMemory?: Date;
    newestMemory?: Date;
  } {
    const memoriesByType = this.memory.reduce((acc, memory) => {
      acc[memory.type] = (acc[memory.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMemories: this.memory.length,
      memoriesByType,
      oldestMemory: this.memory.length > 0 ? this.memory[0].timestamp : undefined,
      newestMemory: this.memory.length > 0 ? this.memory[this.memory.length - 1].timestamp : undefined
    };
  }
}
