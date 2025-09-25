import { NextRequest, NextResponse } from "next/server";

interface CodeReview {
  id: string;
  pullRequestId: string;
  repositoryId: string;
  authorId: string;
  aiReviewerId: string;
  status: "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED" | "NEEDS_CHANGES";
  overallScore: number;
  reviewDate: string;
  aiAnalysis: {
    codeQuality: number;
    performance: number;
    security: number;
    maintainability: number;
    testCoverage: number;
  };
  issues: Array<{
    id: string;
    type: "BUG" | "VULNERABILITY" | "PERFORMANCE" | "STYLE" | "SECURITY";
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    line: number;
    message: string;
    suggestion: string;
  }>;
  recommendations: string[];
  aiReviewer: {
    id: string;
    name: string;
    specialization: string;
    confidence: number;
  };
}

// Демо данные для code review
const demoReviews: CodeReview[] = [
  {
    id: "review_1",
    pullRequestId: "PR-123",
    repositoryId: "deadline-project",
    authorId: "user_1",
    aiReviewerId: "ai-vladimir",
    status: "APPROVED",
    overallScore: 92,
    reviewDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      codeQuality: 95,
      performance: 88,
      security: 94,
      maintainability: 91,
      testCoverage: 87
    },
    issues: [
      {
        id: "issue_1",
        type: "STYLE",
        severity: "LOW",
        line: 45,
        message: "Используйте const вместо let для неизменяемых переменных",
        suggestion: "const userRole = getUserRole();"
      }
    ],
    recommendations: [
      "Добавить больше unit тестов для edge cases",
      "Рассмотреть использование React.memo для оптимизации",
      "Добавить JSDoc комментарии для сложных функций"
    ],
    aiReviewer: {
      id: "ai-vladimir",
      name: "Владимир (AI Code Reviewer)",
      specialization: "Code Quality & Architecture",
      confidence: 94
    }
  },
  {
    id: "review_2",
    pullRequestId: "PR-124",
    repositoryId: "deadline-project",
    authorId: "user_2",
    aiReviewerId: "ai-vladimir",
    status: "REJECTED",
    overallScore: 65,
    reviewDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      codeQuality: 70,
      performance: 60,
      security: 75,
      maintainability: 68,
      testCoverage: 45
    },
    issues: [
      {
        id: "issue_2",
        type: "SECURITY",
        severity: "CRITICAL",
        line: 23,
        message: "SQL injection уязвимость в запросе",
        suggestion: "Используйте параметризованные запросы"
      },
      {
        id: "issue_3",
        type: "PERFORMANCE",
        severity: "HIGH",
        line: 67,
        message: "N+1 проблема в запросах к базе данных",
        suggestion: "Используйте eager loading или batch запросы"
      }
    ],
    recommendations: [
      "Критически важно исправить security уязвимости",
      "Добавить тесты для всех новых функций",
      "Оптимизировать запросы к базе данных"
    ],
    aiReviewer: {
      id: "ai-vladimir",
      name: "Владимир (AI Code Reviewer)",
      specialization: "Code Quality & Architecture",
      confidence: 89
    }
  },
  {
    id: "review_3",
    pullRequestId: "PR-125",
    repositoryId: "deadline-project",
    authorId: "user_3",
    aiReviewerId: "ai-vladimir",
    status: "IN_PROGRESS",
    overallScore: 78,
    reviewDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      codeQuality: 82,
      performance: 75,
      security: 85,
      maintainability: 80,
      testCoverage: 70
    },
    issues: [
      {
        id: "issue_4",
        type: "STYLE",
        severity: "MEDIUM",
        line: 34,
        message: "Функция слишком длинная (120+ строк)",
        suggestion: "Разбейте на более мелкие функции"
      }
    ],
    recommendations: [
      "Рефакторинг длинных функций",
      "Улучшить покрытие тестами",
      "Добавить error handling"
    ],
    aiReviewer: {
      id: "ai-vladimir",
      name: "Владимир (AI Code Reviewer)",
      specialization: "Code Quality & Architecture",
      confidence: 91
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repositoryId = searchParams.get("repositoryId");
    const status = searchParams.get("status");
    const score = searchParams.get("score");

    let filteredReviews = [...demoReviews];

    // Фильтрация по репозиторию
    if (repositoryId) {
      filteredReviews = filteredReviews.filter(review => review.repositoryId === repositoryId);
    }

    // Фильтрация по статусу
    if (status && status !== "ALL") {
      filteredReviews = filteredReviews.filter(review => review.status === status);
    }

    // Фильтрация по оценке
    if (score) {
      switch (score) {
        case "high":
          filteredReviews = filteredReviews.filter(review => review.overallScore >= 80);
          break;
        case "medium":
          filteredReviews = filteredReviews.filter(review => review.overallScore >= 60 && review.overallScore < 80);
          break;
        case "low":
          filteredReviews = filteredReviews.filter(review => review.overallScore < 60);
          break;
      }
    }

    return NextResponse.json({ reviews: filteredReviews });
  } catch (error) {
    console.error("Ошибка получения code reviews:", error);
    return NextResponse.json(
      { error: "Ошибка получения code reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pullRequestId, repositoryId, authorId, codeContent, filePath } = body;

    // В реальном приложении здесь был бы AI анализ кода
    const newReview: CodeReview = {
      id: `review_${Date.now()}`,
      pullRequestId,
      repositoryId,
      authorId,
      aiReviewerId: "ai-vladimir",
      status: "PENDING",
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
      reviewDate: new Date().toISOString(),
      aiAnalysis: {
        codeQuality: Math.floor(Math.random() * 30) + 70,
        performance: Math.floor(Math.random() * 30) + 70,
        security: Math.floor(Math.random() * 30) + 70,
        maintainability: Math.floor(Math.random() * 30) + 70,
        testCoverage: Math.floor(Math.random() * 30) + 70
      },
      issues: [
        {
          id: `issue_${Date.now()}`,
          type: "STYLE",
          severity: "LOW",
          line: Math.floor(Math.random() * 100) + 1,
          message: "Рекомендуется улучшить читаемость кода",
          suggestion: "Добавить комментарии и улучшить именование переменных"
        }
      ],
      recommendations: [
        "Добавить unit тесты",
        "Улучшить error handling",
        "Оптимизировать производительность"
      ],
      aiReviewer: {
        id: "ai-vladimir",
        name: "Владимир (AI Code Reviewer)",
        specialization: "Code Quality & Architecture",
        confidence: Math.floor(Math.random() * 20) + 80
      }
    };

    return NextResponse.json(newReview);
  } catch (error) {
    console.error("Ошибка создания code review:", error);
    return NextResponse.json(
      { error: "Ошибка создания code review" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, status, comments } = body;

    // В реальном приложении здесь было бы обновление в базе данных
    const updatedReview = {
      id: reviewId,
      status: status || "IN_PROGRESS",
      updatedAt: new Date().toISOString(),
      comments: comments || []
    };

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Ошибка обновления code review:", error);
    return NextResponse.json(
      { error: "Ошибка обновления code review" },
      { status: 500 }
    );
  }
}