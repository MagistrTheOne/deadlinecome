import { NextRequest, NextResponse } from "next/server";

interface AITeamMember {
  id: string;
  name: string;
  role: string;
  specialization: string;
  avatar: string;
  status: "online" | "busy" | "away" | "offline";
  currentTask?: string;
  performance: {
    tasksCompleted: number;
    successRate: number;
    responseTime: number;
    satisfaction: number;
  };
  skills: string[];
  personality: {
    traits: string[];
    communicationStyle: string;
    workingHours: string;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: Date;
    project?: string;
  }>;
}

// Демо данные для AI команды
const demoAITeam: AITeamMember[] = [
  {
    id: "ai-vasily",
    name: "Василий",
    role: "AI Team Lead",
    specialization: "Project Management & Strategy",
    avatar: "🤖",
    status: "online",
    currentTask: "Планирование спринта",
    performance: {
      tasksCompleted: 156,
      successRate: 94,
      responseTime: 2.3,
      satisfaction: 4.8
    },
    skills: ["Agile", "Scrum", "Team Management", "AI Strategy"],
    personality: {
      traits: ["Лидер", "Стратегический", "Мотивирующий"],
      communicationStyle: "Прямой и вдохновляющий",
      workingHours: "24/7"
    },
    recentActivity: [
      {
        id: "act-1",
        action: "Создал план спринта на следующую неделю",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        project: "DeadLine"
      },
      {
        id: "act-2",
        action: "Провел ретроспективу с командой",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        project: "DeadLine"
      }
    ]
  },
  {
    id: "ai-vladimir",
    name: "Владимир",
    role: "AI Code Reviewer",
    specialization: "Code Quality & Architecture",
    avatar: "👨‍💻",
    status: "busy",
    currentTask: "Анализ PR-125",
    performance: {
      tasksCompleted: 89,
      successRate: 97,
      responseTime: 1.8,
      satisfaction: 4.9
    },
    skills: ["Code Review", "Architecture", "Security", "Performance"],
    personality: {
      traits: ["Внимательный", "Технический", "Качественный"],
      communicationStyle: "Детальный и конструктивный",
      workingHours: "9:00-18:00"
    },
    recentActivity: [
      {
        id: "act-3",
        action: "Завершил review PR-124",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        project: "DeadLine"
      },
      {
        id: "act-4",
        action: "Обнаружил security уязвимость",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        project: "DeadLine"
      }
    ]
  },
  {
    id: "ai-olga",
    name: "Ольга",
    role: "AI Security Expert",
    specialization: "Security & Compliance",
    avatar: "🛡️",
    status: "online",
    currentTask: "Сканирование безопасности",
    performance: {
      tasksCompleted: 67,
      successRate: 99,
      responseTime: 3.2,
      satisfaction: 4.7
    },
    skills: ["Security", "Compliance", "Risk Assessment", "Penetration Testing"],
    personality: {
      traits: ["Бдительная", "Аналитическая", "Защищающая"],
      communicationStyle: "Осторожная и предупреждающая",
      workingHours: "24/7"
    },
    recentActivity: [
      {
        id: "act-5",
        action: "Завершила security audit",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        project: "DeadLine"
      },
      {
        id: "act-6",
        action: "Обновила security policies",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        project: "DeadLine"
      }
    ]
  },
  {
    id: "ai-pavel",
    name: "Павел",
    role: "AI Performance Engineer",
    specialization: "Performance & Optimization",
    avatar: "⚡",
    status: "away",
    currentTask: "Оптимизация запросов",
    performance: {
      tasksCompleted: 78,
      successRate: 92,
      responseTime: 2.1,
      satisfaction: 4.6
    },
    skills: ["Performance", "Optimization", "Monitoring", "Scalability"],
    personality: {
      traits: ["Эффективный", "Аналитический", "Оптимизирующий"],
      communicationStyle: "Технический и результативный",
      workingHours: "10:00-19:00"
    },
    recentActivity: [
      {
        id: "act-7",
        action: "Оптимизировал database queries",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        project: "DeadLine"
      }
    ]
  },
  {
    id: "ai-mikhail",
    name: "Михаил",
    role: "AI Project Manager",
    specialization: "Planning & Coordination",
    avatar: "📊",
    status: "online",
    currentTask: "Планирование релиза",
    performance: {
      tasksCompleted: 134,
      successRate: 96,
      responseTime: 1.9,
      satisfaction: 4.8
    },
    skills: ["Project Management", "Planning", "Coordination", "Risk Management"],
    personality: {
      traits: ["Организованный", "Предсказуемый", "Координирующий"],
      communicationStyle: "Структурированный и планирующий",
      workingHours: "8:00-17:00"
    },
    recentActivity: [
      {
        id: "act-8",
        action: "Создал roadmap на квартал",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        project: "DeadLine"
      }
    ]
  },
  {
    id: "ai-tatyana",
    name: "Татьяна",
    role: "AI Documentation Specialist",
    specialization: "Documentation & Knowledge",
    avatar: "📚",
    status: "busy",
    currentTask: "Обновление API docs",
    performance: {
      tasksCompleted: 92,
      successRate: 98,
      responseTime: 2.5,
      satisfaction: 4.9
    },
    skills: ["Documentation", "Technical Writing", "Knowledge Management", "API Docs"],
    personality: {
      traits: ["Детальная", "Организованная", "Помогающая"],
      communicationStyle: "Ясная и структурированная",
      workingHours: "9:00-18:00"
    },
    recentActivity: [
      {
        id: "act-9",
        action: "Обновила API документацию",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        project: "DeadLine"
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const specialization = searchParams.get("specialization");

    let filteredTeam = [...demoAITeam];

    // Фильтрация по статусу
    if (status && status !== "ALL") {
      filteredTeam = filteredTeam.filter(member => member.status === status);
    }

    // Фильтрация по специализации
    if (specialization && specialization !== "ALL") {
      filteredTeam = filteredTeam.filter(member => 
        member.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    return NextResponse.json({ team: filteredTeam });
  } catch (error) {
    console.error("Ошибка получения AI команды:", error);
    return NextResponse.json(
      { error: "Ошибка получения AI команды" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, targetMember } = body;

    // В реальном приложении здесь была бы отправка сообщения AI-специалисту
    const response = {
      success: true,
      message: `Сообщение отправлено ${targetMember || "команде"}`,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Ошибка отправки сообщения:", error);
    return NextResponse.json(
      { error: "Ошибка отправки сообщения" },
      { status: 500 }
    );
  }
}