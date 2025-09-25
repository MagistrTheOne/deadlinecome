import { NextRequest, NextResponse } from "next/server";
import { LearningSystem } from "@/lib/ai/learning-system";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "paths":
        const paths = LearningSystem.getLearningPaths();
        return NextResponse.json(paths);

      case "path":
        const pathId = searchParams.get("pathId");
        if (!pathId) {
          return NextResponse.json({ error: "PathId parameter is required" }, { status: 400 });
        }
        const path = LearningSystem.getLearningPath(pathId);
        return NextResponse.json(path);

      case "user-progress":
        const userId = searchParams.get("userId");
        if (!userId) {
          return NextResponse.json({ error: "UserId parameter is required" }, { status: 400 });
        }
        const userProgress = LearningSystem.getUserProgress(userId);
        return NextResponse.json(userProgress);

      case "recommendations":
        const recUserId = searchParams.get("userId");
        if (!recUserId) {
          return NextResponse.json({ error: "UserId parameter is required" }, { status: 400 });
        }
        const recommendations = LearningSystem.getPersonalizedRecommendations(recUserId);
        return NextResponse.json(recommendations);

      case "stats":
        const stats = LearningSystem.getLearningStats();
        return NextResponse.json(stats);

      case "top-users":
        const limit = parseInt(searchParams.get("limit") || "10");
        const topUsers = LearningSystem.getTopUsers(limit);
        return NextResponse.json(topUsers);

      default:
        return NextResponse.json({
          paths: LearningSystem.getLearningPaths(),
          stats: LearningSystem.getLearningStats()
        });
    }
  } catch (error) {
    console.error("Ошибка получения данных системы обучения:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных системы обучения" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "initialize-paths":
        LearningSystem.initializeLearningPaths();
        return NextResponse.json({
          success: true,
          message: "Пути обучения инициализированы"
        });

      case "initialize-user":
        const { userId, userName } = data;
        const userProgress = LearningSystem.initializeUserProgress(userId, userName);
        return NextResponse.json({
          success: true,
          progress: userProgress,
          message: "Прогресс пользователя инициализирован"
        });

      case "complete-module":
        const { userId: moduleUserId, moduleId } = data;
        const moduleCompleted = LearningSystem.completeModule(moduleUserId, moduleId);
        return NextResponse.json({
          success: moduleCompleted,
          message: moduleCompleted ? "Модуль отмечен как завершенный" : "Модуль не найден или уже завершен"
        });

      case "complete-exercise":
        const { userId: exerciseUserId, exerciseId } = data;
        const exerciseCompleted = LearningSystem.completeExercise(exerciseUserId, exerciseId);
        return NextResponse.json({
          success: exerciseCompleted,
          message: exerciseCompleted ? "Упражнение отмечено как завершенное" : "Упражнение не найдено или уже завершено"
        });

      case "get-recommendations":
        const { userId: recUserId } = data;
        const recommendations = LearningSystem.getPersonalizedRecommendations(recUserId);
        return NextResponse.json({
          success: true,
          recommendations,
          message: `Получено ${recommendations.length} рекомендаций`
        });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки системы обучения:", error);
    return NextResponse.json(
      { error: "Ошибка обработки системы обучения" },
      { status: 500 }
    );
  }
}
