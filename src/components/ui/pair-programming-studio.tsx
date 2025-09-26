"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Code,
  Play,
  Square,
  RotateCcw,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Zap,
  Brain,
  Terminal,
  FileText,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Save,
  Share,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AISpecialistType, aiTeamManager } from "@/lib/ai/core/ai-team-manager";
import { useSession } from "@/lib/auth-client";

interface CodeSuggestion {
  id: string;
  line: number;
  content: string;
  explanation: string;
  confidence: number;
  type: 'completion' | 'fix' | 'optimization' | 'security';
}

interface DebugInfo {
  errors: Array<{
    line: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  suggestions: CodeSuggestion[];
}

interface PairProgrammingStudioProps {
  initialCode?: string;
  language?: string;
  className?: string;
}

export function PairProgrammingStudio({
  initialCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Тестирование
console.log(fibonacci(10));`,
  language = 'javascript',
  className
}: PairProgrammingStudioProps) {
  const { data: session } = useSession();
  const [code, setCode] = useState(initialCode);
  const [languageState, setLanguageState] = useState(language);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({ errors: [], suggestions: [] });
  const [selectedSpecialist, setSelectedSpecialist] = useState<AISpecialistType>(AISpecialistType.ALEXEY);
  const [aiSuggestions, setAiSuggestions] = useState<CodeSuggestion[]>([]);
  const [isAISuggestionsVisible, setIsAISuggestionsVisible] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    from: 'user' | 'ai';
    message: string;
    timestamp: Date;
    specialist?: AISpecialistType;
  }>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const codeRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Mock AI suggestions based on code analysis
  useEffect(() => {
    const analyzeCode = async () => {
      if (!code.trim()) return;

      // Simulate code analysis
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockSuggestions: CodeSuggestion[] = [
        {
          id: '1',
          line: 1,
          content: `// Оптимизированная версия с мемоизацией\nfunction fibonacci(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  return memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);\n}`,
          explanation: 'Рекурсивная версия без мемоизации имеет экспоненциальную сложность O(2^n). Добавление мемоизации снизит сложность до O(n).',
          confidence: 0.95,
          type: 'optimization'
        },
        {
          id: '2',
          line: 6,
          content: `// Более эффективное решение с итеративным подходом\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}`,
          explanation: 'Итеративная версия более эффективна по памяти и производительности для больших значений n.',
          confidence: 0.88,
          type: 'optimization'
        },
        {
          id: '3',
          line: 6,
          content: `// Добавим валидацию входных данных\nfunction fibonacci(n) {\n  if (typeof n !== 'number' || n < 0 || !Number.isInteger(n)) {\n    throw new Error('Input must be a non-negative integer');\n  }\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`,
          explanation: 'Добавление проверки входных параметров предотвратит ошибки и сделает функцию более надежной.',
          confidence: 0.92,
          type: 'fix'
        }
      ];

      const mockErrors = [
        {
          line: 2,
          message: 'Рекурсивная функция без мемоизации может вызвать stack overflow для больших значений n',
          severity: 'warning' as const
        },
        {
          line: 6,
          message: 'Отсутствует проверка входных параметров',
          severity: 'info' as const
        }
      ];

      setDebugInfo({
        errors: mockErrors,
        suggestions: mockSuggestions
      });

      setAiSuggestions(mockSuggestions);
    };

    analyzeCode();
  }, [code]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Выполнение кода...\n');

    try {
      // Mock code execution - in real app, this would run code in sandbox
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate execution result
      const result = `> fibonacci(10)
55
> fibonacci(15)
610
> fibonacci(20)
6765

Код выполнен успешно!`;

      setOutput(result);
    } catch (error) {
      setOutput(`Ошибка выполнения:\n${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const applySuggestion = (suggestion: CodeSuggestion) => {
    // Apply the suggestion to code
    setCode(suggestion.content);

    // Remove the applied suggestion
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

    // Add success message
    addChatMessage('ai', `Предложение "${suggestion.explanation.slice(0, 50)}..." применено!`, selectedSpecialist);
  };

  const addChatMessage = (from: 'user' | 'ai', message: string, specialist?: AISpecialistType) => {
    const newMessage = {
      id: Date.now().toString(),
      from,
      message,
      timestamp: new Date(),
      specialist
    };
    setChatMessages(prev => [...prev.slice(-19), newMessage]); // Keep last 20 messages
  };

  const sendChatMessage = async () => {
    if (!currentMessage.trim() || !session?.user?.id) return;

    addChatMessage('user', currentMessage);

    const userMessage = currentMessage;
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const response = await aiTeamManager.chat({
        message: `Помоги с кодом: ${userMessage}\n\nТекущий код:\n${code}`,
        specialist: selectedSpecialist,
        context: {
          userId: session.user.id,
          userActivity: 'pair_programming'
        }
      });

      addChatMessage('ai', response.message, selectedSpecialist);
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage('ai', 'Извините, произошла ошибка. Попробуйте еще раз.', selectedSpecialist);
    } finally {
      setIsTyping(false);
    }
  };

  const getSuggestionIcon = (type: CodeSuggestion['type']) => {
    switch (type) {
      case 'completion': return <Code className="h-4 w-4" />;
      case 'fix': return <AlertTriangle className="h-4 w-4" />;
      case 'optimization': return <Zap className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (type: CodeSuggestion['type']) => {
    switch (type) {
      case 'completion': return 'text-blue-500';
      case 'fix': return 'text-red-500';
      case 'optimization': return 'text-green-500';
      case 'security': return 'text-orange-500';
      default: return 'text-purple-500';
    }
  };

  const specialistInfo = aiTeamManager.getSpecialist(selectedSpecialist);

  return (
    <div className={cn("w-full h-full flex flex-col space-y-4", className)}>
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-500" />
              <div>
                <h2 className="font-semibold">AI Pair Programming Studio</h2>
                <p className="text-sm text-muted-foreground">
                  Совместное программирование с AI-наставником
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {specialistInfo?.avatar || '🤖'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{specialistInfo?.name}</p>
                  <p className="text-muted-foreground">{specialistInfo?.role}</p>
                </div>
              </div>

              <select
                value={selectedSpecialist}
                onChange={(e) => setSelectedSpecialist(e.target.value as AISpecialistType)}
                className="px-3 py-1 text-sm border rounded"
              >
                <option value={AISpecialistType.ALEXEY}>Алексей (Code Review)</option>
                <option value={AISpecialistType.DMITRY}>Дмитрий (Архитектура)</option>
                <option value={AISpecialistType.PAVEL}>Павел (Performance)</option>
                <option value={AISpecialistType.OLGA}>Ольга (Security)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Code Editor */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Редактор кода</CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={languageState}
                  onChange={(e) => setLanguageState(e.target.value)}
                  className="px-2 py-1 text-sm border rounded"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>

                <Button
                  size="sm"
                  onClick={runCode}
                  disabled={isRunning}
                  variant="outline"
                >
                  {isRunning ? (
                    <Square className="h-4 w-4 mr-1" />
                  ) : (
                    <Play className="h-4 w-4 mr-1" />
                  )}
                  {isRunning ? 'Остановить' : 'Запустить'}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <Textarea
              ref={codeRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Напишите ваш код здесь..."
              className="w-full h-full resize-none border-0 rounded-none font-mono text-sm min-h-[400px]"
            />

            {/* Output Panel */}
            <div className="border-t bg-muted/50">
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="text-sm font-medium">Вывод программы</span>
                </div>
                <ScrollArea ref={outputRef} className="h-32 w-full">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {output || 'Нажмите "Запустить" для выполнения кода...'}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions & Chat */}
        <div className="w-96 flex flex-col gap-4">
          {/* AI Suggestions */}
          {isAISuggestionsVisible && (
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    AI Предложения
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAISuggestionsVisible(false)}
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {aiSuggestions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        AI анализирует ваш код...
                      </p>
                    ) : (
                      aiSuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={cn("p-1 rounded", getSuggestionColor(suggestion.type))}>
                                {getSuggestionIcon(suggestion.type)}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.confidence * 100}% уверенность
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => applySuggestion(suggestion)}
                            >
                              Применить
                            </Button>
                          </div>

                          <p className="text-sm mb-2">{suggestion.explanation}</p>

                          <div className="bg-muted p-2 rounded text-xs font-mono">
                            {suggestion.content.split('\n').slice(0, 3).join('\n')}
                            {suggestion.content.split('\n').length > 3 && '\n...'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {!isAISuggestionsVisible && (
            <Button
              variant="outline"
              onClick={() => setIsAISuggestionsVisible(true)}
              className="self-start"
            >
              <Eye className="h-4 w-4 mr-2" />
              Показать предложения AI
            </Button>
          )}

          {/* Debug Info */}
          {debugInfo.errors.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Замечания ({debugInfo.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debugInfo.errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className={cn(
                        "h-4 w-4 mt-0.5",
                        error.severity === 'error' ? "text-red-500" :
                        error.severity === 'warning' ? "text-orange-500" : "text-blue-500"
                      )} />
                      <div className="flex-1">
                        <p className="text-sm">Строка {error.line}: {error.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat with AI */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Обсуждение кода
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={cn(
                      "flex gap-2",
                      msg.from === "user" ? "justify-end" : "justify-start"
                    )}>
                      {msg.from === "ai" && (
                        <Avatar className="h-6 w-6 mt-1">
                          <AvatarFallback className="text-xs">
                            {msg.specialist ? aiTeamManager.getSpecialist(msg.specialist)?.avatar : '🤖'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        msg.from === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      )}>
                        {msg.message}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-2 justify-start">
                      <Avatar className="h-6 w-6 mt-1">
                        <AvatarFallback className="text-xs">
                          {specialistInfo?.avatar || '🤖'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse text-sm text-muted-foreground">
                            {specialistInfo?.name} печатает...
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder={`Спросите ${specialistInfo?.name} о коде...`}
                    className="flex-1"
                  />
                  <Button onClick={sendChatMessage} disabled={!currentMessage.trim()}>
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
