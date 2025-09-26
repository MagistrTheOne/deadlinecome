import { NextRequest, NextResponse } from "next/server";
import { AILearningSystemInstance } from "@/lib/ai/learning-system";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aiId, projectId, experience, outcome } = body;

    if (!aiId || !projectId || !experience || !outcome) {
      return NextResponse.json(
        { error: "aiId, projectId, experience и outcome обязательны" },
        { status: 400 }
      );
    }

    await AILearningSystemInstance.learnFromExperience(aiId, projectId, experience, outcome);
    
    return NextResponse.json({ 
      success: true, 
      message: "Опыт успешно обработан" 
    });
  } catch (error) {
    console.error("Ошибка обработки опыта:", error);
    return NextResponse.json(
      { error: "Ошибка обработки опыта" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aiId = searchParams.get("aiId");

    if (aiId) {
      const insights = await AILearningSystemInstance.getAILearningInsights(aiId);
      return NextResponse.json(insights);
    } else {
      const stats = AILearningSystemInstance.getLearningStats();
      return NextResponse.json(stats);
    }
  } catch (error) {
    console.error("Ошибка получения данных обучения:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных обучения" },
      { status: 500 }
    );
  }
}
