import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { issue } from "@/lib/db/schema";
import { eq, gte, and } from "drizzle-orm";

import { requireAuth } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await requireAuth(request);

    // Получаем данные за последние 7 дней
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const tasks = await db
      .select()
      .from(issue)
      .where(gte(issue.createdAt, weekAgo));

    // Группируем по дням недели
    const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const chartData = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - (6 - i));
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });

      const completedTasks = dayTasks.filter(task => task.status === "DONE");
      const createdTasks = dayTasks.filter(task => task.status !== "DONE");

      chartData.push({
        date: daysOfWeek[dayStart.getDay()],
        tasks: dayTasks.length,
        completed: completedTasks.length,
        created: createdTasks.length
      });
    }

    return NextResponse.json({
      chartData,
      totalTasks: tasks.length,
      totalCompleted: tasks.filter(t => t.status === "DONE").length,
      totalCreated: tasks.filter(t => t.status !== "DONE").length
    });

  } catch (error) {
    console.error("Error getting activity stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
