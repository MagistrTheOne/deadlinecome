"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Code, 
  Play, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  FileText,
  TestTube,
  BookOpen,
  Zap,
  Star,
  TrendingUp
} from "lucide-react";

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  framework?: string;
  category: string;
  template: string;
  variables: string[];
  difficulty: string;
}

interface GeneratedCode {
  id: string;
  code: string;
  language: string;
  framework?: string;
  tests?: string;
  documentation?: string;
  complexity: number;
  quality: number;
  timestamp: string;
  prompt: string;
  suggestions: string[];
}

interface CodeAnalysis {
  id: string;
  codeId: string;
  issues: {
    type: string;
    line: number;
    message: string;
    severity: string;
    fix?: string;
  }[];
  score: number;
  suggestions: string[];
  timestamp: string;
}

export default function AICodeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [framework, setFramework] = useState("");
  const [style, setStyle] = useState("object-oriented");
  const [complexity, setComplexity] = useState("medium");
  const [includeTests, setIncludeTests] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [includeDocumentation, setIncludeDocumentation] = useState(true);
  
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [history, setHistory] = useState<GeneratedCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    fetchTemplates();
    fetchHistory();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/ai/code-generation?action=templates');
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/ai/code-generation?action=history&limit=10');
      const data = await response.json();
      setHistory(data.history);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  const generateCode = async () => {
    if (!prompt.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/ai/code-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt,
          language,
          framework: framework || undefined,
          style,
          complexity,
          includeTests,
          includeComments,
          includeDocumentation
        })
      });
      
      const data = await response.json();
      setGeneratedCode(data.code);
      setActiveTab("result");
      fetchHistory();
    } catch (error) {
      console.error('Ошибка генерации кода:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCode = async (code: string) => {
    try {
      const response = await fetch('/api/ai/code-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          code,
          language
        })
      });
      
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Ошибка анализа кода:', error);
    }
  };

  const applyTemplate = async (templateId: string, variables: Record<string, string>) => {
    try {
      const response = await fetch('/api/ai/code-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply-template',
          templateId,
          variables
        })
      });
      
      const data = await response.json();
      setGeneratedCode({
        id: `template_${Date.now()}`,
        code: data.code,
        language: templates.find(t => t.id === templateId)?.language || 'typescript',
        complexity: 50,
        quality: 80,
        timestamp: new Date().toISOString(),
        prompt: `Template: ${templateId}`,
        suggestions: []
      });
      setActiveTab("result");
    } catch (error) {
      console.error('Ошибка применения шаблона:', error);
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

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case 'typescript': return '🔷';
      case 'javascript': return '🟨';
      case 'python': return '🐍';
      case 'java': return '☕';
      case 'cpp': return '⚙️';
      default: return '📄';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Code className="h-6 w-6 text-blue-400" />
            AI Генератор Кода
          </h2>
          <p className="text-white/60">Генерация кода с помощью искусственного интеллекта</p>
        </div>
        <Button 
          onClick={() => setActiveTab("generate")}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Zap className="h-4 w-4 mr-2" />
          Новый код
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black/50">
          <TabsTrigger value="generate" className="text-white">Генерация</TabsTrigger>
          <TabsTrigger value="templates" className="text-white">Шаблоны</TabsTrigger>
          <TabsTrigger value="result" className="text-white">Результат</TabsTrigger>
          <TabsTrigger value="history" className="text-white">История</TabsTrigger>
        </TabsList>

        {/* Генерация кода */}
        <TabsContent value="generate" className="space-y-6">
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Play className="h-5 w-5 text-green-400" />
                Генерация кода
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Описание задачи</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Опишите, какой код нужно сгенерировать..."
                    className="bg-black/50 border-white/20 text-white min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Язык программирования</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-black/50 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Фреймворк</label>
                    <Input
                      value={framework}
                      onChange={(e) => setFramework(e.target.value)}
                      placeholder="React, Express, Django..."
                      className="bg-black/50 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Стиль кода</label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="bg-black/50 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="functional">Функциональный</SelectItem>
                        <SelectItem value="object-oriented">ООП</SelectItem>
                        <SelectItem value="procedural">Процедурный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Сложность</label>
                    <Select value={complexity} onValueChange={setComplexity}>
                      <SelectTrigger className="bg-black/50 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Простая</SelectItem>
                        <SelectItem value="medium">Средняя</SelectItem>
                        <SelectItem value="complex">Сложная</SelectItem>
                      </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-white/70">
                    <input
                      type="checkbox"
                      checked={includeTests}
                      onChange={(e) => setIncludeTests(e.target.checked)}
                      className="rounded"
                    />
                    <TestTube className="h-4 w-4" />
                    Включить тесты
                  </label>
                  <label className="flex items-center gap-2 text-white/70">
                    <input
                      type="checkbox"
                      checked={includeComments}
                      onChange={(e) => setIncludeComments(e.target.checked)}
                      className="rounded"
                    />
                    <FileText className="h-4 w-4" />
                    Включить комментарии
                  </label>
                  <label className="flex items-center gap-2 text-white/70">
                    <input
                      type="checkbox"
                      checked={includeDocumentation}
                      onChange={(e) => setIncludeDocumentation(e.target.checked)}
                      className="rounded"
                    />
                    <BookOpen className="h-4 w-4" />
                    Включить документацию
                  </label>
                </div>
              </div>

              <Button 
                onClick={generateCode}
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Генерация...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Сгенерировать код
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Шаблоны */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-2xl">{getLanguageIcon(template.language)}</span>
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/70 text-sm">{template.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500 text-white">{template.language}</Badge>
                    {template.framework && (
                      <Badge className="bg-purple-500 text-white">{template.framework}</Badge>
                    )}
                    <Badge className="bg-green-500 text-white">{template.category}</Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Переменные для замены:</label>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-white/70 border-white/20">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      const variables: Record<string, string> = {};
                      template.variables.forEach(variable => {
                        variables[variable] = prompt(`Введите значение для ${variable}:`) || variable;
                      });
                      applyTemplate(template.id, variables);
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Применить шаблон
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Результат */}
        <TabsContent value="result" className="space-y-6">
          {generatedCode && (
            <div className="space-y-6">
              {/* Информация о сгенерированном коде */}
              <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Сгенерированный код
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getLanguageIcon(generatedCode.language)}</span>
                      <span className="text-white font-medium">{generatedCode.language}</span>
                    </div>
                    <Badge className="bg-blue-500 text-white">Сложность: {generatedCode.complexity}%</Badge>
                    <Badge className="bg-green-500 text-white">Качество: {generatedCode.quality}%</Badge>
                    <div className="flex-1"></div>
                    <Button
                      onClick={() => copyToClipboard(generatedCode.code)}
                      size="sm"
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Копировать
                    </Button>
                    <Button
                      onClick={() => downloadCode(generatedCode.code, `generated.${generatedCode.language}`)}
                      size="sm"
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Скачать
                    </Button>
                    <Button
                      onClick={() => analyzeCode(generatedCode.code)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Анализ
                    </Button>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm whitespace-pre-wrap">
                      {generatedCode.code}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Тесты */}
              {generatedCode.tests && (
                <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-yellow-400" />
                      Тесты
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-yellow-400 text-sm whitespace-pre-wrap">
                        {generatedCode.tests}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Документация */}
              {generatedCode.documentation && (
                <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                      Документация
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-blue-400 text-sm whitespace-pre-wrap">
                        {generatedCode.documentation}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Предложения */}
              {generatedCode.suggestions.length > 0 && (
                <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                      Предложения по улучшению
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedCode.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-white/5 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5" />
                          <span className="text-white/80 text-sm">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Анализ кода */}
              {analysis && (
                <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      Анализ кода
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-white">Оценка: {analysis.score}/100</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full"
                              style={{ width: `${analysis.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {analysis.issues.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Найденные проблемы:</h4>
                          {analysis.issues.map((issue, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-white/5 rounded-lg">
                              <AlertTriangle className={`h-4 w-4 mt-0.5 ${getSeverityColor(issue.severity)}`} />
                              <div className="flex-1">
                                <div className="text-white font-medium text-sm">
                                  Строка {issue.line}: {issue.message}
                                </div>
                                {issue.fix && (
                                  <div className="text-white/60 text-xs mt-1">
                                    Исправление: {issue.fix}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {analysis.suggestions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Рекомендации:</h4>
                          {analysis.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-white/5 rounded-lg">
                              <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5" />
                              <span className="text-white/80 text-sm">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* История */}
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
                {history.map((code) => (
                  <div key={code.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getLanguageIcon(code.language)}</span>
                      <div>
                        <div className="text-white font-medium">{code.prompt}</div>
                        <div className="text-white/60 text-sm">
                          {new Date(code.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500 text-white">Сложность: {code.complexity}%</Badge>
                      <Badge className="bg-green-500 text-white">Качество: {code.quality}%</Badge>
                      <Button
                        onClick={() => {
                          setGeneratedCode(code);
                          setActiveTab("result");
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Star className="h-4 w-4 mr-2" />
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
