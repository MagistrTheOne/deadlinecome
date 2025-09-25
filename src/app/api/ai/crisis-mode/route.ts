import { NextRequest, NextResponse } from "next/server";
import { CrisisMode } from "@/lib/ai/crisis-mode";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "active-crises":
        const activeCrises = CrisisMode.getActiveCrises();
        return NextResponse.json(activeCrises);

      case "responses":
        const responses = CrisisMode.getCrisisResponses();
        return NextResponse.json(responses);

      case "support-messages":
        const supportMessages = CrisisMode.getSupportMessages();
        return NextResponse.json(supportMessages);

      case "metrics":
        const metrics = CrisisMode.getCrisisMetrics();
        return NextResponse.json(metrics);

      case "is-active":
        const isActive = CrisisMode.isCrisisModeActive();
        return NextResponse.json({ isActive });

      case "prevention-recommendations":
        const recommendations = CrisisMode.getCrisisPreventionRecommendations();
        return NextResponse.json({ recommendations });

      default:
        return NextResponse.json({
          activeCrises: CrisisMode.getActiveCrises(),
          isActive: CrisisMode.isCrisisModeActive(),
          metrics: CrisisMode.getCrisisMetrics()
        });
    }
  } catch (error) {
    console.error("Ошибка получения данных режима кризиса:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных режима кризиса" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "detect-crises":
        const newAlerts = CrisisMode.detectCrisisSituations(data);
        return NextResponse.json({
          success: true,
          alerts: newAlerts,
          message: `Обнаружено ${newAlerts.length} кризисных ситуаций`
        });

      case "create-response":
        const { alertId } = data;
        const response = CrisisMode.createCrisisResponse(alertId);
        return NextResponse.json({
          success: true,
          response,
          message: "План реагирования на кризис создан"
        });

      case "send-support-messages":
        const { alertId: supportAlertId } = data;
        const supportMessages = CrisisMode.sendCrisisSupportMessages(supportAlertId);
        return NextResponse.json({
          success: true,
          messages: supportMessages,
          message: `Отправлено ${supportMessages.length} сообщений поддержки`
        });

      case "execute-action":
        const { responseId, actionId, assignedTo } = data;
        const executed = CrisisMode.executeCrisisAction(responseId, actionId, assignedTo);
        return NextResponse.json({
          success: executed,
          message: executed ? "Действие выполнено" : "Действие не найдено"
        });

      case "escalate-crisis":
        const { alertId: escalateAlertId } = data;
        const escalated = CrisisMode.escalateCrisis(escalateAlertId);
        return NextResponse.json({
          success: escalated,
          message: escalated ? "Кризис эскалирован" : "Кризис не найден"
        });

      case "activate-crisis-mode":
        CrisisMode.activateCrisisMode();
        return NextResponse.json({
          success: true,
          message: "Режим кризиса активирован"
        });

      case "deactivate-crisis-mode":
        CrisisMode.deactivateCrisisMode();
        return NextResponse.json({
          success: true,
          message: "Режим кризиса деактивирован"
        });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки режима кризиса:", error);
    return NextResponse.json(
      { error: "Ошибка обработки режима кризиса" },
      { status: 500 }
    );
  }
}
