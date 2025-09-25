"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Sparkles, 
  MessageCircle, 
  Lightbulb, 
  TrendingUp,
  Calendar,
  Users,
  Zap,
  X
} from "lucide-react";

interface WelcomeMessage {
  id: string;
  type: "welcome" | "suggestion" | "tip" | "achievement";
  title: string;
  content: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  emoji: string;
  priority: "low" | "medium" | "high";
}

interface AIWelcomeSystemProps {
  user?: {
    name: string;
    email: string;
  };
  onClose?: () => void;
}

export function AIWelcomeSystem({ user, onClose }: AIWelcomeSystemProps) {
  const [messages, setMessages] = useState<WelcomeMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Генерируем персонализированные приветственные сообщения
    const generateWelcomeMessages = (): WelcomeMessage[] => {
      const baseMessages: WelcomeMessage[] = [
        {
          id: "welcome-1",
          type: "welcome",
          title: "Добро пожаловать в DeadLine! 🚀",
          content: `Привет, ${user?.name || "пользователь"}! Я Василий, ваш AI-ассистент. Готов помочь с управлением проектами и задачами.`,
          emoji: "👋",
          priority: "high"
        },
        {
          id: "suggestion-1",
          type: "suggestion",
          title: "Начните с создания проекта",
          content: "Создайте свой первый проект, чтобы начать работу с DeadLine. Я помогу настроить все необходимые компоненты.",
          action: {
            label: "Создать проект",
            onClick: () => window.location.href = "/projects"
          },
          emoji: "📁",
          priority: "high"
        },
        {
          id: "tip-1",
          type: "tip",
          title: "Полезный совет",
          content: "Используйте команды в чате с Василием: /joke для шуток, /mood для настроения, /help для помощи.",
          emoji: "💡",
          priority: "medium"
        },
        {
          id: "suggestion-2",
          type: "suggestion",
          title: "Пригласите команду",
          content: "Работайте эффективнее вместе! Пригласите коллег в ваш проект для совместной работы.",
          action: {
            label: "Управление командой",
            onClick: () => window.location.href = "/team"
          },
          emoji: "👥",
          priority: "medium"
        },
        {
          id: "tip-2",
          type: "tip",
          title: "AI-функции",
          content: "DeadLine оснащен умными функциями: автоматическое планирование спринтов, умное назначение задач и аналитика.",
          emoji: "🤖",
          priority: "low"
        }
      ];

      // Добавляем контекстные сообщения в зависимости от времени
      const hour = new Date().getHours();
      if (hour < 12) {
        baseMessages.push({
          id: "morning-1",
          type: "tip",
          title: "Доброе утро! ☀️",
          content: "Отличное время для планирования дня! Создайте задачи и назначьте приоритеты.",
          emoji: "🌅",
          priority: "medium"
        });
      } else if (hour < 18) {
        baseMessages.push({
          id: "afternoon-1",
          type: "tip",
          title: "Продуктивный день! ⚡",
          content: "Проверьте прогресс ваших задач и обновите статусы. Василий может помочь с аналитикой.",
          emoji: "📊",
          priority: "medium"
        });
      } else {
        baseMessages.push({
          id: "evening-1",
          type: "tip",
          title: "Время подвести итоги 🌙",
          content: "Посмотрите на достижения дня и запланируйте задачи на завтра.",
          emoji: "📝",
          priority: "low"
        });
      }

      return baseMessages;
    };

    const welcomeMessages = generateWelcomeMessages();
    setMessages(welcomeMessages);

    // Автоматически показываем следующее сообщение через 5 секунд
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        if (prev < welcomeMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const currentMessage = messages[currentMessageIndex];

  const handleNext = () => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    } else {
      setIsVisible(false);
      onClose?.();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || !currentMessage) {
    return null;
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "welcome":
        return <Bot className="h-5 w-5 text-blue-400" />;
      case "suggestion":
        return <Lightbulb className="h-5 w-5 text-yellow-400" />;
      case "tip":
        return <Sparkles className="h-5 w-5 text-purple-400" />;
      case "achievement":
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      default:
        return <MessageCircle className="h-5 w-5 text-white/60" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl shadow-white/10 animate-in slide-in-from-right duration-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getMessageIcon(currentMessage.type)}
              <Badge className={getPriorityColor(currentMessage.priority)}>
                {currentMessage.type === "welcome" ? "Приветствие" :
                 currentMessage.type === "suggestion" ? "Предложение" :
                 currentMessage.type === "tip" ? "Совет" : "Достижение"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">{currentMessage.emoji}</span>
              {currentMessage.title}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {currentMessage.content}
            </p>
          </div>

          {currentMessage.action && (
            <div className="mb-4">
              <Button
                onClick={currentMessage.action.onClick}
                size="sm"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white"
              >
                {currentMessage.action.label}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {messages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentMessageIndex 
                        ? "bg-white" 
                        : index < currentMessageIndex 
                          ? "bg-white/60" 
                          : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-white/50">
                {currentMessageIndex + 1} из {messages.length}
              </span>
            </div>

            <div className="flex gap-2">
              {currentMessageIndex < messages.length - 1 ? (
                <Button
                  onClick={handleNext}
                  size="sm"
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  Далее
                </Button>
              ) : (
                <Button
                  onClick={handleSkip}
                  size="sm"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white"
                >
                  Понятно
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
