"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Brain,
  Send,
  Bot,
  User,
  Zap,
  Sparkles,
  MessageSquare,
  Settings,
  Minimize2,
  Maximize2,
  X,
  RefreshCw,
  Loader2
} from "lucide-react";

interface ChatMessage {
  id: string;
  from: 'user' | 'vasily';
  message: string;
  timestamp: Date;
  isTyping?: boolean;
  isSimulating?: boolean;
}

interface VasilyStatus {
  isOnline: boolean;
  mood: string;
  statusMessage: string;
  currentTask?: string;
}

export default function VasilyPageClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [vasilyStatus, setVasilyStatus] = useState<VasilyStatus>({
    isOnline: true,
    mood: "productive",
    statusMessage: "Готов к работе!",
    currentTask: "Анализ проектов"
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Инициализируем с приветственным сообщением Василия
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        from: 'vasily',
        message: "Привет! Я Василий, ваш AI-менеджер проектов. Я анализирую ваши задачи, оптимизирую процессы и помогаю принимать решения. Чем могу помочь?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Симуляция работы Василия
  const simulateVasilyWork = async () => {
    setIsSimulating(true);
    setVasilyStatus(prev => ({
      ...prev,
      currentTask: "Анализ данных...",
      statusMessage: "Обрабатываю информацию"
    }));

    // Симуляция различных задач Василия
    const tasks = [
      "Анализирую метрики проекта...",
      "Проверяю дедлайны...",
      "Оптимизирую процессы...",
      "Генерирую рекомендации...",
      "Обновляю статусы задач..."
    ];

    for (const task of tasks) {
      setVasilyStatus(prev => ({
        ...prev,
        currentTask: task,
        statusMessage: "Работаю над задачей"
      }));
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsSimulating(false);
    setVasilyStatus(prev => ({
      ...prev,
      currentTask: "Готов к общению",
      statusMessage: "Анализ завершен"
    }));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      from: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    // Симуляция работы Василия перед ответом
    await simulateVasilyWork();

    try {
      const response = await fetch('/api/vasily/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          workspaceId: 'demo-workspace',
          projectId: 'demo-project'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const vasilyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          from: 'vasily',
          message: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, vasilyMessage]);
      } else {
        const vasilyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          from: 'vasily',
          message: "Извините, произошла ошибка. Попробуйте еще раз.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, vasilyMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const vasilyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'vasily',
        message: "Извините, произошла ошибка. Попробуйте еще раз.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, vasilyMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'productive': return 'text-green-400';
      case 'thinking': return 'text-blue-400';
      case 'excited': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'productive': return '🚀';
      case 'thinking': return '🤔';
      case 'excited': return '✨';
      default: return '🤖';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Василий AI</h1>
                <p className="text-white/60 text-sm">AI-менеджер проектов</p>
              </div>
            </div>

            {/* Статус Василия */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${vasilyStatus.isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-white/80 text-sm">
                  {vasilyStatus.isOnline ? 'Онлайн' : 'Офлайн'}
                </span>
              </div>

              <Badge className={`${getMoodColor(vasilyStatus.mood)} bg-white/10 border-white/20`}>
                {getMoodEmoji(vasilyStatus.mood)} {vasilyStatus.statusMessage}
              </Badge>

              {isSimulating && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  {vasilyStatus.currentTask}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20 h-[600px] flex flex-col">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Чат с Василием
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.from === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.from === 'vasily' ? '/ai-avatar.jpg' : undefined} />
                        <AvatarFallback className="bg-white/10 text-white text-sm">
                          {message.from === 'vasily' ? 'V' : 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.from === 'user'
                            ? 'bg-white/10 text-white'
                            : 'bg-white/5 text-white/90'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.message}</div>
                        <div className="text-xs text-white/50 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-white/10 text-white text-sm">V</AvatarFallback>
                      </Avatar>
                      <div className="bg-white/5 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <span className="text-white/60 text-sm ml-2">Василий печатает...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Input Area */}
              <div className="p-6 border-t border-white/10">
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Напишите сообщение Василию..."
                    className="flex-1 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    disabled={isTyping || isSimulating}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isTyping || isSimulating}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    {isTyping || isSimulating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Василий Статус */}
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Статус Василия
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Статус</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {vasilyStatus.isOnline ? 'Онлайн' : 'Офлайн'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Настроение</span>
                  <span className="text-white">{getMoodEmoji(vasilyStatus.mood)} {vasilyStatus.mood}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-white/60 text-sm">Текущая задача</span>
                  <p className="text-white text-sm">{vasilyStatus.currentTask}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-white/60 text-sm">Сообщение</span>
                  <p className="text-white text-sm">{vasilyStatus.statusMessage}</p>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые команды */}
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Быстрые команды
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white/60 hover:text-white"
                  onClick={() => setInputMessage("/joke")}
                >
                  🎭 Расскажи шутку
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white/60 hover:text-white"
                  onClick={() => setInputMessage("/mood")}
                >
                  😊 Покажи настроение
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white/60 hover:text-white"
                  onClick={() => setInputMessage("/help")}
                >
                  ❓ Помощь
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white/60 hover:text-white"
                  onClick={() => setInputMessage("Покажи статистику проектов")}
                >
                  📊 Статистика
                </Button>
              </CardContent>
            </Card>

            {/* AI Возможности */}
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Возможности
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white/60 text-sm">
                  <p>• Анализ проектов</p>
                  <p>• Оптимизация процессов</p>
                  <p>• Предсказание рисков</p>
                  <p>• Автоматизация задач</p>
                  <p>• Генерация отчетов</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
