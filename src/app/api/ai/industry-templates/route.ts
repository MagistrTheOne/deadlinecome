import { NextRequest, NextResponse } from "next/server";
import { IndustryTemplatesInstance } from "@/lib/ai/industry-templates";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const templateId = searchParams.get("templateId");
    const industry = searchParams.get("industry");

    switch (action) {
      case "list":
        const templates = await IndustryTemplatesInstance.getTemplates(industry || undefined);
        return NextResponse.json({ templates });

      case "get":
        if (!templateId) {
          return NextResponse.json(
            { error: "templateId обязателен" },
            { status: 400 }
          );
        }
        const template = await IndustryTemplatesInstance.getTemplate(templateId);
        return NextResponse.json({ template });

      case "stats":
        const stats = IndustryTemplatesInstance.getTemplateStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка industry templates:", error);
    return NextResponse.json(
      { error: "Ошибка industry templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, templateId, companyId, customizations, customizationId } = body;

    switch (action) {
      case "customize":
        if (!templateId || !companyId || !customizations) {
          return NextResponse.json(
            { error: "templateId, companyId и customizations обязательны" },
            { status: 400 }
          );
        }
        const customizationId = await IndustryTemplatesInstance.customizeTemplate(templateId, companyId, customizations);
        return NextResponse.json({ customizationId });

      case "deploy":
        if (!customizationId) {
          return NextResponse.json(
            { error: "customizationId обязателен" },
            { status: 400 }
          );
        }
        const deployment = await IndustryTemplatesInstance.deployTemplate(customizationId);
        return NextResponse.json(deployment);

      case "recommendations":
        if (!body.companyProfile) {
          return NextResponse.json(
            { error: "companyProfile обязателен" },
            { status: 400 }
          );
        }
        const recommendations = await IndustryTemplatesInstance.getIndustryRecommendations(body.companyProfile);
        return NextResponse.json(recommendations);

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка industry templates:", error);
    return NextResponse.json(
      { error: "Ошибка industry templates" },
      { status: 500 }
    );
  }
}
