import { NextRequest, NextResponse } from "next/server";
import { AICodeGenerationInstance } from "@/lib/ai/code-generation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const category = searchParams.get("category");
    const language = searchParams.get("language");
    const limit = parseInt(searchParams.get("limit") || "20");

    switch (action) {
      case "templates":
        const templates = AICodeGenerationInstance.getTemplates(category || undefined, language || undefined);
        return NextResponse.json({ templates });

      case "history":
        const history = AICodeGenerationInstance.getGenerationHistory(limit);
        return NextResponse.json({ history });

      case "stats":
        const stats = AICodeGenerationInstance.getGenerationStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка получения данных генерации кода:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных генерации кода" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, prompt, language, framework, style, complexity, includeTests, includeComments, includeDocumentation, templateId, variables, code } = body;

    switch (action) {
      case "generate":
        if (!prompt || !language) {
          return NextResponse.json(
            { error: "prompt и language обязательны" },
            { status: 400 }
          );
        }
        const generatedCode = await AICodeGenerationInstance.generateCode({
          prompt,
          language,
          framework,
          style,
          complexity,
          includeTests,
          includeComments,
          includeDocumentation
        });
        return NextResponse.json({ code: generatedCode });

      case "apply-template":
        if (!templateId || !variables) {
          return NextResponse.json(
            { error: "templateId и variables обязательны" },
            { status: 400 }
          );
        }
        const appliedTemplate = AICodeGenerationInstance.applyTemplate(templateId, variables);
        return NextResponse.json({ code: appliedTemplate });

      case "analyze":
        if (!code || !language) {
          return NextResponse.json(
            { error: "code и language обязательны" },
            { status: 400 }
          );
        }
        const analysis = await AICodeGenerationInstance.analyzeCode(code, language);
        return NextResponse.json({ analysis });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки генерации кода:", error);
    return NextResponse.json(
      { error: "Ошибка обработки генерации кода" },
      { status: 500 }
    );
  }
}
