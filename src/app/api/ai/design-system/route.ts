import { NextRequest, NextResponse } from "next/server";
import { AIDesignSystemInstance } from "@/lib/ai/design-system";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const limit = parseInt(searchParams.get("limit") || "20");

    switch (action) {
      case "systems":
        const systems = AIDesignSystemInstance.getDesignSystems();
        return NextResponse.json({ systems });

      case "templates":
        const templates = AIDesignSystemInstance.getComponentTemplates();
        return NextResponse.json({ templates });

      case "history":
        const history = AIDesignSystemInstance.getGenerationHistory(limit);
        return NextResponse.json({ history });

      case "stats":
        const stats = AIDesignSystemInstance.getDesignStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка получения данных дизайн-системы:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных дизайн-системы" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, prompt, style, colorScheme, componentId, code } = body;

    switch (action) {
      case "generate":
        if (!prompt || !style || !colorScheme) {
          return NextResponse.json(
            { error: "prompt, style и colorScheme обязательны" },
            { status: 400 }
          );
        }
        const generation = await AIDesignSystemInstance.generateDesignSystem(prompt, style, colorScheme);
        return NextResponse.json({ generation });

      case "analyze":
        if (!componentId || !code) {
          return NextResponse.json(
            { error: "componentId и code обязательны" },
            { status: 400 }
          );
        }
        const analysis = await AIDesignSystemInstance.analyzeDesign(componentId, code);
        return NextResponse.json({ analysis });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки дизайн-системы:", error);
    return NextResponse.json(
      { error: "Ошибка обработки дизайн-системы" },
      { status: 500 }
    );
  }
}
