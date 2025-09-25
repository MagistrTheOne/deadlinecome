import { NextRequest, NextResponse } from "next/server";
import { PredictiveAnalytics } from "@/lib/ai/predictive-analytics";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "predictions":
        const predictions = PredictiveAnalytics.getPredictions();
        return NextResponse.json(predictions);

      case "risks":
        const risks = PredictiveAnalytics.getRisks();
        return NextResponse.json(risks);

      case "forecasts":
        const forecasts = PredictiveAnalytics.getForecasts();
        return NextResponse.json(forecasts);

      case "developer-performance":
        const devPerformance = PredictiveAnalytics.getDeveloperPerformance();
        return NextResponse.json(devPerformance);

      case "stats":
        const stats = PredictiveAnalytics.getPredictionStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json({
          predictions: PredictiveAnalytics.getPredictions(),
          risks: PredictiveAnalytics.getRisks(),
          forecasts: PredictiveAnalytics.getForecasts(),
          stats: PredictiveAnalytics.getPredictionStats()
        });
    }
  } catch (error) {
    console.error("Ошибка получения данных предсказательной аналитики:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных предсказательной аналитики" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "predict-task":
        const taskPrediction = await PredictiveAnalytics.predictTaskCompletion(data.task);
        return NextResponse.json({
          success: true,
          prediction: taskPrediction,
          message: "Предсказание времени выполнения задачи создано"
        });

      case "assess-risks":
        const risks = PredictiveAnalytics.assessProjectRisks(data.project);
        return NextResponse.json({
          success: true,
          risks,
          message: `Обнаружено ${risks.length} рисков`
        });

      case "create-forecast":
        const forecast = PredictiveAnalytics.createProjectForecast(data.project);
        return NextResponse.json({
          success: true,
          forecast,
          message: "Прогноз проекта создан"
        });

      case "update-developer-performance":
        const { userId, performanceData } = data;
        PredictiveAnalytics.updateDeveloperPerformance(userId, performanceData);
        return NextResponse.json({
          success: true,
          message: "Производительность разработчика обновлена"
        });

      case "resolve-risk":
        const { riskId } = data;
        const resolved = PredictiveAnalytics.resolveRisk(riskId);
        return NextResponse.json({
          success: resolved,
          message: resolved ? "Риск разрешен" : "Риск не найден"
        });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки предсказательной аналитики:", error);
    return NextResponse.json(
      { error: "Ошибка обработки предсказательной аналитики" },
      { status: 500 }
    );
  }
}
