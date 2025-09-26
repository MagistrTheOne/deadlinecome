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
      workspaceId,
      teamData,
      timeRange = "30d",
    } = await request.json();

    if (!workspaceId || !teamData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Находим AI Burnout Detector
    const aiBurnout = await db
      .select()
      .from(aiTeamMember)
      .where(eq(aiTeamMember.role, "AI_BURNOUT_DETECTOR"))
      .limit(1);

    if (!aiBurnout.length) {
      return NextResponse.json({ error: "AI Burnout Detector not found" }, { status: 404 });
    }

    // Выполняем AI Burnout Detection
    const burnoutAnalysis = await performBurnoutDetection(teamData, timeRange);

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyBurnoutAlert(workspaceId, burnoutAnalysis);
    }

    return NextResponse.json({
      success: true,
      analysis: burnoutAnalysis,
    });
  } catch (error) {
    console.error("Error performing burnout detection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// AI функция для детекции выгорания
async function performBurnoutDetection(teamData: any, timeRange: string) {
  const analysisId = `burnout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Симуляция AI Burnout Detection
  const teamMembers = [
    {
      id: "user_1",
      name: "Алексей Иванов",
      role: "Senior Developer",
      burnoutRisk: "MEDIUM",
      stressLevel: 6.2,
      workHours: 9.5,
      productivity: 78,
      indicators: [
        "Увеличение рабочего времени",
        "Снижение продуктивности",
        "Частые переработки",
      ],
      recommendations: [
        "Снизить нагрузку на 20%",
        "Взять дополнительный выходной",
        "Провести 1-on-1 с менеджером",
      ],
    },
    {
      id: "user_2",
      name: "Мария Петрова",
      role: "Frontend Developer",
      burnoutRisk: "LOW",
      stressLevel: 4.1,
      workHours: 8.2,
      productivity: 92,
      indicators: [
        "Стабильная продуктивность",
        "Нормальные рабочие часы",
        "Положительный настрой",
      ],
      recommendations: [
        "Продолжить текущие практики",
        "Рассмотреть менторство",
        "Участие в новых проектах",
      ],
    },
    {
      id: "user_3",
      name: "Дмитрий Сидоров",
      role: "Backend Developer",
      burnoutRisk: "HIGH",
      stressLevel: 8.7,
      workHours: 11.2,
      productivity: 65,
      indicators: [
        "Критическое превышение рабочих часов",
        "Значительное снижение продуктивности",
        "Признаки эмоционального истощения",
      ],
      recommendations: [
        "Немедленный отпуск на 2 недели",
        "Снижение нагрузки на 50%",
        "Консультация с психологом",
        "Пересмотр рабочих процессов",
      ],
    },
  ];

  const teamMetrics = {
    averageBurnoutRisk: "MEDIUM",
    highRiskMembers: 1,
    mediumRiskMembers: 1,
    lowRiskMembers: 1,
    averageStressLevel: 6.3,
    averageWorkHours: 9.6,
    averageProductivity: 78.3,
  };

  const riskFactors = [
    {
      factor: "Excessive Work Hours",
      impact: "HIGH",
      affectedMembers: 2,
      description: "Превышение нормальных рабочих часов",
    },
    {
      factor: "High Stress Level",
      impact: "MEDIUM",
      affectedMembers: 2,
      description: "Повышенный уровень стресса",
    },
    {
      factor: "Low Productivity",
      impact: "MEDIUM",
      affectedMembers: 1,
      description: "Снижение продуктивности",
    },
    {
      factor: "Lack of Work-Life Balance",
      impact: "HIGH",
      affectedMembers: 2,
      description: "Нарушение баланса работы и жизни",
    },
  ];

  const recommendations = [
    {
      priority: "HIGH",
      action: "Немедленные меры для высокорисковых сотрудников",
      description: "Предоставить отпуск и снизить нагрузку",
      timeline: "1-2 недели",
    },
    {
      priority: "MEDIUM",
      action: "Внедрить систему мониторинга выгорания",
      description: "Регулярные check-in и метрики",
      timeline: "1 месяц",
    },
    {
      priority: "MEDIUM",
      action: "Улучшить процессы управления нагрузкой",
      description: "Более равномерное распределение задач",
      timeline: "2-3 недели",
    },
    {
      priority: "LOW",
      action: "Провести team building мероприятия",
      description: "Улучшить атмосферу в команде",
      timeline: "1-2 месяца",
    },
  ];

  const analysisResult = {
    id: analysisId,
    timestamp: new Date().toISOString(),
    timeRange,
    teamMetrics,
    members: teamMembers,
    riskFactors,
    recommendations,
    summary: {
      totalMembers: teamMembers.length,
      highRisk: teamMembers.filter(m => m.burnoutRisk === "HIGH").length,
      mediumRisk: teamMembers.filter(m => m.burnoutRisk === "MEDIUM").length,
      lowRisk: teamMembers.filter(m => m.burnoutRisk === "LOW").length,
      averageStress: teamMetrics.averageStressLevel,
      averageHours: teamMetrics.averageWorkHours,
    },
    aiAnalysis: {
      overallRisk: teamMetrics.averageBurnoutRisk,
      confidence: 89,
      keyInsights: [
        "1 сотрудник находится в зоне высокого риска выгорания",
        "Команда в целом работает с превышением нормальных часов",
        "Необходимы немедленные меры для предотвращения выгорания",
        "Рекомендуется пересмотр процессов управления нагрузкой",
      ],
      nextSteps: [
        "Немедленно принять меры для высокорисковых сотрудников",
        "Внедрить систему мониторинга выгорания",
        "Провести индивидуальные встречи с командой",
        "Разработать план профилактики выгорания",
      ],
    },
  };

  return analysisResult;
}
