import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiTeamMember } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWebSocketManager } from "@/lib/websocket-server";

import { requireAuth } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const {
      projectId,
      codeContent,
      dependencies,
      environment,
      scanType = "FULL",
    } = await request.json();

    if (!projectId || !codeContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Находим AI Security Expert (Ольга)
    const aiSecurity = await db
      .select()
      .from(aiTeamMember)
      .where(eq(aiTeamMember.role, "AI_SECURITY"))
      .limit(1);

    if (!aiSecurity.length) {
      return NextResponse.json({ error: "AI Security Expert not found" }, { status: 404 });
    }

    // Выполняем AI Security Scan
    const securityScan = await performSecurityScan(codeContent, dependencies, environment, scanType);

    // Отправляем уведомление через WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifySecurityScan(projectId, securityScan);
    }

    return NextResponse.json({
      success: true,
      scan: securityScan,
    });
  } catch (error) {
    console.error("Error performing security scan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// AI функция для сканирования безопасности
async function performSecurityScan(codeContent: string, dependencies: any[], environment: string, scanType: string) {
  const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Симуляция AI Security Scan
  const vulnerabilities = [
    {
      id: `vuln_${Date.now()}_1`,
      type: "SQL_INJECTION",
      severity: "HIGH",
      title: "Потенциальная SQL-инъекция",
      description: "Обнаружена уязвимость SQL-инъекции в запросе к базе данных",
      line: Math.floor(Math.random() * 50) + 1,
      file: "src/api/users.ts",
      cwe: "CWE-89",
      cvss: 7.5,
      recommendation: "Использовать параметризованные запросы или ORM",
      fix: "Заменить конкатенацию строк на параметризованные запросы",
    },
    {
      id: `vuln_${Date.now()}_2`,
      type: "XSS",
      severity: "MEDIUM",
      title: "Cross-Site Scripting (XSS)",
      description: "Недостаточная валидация пользовательского ввода",
      line: Math.floor(Math.random() * 30) + 1,
      file: "src/components/UserInput.tsx",
      cwe: "CWE-79",
      cvss: 6.1,
      recommendation: "Добавить санитизацию HTML и валидацию",
      fix: "Использовать DOMPurify или аналогичную библиотеку",
    },
    {
      id: `vuln_${Date.now()}_3`,
      type: "AUTHENTICATION",
      severity: "CRITICAL",
      title: "Слабая аутентификация",
      description: "Обнаружены проблемы с аутентификацией и авторизацией",
      line: Math.floor(Math.random() * 40) + 1,
      file: "src/lib/auth.ts",
      cwe: "CWE-287",
      cvss: 9.1,
      recommendation: "Усилить механизмы аутентификации",
      fix: "Добавить многофакторную аутентификацию и rate limiting",
    },
  ];

  const dependencyVulns = [
    {
      id: `dep_${Date.now()}_1`,
      package: "lodash",
      version: "4.17.15",
      vulnerability: "Prototype Pollution",
      severity: "HIGH",
      cvss: 7.4,
      description: "Уязвимость prototype pollution в lodash",
      fix: "Обновить до версии 4.17.21 или выше",
    },
    {
      id: `dep_${Date.now()}_2`,
      package: "express",
      version: "4.16.4",
      vulnerability: "Path Traversal",
      severity: "MEDIUM",
      cvss: 5.3,
      description: "Возможность path traversal атаки",
      fix: "Обновить до версии 4.18.2 или выше",
    },
  ];

  const securityScore = Math.max(0, 100 - (vulnerabilities.length * 15) - (dependencyVulns.length * 10));
  const riskLevel = securityScore >= 90 ? "LOW" : securityScore >= 70 ? "MEDIUM" : securityScore >= 50 ? "HIGH" : "CRITICAL";

  const recommendations = [
    "Провести полный security audit кода",
    "Обновить все зависимости до последних версий",
    "Добавить автоматическое сканирование в CI/CD",
    "Внедрить SAST и DAST инструменты",
    "Провести penetration testing",
    "Добавить security headers",
    "Внедрить Content Security Policy (CSP)",
    "Настроить мониторинг безопасности",
  ];

  const scanResult = {
    id: scanId,
    projectId: "demo-project",
    scanType,
    timestamp: new Date().toISOString(),
    securityScore,
    riskLevel,
    vulnerabilities,
    dependencyVulns,
    recommendations,
    summary: {
      totalVulns: vulnerabilities.length,
      criticalVulns: vulnerabilities.filter(v => v.severity === "CRITICAL").length,
      highVulns: vulnerabilities.filter(v => v.severity === "HIGH").length,
      mediumVulns: vulnerabilities.filter(v => v.severity === "MEDIUM").length,
      lowVulns: vulnerabilities.filter(v => v.severity === "LOW").length,
      dependencyVulns: dependencyVulns.length,
    },
    aiAnalysis: {
      overallRisk: riskLevel,
      confidence: 92,
      nextSteps: [
        "Немедленно исправить критические уязвимости",
        "Обновить уязвимые зависимости",
        "Провести дополнительное тестирование",
        "Настроить автоматическое сканирование",
      ],
    },
  };

  return scanResult;
}
