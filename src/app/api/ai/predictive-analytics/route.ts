import { NextRequest, NextResponse } from "next/server";
import { PredictiveAnalyticsInstance } from "@/lib/ai/predictive-analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "analyze-risks":
        if (!data.projectData) {
          return NextResponse.json(
            { error: "projectData обязателен" },
            { status: 400 }
          );
        }
        const riskAssessment = await PredictiveAnalyticsInstance.analyzeProjectRisks(data.projectData);
        return NextResponse.json(riskAssessment);

      case "predict-performance":
        if (!data.teamData) {
          return NextResponse.json(
            { error: "teamData обязателен" },
            { status: 400 }
          );
        }
        const performance = await PredictiveAnalyticsInstance.predictTeamPerformance(data.teamData);
        return NextResponse.json(performance);

      case "predict-quality":
        if (!data.codeMetrics) {
          return NextResponse.json(
            { error: "codeMetrics обязателен" },
            { status: 400 }
          );
        }
        const quality = await PredictiveAnalyticsInstance.predictQualityIssues(data.codeMetrics);
        return NextResponse.json(quality);

      case "predict-deadlines":
        if (!data.projectData) {
          return NextResponse.json(
            { error: "projectData обязателен" },
            { status: 400 }
          );
        }
        const deadlines = await PredictiveAnalyticsInstance.predictDeadlineRisks(data.projectData);
        return NextResponse.json(deadlines);

      case "add-data":
        if (!data) {
          return NextResponse.json(
            { error: "data обязателен" },
            { status: 400 }
          );
        }
        PredictiveAnalyticsInstance.addHistoricalData(data);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка predictive analytics:", error);
    return NextResponse.json(
      { error: "Ошибка predictive analytics" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const accuracy = PredictiveAnalyticsInstance.getPredictionAccuracy();
    return NextResponse.json(accuracy);
  } catch (error) {
    console.error("Ошибка получения predictive analytics:", error);
    return NextResponse.json(
      { error: "Ошибка получения predictive analytics" },
      { status: 500 }
    );
  }
}