"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  Lightbulb,
  TrendingUp,
  FileText,
  X,
  Check,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  context?: any;
}

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  priority: string;
  estimatedHours: number;
  reasoning: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

interface AIAssistantProps {
  workspaceId?: string;
  projectId?: string;
  className?: string;
}

export function AIAssistant({ workspaceId, projectId, className }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage.content,
          workspaceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: "ai",
        content: data.response,
        timestamp: new Date(),
        context: data.context,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: "ai",
        content: "Извините, произошла ошибка. Попробуйте еще раз.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!workspaceId) {
      console.warn("WorkspaceId is required for generating suggestions");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          projectId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to generate suggestions: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Проверяем, что данные корректны
      if (data && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        console.warn("Invalid suggestions data received:", data);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      // Показываем пользователю уведомление об ошибке
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: "ai",
        content: "Не удалось сгенерировать предложения. Проверьте подключение к API.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptSuggestion = async (suggestionId: string) => {
    try {
      const response = await fetch("/api/ai/create-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: suggestions.find(s => s.id === suggestionId)?.title,
          description: suggestions.find(s => s.id === suggestionId)?.description,
          projectId,
          workspaceId,
          useAI: true,
        }),
      });

      if (response.ok) {
        setSuggestions(prev => 
          prev.map(s => 
            s.id === suggestionId ? { ...s, status: "ACCEPTED" } : s
          )
        );
      }
    } catch (error) {
      console.error("Error accepting suggestion:", error);
    }
  };

  const rejectSuggestion = (suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestionId ? { ...s, status: "REJECTED" } : s
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGHEST":
        return "bg-black/50 text-white border-white/30";
      case "HIGH":
        return "bg-black/50 text-white border-white/30";
      case "MEDIUM":
        return "bg-black/50 text-white border-white/30";
      case "LOW":
        return "bg-black/50 text-white border-white/30";
      case "LOWEST":
        return "bg-black/50 text-white border-white/30";
      default:
        return "bg-black/50 text-white border-white/30";
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full bg-black hover:bg-black/80 text-white shadow-lg hover:shadow-xl transition-all duration-200 z-50 border border-white/20",
          className
        )}
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 w-96 h-[600px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl z-50 flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-white" />
          <h3 className="text-white font-semibold">Василий - AI Team Lead</h3>
          <Badge className="bg-black/50 text-white border-white/30 text-xs">
            GPT-4o-mini
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSuggestions}
            disabled={isLoading}
            className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-auto"
            title="Предложить задачи"
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-white/60" />
              <p className="text-white/60 text-sm">
                Привет! Я Василий - AI Team Lead DeadLine. Помогу составить задачи, спланировать проект и оптимизировать работу команды. Что будем делать?
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-lg",
                  message.type === "user"
                    ? "bg-black/50 text-white border border-white/30"
                    : "bg-black/30 text-white border border-white/20"
                )}
              >
                <p className="text-sm">{message.content}</p>
                {message.context && message.context.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-xs text-white/60 mb-1">Контекст:</p>
                    {message.context.slice(0, 2).map((task: any, index: number) => (
                      <div key={index} className="text-xs text-white/70">
                        • {task.title} ({task.status})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white border border-white/20 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Думаю...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Спросите AI-ассистента..."
            className="flex-1 bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-black hover:bg-black/80 text-white border border-white/20"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Предложения ИИ
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(false)}
              className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-white font-medium text-sm">
                    {suggestion.title}
                  </h5>
                  <Badge className={getPriorityColor(suggestion.priority)}>
                    {suggestion.priority}
                  </Badge>
                </div>
                
                <p className="text-white/70 text-xs mb-2">
                  {suggestion.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">
                    ~{suggestion.estimatedHours}ч
                  </div>
                  
                  {suggestion.status === "PENDING" && (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        onClick={() => acceptSuggestion(suggestion.id)}
                        className="bg-black/50 hover:bg-black/70 text-white border border-white/30 p-1 h-auto"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => rejectSuggestion(suggestion.id)}
                        className="bg-black/50 hover:bg-black/70 text-white border border-white/30 p-1 h-auto"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {suggestion.status === "ACCEPTED" && (
                    <Badge className="bg-black/50 text-white border-white/30">
                      Принято
                    </Badge>
                  )}
                  
                  {suggestion.status === "REJECTED" && (
                    <Badge className="bg-black/50 text-white border-white/30">
                      Отклонено
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
