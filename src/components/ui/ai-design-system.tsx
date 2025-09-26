"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Palette, 
  Component, 
  Code, 
  Eye, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Zap,
  Star,
  TrendingUp,
  Shield,
  Smartphone,
  Monitor
} from "lucide-react";

interface DesignToken {
  id: string;
  name: string;
  value: string;
  type: string;
  category: string;
  description: string;
  usage: string[];
  variants?: Record<string, string>;
}

interface Component {
  id: string;
  name: string;
  description: string;
  category: string;
  props: {
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
    description: string;
  }[];
  variants: {
    name: string;
    props: Record<string, any>;
    description: string;
  }[];
  code: string;
  designTokens: string[];
  accessibility: {
    level: string;
    guidelines: string[];
    testing: string[];
  };
}

interface DesignGeneration {
  id: string;
  prompt: string;
  generatedComponents: Component[];
  generatedTokens: DesignToken[];
  style: string;
  colorScheme: string;
  accessibility: boolean;
  responsive: boolean;
  timestamp: string;
}

interface DesignAnalysis {
  id: string;
  componentId: string;
  issues: {
    type: string;
    severity: string;
    message: string;
    suggestion: string;
    line?: number;
  }[];
  score: number;
  recommendations: string[];
  timestamp: string;
}

export default function AIDesignSystem() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [colorScheme, setColorScheme] = useState("light");
  const [accessibility, setAccessibility] = useState(true);
  const [responsive, setResponsive] = useState(true);
  
  const [templates, setTemplates] = useState<Component[]>([]);
  const [generation, setGeneration] = useState<DesignGeneration | null>(null);
  const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);
  const [history, setHistory] = useState<DesignGeneration[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    fetchTemplates();
    fetchHistory();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/ai/design-system?action=templates');
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/ai/design-system?action=history&limit=10');
      const data = await response.json();
      setHistory(data.history);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  const generateDesignSystem = async () => {
    if (!prompt.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/ai/design-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt,
          style,
          colorScheme
        })
      });
      
      const data = await response.json();
      setGeneration(data.generation);
      setActiveTab("result");
      fetchHistory();
    } catch (error) {
      console.error('Ошибка генерации дизайн-системы:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeComponent = async (componentId: string, code: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/design-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          componentId,
          code
        })
      });
      
      const data = await response.json();
      setAnalysis(data.analysis);
      setActiveTab("analysis");
    } catch (error) {
      console.error('Ошибка анализа компонента:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'button': return '🔘';
      case 'input': return '📝';
      case 'card': return '🃏';
      case 'modal': return '🪟';
      case 'navigation': return '🧭';
      case 'layout': return '📐';
      case 'feedback': return '💬';
      default: return '🧩';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="h-6 w-6 text-pink-400" />
            AI Дизайн-Система
          </h2>
          <p className="text-white/60">Генерация и анализ дизайн-систем с помощью ИИ</p>
        </div>
        <Button 
          onClick={() => setActiveTab("generate")}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          <Zap className="h-4 w-4 mr-2" />
          Новая система
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-black/50">
          <TabsTrigger value="generate" className="text-white">Генерация</TabsTrigger>
          <TabsTrigger value="result" className="text-white">Результат</TabsTrigger>
          <TabsTrigger value="analysis" className="text-white">Анализ</TabsTrigger>
          <TabsTrigger value="templates" className="text-white">Шаблоны</TabsTrigger>
          <TabsTrigger value="history" className="text-white">История</TabsTrigger>
        </TabsList>

        {/* Генерация дизайн-системы */}
        <TabsContent value="generate" className="space-y-6">
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Component className="h-5 w-5 text-blue-400" />
                Генерация дизайн-системы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Описание дизайн-системы</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Опишите, какую дизайн-систему нужно создать..."
                    className="bg-black/50 border-white/20 text-white min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Стиль</label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="bg-black/50 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Современный</SelectItem>
                        <SelectItem value="minimalist">Минималистичный</SelectItem>
                        <SelectItem value="corporate">Корпоративный</SelectItem>
                        <SelectItem value="creative">Креативный</SelectItem>
                        <SelectItem value="tech">Технологичный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Цветовая схема</label>
                    <Select value={colorScheme} onValueChange={setColorScheme}>
                      <SelectTrigger className="bg-black/50 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Светлая</SelectItem>
                        <SelectItem value="dark">Темная</SelectItem>
                        <SelectItem value="auto">Автоматическая</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-white/70">
                    <input
                      type="checkbox"
                      checked={accessibility}
                      onChange={(e) => setAccessibility(e.target.checked)}
                      className="rounded"
                    />
                    <Shield className="h-4 w-4" />
                    Доступность
                  </label>
                  <label className="flex items-center gap-2 text-white/70">
                    <input
                      type="checkbox"
                      checked={responsive}
                      onChange={(e) => setResponsive(e.target.checked)}
                      className="rounded"
                    />
                    <Smartphone className="h-4 w-4" />
                    Адаптивность
                  </label>
                </div>
              </div>

              <Button 
                onClick={generateDesignSystem}
                disabled={loading || !prompt.trim()}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Генерация...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4 mr-2" />
                    Создать дизайн-систему
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Результат генерации */}
        <TabsContent value="result" className="space-y-6">
          {generation && (
            <div className="space-y-6">
              {/* Информация о генерации */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Сгенерированная дизайн-система
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{generation.generatedComponents.length}</div>
                      <div className="text-white/70 text-sm">Компонентов</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{generation.generatedTokens.length}</div>
                      <div className="text-white/70 text-sm">Токенов</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white capitalize">{generation.style}</div>
                      <div className="text-white/70 text-sm">Стиль</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className="bg-blue-500 text-white capitalize">{generation.style}</Badge>
                    <Badge className="bg-purple-500 text-white capitalize">{generation.colorScheme}</Badge>
                    {generation.accessibility && (
                      <Badge className="bg-green-500 text-white">Доступность</Badge>
                    )}
                    {generation.responsive && (
                      <Badge className="bg-orange-500 text-white">Адаптивность</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Сгенерированные компоненты */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Компоненты</h3>
                {generation.generatedComponents.map((component, index) => (
                  <Card key={index} className="bg-black/50 backdrop-blur-sm border border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(component.category)}</span>
                        {component.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-white/70 text-sm">{component.description}</p>
                      
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500 text-white">{component.category}</Badge>
                        <Badge className="bg-green-500 text-white">Уровень {component.accessibility.level}</Badge>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-green-400 text-sm whitespace-pre-wrap">
                          {component.code}
                        </pre>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyToClipboard(component.code)}
                          size="sm"
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Копировать
                        </Button>
                        <Button
                          onClick={() => downloadCode(component.code, `${component.name}.tsx`)}
                          size="sm"
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Скачать
                        </Button>
                        <Button
                          onClick={() => analyzeComponent(component.id, component.code)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Анализ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Дизайн-токены */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Дизайн-токены</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generation.generatedTokens.map((token, index) => (
                    <Card key={index} className="bg-black/50 backdrop-blur-sm border border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{token.name}</h4>
                          <Badge className="bg-purple-500 text-white">{token.type}</Badge>
                        </div>
                        <div className="text-white/70 text-sm mb-2">{token.description}</div>
                        <div className="flex items-center gap-2">
                          {token.type === 'color' && (
                            <div 
                              className="w-6 h-6 rounded border border-white/20"
                              style={{ backgroundColor: token.value }}
                            ></div>
                          )}
                          <span className="text-white font-mono text-sm">{token.value}</span>
                        </div>
                        <div className="text-white/60 text-xs mt-2">
                          Использование: {token.usage.join(', ')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Анализ компонента */}
        <TabsContent value="analysis" className="space-y-6">
          {analysis && (
            <div className="space-y-6">
              {/* Общая оценка */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Анализ компонента
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-white">
                      {analysis.score}/100
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-700 rounded-full h-4">
                        <div 
                          className="bg-white h-4 rounded-full"
                          style={{ width: `${analysis.score}%` }}
                        ></div>
                      </div>
                      <div className="text-white/70 text-sm mt-2">
                        Качество: {analysis.score >= 80 ? 'Отличное' :
                                  analysis.score >= 60 ? 'Хорошее' :
                                  analysis.score >= 40 ? 'Удовлетворительное' : 'Требует улучшения'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Найденные проблемы */}
              {analysis.issues.length > 0 && (
                <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      Найденные проблемы
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.issues.map((issue, index) => (
                        <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-white font-medium">{issue.message}</h4>
                              <div className="text-white/60 text-sm capitalize">{issue.type}</div>
                            </div>
                            <Badge className={`${getSeverityBg(issue.severity)} text-white`}>
                              {issue.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-white/80 text-sm">
                            <strong>Рекомендация:</strong> {issue.suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Рекомендации */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Рекомендации по улучшению
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5" />
                        <span className="text-white/80 text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Шаблоны компонентов */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/70 text-sm">{template.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500 text-white">{template.category}</Badge>
                    <Badge className="bg-green-500 text-white">Уровень {template.accessibility.level}</Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium text-sm">Пропсы:</h4>
                    <div className="space-y-1">
                      {template.props.slice(0, 3).map((prop, index) => (
                        <div key={index} className="text-white/60 text-xs">
                          {prop.name}: {prop.type}
                        </div>
                      ))}
                      {template.props.length > 3 && (
                        <div className="text-white/40 text-xs">
                          +{template.props.length - 3} еще...
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      setGeneration({
                        id: `template_${Date.now()}`,
                        prompt: `Template: ${template.name}`,
                        generatedComponents: [template],
                        generatedTokens: [],
                        style: 'template',
                        colorScheme: 'light',
                        accessibility: true,
                        responsive: true,
                        timestamp: new Date().toISOString()
                      });
                      setActiveTab("result");
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    <Component className="h-4 w-4 mr-2" />
                    Использовать шаблон
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* История генерации */}
        <TabsContent value="history" className="space-y-6">
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                История генерации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((gen) => (
                  <div key={gen.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon('component')}</span>
                      <div>
                        <div className="text-white font-medium">{gen.prompt}</div>
                        <div className="text-white/60 text-sm">
                          {new Date(gen.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500 text-white">{gen.generatedComponents.length} компонентов</Badge>
                      <Badge className="bg-purple-500 text-white capitalize">{gen.style}</Badge>
                      <Button
                        onClick={() => {
                          setGeneration(gen);
                          setActiveTab("result");
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Просмотр
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
