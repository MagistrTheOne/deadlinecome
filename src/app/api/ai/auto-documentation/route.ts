import { NextRequest, NextResponse } from "next/server";
import { AutoDocumentation } from "@/lib/ai/auto-documentation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "documentation":
        const documentation = AutoDocumentation.getDocumentation();
        return NextResponse.json(documentation);

      case "reports":
        const reports = AutoDocumentation.getReports();
        return NextResponse.json(reports);

      case "code-docs":
        const codeDocs = AutoDocumentation.getCodeDocumentation();
        return NextResponse.json(codeDocs);

      case "stats":
        const stats = AutoDocumentation.getDocumentationStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json({
          documentation: AutoDocumentation.getDocumentation(),
          reports: AutoDocumentation.getReports(),
          codeDocs: AutoDocumentation.getCodeDocumentation(),
          stats: AutoDocumentation.getDocumentationStats()
        });
    }
  } catch (error) {
    console.error("Ошибка получения данных автоматической документации:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных автоматической документации" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "generate-api-doc":
        const apiDoc = AutoDocumentation.generateAPIDocumentation(data.endpoint);
        return NextResponse.json({
          success: true,
          documentation: apiDoc,
          message: "Документация API сгенерирована"
        });

      case "generate-component-doc":
        const componentDoc = AutoDocumentation.generateComponentDocumentation(data.component);
        return NextResponse.json({
          success: true,
          documentation: componentDoc,
          message: "Документация компонента сгенерирована"
        });

      case "generate-function-doc":
        const functionDoc = AutoDocumentation.generateFunctionDocumentation(data.function);
        return NextResponse.json({
          success: true,
          documentation: functionDoc,
          message: "Документация функции сгенерирована"
        });

      case "generate-sprint-report":
        const sprintReport = AutoDocumentation.generateSprintReport(data.sprint);
        return NextResponse.json({
          success: true,
          report: sprintReport,
          message: "Отчет по спринту сгенерирован"
        });

      case "generate-daily-report":
        const dailyReport = AutoDocumentation.generateDailyReport(data.dailyData);
        return NextResponse.json({
          success: true,
          report: dailyReport,
          message: "Ежедневный отчет сгенерирован"
        });

      case "generate-performance-report":
        const performanceReport = AutoDocumentation.generatePerformanceReport(data.performanceData);
        return NextResponse.json({
          success: true,
          report: performanceReport,
          message: "Отчет о производительности сгенерирован"
        });

      case "generate-project-readme":
        const projectReadme = AutoDocumentation.generateProjectREADME(data.project);
        return NextResponse.json({
          success: true,
          documentation: projectReadme,
          message: "README проекта сгенерирован"
        });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки автоматической документации:", error);
    return NextResponse.json(
      { error: "Ошибка обработки автоматической документации" },
      { status: 500 }
    );
  }
}
