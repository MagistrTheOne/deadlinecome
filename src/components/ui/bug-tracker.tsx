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
import { 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Upload,
  Brain,
  TestTube,
  TrendingUp,
  Shield
} from "lucide-react";

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

export default function BugTracker() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });

  // Fallback demo data
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

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const response = await fetch("/api/bugs");
      if (response.ok) {
        const data = await response.json();
        setBugs(data.bugs || demoBugs);
      } else {
        setBugs(demoBugs);
      }
    } catch (error) {
      console.error("Error fetching bugs:", error);
      setBugs(demoBugs);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      NEW: "bg-blue-500",
      ASSIGNED: "bg-yellow-500",
      IN_PROGRESS: "bg-orange-500",
      TESTING: "bg-purple-500",
      RESOLVED: "bg-green-500",
      CLOSED: "bg-gray-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      CRITICAL: "bg-red-500",
      HIGH: "bg-orange-500",
      MEDIUM: "bg-yellow-500",
      LOW: "bg-green-500",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-500";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      FRONTEND: Eye,
      BACKEND: Bug,
      DATABASE: TrendingUp,
      API: TestTube,
      UI_UX: Eye,
      PERFORMANCE: TrendingUp,
      SECURITY: Shield,
    };
    return icons[category as keyof typeof icons] || Bug;
  };

  const filteredBugs = bugs.filter(bug => {
    if (filters.status && bug.status !== filters.status) return false;
    if (filters.priority && bug.priority !== filters.priority) return false;
    if (filters.category && bug.category !== filters.category) return false;
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
          <h2 className="text-2xl font-bold text-white">Bug Tracker</h2>
          <p className="text-gray-400">Отслеживание и управление багами с AI-анализом</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Создать баг
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Создать новый баг-репорт</DialogTitle>
              <DialogDescription className="text-gray-400">
                Опишите проблему, которую вы обнаружили
              </DialogDescription>
            </DialogHeader>
            <CreateBugForm onClose={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Фильтры:</span>
        </div>
        <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-600">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все статусы</SelectItem>
            <SelectItem value="NEW">Новый</SelectItem>
            <SelectItem value="ASSIGNED">Назначен</SelectItem>
            <SelectItem value="IN_PROGRESS">В работе</SelectItem>
            <SelectItem value="TESTING">Тестирование</SelectItem>
            <SelectItem value="RESOLVED">Исправлен</SelectItem>
            <SelectItem value="CLOSED">Закрыт</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-600">
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все приоритеты</SelectItem>
            <SelectItem value="CRITICAL">Критический</SelectItem>
            <SelectItem value="HIGH">Высокий</SelectItem>
            <SelectItem value="MEDIUM">Средний</SelectItem>
            <SelectItem value="LOW">Низкий</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-600">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все категории</SelectItem>
            <SelectItem value="FRONTEND">Frontend</SelectItem>
            <SelectItem value="BACKEND">Backend</SelectItem>
            <SelectItem value="DATABASE">База данных</SelectItem>
            <SelectItem value="API">API</SelectItem>
            <SelectItem value="UI_UX">UI/UX</SelectItem>
            <SelectItem value="PERFORMANCE">Производительность</SelectItem>
            <SelectItem value="SECURITY">Безопасность</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredBugs.map((bug) => {
            const CategoryIcon = getCategoryIcon(bug.category);
            return (
              <Card key={bug.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{bug.title}</CardTitle>
                      <CardDescription className="text-gray-400 mt-1">
                        {bug.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge className={getStatusColor(bug.status)}>
                        {bug.status}
                      </Badge>
                      <Badge className={getPriorityColor(bug.priority)}>
                        {bug.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <CategoryIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{bug.category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {new Date(bug.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {bug.aiAnalysis && (
                        <div className="flex items-center space-x-1">
                          <Brain className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-purple-400">AI анализ</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBug(bug)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Подробнее
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Всего багов:</span>
                <span className="text-sm text-white">{bugs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Новых:</span>
                <span className="text-sm text-blue-400">{bugs.filter(b => b.status === "NEW").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">В работе:</span>
                <span className="text-sm text-orange-400">{bugs.filter(b => b.status === "IN_PROGRESS").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Исправлено:</span>
                <span className="text-sm text-green-400">{bugs.filter(b => b.status === "RESOLVED").length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">AI QA Анализ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Проанализировано:</span>
                <span className="text-sm text-white">{bugs.filter(b => b.aiAnalysis).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Высокий риск:</span>
                <span className="text-sm text-red-400">
                  {bugs.filter(b => b.aiAnalysis?.predictedRisk === "HIGH" || b.aiAnalysis?.predictedRisk === "CRITICAL").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Средний риск:</span>
                <span className="text-sm text-yellow-400">
                  {bugs.filter(b => b.aiAnalysis?.predictedRisk === "MEDIUM").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedBug && (
        <BugDetailsDialog 
          bug={selectedBug} 
          onClose={() => setSelectedBug(null)}
        />
      )}
    </div>
  );
}

// Компонент формы создания бага
function CreateBugForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    priority: "MEDIUM",
    category: "FRONTEND",
    environment: "",
    severity: "MAJOR",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика создания бага
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Заголовок *
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Краткое описание проблемы"
          className="bg-gray-800 border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Описание *
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Подробное описание проблемы"
          className="bg-gray-800 border-gray-600"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Приоритет
          </label>
          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CRITICAL">Критический</SelectItem>
              <SelectItem value="HIGH">Высокий</SelectItem>
              <SelectItem value="MEDIUM">Средний</SelectItem>
              <SelectItem value="LOW">Низкий</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Категория
          </label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FRONTEND">Frontend</SelectItem>
              <SelectItem value="BACKEND">Backend</SelectItem>
              <SelectItem value="DATABASE">База данных</SelectItem>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="UI_UX">UI/UX</SelectItem>
              <SelectItem value="PERFORMANCE">Производительность</SelectItem>
              <SelectItem value="SECURITY">Безопасность</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Шаги воспроизведения
        </label>
        <Textarea
          value={formData.stepsToReproduce}
          onChange={(e) => setFormData(prev => ({ ...prev, stepsToReproduce: e.target.value }))}
          placeholder="1. Открыть страницу\n2. Нажать кнопку\n3. ..."
          className="bg-gray-800 border-gray-600"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Создать баг
        </Button>
      </div>
    </form>
  );
}

// Компонент детального просмотра бага
function BugDetailsDialog({ bug, onClose }: { bug: BugReport; onClose: () => void }) {
  const CategoryIcon = getCategoryIcon(bug.category);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{bug.title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Баг #{bug.id} • {new Date(bug.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Статус</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(bug.status)}>
                  {bug.status}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Приоритет</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getPriorityColor(bug.priority)}>
                  {bug.priority}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Категория</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CategoryIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{bug.category}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-2">Описание</h3>
              <p className="text-gray-300">{bug.description}</p>
            </div>

            {bug.stepsToReproduce && (
              <div>
                <h3 className="text-white font-semibold mb-2">Шаги воспроизведения</h3>
                <pre className="text-gray-300 whitespace-pre-wrap bg-gray-800 p-3 rounded">
                  {bug.stepsToReproduce}
                </pre>
              </div>
            )}

            {bug.expectedBehavior && (
              <div>
                <h3 className="text-white font-semibold mb-2">Ожидаемое поведение</h3>
                <p className="text-gray-300">{bug.expectedBehavior}</p>
              </div>
            )}

            {bug.actualBehavior && (
              <div>
                <h3 className="text-white font-semibold mb-2">Фактическое поведение</h3>
                <p className="text-gray-300">{bug.actualBehavior}</p>
              </div>
            )}
          </div>

          {bug.aiAnalysis && (
            <Card className="bg-purple-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  AI QA Анализ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Анализ</h4>
                  <p className="text-gray-300">{bug.aiAnalysis.analysis}</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Рекомендации</h4>
                  <ul className="space-y-1">
                    {bug.aiAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-300 flex items-start">
                        <span className="text-purple-400 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Уверенность:</span>
                    <span className="text-sm text-white ml-2">{bug.aiAnalysis.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Предсказанный риск:</span>
                    <Badge className={bug.aiAnalysis.predictedRisk === "CRITICAL" ? "bg-red-500" : 
                                   bug.aiAnalysis.predictedRisk === "HIGH" ? "bg-orange-500" :
                                   bug.aiAnalysis.predictedRisk === "MEDIUM" ? "bg-yellow-500" : "bg-green-500"}>
                      {bug.aiAnalysis.predictedRisk}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
