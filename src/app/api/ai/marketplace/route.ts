import { NextRequest, NextResponse } from "next/server";
import { AIMarketplaceInstance } from "@/lib/ai/ai-marketplace";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "search":
        const criteria = {
          specialization: searchParams.get("specialization") || undefined,
          maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined,
          minRating: searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined,
          skills: searchParams.get("skills")?.split(",") || undefined
        };
        const specialists = await AIMarketplaceInstance.searchSpecialists(criteria);
        return NextResponse.json({ specialists });

      case "specialist":
        const specialistId = searchParams.get("specialistId");
        if (!specialistId) {
          return NextResponse.json(
            { error: "specialistId обязателен" },
            { status: 400 }
          );
        }
        const specialist = await AIMarketplaceInstance.getSpecialistDetails(specialistId);
        return NextResponse.json({ specialist });

      case "packages":
        const packages = await AIMarketplaceInstance.getPackages();
        return NextResponse.json({ packages });

      case "stats":
        const stats = AIMarketplaceInstance.getMarketplaceStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка marketplace:", error);
    return NextResponse.json(
      { error: "Ошибка marketplace" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, specialistId, projectId, duration, requirements, packageId, rating, comment, project } = body;

    switch (action) {
      case "hire":
        if (!specialistId || !projectId || !duration) {
          return NextResponse.json(
            { error: "specialistId, projectId и duration обязательны" },
            { status: 400 }
          );
        }
        const hireResult = await AIMarketplaceInstance.hireSpecialist(specialistId, projectId, duration, requirements);
        return NextResponse.json(hireResult);

      case "purchase-package":
        if (!packageId || !projectId) {
          return NextResponse.json(
            { error: "packageId и projectId обязательны" },
            { status: 400 }
          );
        }
        const packageResult = await AIMarketplaceInstance.purchasePackage(packageId, projectId);
        return NextResponse.json(packageResult);

      case "add-review":
        if (!specialistId || !rating || !comment) {
          return NextResponse.json(
            { error: "specialistId, rating, comment и project обязательны" },
            { status: 400 }
          );
        }
        await AIMarketplaceInstance.addReview(specialistId, rating, comment, project);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка marketplace:", error);
    return NextResponse.json(
      { error: "Ошибка marketplace" },
      { status: 500 }
    );
  }
}
