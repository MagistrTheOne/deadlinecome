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
      currentCosts,
      usageData,
      optimizationGoals,
    } = await request.json();

    if (!projectId || !currentCosts) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Находим AI Analyst (Светлана)
    const aiAnalyst = await db
      .select()
      .from(aiTeamMember)
      .where(eq(aiTeamMember.role, "AI_ANALYST"))
      .limit(1);

    if (!aiAnalyst.length) {
      return NextResponse.json({ error: "AI Analyst not found" }, { status: 404 });
    }

    // Выполняем AI Cost Optimization
    const optimization = await performCostOptimization(currentCosts, usageData, optimizationGoals);

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyCostOptimization(projectId, optimization);
    }

    return NextResponse.json({
      success: true,
      optimization,
    });
  } catch (error) {
    console.error("Error performing cost optimization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// AI функция для оптимизации затрат
async function performCostOptimization(currentCosts: any, usageData: any, optimizationGoals: any) {
  const optimizationId = `cost_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Симуляция AI Cost Optimization
  const costAnalysis = {
    current: {
      infrastructure: 1250,
      development: 8500,
      tools: 450,
      personnel: 15000,
      total: 25200,
    },
    optimized: {
      infrastructure: 980,
      development: 7200,
      tools: 320,
      personnel: 15000,
      total: 23500,
    },
    savings: {
      infrastructure: 270,
      development: 1300,
      tools: 130,
      personnel: 0,
      total: 1700,
    },
    savingsPercentage: 6.7,
  };

  const optimizations = [
    {
      id: "opt_1",
      category: "Infrastructure",
      title: "Оптимизация облачных ресурсов",
      description: "Автоматическое масштабирование и оптимизация конфигурации",
      currentCost: 1250,
      optimizedCost: 980,
      savings: 270,
      implementation: "2-3 недели",
      risk: "LOW",
      priority: "HIGH",
      actions: [
        "Внедрить auto-scaling для серверов",
        "Оптимизировать размеры инстансов",
        "Настроить мониторинг использования ресурсов",
        "Внедрить spot instances для dev окружения",
      ],
    },
    {
      id: "opt_2",
      category: "Development",
      title: "Автоматизация процессов разработки",
      description: "Сокращение времени разработки через автоматизацию",
      currentCost: 8500,
      optimizedCost: 7200,
      savings: 1300,
      implementation: "1-2 месяца",
      risk: "MEDIUM",
      priority: "HIGH",
      actions: [
        "Внедрить CI/CD pipeline",
        "Автоматизировать тестирование",
        "Настроить автоматический деплой",
        "Оптимизировать процессы code review",
      ],
    },
    {
      id: "opt_3",
      category: "Tools",
      title: "Консолидация инструментов",
      description: "Объединение похожих инструментов и отказ от дублирования",
      currentCost: 450,
      optimizedCost: 320,
      savings: 130,
      implementation: "1 месяц",
      risk: "LOW",
      priority: "MEDIUM",
      actions: [
        "Аудит всех используемых инструментов",
        "Выявление дублирующих функций",
        "Переговоры с поставщиками о скидках",
        "Консолидация лицензий",
      ],
    },
    {
      id: "opt_4",
      category: "Personnel",
      title: "Оптимизация рабочего времени",
      description: "Повышение эффективности команды",
      currentCost: 15000,
      optimizedCost: 15000,
      savings: 0,
      implementation: "3-6 месяцев",
      risk: "HIGH",
      priority: "LOW",
      actions: [
        "Внедрить agile методологии",
        "Улучшить процессы коммуникации",
        "Автоматизировать рутинные задачи",
        "Повысить квалификацию команды",
      ],
    },
  ];

  const recommendations = [
    {
      priority: "HIGH",
      title: "Немедленная оптимизация инфраструктуры",
      description: "Быстрые меры для снижения затрат на 21.6%",
      timeline: "2-3 недели",
      impact: "HIGH",
      effort: "MEDIUM",
    },
    {
      priority: "HIGH",
      title: "Автоматизация процессов разработки",
      description: "Долгосрочные меры для повышения эффективности",
      timeline: "1-2 месяца",
      impact: "HIGH",
      effort: "HIGH",
    },
    {
      priority: "MEDIUM",
      title: "Консолидация инструментов",
      description: "Среднесрочные меры для снижения затрат на инструменты",
      timeline: "1 месяц",
      impact: "MEDIUM",
      effort: "MEDIUM",
    },
    {
      priority: "LOW",
      title: "Оптимизация персонала",
      description: "Долгосрочные меры для повышения эффективности команды",
      timeline: "3-6 месяцев",
      impact: "MEDIUM",
      effort: "HIGH",
    },
  ];

  const riskAssessment = [
    {
      risk: "Технические проблемы при внедрении",
      probability: 30,
      impact: "MEDIUM",
      mitigation: "Поэтапное внедрение с тестированием",
    },
    {
      risk: "Сопротивление команды изменениям",
      probability: 40,
      impact: "HIGH",
      mitigation: "Обучение и мотивация команды",
    },
    {
      risk: "Временное снижение производительности",
      probability: 50,
      impact: "MEDIUM",
      mitigation: "Планирование переходного периода",
    },
  ];

  const optimizationResult = {
    id: optimizationId,
    timestamp: new Date().toISOString(),
    costAnalysis,
    optimizations,
    recommendations,
    riskAssessment,
    summary: {
      totalSavings: 1700,
      savingsPercentage: 6.7,
      implementationTime: "2-6 месяцев",
      riskLevel: "MEDIUM",
      priorityActions: 2,
    },
    aiAnalysis: {
      overallOptimization: "MEDIUM",
      confidence: 87,
      keyInsights: [
        "Наибольший потенциал экономии в области разработки (15.3%)",
        "Инфраструктурные затраты можно снизить на 21.6%",
        "Инструменты имеют потенциал оптимизации на 28.9%",
        "Персонал требует долгосрочных инвестиций в эффективность",
      ],
      nextSteps: [
        "Начать с быстрых мер по инфраструктуре",
        "Планировать автоматизацию разработки",
        "Провести аудит инструментов",
        "Разработать план оптимизации персонала",
      ],
    },
  };

  return optimizationResult;
}
