import { NextRequest, NextResponse } from "next/server";
import { AutoTaskCreator } from "@/lib/ai/auto-task-creator";
import { CodeAnalyzer } from "@/lib/ai/code-analyzer";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats":
        const stats = AutoTaskCreator.getTaskStats();
        return NextResponse.json(stats);

      case "by-priority":
        const priority = searchParams.get("priority") as "low" | "medium" | "high" | "critical";
        if (!priority) {
          return NextResponse.json({ error: "Priority parameter is required" }, { status: 400 });
        }
        const tasksByPriority = AutoTaskCreator.getTasksByPriority(priority);
        return NextResponse.json(tasksByPriority);

      case "by-type":
        const type = searchParams.get("type") as "bug" | "feature" | "improvement" | "refactor" | "documentation" | "test";
        if (!type) {
          return NextResponse.json({ error: "Type parameter is required" }, { status: 400 });
        }
        const tasksByType = AutoTaskCreator.getTasksByType(type);
        return NextResponse.json(tasksByType);

      default:
        const allTasks = AutoTaskCreator.getCreatedTasks();
        return NextResponse.json(allTasks);
    }
  } catch (error) {
    console.error("Ошибка получения автоматических задач:", error);
    return NextResponse.json(
      { error: "Ошибка получения автоматических задач" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "analyze-commit":
        const commitTasks = await AutoTaskCreator.analyzeCommitAndCreateTasks(data.commit);
        return NextResponse.json({
          success: true,
          tasks: commitTasks,
          message: `Создано ${commitTasks.length} задач на основе анализа коммита`
        });

      case "analyze-code":
        const codeAnalysis = await CodeAnalyzer.analyzeCode(data.code, data.filePath);
        return NextResponse.json({
          success: true,
          analysis: codeAnalysis,
          message: "Анализ кода завершен"
        });

      case "create-performance-tasks":
        const performanceTasks = AutoTaskCreator.createPerformanceTasks(data.metrics);
        return NextResponse.json({
          success: true,
          tasks: performanceTasks,
          message: `Создано ${performanceTasks.length} задач на основе метрик производительности`
        });

      case "create-feedback-task":
        const feedbackTask = AutoTaskCreator.createFeedbackTasks(data.feedback);
        return NextResponse.json({
          success: true,
          task: feedbackTask,
          message: "Задача на основе пользовательского фидбека создана"
        });

      case "update-task-status":
        const { taskId, status } = data;
        const updated = AutoTaskCreator.updateTaskStatus(taskId, status);
        return NextResponse.json({
          success: updated,
          message: updated ? "Статус задачи обновлен" : "Задача не найдена"
        });

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ошибка обработки автоматических задач:", error);
    return NextResponse.json(
      { error: "Ошибка обработки автоматических задач" },
      { status: 500 }
    );
  }
}
