import { NextRequest, NextResponse } from "next/server";
import { CustomAISystemInstance } from "@/lib/ai/custom-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, companyId, name, specialization, trainingData, customAIId, question, context, newData } = body;

    switch (action) {
      case "create":
        if (!companyId || !name || !specialization || !trainingData) {
          return NextResponse.json(
            { error: "companyId, name, specialization и trainingData обязательны" },
            { status: 400 }
          );
        }
        const aiId = await CustomAISystemInstance.createCustomAI(companyId, name, specialization, trainingData);
        return NextResponse.json({ customAIId: aiId });

      case "query":
        if (!customAIId || !question) {
          return NextResponse.json(
            { error: "customAIId и question обязательны" },
            { status: 400 }
          );
        }
        const response = await CustomAISystemInstance.queryCustomAI(customAIId, question, context);
        return NextResponse.json(response);

      case "retrain":
        if (!customAIId || !newData) {
          return NextResponse.json(
            { error: "customAIId и newData обязательны" },
            { status: 400 }
          );
        }
        await CustomAISystemInstance.retrainCustomAI(customAIId, newData);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка custom AI:", error);
    return NextResponse.json(
      { error: "Ошибка custom AI" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const customAIId = searchParams.get("customAIId");
    const companyId = searchParams.get("companyId");

    switch (action) {
      case "get":
        if (!customAIId) {
          return NextResponse.json(
            { error: "customAIId обязателен" },
            { status: 400 }
          );
        }
        const customAI = CustomAISystemInstance.getCustomAI(customAIId);
        return NextResponse.json({ customAI });

      case "company":
        if (!companyId) {
          return NextResponse.json(
            { error: "companyId обязателен" },
            { status: 400 }
          );
        }
        const companyAIs = CustomAISystemInstance.getCompanyCustomAIs(companyId);
        return NextResponse.json({ customAIs: companyAIs });

      case "progress":
        if (!customAIId) {
          return NextResponse.json(
            { error: "customAIId обязателен" },
            { status: 400 }
          );
        }
        const progress = CustomAISystemInstance.getTrainingProgress(customAIId);
        return NextResponse.json(progress);

      case "stats":
        const stats = CustomAISystemInstance.getCustomAIStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка получения custom AI:", error);
    return NextResponse.json(
      { error: "Ошибка получения custom AI" },
      { status: 500 }
    );
  }
}
