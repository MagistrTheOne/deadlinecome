import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiTeamMember } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWebSocketManager } from "@/lib/websocket-server";

import { requireAuth } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const {
      projectId,
      sprintDuration = 14,
      teamCapacity,
      backlog,
      priorities,
    } = await request.json();

    if (!projectId || !backlog) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Находим AI Project Manager (Михаил)
    const aiPM = await db
      .select()
      .from(aiTeamMember)
      .where(eq(aiTeamMember.role, "AI_PM"))
      .limit(1);

    if (!aiPM.length) {
      return NextResponse.json({ error: "AI Project Manager not found" }, { status: 404 });
    }

    // Выполняем AI Sprint Planning
    const sprintPlan = await performSprintPlanning(sprintDuration, teamCapacity, backlog, priorities);

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifySprintPlanning(projectId, sprintPlan);
    }

    return NextResponse.json({
      success: true,
      plan: sprintPlan,
    });
  } catch (error) {
    console.error("Error performing sprint planning:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// AI функция для планирования спринта
async function performSprintPlanning(sprintDuration: number, teamCapacity: any, backlog: any[], priorities: any[]) {
  const planId = `sprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Симуляция AI Sprint Planning
  const selectedStories = [
    {
      id: `story_${Date.now()}_1`,
      title: "Реализация аутентификации пользователей",
      description: "Создать систему входа и регистрации с JWT токенами",
      storyPoints: 8,
      priority: "HIGH",
      assignee: "Frontend Developer",
      estimatedHours: 16,
      dependencies: [],
      risks: ["Сложность интеграции с внешними провайдерами"],
    },
    {
      id: `story_${Date.now()}_2`,
      title: "API для управления задачами",
      description: "Создать REST API для CRUD операций с задачами",
      storyPoints: 5,
      priority: "HIGH",
      assignee: "Backend Developer",
      estimatedHours: 10,
      dependencies: ["story_1"],
      risks: ["Необходимо согласование с фронтенд командой"],
    },
    {
      id: `story_${Date.now()}_3`,
      title: "UI компоненты для дашборда",
      description: "Создать переиспользуемые компоненты для интерфейса",
      storyPoints: 3,
      priority: "MEDIUM",
      assignee: "UI/UX Developer",
      estimatedHours: 6,
      dependencies: [],
      risks: ["Изменения в дизайне могут повлиять на сроки"],
    },
    {
      id: `story_${Date.now()}_4`,
      title: "Интеграция с базой данных",
      description: "Настроить подключение и миграции БД",
      storyPoints: 5,
      priority: "HIGH",
      assignee: "Backend Developer",
      estimatedHours: 10,
      dependencies: [],
      risks: ["Сложность настройки в production окружении"],
    },
    {
      id: `story_${Date.now()}_5`,
      title: "Тестирование API",
      description: "Написать unit и integration тесты",
      storyPoints: 3,
      priority: "MEDIUM",
      assignee: "QA Engineer",
      estimatedHours: 6,
      dependencies: ["story_2", "story_4"],
      risks: ["Недостаток времени на полное покрытие"],
    },
  ];

  const sprintGoals = [
    "Реализовать базовую аутентификацию пользователей",
    "Создать API для управления задачами",
    "Подготовить UI компоненты для дашборда",
    "Настроить интеграцию с базой данных",
    "Обеспечить базовое тестирование функциональности",
  ];

  const capacityAnalysis = {
    totalCapacity: teamCapacity?.totalHours || 80,
    allocatedCapacity: selectedStories.reduce((sum, story) => sum + story.estimatedHours, 0),
    utilizationRate: Math.round((selectedStories.reduce((sum, story) => sum + story.estimatedHours, 0) / (teamCapacity?.totalHours || 80)) * 100),
    bufferHours: Math.max(0, (teamCapacity?.totalHours || 80) - selectedStories.reduce((sum, story) => sum + story.estimatedHours, 0)),
  };

  const riskAssessment = [
    {
      id: `risk_${Date.now()}_1`,
      title: "Зависимости между задачами",
      severity: "MEDIUM",
      probability: 70,
      impact: "Может задержать завершение спринта",
      mitigation: "Параллельная разработка где возможно",
    },
    {
      id: `risk_${Date.now()}_2`,
      title: "Недооценка сложности задач",
      severity: "HIGH",
      probability: 60,
      impact: "Превышение временных рамок",
      mitigation: "Регулярные ретроспективы и корректировка оценок",
    },
    {
      id: `risk_${Date.now()}_3`,
      title: "Изменения в требованиях",
      severity: "MEDIUM",
      probability: 40,
      impact: "Дополнительная работа в спринте",
      mitigation: "Четкое определение scope в начале спринта",
    },
  ];

  const planResult = {
    id: planId,
    sprintDuration,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + sprintDuration * 24 * 60 * 60 * 1000).toISOString(),
    goals: sprintGoals,
    stories: selectedStories,
    capacity: capacityAnalysis,
    risks: riskAssessment,
    summary: {
      totalStories: selectedStories.length,
      totalStoryPoints: selectedStories.reduce((sum, story) => sum + story.storyPoints, 0),
      totalHours: selectedStories.reduce((sum, story) => sum + story.estimatedHours, 0),
      highPriorityStories: selectedStories.filter(s => s.priority === "HIGH").length,
      mediumPriorityStories: selectedStories.filter(s => s.priority === "MEDIUM").length,
      lowPriorityStories: selectedStories.filter(s => s.priority === "LOW").length,
    },
    aiAnalysis: {
      sprintHealth: capacityAnalysis.utilizationRate > 90 ? "AT_RISK" : capacityAnalysis.utilizationRate > 70 ? "HEALTHY" : "UNDER_UTILIZED",
      confidence: 85,
      recommendations: [
        "Рассмотреть добавление еще одной задачи для лучшего использования capacity",
        "Подготовить план B на случай блокеров",
        "Настроить ежедневные standup для отслеживания прогресса",
        "Запланировать mid-sprint review для корректировки",
      ],
      nextSteps: [
        "Провести sprint planning meeting с командой",
        "Создать детальные задачи в Jira/Trello",
        "Настроить мониторинг прогресса",
        "Подготовить demo план для sprint review",
      ],
    },
  };

  return planResult;
}
