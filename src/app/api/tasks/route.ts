import { NextRequest, NextResponse } from "next/server";

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  aiGenerated?: boolean;
  projectId: string;
}

// Демо данные для задач
const demoTasks: TodoItem[] = [
  {
    id: "task-1",
    title: "Реализовать систему ролей",
    description: "Создать систему IT-ролей для умного распределения задач",
    status: "DONE",
    priority: "HIGH",
    assigneeId: "user-2",
    assigneeName: "Тим лид",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aiGenerated: false,
    projectId: "demo-project"
  },
  {
    id: "task-2",
    title: "Настроить WebSocket для real-time",
    description: "Интегрировать WebSocket сервер для live-обновлений",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeId: "user-3",
    assigneeName: "Разработчик",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    aiGenerated: false,
    projectId: "demo-project"
  },
  {
    id: "task-3",
    title: "Улучшить Василия AI",
    description: "Добавить автораспределение задач и умные уведомления",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assigneeId: "user-2",
    assigneeName: "Тим лид",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    aiGenerated: true,
    projectId: "demo-project"
  },
  {
    id: "task-4",
    title: "Протестировать все компоненты",
    description: "Провести полное тестирование UI компонентов",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "user-4",
    assigneeName: "QA Engineer",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    aiGenerated: false,
    projectId: "demo-project"
  },
  {
    id: "task-5",
    title: "Оптимизировать производительность",
    description: "Улучшить производительность real-time обновлений",
    status: "BLOCKED",
    priority: "URGENT",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    aiGenerated: true,
    projectId: "demo-project"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      const projectTasks = demoTasks.filter(task => task.projectId === projectId);
      return NextResponse.json(projectTasks);
    }

    return NextResponse.json(demoTasks);
  } catch (error) {
    console.error("Ошибка получения задач:", error);
    return NextResponse.json(
      { error: "Ошибка получения задач" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, assigneeId, dueDate, projectId, status } = body;

    const newTask: TodoItem = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      assigneeId,
      assigneeName: assigneeId ? `Пользователь ${assigneeId}` : undefined,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiGenerated: false,
      projectId: projectId || "demo-project"
    };

    // В реальном приложении здесь была бы запись в базу данных
    demoTasks.push(newTask);

    return NextResponse.json(newTask);
  } catch (error) {
    console.error("Ошибка создания задачи:", error);
    return NextResponse.json(
      { error: "Ошибка создания задачи" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, status, priority, assigneeId } = body;

    const taskIndex = demoTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "Задача не найдена" },
        { status: 404 }
      );
    }

    const updatedTask = {
      ...demoTasks[taskIndex],
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId, assigneeName: `Пользователь ${assigneeId}` }),
      updatedAt: new Date().toISOString()
    };

    demoTasks[taskIndex] = updatedTask;

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Ошибка обновления задачи:", error);
    return NextResponse.json(
      { error: "Ошибка обновления задачи" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "ID задачи обязателен" },
        { status: 400 }
      );
    }

    const taskIndex = demoTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "Задача не найдена" },
        { status: 404 }
      );
    }

    demoTasks.splice(taskIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления задачи:", error);
    return NextResponse.json(
      { error: "Ошибка удаления задачи" },
      { status: 500 }
    );
  }
}