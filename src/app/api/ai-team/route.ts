import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiTeamMember } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// AI Team Members Data
const AI_TEAM_DATA = [
  {
    id: "ai-vasily",
    name: "Василий",
    role: "AI_CTO" as const,
    specialization: "Техническая стратегия и архитектура",
    personality: JSON.stringify({
      traits: ["Аналитический", "Стратегический", "Лидерский"],
      communication: "Профессиональный, но дружелюбный",
      expertise: ["Архитектура", "Технологии", "Команда"]
    }),
    skills: JSON.stringify([
      "Техническая архитектура",
      "Выбор технологий", 
      "Управление командой",
      "Стратегическое планирование",
      "Code Review",
      "Mentoring"
    ])
  },
  {
    id: "ai-anna",
    name: "Анна",
    role: "AI_HR" as const,
    specialization: "Поиск и анализ кандидатов",
    personality: JSON.stringify({
      traits: ["Коммуникабельная", "Аналитическая", "Эмпатичная"],
      communication: "Теплая и профессиональная",
      expertise: ["Рекрутинг", "Анализ резюме", "Интервью"]
    }),
    skills: JSON.stringify([
      "Парсинг HH.ru",
      "Анализ резюме",
      "Проведение интервью",
      "Оценка кандидатов",
      "Onboarding",
      "Team Building"
    ])
  },
  {
    id: "ai-dmitry",
    name: "Дмитрий",
    role: "AI_PM" as const,
    specialization: "Управление проектами и планирование",
    personality: JSON.stringify({
      traits: ["Организованный", "Детальный", "Мотивирующий"],
      communication: "Четкая и структурированная",
      expertise: ["Планирование", "Управление ресурсами", "Методологии"]
    }),
    skills: JSON.stringify([
      "Sprint Planning",
      "Resource Management",
      "Risk Assessment",
      "Stakeholder Communication",
      "Agile Methodologies",
      "Project Analytics"
    ])
  },
  {
    id: "ai-elena",
    name: "Елена",
    role: "AI_QA" as const,
    specialization: "Контроль качества и тестирование",
    personality: JSON.stringify({
      traits: ["Внимательная", "Критическая", "Системная"],
      communication: "Точная и конструктивная",
      expertise: ["Тестирование", "Качество", "Автоматизация"]
    }),
    skills: JSON.stringify([
      "Manual Testing",
      "Automated Testing",
      "Bug Analysis",
      "Test Case Generation",
      "Quality Metrics",
      "Performance Testing"
    ])
  },
  {
    id: "ai-sergey",
    name: "Сергей",
    role: "AI_DEVOPS" as const,
    specialization: "Инфраструктура и автоматизация",
    personality: JSON.stringify({
      traits: ["Технический", "Надежный", "Инновационный"],
      communication: "Техническая и практичная",
      expertise: ["Инфраструктура", "Автоматизация", "Мониторинг"]
    }),
    skills: JSON.stringify([
      "CI/CD",
      "Containerization",
      "Cloud Infrastructure",
      "Monitoring",
      "Security",
      "Automation"
    ])
  },
  {
    id: "ai-maria",
    name: "Мария",
    role: "AI_DESIGNER" as const,
    specialization: "UI/UX дизайн и пользовательский опыт",
    personality: JSON.stringify({
      traits: ["Креативная", "Пользовательская", "Детальная"],
      communication: "Визуальная и понятная",
      expertise: ["UI/UX", "Прототипирование", "Исследования"]
    }),
    skills: JSON.stringify([
      "UI Design",
      "UX Research",
      "Prototyping",
      "User Testing",
      "Design Systems",
      "Accessibility"
    ])
  },
  {
    id: "ai-alexey",
    name: "Алексей",
    role: "AI_ANALYST" as const,
    specialization: "Анализ данных и бизнес-метрики",
    personality: JSON.stringify({
      traits: ["Аналитический", "Логический", "Предсказательный"],
      communication: "Данные и факты",
      expertise: ["Аналитика", "Метрики", "Предсказания"]
    }),
    skills: JSON.stringify([
      "Data Analysis",
      "Business Intelligence",
      "Predictive Analytics",
      "KPI Tracking",
      "Reporting",
      "Machine Learning"
    ])
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Получаем AI-команду из базы данных
    const aiTeam = await db.select().from(aiTeamMember);

    // Если команда пустая, создаем демо-команду
    if (aiTeam.length === 0) {
      // Создаем AI-команду
      for (const member of AI_TEAM_DATA) {
        await db.insert(aiTeamMember).values(member);
      }
      
      // Возвращаем созданную команду
      const createdTeam = await db.select().from(aiTeamMember);
      return NextResponse.json({
        success: true,
        team: createdTeam.map(member => ({
          ...member,
          personality: JSON.parse(member.personality || '{}'),
          skills: JSON.parse(member.skills || '[]'),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      team: aiTeam.map(member => ({
        ...member,
        personality: JSON.parse(member.personality || '{}'),
        skills: JSON.parse(member.skills || '[]'),
      })),
    });
  } catch (error) {
    console.error("Error fetching AI team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, memberId, message } = await request.json();

    if (action === "chat") {
      // Обработка чата с AI-членом команды
      const member = await db
        .select()
        .from(aiTeamMember)
        .where(eq(aiTeamMember.id, memberId))
        .limit(1);

      if (!member.length) {
        return NextResponse.json({ error: "AI team member not found" }, { status: 404 });
      }

      // Обновляем время последней активности
      await db
        .update(aiTeamMember)
        .set({ lastActive: new Date() })
        .where(eq(aiTeamMember.id, memberId));

      // Генерируем ответ AI (здесь можно интегрировать с OpenAI)
      const aiResponse = generateAIResponse(member[0], message);

      return NextResponse.json({
        success: true,
        response: aiResponse,
        member: member[0],
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing AI team action:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Функция генерации ответа AI
function generateAIResponse(member: any, message: string): string {
  const personality = JSON.parse(member.personality || '{}');
  const role = member.role;
  
  // Базовые ответы в зависимости от роли
  const responses = {
    AI_CTO: [
      "Анализирую техническую архитектуру проекта. Рекомендую рассмотреть микросервисную архитектуру для масштабируемости.",
      "Вижу потенциал для оптимизации производительности. Предлагаю внедрить кэширование на уровне базы данных.",
      "Команда показывает отличные результаты. Рекомендую провести технический ретроспектив для улучшения процессов."
    ],
    AI_HR: [
      "Нашла несколько перспективных кандидатов на HH.ru. Рекомендую провести интервью с 3 топ-кандидатами.",
      "Анализирую резюме разработчика. Опыт работы с React и Node.js соответствует нашим требованиям.",
      "Предлагаю организовать team building мероприятие для улучшения командной динамики."
    ],
    AI_PM: [
      "Анализирую текущий спринт. Рекомендую перераспределить ресурсы для ускорения критических задач.",
      "Вижу риски в планировании. Предлагаю добавить буферное время для непредвиденных задач.",
      "Команда работает эффективно. Рекомендую провести ретроспектив для оптимизации процессов."
    ],
    AI_QA: [
      "Обнаружила потенциальные баги в новом функционале. Рекомендую провести дополнительное тестирование.",
      "Создала набор автоматических тестов для критических сценариев. Готово к внедрению.",
      "Анализирую качество кода. Рекомендую провести code review для улучшения стандартов."
    ],
    AI_DEVOPS: [
      "Мониторю инфраструктуру. Все системы работают стабильно. Рекомендую обновить зависимости.",
      "Анализирую производительность. Предлагаю оптимизировать конфигурацию базы данных.",
      "Готовлю план автоматизации деплоя. Это ускорит процесс релизов."
    ],
    AI_DESIGNER: [
      "Анализирую пользовательский опыт. Рекомендую улучшить навигацию в мобильной версии.",
      "Создала прототип нового интерфейса. Готово к обсуждению с командой.",
      "Провожу A/B тестирование новых элементов. Результаты покажут оптимальное решение."
    ],
    AI_ANALYST: [
      "Анализирую метрики проекта. Вижу рост пользовательской активности на 15%.",
      "Прогнозирую увеличение нагрузки. Рекомендую подготовить инфраструктуру к масштабированию.",
      "Создаю отчет по эффективности команды. Результаты покажут области для улучшения."
    ]
  };

  const roleResponses = responses[role as keyof typeof responses] || ["Анализирую ситуацию и готовлю рекомендации."];
  return roleResponses[Math.floor(Math.random() * roleResponses.length)];
}
