import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiTeamMember } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWebSocketManager } from "@/lib/websocket-server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      workspaceId,
      meetingType,
      participants,
      agenda,
      duration,
    } = await request.json();

    if (!workspaceId || !meetingType || !participants) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Находим AI Meeting Assistant
    const aiMeeting = await db
      .select()
      .from(aiTeamMember)
      .where(eq(aiTeamMember.role, "AI_MEETING_ASSISTANT"))
      .limit(1);

    if (!aiMeeting.length) {
      return NextResponse.json({ error: "AI Meeting Assistant not found" }, { status: 404 });
    }

    // Создаем AI Meeting с помощью AI
    const meeting = await createAIMeeting(meetingType, participants, agenda, duration);

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyMeetingScheduled(workspaceId, meeting);
    }

    return NextResponse.json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("Error creating AI meeting:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// AI функция для создания встречи
async function createAIMeeting(meetingType: string, participants: any[], agenda: any[], duration: number) {
  const meetingId = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const meetingTemplates = {
    DAILY_STANDUP: generateDailyStandup(),
    SPRINT_PLANNING: generateSprintPlanning(),
    RETROSPECTIVE: generateRetrospective(),
    CODE_REVIEW: generateCodeReview(),
    TECHNICAL_DISCUSSION: generateTechnicalDiscussion(),
    PROJECT_REVIEW: generateProjectReview(),
  };

  const meeting = meetingTemplates[meetingType as keyof typeof meetingTemplates] || generateDailyStandup();

  return {
    id: meetingId,
    type: meetingType,
    scheduledAt: new Date().toISOString(),
    ...meeting,
  };
}

function generateDailyStandup() {
  return {
    title: "Daily Standup Meeting",
    description: "Ежедневная синхронизация команды",
    agenda: [
      "Обзор вчерашних достижений",
      "Планы на сегодня",
      "Блокеры и препятствия",
      "Обновление статуса задач",
    ],
    aiAssistance: [
      "Автоматическое создание отчета",
      "Отслеживание прогресса задач",
      "Выявление потенциальных блокеров",
      "Генерация action items",
    ],
    duration: 15,
    participants: ["Development Team", "Product Owner", "Scrum Master"],
    preparation: [
      "Обновить статус задач в Jira",
      "Подготовить список блокеров",
      "Проверить зависимости между задачами",
    ],
    outcomes: [
      "Синхронизация команды",
      "Выявление блокеров",
      "Планирование дня",
      "Обновление статуса проекта",
    ],
  };
}

function generateSprintPlanning() {
  return {
    title: "Sprint Planning Meeting",
    description: "Планирование спринта с AI-помощником",
    agenda: [
      "Обзор backlog",
      "Оценка сложности задач",
      "Планирование capacity",
      "Определение sprint goals",
      "Создание sprint backlog",
    ],
    aiAssistance: [
      "AI-оценка сложности задач",
      "Оптимальное распределение нагрузки",
      "Предсказание рисков",
      "Автоматическое планирование",
    ],
    duration: 120,
    participants: ["Development Team", "Product Owner", "Scrum Master", "Stakeholders"],
    preparation: [
      "Подготовить refined backlog",
      "Провести capacity planning",
      "Определить sprint goals",
      "Подготовить user stories",
    ],
    outcomes: [
      "Sprint backlog",
      "Sprint goals",
      "Task assignments",
      "Risk assessment",
    ],
  };
}

function generateRetrospective() {
  return {
    title: "Sprint Retrospective",
    description: "Ретроспектива спринта с AI-анализом",
    agenda: [
      "Обзор метрик спринта",
      "Что прошло хорошо",
      "Что можно улучшить",
      "Action items на следующий спринт",
    ],
    aiAssistance: [
      "Анализ метрик производительности",
      "Выявление паттернов в команде",
      "Рекомендации по улучшению",
      "Автоматическая генерация insights",
    ],
    duration: 90,
    participants: ["Development Team", "Scrum Master"],
    preparation: [
      "Собрать метрики спринта",
      "Подготовить данные о производительности",
      "Проанализировать feedback",
    ],
    outcomes: [
      "Action items",
      "Process improvements",
      "Team insights",
      "Next sprint preparation",
    ],
  };
}

function generateCodeReview() {
  return {
    title: "Code Review Session",
    description: "Сессия code review с AI-ассистентом",
    agenda: [
      "Обзор pull requests",
      "Обсуждение архитектурных решений",
      "Code quality feedback",
      "Best practices discussion",
    ],
    aiAssistance: [
      "Автоматический анализ кода",
      "Предложения по улучшению",
      "Выявление потенциальных проблем",
      "Генерация рекомендаций",
    ],
    duration: 60,
    participants: ["Senior Developers", "Tech Lead", "Code Authors"],
    preparation: [
      "Подготовить pull requests",
      "Провести предварительный анализ",
      "Подготовить вопросы для обсуждения",
    ],
    outcomes: [
      "Code improvements",
      "Knowledge sharing",
      "Best practices",
      "Technical decisions",
    ],
  };
}

function generateTechnicalDiscussion() {
  return {
    title: "Technical Discussion",
    description: "Техническое обсуждение с AI-экспертом",
    agenda: [
      "Архитектурные решения",
      "Технические проблемы",
      "Выбор технологий",
      "Performance optimization",
    ],
    aiAssistance: [
      "AI-анализ архитектурных решений",
      "Предложения по оптимизации",
      "Анализ производительности",
      "Рекомендации по технологиям",
    ],
    duration: 90,
    participants: ["Tech Lead", "Senior Developers", "Architects"],
    preparation: [
      "Подготовить технические вопросы",
      "Исследовать возможные решения",
      "Подготовить сравнительный анализ",
    ],
    outcomes: [
      "Technical decisions",
      "Architecture improvements",
      "Technology choices",
      "Implementation plans",
    ],
  };
}

function generateProjectReview() {
  return {
    title: "Project Review Meeting",
    description: "Обзор проекта с AI-аналитиком",
    agenda: [
      "Обзор прогресса проекта",
      "Анализ метрик",
      "Обсуждение рисков",
      "Планирование следующих этапов",
    ],
    aiAssistance: [
      "AI-анализ прогресса",
      "Предсказание рисков",
      "Оптимизация ресурсов",
      "Рекомендации по улучшению",
    ],
    duration: 120,
    participants: ["Project Manager", "Stakeholders", "Team Leads"],
    preparation: [
      "Подготовить отчет о прогрессе",
      "Собрать метрики проекта",
      "Проанализировать риски",
    ],
    outcomes: [
      "Progress report",
      "Risk mitigation plan",
      "Resource optimization",
      "Next phase planning",
    ],
  };
}
