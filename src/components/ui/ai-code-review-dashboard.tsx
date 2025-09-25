"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Code, 
  Shield, 
  Zap, 
  Wrench, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  GitBranch,
  Clock,
  User,
  Star,
  TrendingUp,
  Brain,
  Lock,
  Unlock
} from "lucide-react";

interface CodeReview {
  id: string;
  pullRequestId: string;
  repositoryId: string;
  authorId: string;
  aiReviewerId: string;
  status: "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED" | "NEEDS_CHANGES";
  qualityScore: number;
  securityScore: number;
  performanceScore: number;
  maintainabilityScore: number;
  overallScore: number;
  issues: Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    line: number;
    suggestion: string;
  }>;
  suggestions: string[];
  approved: boolean;
  blockingIssues: Array<{
    id: string;
    type: string;
    message: string;
    mustFix: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function AICodeReviewDashboard() {
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    score: "",
  });

  // Fallback demo data
  const demoReviews: CodeReview[] = [
    {
      id: "review_1",
      pullRequestId: "PR-123",
      repositoryId: "demo-project",
      authorId: "user_1",
      aiReviewerId: "ai-vladimir",
      status: "APPROVED",
      qualityScore: 85,
      securityScore: 92,
      performanceScore: 78,
      maintainabilityScore: 88,
      overallScore: 86,
      issues: [
        {
          id: "issue_1",
          type: "CODE_SMELL",
          severity: "MEDIUM",
          message: "Функция слишком длинная, рекомендуется разбить на более мелкие",
          line: 45,
          suggestion: "Разделить функцию на логические блоки",
        },
        {
          id: "issue_2",
          type: "SECURITY",
          severity: "HIGH",
          message: "Потенциальная SQL-инъекция в запросе",
          line: 23,
          suggestion: "Использовать параметризованные запросы",
        },
      ],
      suggestions: [
        "Добавить JSDoc комментарии для лучшей документации",
        "Рассмотреть использование TypeScript для типизации",
        "Оптимизировать алгоритм для лучшей производительности",
      ],
      approved: true,
      blockingIssues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "review_2",
      pullRequestId: "PR-124",
      repositoryId: "demo-project",
      authorId: "user_2",
      aiReviewerId: "ai-vladimir",
      status: "REJECTED",
      qualityScore: 65,
      securityScore: 45,
      performanceScore: 70,
      maintainabilityScore: 60,
      overallScore: 60,
      issues: [
        {
          id: "issue_3",
          type: "SECURITY",
          severity: "CRITICAL",
          message: "Критическая уязвимость безопасности",
          line: 12,
          suggestion: "Немедленно исправить уязвимость",
        },
        {
          id: "issue_4",
          type: "PERFORMANCE",
          severity: "HIGH",
          message: "Неэффективный алгоритм может вызвать проблемы",
          line: 67,
          suggestion: "Оптимизировать алгоритм",
        },
      ],
      suggestions: [
        "Провести полный security audit",
        "Добавить unit тесты",
        "Улучшить обработку ошибок",
      ],
      approved: false,
      blockingIssues: [
        {
          id: "blocking_1",
          type: "CRITICAL",
          message: "Критические проблемы безопасности требуют исправления",
          mustFix: true,
        }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "review_3",
      pullRequestId: "PR-125",
      repositoryId: "demo-project",
      authorId: "user_3",
      aiReviewerId: "ai-vladimir",
      status: "IN_PROGRESS",
      qualityScore: 75,
      securityScore: 80,
      performanceScore: 85,
      maintainabilityScore: 70,
      overallScore: 78,
      issues: [
        {
          id: "issue_5",
          type: "CODE_SMELL",
          severity: "LOW",
          message: "Неиспользуемая переменная",
          line: 34,
          suggestion: "Удалить неиспользуемую переменную",
        },
      ],
      suggestions: [
        "Добавить комментарии к сложной логике",
        "Рассмотреть рефакторинг для улучшения читаемости",
      ],
      approved: false,
      blockingIssues: [],
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  useEffect(() => {
    fetchReviews();
  }, []);

  // Автоматическое обновление при изменении фильтров
  useEffect(() => {
    fetchReviews();
  }, [filters.status, filters.score]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "ALL") {
        params.append("status", filters.status);
      }
      if (filters.score && filters.score !== "ALL") {
        params.append("score", filters.score);
      }
      
      const response = await fetch(`/api/code-review?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      } else {
        console.warn("API недоступен, используем fallback данные");
        setReviews(demoReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews(demoReviews);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-500",
      IN_PROGRESS: "bg-blue-500",
      APPROVED: "bg-green-500",
      REJECTED: "bg-red-500",
      NEEDS_CHANGES: "bg-orange-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-yellow-400";
    if (score >= 70) return "text-orange-400";
    return "text-red-400";
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      CRITICAL: "bg-red-600",
      HIGH: "bg-red-500",
      MEDIUM: "bg-yellow-500",
      LOW: "bg-green-500",
    };
    return colors[severity as keyof typeof colors] || "bg-gray-500";
  };

  const filteredReviews = reviews.filter(review => {
    if (filters.status && review.status !== filters.status) return false;
    if (filters.score === "high" && review.overallScore < 80) return false;
    if (filters.score === "medium" && (review.overallScore < 60 || review.overallScore >= 80)) return false;
    if (filters.score === "low" && review.overallScore >= 60) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Code Review Dashboard</h2>
          <p className="text-gray-400">Автоматический анализ кода с Владимиром (AI Code Reviewer)</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Code className="w-4 h-4 mr-2" />
              Новый Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Создать новый Code Review</DialogTitle>
              <DialogDescription className="text-gray-400">
                Загрузите код для анализа AI-рецензентом
              </DialogDescription>
            </DialogHeader>
            <CreateReviewForm onClose={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Фильтры:</span>
        </div>
        <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-600">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все статусы</SelectItem>
            <SelectItem value="PENDING">Ожидает</SelectItem>
            <SelectItem value="IN_PROGRESS">В процессе</SelectItem>
            <SelectItem value="APPROVED">Одобрено</SelectItem>
            <SelectItem value="REJECTED">Отклонено</SelectItem>
            <SelectItem value="NEEDS_CHANGES">Требует изменений</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.score} onValueChange={(value) => setFilters(prev => ({ ...prev, score: value }))}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-600">
            <SelectValue placeholder="Качество" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все оценки</SelectItem>
            <SelectItem value="high">Высокое (80+)</SelectItem>
            <SelectItem value="medium">Среднее (60-79)</SelectItem>
            <SelectItem value="low">Низкое (&lt;60)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">
                      PR #{review.pullRequestId}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      Repository: {review.repositoryId}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={getStatusColor(review.status)}>
                      {review.status}
                    </Badge>
                    {review.approved ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{review.overallScore}</div>
                      <div className="text-xs text-gray-400">Общая оценка</div>
                      <Progress value={review.overallScore} className="mt-1" />
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(review.qualityScore)}`}>
                        {review.qualityScore}
                      </div>
                      <div className="text-xs text-gray-400">Качество</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(review.securityScore)}`}>
                        {review.securityScore}
                      </div>
                      <div className="text-xs text-gray-400">Безопасность</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(review.performanceScore)}`}>
                        {review.performanceScore}
                      </div>
                      <div className="text-xs text-gray-400">Производительность</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Issues: {review.issues.length}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.blockingIssues.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Lock className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400">Заблокировано</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReview(review)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Подробнее
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Всего reviews:</span>
                <span className="text-sm text-white">{reviews.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Одобрено:</span>
                <span className="text-sm text-green-400">{reviews.filter(r => r.approved).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Отклонено:</span>
                <span className="text-sm text-red-400">{reviews.filter(r => !r.approved).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Средняя оценка:</span>
                <span className="text-sm text-white">
                  {Math.round(reviews.reduce((acc, r) => acc + r.overallScore, 0) / reviews.length)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">AI Владимир</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-white">AI Code Reviewer</span>
              </div>
              <div className="text-sm text-gray-400">
                Автоматический анализ качества кода, безопасности и производительности
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Активность:</span>
                <Badge className="bg-green-500">Онлайн</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedReview && (
        <ReviewDetailsDialog 
          review={selectedReview} 
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}

// Компонент формы создания review
function CreateReviewForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    pullRequestId: "",
    repositoryId: "",
    codeContent: "",
    language: "javascript",
    filePath: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика создания review
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pull Request ID *
          </label>
          <Input
            value={formData.pullRequestId}
            onChange={(e) => setFormData(prev => ({ ...prev, pullRequestId: e.target.value }))}
            placeholder="PR-123"
            className="bg-gray-800 border-gray-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Repository ID *
          </label>
          <Input
            value={formData.repositoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, repositoryId: e.target.value }))}
            placeholder="demo-project"
            className="bg-gray-800 border-gray-600"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Язык программирования
          </label>
          <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="go">Go</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Путь к файлу
          </label>
          <Input
            value={formData.filePath}
            onChange={(e) => setFormData(prev => ({ ...prev, filePath: e.target.value }))}
            placeholder="src/components/Button.tsx"
            className="bg-gray-800 border-gray-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Код для анализа *
        </label>
        <Textarea
          value={formData.codeContent}
          onChange={(e) => setFormData(prev => ({ ...prev, codeContent: e.target.value }))}
          placeholder="Вставьте код для анализа..."
          className="bg-gray-800 border-gray-600"
          rows={10}
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Анализировать код
        </Button>
      </div>
    </form>
  );
}

// Компонент детального просмотра review
function ReviewDetailsDialog({ review, onClose }: { review: CodeReview; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Code Review #{review.pullRequestId}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Анализ от AI Владимира • {new Date(review.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Общая оценка</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{review.overallScore}</div>
                <Progress value={review.overallScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Качество</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{review.qualityScore}</div>
                <div className="text-xs text-gray-400">Code Quality</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Безопасность</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{review.securityScore}</div>
                <div className="text-xs text-gray-400">Security</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Производительность</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{review.performanceScore}</div>
                <div className="text-xs text-gray-400">Performance</div>
              </CardContent>
            </Card>
          </div>

          {review.issues.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                Найденные проблемы ({review.issues.length})
              </h3>
              <div className="space-y-3">
                {review.issues.map((issue) => (
                  <Card key={issue.id} className="bg-red-900/20 border-red-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline">{issue.type}</Badge>
                            <span className="text-sm text-gray-400">Line {issue.line}</span>
                          </div>
                          <p className="text-white mb-2">{issue.message}</p>
                          <p className="text-sm text-gray-300">
                            <strong>Рекомендация:</strong> {issue.suggestion}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {review.suggestions.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Рекомендации ({review.suggestions.length})
              </h3>
              <div className="space-y-2">
                {review.suggestions.map((suggestion, index) => (
                  <Card key={index} className="bg-yellow-900/20 border-yellow-500/30">
                    <CardContent className="p-3">
                      <p className="text-white">{suggestion}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {review.blockingIssues.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-red-400" />
                Блокирующие проблемы ({review.blockingIssues.length})
              </h3>
              <div className="space-y-2">
                {review.blockingIssues.map((blocking) => (
                  <Card key={blocking.id} className="bg-red-900/30 border-red-600/50">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-white font-medium">{blocking.message}</span>
                        {blocking.mustFix && (
                          <Badge className="bg-red-600">ОБЯЗАТЕЛЬНО ИСПРАВИТЬ</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getSeverityColor(severity: string) {
  const colors = {
    CRITICAL: "bg-red-600",
    HIGH: "bg-red-500",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-green-500",
  };
  return colors[severity as keyof typeof colors] || "bg-gray-500";
}
