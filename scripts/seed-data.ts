import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { user, workspace, workspaceMember, project } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seedData() {
  console.log("🌱 Создание тестовых данных...");

  try {
    // Создаем тестового пользователя
    console.log("👤 Создание тестового пользователя...");
    const testUserId = generateId();
    const testUser = {
      id: testUserId,
      name: "Тестовый пользователь",
      email: "test@example.com",
      emailVerified: true,
      image: null,
    };

    await db.insert(user).values(testUser);
    console.log("✅ Тестовый пользователь создан");

    // Создаем тестовое рабочее пространство
    console.log("🏢 Создание тестового рабочего пространства...");
    const testWorkspaceId = generateId();
    const testWorkspace = {
      id: testWorkspaceId,
      name: "Тестовое рабочее пространство",
      slug: "test-workspace",
      description: "Рабочее пространство для тестирования",
      ownerId: testUserId,
    };

    await db.insert(workspace).values(testWorkspace);
    console.log("✅ Тестовое рабочее пространство создано");

    // Добавляем пользователя в рабочее пространство
    console.log("👥 Добавление пользователя в рабочее пространство...");
    const memberId = generateId();
    const member = {
      id: memberId,
      workspaceId: testWorkspaceId,
      userId: testUserId,
      role: "OWNER" as const,
    };

    await db.insert(workspaceMember).values(member);
    console.log("✅ Пользователь добавлен в рабочее пространство");

    // Создаем тестовый проект
    console.log("📁 Создание тестового проекта...");
    const testProjectId = generateId();
    const testProject = {
      id: testProjectId,
      key: "TEST",
      name: "Тестовый проект",
      description: "Проект для тестирования функциональности",
      workspaceId: testWorkspaceId,
      leadId: testUserId,
    };

    await db.insert(project).values(testProject);
    console.log("✅ Тестовый проект создан");

    console.log("🎉 Тестовые данные созданы успешно!");
    console.log("\n📋 Информация для входа:");
    console.log("Email: test@example.com");
    console.log("Пароль: password123");
    console.log("\n🔗 URL: http://localhost:3000");

  } catch (error) {
    console.error("❌ Ошибка при создании тестовых данных:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedData();
