import { NextRequest, NextResponse } from "next/server";
import { AIProjectPredictorInstance } from "@/lib/ai/project-predictor";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const projectType = searchParams.get("projectType");

    switch (action) {
      case "technology-trends":
        const trends = AIProjectPredictorInstance.getTechnologyTrends();
        return NextResponse.json({ trends });

      case "stats":
        const stats = AIProjectPredictorInstance.getPredictionStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка получения данных предсказания проектов:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных предсказания проектов" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, projectId, metrics, projectType } = body;

    switch (action) {
      case "predict":
        if (!projectId || !metrics) {
          return NextResponse.json(
            { error: "projectId и metrics обязательны" },
            { status: 400 }
          );
        }
        const prediction = await AIProjectPredictorInstance.predictProjectSuccess(metrics);
        return NextResponse.json({ prediction });

      case "assess-risks":
        if (!projectId || !metrics) {
          return NextResponse.json(
            { error: "projectId и metrics обязательны" },
            { status: 400 }
          );
        }
        const riskAssessment = await AIProjectPredictorInstance.assessRisks(projectId, metrics);
        return NextResponse.json({ riskAssessment });

      case "analyze-market":
        if (!projectId || !projectType) {
          return NextResponse.json(
            { error: "projectId и projectType обязательны" },
            { status: 400 }
          );
        }
        const marketAnalysis = await AIProjectPredictorInstance.analyzeMarket(projectId, projectType);
        return NextResponse.json({ marketAnalysis });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки предсказания проектов:", error);
    return NextResponse.json(
      { error: "Ошибка обработки предсказания проектов" },
      { status: 500 }
    );
  }
}
