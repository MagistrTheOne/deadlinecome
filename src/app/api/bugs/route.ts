import { NextRequest, NextResponse } from "next/server";

interface BugReport {
  id: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  status: "NEW" | "ASSIGNED" | "IN_PROGRESS" | "TESTING" | "RESOLVED" | "CLOSED";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "FRONTEND" | "BACKEND" | "DATABASE" | "API" | "UI_UX" | "PERFORMANCE" | "SECURITY";
  projectId: string;
  reporterId: string;
  assigneeId?: string;
  aiQaId?: string;
  screenshots: string[];
  environment?: string;
  severity?: "BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "TRIVIAL";
  estimatedFixTime?: number;
  actualFixTime?: number;
  aiAnalysis?: {
    analysis: string;
    confidence: number;
    recommendations: string[];
    testCases: any[];
    predictedRisk: string;
  };
  aiRecommendations: string[];
  createdAt: string;
  updatedAt: string;
}

// Демо данные для багов
const demoBugs: BugReport[] = [
  {
    id: "bug_1",
    title: "Кнопка 'Сохранить' не работает в модальном окне",
    description: "При попытке сохранить изменения в модальном окне редактирования профиля, кнопка 'Сохранить' не реагирует на клики.",
    stepsToReproduce: "1. Открыть профиль пользователя\n2. Нажать 'Редактировать'\n3. Внести изменения\n4. Нажать 'Сохранить'",
    expectedBehavior: "Изменения должны сохраниться и модальное окно должно закрыться",
    actualBehavior: "Кнопка не реагирует, изменения не сохраняются",
    status: "NEW",
    priority: "HIGH",
    category: "FRONTEND",
    projectId: "demo-project",
    reporterId: "user_1",
    screenshots: [],
    environment: "Chrome 120, Windows 11",
    severity: "MAJOR",
    aiAnalysis: {
      analysis: "Анализ фронтенд бага: Проблема связана с пользовательским интерфейсом. Рекомендую проверить обработчики событий и состояние компонента.",
      confidence: 85,
      recommendations: [
        "Проверить обработчик onClick для кнопки",
        "Убедиться в правильности состояния формы",
        "Проверить валидацию данных перед сохранением"
      ],
      testCases: [
        {
          id: "test_1",
          title: "Тест: Сохранение в модальном окне",
          steps: ["Открыть модальное окно", "Внести изменения", "Нажать сохранить"],
          expectedResult: "Изменения сохраняются",
          priority: "HIGH"
        }
      ],
      predictedRisk: "MEDIUM"
    },
    aiRecommendations: [
      "Проверить обработчик onClick для кнопки",
      "Убедиться в правильности состояния формы",
      "Проверить валидацию данных перед сохранением"
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bug_2",
    title: "Медленная загрузка данных пользователей",
    description: "API endpoint для получения списка пользователей работает очень медленно, время ответа превышает 5 секунд.",
    stepsToReproduce: "1. Перейти на страницу 'Команда'\n2. Дождаться загрузки списка пользователей",
    expectedBehavior: "Список должен загружаться за 1-2 секунды",
    actualBehavior: "Загрузка занимает 5+ секунд",
    status: "ASSIGNED",
    priority: "MEDIUM",
    category: "BACKEND",
    projectId: "demo-project",
    reporterId: "user_2",
    assigneeId: "user_3",
    screenshots: [],
    environment: "Production",
    severity: "MAJOR",
    aiAnalysis: {
      analysis: "Анализ бэкенд бага: Проблема в серверной логике. Рекомендую проверить оптимизацию запросов к базе данных и кэширование.",
      confidence: 90,
      recommendations: [
        "Добавить индексы для оптимизации запросов",
        "Внедрить кэширование результатов",
        "Проверить N+1 проблему в запросах"
      ],
      testCases: [
        {
          id: "test_2",
          title: "Тест: Производительность API",
          steps: ["Вызвать API endpoint", "Измерить время ответа"],
          expectedResult: "Время ответа < 2 секунд",
          priority: "HIGH"
        }
      ],
      predictedRisk: "HIGH"
    },
    aiRecommendations: [
      "Добавить индексы для оптимизации запросов",
      "Внедрить кэширование результатов",
      "Проверить N+1 проблему в запросах"
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bug_3",
    title: "Уязвимость в аутентификации",
    description: "Обнаружена потенциальная уязвимость в системе аутентификации - токены не истекают через указанное время.",
    stepsToReproduce: "1. Войти в систему\n2. Подождать время истечения токена\n3. Попробовать выполнить действие",
    expectedBehavior: "Токен должен истекать и требовать повторной аутентификации",
    actualBehavior: "Токен остается действительным",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    category: "SECURITY",
    projectId: "demo-project",
    reporterId: "user_1",
    assigneeId: "user_4",
    screenshots: [],
    environment: "All environments",
    severity: "BLOCKER",
    aiAnalysis: {
      analysis: "Анализ безопасности: Критическая проблема безопасности. Рекомендую немедленное исправление и аудит безопасности.",
      confidence: 95,
      recommendations: [
        "Провести security audit",
        "Исправить логику истечения токенов",
        "Добавить мониторинг безопасности"
      ],
      testCases: [
        {
          id: "test_3",
          title: "Тест: Истечение токенов",
          steps: ["Войти в систему", "Подождать истечения", "Проверить доступ"],
          expectedResult: "Доступ должен быть заблокирован",
          priority: "CRITICAL"
        }
      ],
      predictedRisk: "CRITICAL"
    },
    aiRecommendations: [
      "Провести security audit",
      "Исправить логику истечения токенов",
      "Добавить мониторинг безопасности"
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");

    let filteredBugs = [...demoBugs];

    // Фильтрация по проекту
    if (projectId) {
      filteredBugs = filteredBugs.filter(bug => bug.projectId === projectId);
    }

    // Фильтрация по статусу
    if (status && status !== "ALL") {
      filteredBugs = filteredBugs.filter(bug => bug.status === status);
    }

    // Фильтрация по приоритету
    if (priority && priority !== "ALL") {
      filteredBugs = filteredBugs.filter(bug => bug.priority === priority);
    }

    // Фильтрация по категории
    if (category && category !== "ALL") {
      filteredBugs = filteredBugs.filter(bug => bug.category === category);
    }

    return NextResponse.json({ bugs: filteredBugs });
  } catch (error) {
    console.error("Ошибка получения багов:", error);
    return NextResponse.json(
      { error: "Ошибка получения багов" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, stepsToReproduce, expectedBehavior, actualBehavior, priority, category, environment, severity } = body;

    const newBug: BugReport = {
      id: `bug_${Date.now()}`,
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      status: "NEW",
      priority: priority || "MEDIUM",
      category: category || "FRONTEND",
      projectId: "demo-project",
      reporterId: "current_user",
      screenshots: [],
      environment,
      severity: severity || "MAJOR",
      aiRecommendations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    demoBugs.push(newBug);

    return NextResponse.json(newBug);
  } catch (error) {
    console.error("Ошибка создания бага:", error);
    return NextResponse.json(
      { error: "Ошибка создания бага" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bugId, status, assigneeId, priority } = body;

    const bugIndex = demoBugs.findIndex(bug => bug.id === bugId);
    if (bugIndex === -1) {
      return NextResponse.json(
        { error: "Баг не найден" },
        { status: 404 }
      );
    }

    const updatedBug = {
      ...demoBugs[bugIndex],
      ...(status && { status }),
      ...(assigneeId && { assigneeId }),
      ...(priority && { priority }),
      updatedAt: new Date().toISOString()
    };

    demoBugs[bugIndex] = updatedBug;

    return NextResponse.json(updatedBug);
  } catch (error) {
    console.error("Ошибка обновления бага:", error);
    return NextResponse.json(
      { error: "Ошибка обновления бага" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bugId = searchParams.get("bugId");

    if (!bugId) {
      return NextResponse.json(
        { error: "ID бага обязателен" },
        { status: 400 }
      );
    }

    const bugIndex = demoBugs.findIndex(bug => bug.id === bugId);
    if (bugIndex === -1) {
      return NextResponse.json(
        { error: "Баг не найден" },
        { status: 404 }
      );
    }

    demoBugs.splice(bugIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления бага:", error);
    return NextResponse.json(
      { error: "Ошибка удаления бага" },
      { status: 500 }
    );
  }
}