import { NextRequest, NextResponse } from "next/server";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: {
    name: string;
    level: "junior" | "middle" | "senior" | "lead";
    department: string;
    skills: string[];
  };
  stats: {
    completedTasks: number;
    totalTasks: number;
    productivity: number;
    streak: number;
    rating: number;
    hoursWorked: number;
  };
  currentTasks: Array<{
    id: string;
    title: string;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate?: string;
    project: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: Date;
    project?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: Date;
  }>;
  teamMood: {
    personal: string;
    stress: number;
    energy: number;
    satisfaction: number;
  };
}

// Демо данные профиля
const demoProfile: UserProfile = {
  id: "user-1",
  name: "MagistrTheOne",
  email: "maxonyushko71@gmail.com",
  avatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
  role: {
    name: "Full-Stack Developer & AI Engineer",
    level: "lead",
    department: "AI Development",
    skills: ["React", "Next.js", "TypeScript", "AI/ML", "Node.js", "Python"]
  },
  stats: {
    completedTasks: 47,
    totalTasks: 52,
    productivity: 87,
    streak: 12,
    rating: 4.9,
    hoursWorked: 156
  },
  currentTasks: [
    {
      id: "task-1",
      title: "Реализовать AI-ассистента Василия",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      project: "DeadLine"
    },
    {
      id: "task-2",
      title: "Настроить WebSocket для real-time",
      status: "DONE",
      priority: "HIGH",
      project: "DeadLine"
    },
    {
      id: "task-3",
      title: "Создать систему ролей",
      status: "DONE",
      priority: "MEDIUM",
      project: "DeadLine"
    },
    {
      id: "task-4",
      title: "Оптимизировать производительность",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      project: "DeadLine"
    }
  ],
  recentActivity: [
    {
      id: "activity-1",
      action: "Завершил задачу 'Настроить WebSocket'",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      project: "DeadLine"
    },
    {
      id: "activity-2",
      action: "Добавил комментарий к задаче 'AI-ассистент'",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      project: "DeadLine"
    },
    {
      id: "activity-3",
      action: "Создал новый проект 'DeadLine'",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      project: "DeadLine"
    }
  ],
  achievements: [
    {
      id: "ach-1",
      title: "AI Pioneer",
      description: "Создал первую AI-команду разработки",
      icon: "🤖",
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: "ach-2",
      title: "Productivity Master",
      description: "12 дней подряд высокой продуктивности",
      icon: "⚡",
      earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: "ach-3",
      title: "Team Player",
      description: "Помог 5+ участникам команды",
      icon: "👥",
      earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    }
  ],
  teamMood: {
    personal: "excited",
    stress: 25,
    energy: 85,
    satisfaction: 92
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "UserId parameter is required" },
        { status: 400 }
      );
    }

    // В реальном приложении здесь был бы запрос к базе данных
    // const profile = await getUserProfile(userId);
    
    // Возвращаем demo данные
    return NextResponse.json(demoProfile);
  } catch (error) {
    console.error("Ошибка получения профиля пользователя:", error);
    return NextResponse.json(
      { error: "Ошибка получения профиля пользователя" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "UserId parameter is required" },
        { status: 400 }
      );
    }

    // В реальном приложении здесь была бы обновление в базе данных
    // const updatedProfile = await updateUserProfile(userId, updates);
    
    // Возвращаем обновленный профиль
    const updatedProfile = {
      ...demoProfile,
      ...updates,
      id: userId
    };

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Ошибка обновления профиля пользователя:", error);
    return NextResponse.json(
      { error: "Ошибка обновления профиля пользователя" },
      { status: 500 }
    );
  }
}
