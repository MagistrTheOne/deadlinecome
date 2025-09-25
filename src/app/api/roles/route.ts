import { NextRequest, NextResponse } from "next/server";

interface TeamMember {
  userId: string;
  userName: string;
  email: string;
  itRoleInfo: {
    name: string;
    level: "junior" | "middle" | "senior" | "lead";
    skills: string[];
    experience: number;
    specialization: string;
  };
  availability: {
    status: "available" | "busy" | "unavailable";
    workload: number; // 0-100%
    nextAvailable: string;
  };
  performance: {
    completedTasks: number;
    averageRating: number;
    lastActivity: string;
  };
}

// Демо данные для участников команды
const demoMembers: TeamMember[] = [
  {
    userId: "user-1",
    userName: "Алексей Иванов",
    email: "alexey@company.com",
    itRoleInfo: {
      name: "Frontend Developer",
      level: "senior",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      experience: 5,
      specialization: "UI/UX Development"
    },
    availability: {
      status: "available",
      workload: 70,
      nextAvailable: new Date().toISOString()
    },
    performance: {
      completedTasks: 12,
      averageRating: 4.8,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    userId: "user-2",
    userName: "Мария Петрова",
    email: "maria@company.com",
    itRoleInfo: {
      name: "Team Lead",
      level: "lead",
      skills: ["Project Management", "Agile", "Team Leadership", "Architecture"],
      experience: 8,
      specialization: "Project Management"
    },
    availability: {
      status: "busy",
      workload: 90,
      nextAvailable: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    },
    performance: {
      completedTasks: 8,
      averageRating: 4.9,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  },
  {
    userId: "user-3",
    userName: "Дмитрий Сидоров",
    email: "dmitry@company.com",
    itRoleInfo: {
      name: "Backend Developer",
      level: "middle",
      skills: ["Node.js", "Python", "PostgreSQL", "Docker"],
      experience: 3,
      specialization: "API Development"
    },
    availability: {
      status: "available",
      workload: 60,
      nextAvailable: new Date().toISOString()
    },
    performance: {
      completedTasks: 15,
      averageRating: 4.6,
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    userId: "user-4",
    userName: "Анна Козлова",
    email: "anna@company.com",
    itRoleInfo: {
      name: "QA Engineer",
      level: "middle",
      skills: ["Testing", "Automation", "Selenium", "Jest"],
      experience: 4,
      specialization: "Quality Assurance"
    },
    availability: {
      status: "available",
      workload: 50,
      nextAvailable: new Date().toISOString()
    },
    performance: {
      completedTasks: 20,
      averageRating: 4.7,
      lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  },
  {
    userId: "user-5",
    userName: "Сергей Волков",
    email: "sergey@company.com",
    itRoleInfo: {
      name: "DevOps Engineer",
      level: "senior",
      skills: ["AWS", "Kubernetes", "CI/CD", "Monitoring"],
      experience: 6,
      specialization: "Infrastructure"
    },
    availability: {
      status: "unavailable",
      workload: 0,
      nextAvailable: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    },
    performance: {
      completedTasks: 6,
      averageRating: 4.5,
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const availability = searchParams.get("availability");

    let filteredMembers = [...demoMembers];

    // Фильтрация по workspace (в демо все участники в одном workspace)
    if (workspaceId && workspaceId !== "demo-workspace") {
      return NextResponse.json({ members: [] });
    }

    // Фильтрация по конкретному пользователю
    if (userId) {
      const member = filteredMembers.find(m => m.userId === userId);
      return NextResponse.json({ members: member ? [member] : [] });
    }

    // Фильтрация по роли
    if (role) {
      filteredMembers = filteredMembers.filter(member => 
        member.itRoleInfo.name.toLowerCase().includes(role.toLowerCase())
      );
    }

    // Фильтрация по доступности
    if (availability) {
      filteredMembers = filteredMembers.filter(member => 
        member.availability.status === availability
      );
    }

    return NextResponse.json({ members: filteredMembers });
  } catch (error) {
    console.error("Ошибка получения участников команды:", error);
    return NextResponse.json(
      { error: "Ошибка получения участников команды" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, email, itRoleInfo } = body;

    const newMember: TeamMember = {
      userId: `user-${Date.now()}`,
      userName,
      email,
      itRoleInfo: {
        name: itRoleInfo.name || "Developer",
        level: itRoleInfo.level || "middle",
        skills: itRoleInfo.skills || [],
        experience: itRoleInfo.experience || 1,
        specialization: itRoleInfo.specialization || "General"
      },
      availability: {
        status: "available",
        workload: 0,
        nextAvailable: new Date().toISOString()
      },
      performance: {
        completedTasks: 0,
        averageRating: 0,
        lastActivity: new Date().toISOString()
      }
    };

    demoMembers.push(newMember);

    return NextResponse.json(newMember);
  } catch (error) {
    console.error("Ошибка добавления участника:", error);
    return NextResponse.json(
      { error: "Ошибка добавления участника" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, availability, performance } = body;

    const memberIndex = demoMembers.findIndex(member => member.userId === userId);
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "Участник не найден" },
        { status: 404 }
      );
    }

    const updatedMember = {
      ...demoMembers[memberIndex],
      ...(availability && { availability: { ...demoMembers[memberIndex].availability, ...availability } }),
      ...(performance && { performance: { ...demoMembers[memberIndex].performance, ...performance } })
    };

    demoMembers[memberIndex] = updatedMember;

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Ошибка обновления участника:", error);
    return NextResponse.json(
      { error: "Ошибка обновления участника" },
      { status: 500 }
    );
  }
}