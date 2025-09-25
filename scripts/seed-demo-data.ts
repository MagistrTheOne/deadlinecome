import { db } from "../src/lib/db";
import { workspace, workspaceMember, project, issue, projectStatus, vasilyAction } from "../src/lib/db/schema";

async function seedDemoData() {
  console.log("🌱 Начинаем создание демо-данных...");

  try {
    // Создаем демо workspace
    const demoWorkspace = await db.insert(workspace).values({
      id: "demo-workspace",
      name: "Demo Workspace",
      slug: "demo-workspace",
      description: "Демонстрационное рабочее пространство для тестирования",
      ownerId: "demo-user",
    }).returning();

    console.log("✅ Создан демо workspace:", demoWorkspace[0].name);

    // Создаем демо участников с IT-ролями
    const demoMembers = [
      {
        id: "member-1",
        workspaceId: "demo-workspace",
        userId: "demo-user",
        role: "OWNER" as const,
        itRole: "CTO" as const,
        skills: JSON.stringify(["Leadership", "Architecture", "Strategy"]),
        experience: 10,
      },
      {
        id: "member-2",
        workspaceId: "demo-workspace",
        userId: "user-2",
        role: "MEMBER" as const,
        itRole: "TEAM_LEAD" as const,
        skills: JSON.stringify(["React", "Node.js", "Team Management"]),
        experience: 7,
      },
      {
        id: "member-3",
        workspaceId: "demo-workspace",
        userId: "user-3",
        role: "MEMBER" as const,
        itRole: "DEVELOPER" as const,
        skills: JSON.stringify(["TypeScript", "Next.js", "PostgreSQL"]),
        experience: 4,
      },
      {
        id: "member-4",
        workspaceId: "demo-workspace",
        userId: "user-4",
        role: "MEMBER" as const,
        itRole: "QA" as const,
        skills: JSON.stringify(["Testing", "Automation", "Quality Assurance"]),
        experience: 3,
      },
      {
        id: "member-5",
        workspaceId: "demo-workspace",
        userId: "user-5",
        role: "MEMBER" as const,
        itRole: "PM" as const,
        skills: JSON.stringify(["Project Management", "Agile", "Scrum"]),
        experience: 5,
      },
    ];

    for (const member of demoMembers) {
      await db.insert(workspaceMember).values(member);
    }

    console.log("✅ Созданы демо участники с IT-ролями");

    // Создаем демо проект
    const demoProject = await db.insert(project).values({
      id: "demo-project",
      key: "DEMO",
      name: "DeadLine Demo Project",
      description: "Демонстрационный проект для тестирования всех функций",
      workspaceId: "demo-workspace",
      leadId: "demo-user",
    }).returning();

    console.log("✅ Создан демо проект:", demoProject[0].name);

    // Создаем демо задачи
    const demoIssues = [
      {
        id: "issue-1",
        key: "DEMO-1",
        title: "Реализовать систему ролей",
        description: "Создать систему IT-ролей для умного распределения задач",
        status: "DONE" as const,
        priority: "HIGH" as const,
        type: "TASK" as const,
        projectId: "demo-project",
        assigneeId: "user-2",
        reporterId: "demo-user",
        estimatedHours: 8,
        actualHours: 6,
        aiGenerated: false,
      },
      {
        id: "issue-2",
        key: "DEMO-2",
        title: "Настроить WebSocket для real-time",
        description: "Интегрировать WebSocket сервер для live-обновлений",
        status: "IN_PROGRESS" as const,
        priority: "HIGH" as const,
        type: "TASK" as const,
        projectId: "demo-project",
        assigneeId: "user-3",
        reporterId: "demo-user",
        estimatedHours: 12,
        actualHours: 4,
        aiGenerated: false,
      },
      {
        id: "issue-3",
        key: "DEMO-3",
        title: "Улучшить Василия AI",
        description: "Добавить автораспределение задач и умные уведомления",
        status: "IN_PROGRESS" as const,
        priority: "MEDIUM" as const,
        type: "TASK" as const,
        projectId: "demo-project",
        assigneeId: "user-2",
        reporterId: "demo-user",
        estimatedHours: 16,
        actualHours: 8,
        aiGenerated: true,
      },
      {
        id: "issue-4",
        key: "DEMO-4",
        title: "Протестировать все компоненты",
        description: "Провести полное тестирование UI компонентов",
        status: "TODO" as const,
        priority: "MEDIUM" as const,
        type: "TASK" as const,
        projectId: "demo-project",
        assigneeId: "user-4",
        reporterId: "demo-user",
        estimatedHours: 6,
        aiGenerated: false,
      },
      {
        id: "issue-5",
        key: "DEMO-5",
        title: "Создать документацию",
        description: "Написать документацию для новых функций",
        status: "TODO" as const,
        priority: "LOW" as const,
        type: "TASK" as const,
        projectId: "demo-project",
        assigneeId: "user-5",
        reporterId: "demo-user",
        estimatedHours: 4,
        aiGenerated: false,
      },
      {
        id: "issue-6",
        key: "DEMO-6",
        title: "Оптимизировать производительность",
        description: "Улучшить производительность real-time обновлений",
        status: "TODO" as const,
        priority: "HIGH" as const,
        type: "TASK" as const,
        projectId: "demo-project",
        reporterId: "demo-user",
        estimatedHours: 10,
        aiGenerated: true,
      },
    ];

    for (const issueData of demoIssues) {
      await db.insert(issue).values(issueData);
    }

    console.log("✅ Созданы демо задачи");

    // Создаем демо статус проекта
    const demoProjectStatus = await db.insert(projectStatus).values({
      id: "status-1",
      projectId: "demo-project",
      status: "AT_RISK" as const,
      healthScore: 75,
      progress: 45,
      aiAnalysis: JSON.stringify({
        totalTasks: 6,
        completedTasks: 1,
        inProgressTasks: 2,
        todoTasks: 2,
        blockedTasks: 1,
        teamSize: 5,
        lastAnalyzed: new Date().toISOString(),
        riskFactors: ["Блокированная задача", "Высокий приоритет задач"],
        recommendations: ["Разблокировать задачу оптимизации", "Перераспределить ресурсы"],
      }),
      recommendations: JSON.stringify([
        "Разблокировать задачу оптимизации производительности",
        "Перераспределить ресурсы на высокоприоритетные задачи",
        "Провести ретроспективу по блокерам",
      ]),
      lastAnalyzed: new Date(),
    }).returning();

    console.log("✅ Создан демо статус проекта");

    // Создаем демо действия Василия
    const demoVasilyActions = [
      {
        id: "action-1",
        projectId: "demo-project",
        actionType: "TASK_ASSIGNED" as const,
        description: "Василий назначил задачу 'Реализовать систему ролей' на TEAM_LEAD",
        targetUserId: "user-2",
        metadata: JSON.stringify({
          taskId: "issue-1",
          taskTitle: "Реализовать систему ролей",
          assigneeRole: "TEAM_LEAD",
          reasoning: "Назначен как TEAM_LEAD с опытом 7 лет",
        }),
        executed: true,
      },
      {
        id: "action-2",
        projectId: "demo-project",
        actionType: "STATUS_UPDATE" as const,
        description: "Василий обновил статус проекта: AT_RISK",
        metadata: JSON.stringify({
          previousStatus: "ON_TRACK",
          newStatus: "AT_RISK",
          reason: "Обнаружена заблокированная задача высокого приоритета",
        }),
        executed: true,
      },
      {
        id: "action-3",
        projectId: "demo-project",
        actionType: "RECOMMENDATION" as const,
        description: "Василий рекомендует разблокировать задачу оптимизации",
        metadata: JSON.stringify({
          recommendation: "Разблокировать задачу оптимизации производительности",
          priority: "HIGH",
          impact: "Улучшит общую производительность системы",
        }),
        executed: false,
      },
    ];

    for (const action of demoVasilyActions) {
      await db.insert(vasilyAction).values(action);
    }

    console.log("✅ Созданы демо действия Василия");

    console.log("🎉 Демо-данные успешно созданы!");
    console.log("\n📊 Статистика:");
    console.log(`- Workspace: ${demoWorkspace[0].name}`);
    console.log(`- Участников: ${demoMembers.length}`);
    console.log(`- Проектов: 1`);
    console.log(`- Задач: ${demoIssues.length}`);
    console.log(`- Действий Василия: ${demoVasilyActions.length}`);

  } catch (error) {
    console.error("❌ Ошибка при создании демо-данных:", error);
    throw error;
  }
}

// Запускаем скрипт
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log("✅ Скрипт завершен успешно");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Ошибка выполнения скрипта:", error);
      process.exit(1);
    });
}

export { seedDemoData };
