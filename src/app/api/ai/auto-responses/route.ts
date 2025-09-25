import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface AutoResponseContext {
  user?: {
    name: string;
    email: string;
  };
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  userActivity: {
    lastLogin?: Date;
    projectCount: number;
    taskCount: number;
    teamSize: number;
  };
  recentActions: string[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { context } = await request.json();

    // Определяем время дня
    const hour = new Date().getHours();
    let timeOfDay: "morning" | "afternoon" | "evening" | "night";
    if (hour >= 6 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
    else if (hour >= 18 && hour < 22) timeOfDay = "evening";
    else timeOfDay = "night";

    // Генерируем контекстные автоответы
    const autoResponses = generateAutoResponses({
      user: session.user,
      timeOfDay,
      userActivity: context?.userActivity || {
        projectCount: 0,
        taskCount: 0,
        teamSize: 1
      },
      recentActions: context?.recentActions || []
    });

    return NextResponse.json({
      success: true,
      autoResponses,
      context: {
        timeOfDay,
        user: session.user
      }
    });

  } catch (error) {
    console.error("Ошибка генерации автоответов:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

function generateAutoResponses(context: AutoResponseContext) {
  const responses = [];

  // Приветствие в зависимости от времени дня
  const timeGreetings = {
    morning: "Доброе утро! ☀️ Готов к продуктивному дню?",
    afternoon: "Добрый день! ⚡ Как дела с проектами?",
    evening: "Добрый вечер! 🌙 Время подвести итоги дня?",
    night: "Поздний вечер! 🌙 Не забывайте про отдых!"
  };

  responses.push({
    id: "time-greeting",
    type: "greeting",
    message: timeGreetings[context.timeOfDay],
    priority: "high",
    emoji: context.timeOfDay === "morning" ? "☀️" : 
           context.timeOfDay === "afternoon" ? "⚡" : 
           context.timeOfDay === "evening" ? "🌙" : "🌙",
    suggestions: [
      "Показать статистику",
      "Создать задачу",
      "Проверить проекты"
    ]
  });

  // Предложения для новых пользователей
  if (context.userActivity.projectCount === 0) {
    responses.push({
      id: "first-project",
      type: "suggestion",
      message: "Создайте свой первый проект! 🚀 Я помогу настроить все необходимое.",
      priority: "high",
      emoji: "📁",
      action: {
        type: "navigate",
        url: "/projects",
        label: "Создать проект"
      }
    });
  }

  // Предложения для команды
  if (context.userActivity.teamSize === 1) {
    responses.push({
      id: "invite-team",
      type: "suggestion",
      message: "Пригласите коллег в команду! 👥 Совместная работа повышает эффективность.",
      priority: "medium",
      emoji: "👥",
      action: {
        type: "navigate",
        url: "/team",
        label: "Управление командой"
      }
    });
  }

  // Советы по времени дня
  if (context.timeOfDay === "morning") {
    responses.push({
      id: "morning-tip",
      type: "tip",
      message: "Утренний совет: Планируйте самые важные задачи на первую половину дня! 🎯",
      priority: "medium",
      emoji: "💡"
    });
  } else if (context.timeOfDay === "evening") {
    responses.push({
      id: "evening-tip",
      type: "tip",
      message: "Вечерний совет: Проверьте прогресс задач и запланируйте завтрашний день! 📝",
      priority: "medium",
      emoji: "📊"
    });
  }

  // Контекстные предложения на основе активности
  if (context.recentActions.includes("task_created")) {
    responses.push({
      id: "task-created-followup",
      type: "suggestion",
      message: "Отлично! Вы создали задачу. Хотите назначить её участнику команды? 👤",
      priority: "low",
      emoji: "✅",
      suggestions: [
        "Назначить задачу",
        "Установить дедлайн",
        "Добавить описание"
      ]
    });
  }

  if (context.recentActions.includes("project_created")) {
    responses.push({
      id: "project-created-followup",
      type: "suggestion",
      message: "Проект создан! Теперь добавьте задачи и пригласите команду. 🎉",
      priority: "medium",
      emoji: "🎯",
      suggestions: [
        "Добавить задачи",
        "Пригласить команду",
        "Настроить доску"
      ]
    });
  }

  // Общие советы по продуктивности
  const productivityTips = [
    {
      id: "productivity-1",
      type: "tip",
      message: "Используйте AI-планирование спринтов для оптимального распределения задач! 🤖",
      priority: "low",
      emoji: "⚡"
    },
    {
      id: "productivity-2",
      type: "tip",
      message: "Настройте автоматические уведомления о дедлайнах! 🔔",
      priority: "low",
      emoji: "📅"
    },
    {
      id: "productivity-3",
      type: "tip",
      message: "Используйте аналитику для отслеживания прогресса команды! 📈",
      priority: "low",
      emoji: "📊"
    }
  ];

  // Добавляем случайный совет по продуктивности
  const randomTip = productivityTips[Math.floor(Math.random() * productivityTips.length)];
  responses.push(randomTip);

  return responses;
}
