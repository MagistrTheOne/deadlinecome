"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Smile, 
  Zap,
  MessageCircle,
  Lightbulb,
  Minimize2,
  Maximize2,
  Move,
  X
} from "lucide-react";

interface VasilyMessage {
  id: string;
  type: "user" | "vasily";
  content: string;
  mood?: string;
  emoji?: string;
  suggestions?: string[];
  timestamp: Date;
}

interface VasilyResponse {
  response: string;
  mood: string;
  emoji: string;
  statusMessage: string;
  suggestions?: string[];
  isProjectRelated: boolean;
  memoryUsed?: boolean;
}

interface ChatPosition {
  x: number;
  y: number;
}

interface ChatSize {
  width: number;
  height: number;
}

export function DraggableVasilyChat() {
  const [messages, setMessages] = useState<VasilyMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [vasilyStatus, setVasilyStatus] = useState<VasilyResponse | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<ChatPosition>({ x: 20, y: 20 });
  const [size, setSize] = useState<ChatSize>({ width: 400, height: 600 });
  const [dragStart, setDragStart] = useState<ChatPosition>({ x: 0, y: 0 });
  
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Загружаем начальный статус Василия
    fetchVasilyStatus();
    
    // Автоматическое приветствие при первом открытии
    if (messages.length === 0) {
      setTimeout(() => {
        const welcomeMessage: VasilyMessage = {
          id: crypto.randomUUID(),
          type: "vasily",
          content: "Привет! Я Василий 🤖\n\nЧем могу помочь? Могу:\n• Помочь с проектами\n• Ответить на вопросы\n• Дать совет по задачам\n• Просто поболтать!\n\nПопробуй команды: /joke, /mood, /help",
          mood: "happy",
          emoji: "👋",
          suggestions: ["Расскажи о проектах", "Покажи статистику", "Помоги с задачами"],
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }, 1000);
    }
  }, []);

  const fetchVasilyStatus = async () => {
    try {
      const response = await fetch('/api/ai/status');
      if (response.ok) {
        const data = await response.json();
        if (data.vasily) {
          setVasilyStatus({
            response: "",
            mood: data.vasily.mood,
            emoji: data.vasily.emoji,
            statusMessage: data.vasily.statusMessage,
            suggestions: [],
            isProjectRelated: false
          });
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса Василия:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: VasilyMessage = {
      id: crypto.randomUUID(),
      type: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input.trim()
        }),
      });

      if (response.ok) {
        const vasilyResponse: VasilyResponse = await response.json();
        
        const vasilyMessage: VasilyMessage = {
          id: crypto.randomUUID(),
          type: "vasily",
          content: vasilyResponse.response,
          mood: vasilyResponse.mood,
          emoji: vasilyResponse.emoji,
          suggestions: vasilyResponse.suggestions,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, vasilyMessage]);
        setVasilyStatus(vasilyResponse);
      } else {
        throw new Error('Ошибка API');
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      
      const errorMessage: VasilyMessage = {
        id: crypto.randomUUID(),
        type: "vasily",
        content: "Извини, у меня технические трудности... Попробуй еще раз! 🔧",
        mood: "tired",
        emoji: "😴",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Ограничиваем позицию в пределах экрана
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - (isMinimized ? 60 : size.height);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Сохраняем позицию в localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('vasily-chat-position');
    const savedSize = localStorage.getItem('vasily-chat-size');
    const savedMinimized = localStorage.getItem('vasily-chat-minimized');
    
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
    if (savedSize) {
      setSize(JSON.parse(savedSize));
    }
    if (savedMinimized) {
      setIsMinimized(JSON.parse(savedMinimized));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vasily-chat-position', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem('vasily-chat-size', JSON.stringify(size));
  }, [size]);

  useEffect(() => {
    localStorage.setItem('vasily-chat-minimized', JSON.stringify(isMinimized));
  }, [isMinimized]);

  return (
    <div
      ref={chatRef}
      className={`fixed z-50 transition-all duration-300 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 300 : size.width,
        height: isMinimized ? 60 : size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="bg-black backdrop-blur-xl border border-white/20 shadow-2xl shadow-white/10 h-full flex flex-col">
        <CardHeader 
          className="pb-3 cursor-grab active:cursor-grabbing select-none"
          data-drag-handle
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Василий
              {vasilyStatus && (
                <span className="text-2xl">{vasilyStatus.emoji}</span>
              )}
              <Move className="h-4 w-4 text-white/40" />
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearChat}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!isMinimized && vasilyStatus && (
            <div className="text-white/70 text-sm italic">
              "{vasilyStatus.statusMessage}"
            </div>
          )}
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "vasily" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-lg">{message.emoji || "🤖"}</span>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 backdrop-blur-sm ${
                      message.type === "user"
                        ? "bg-white text-black shadow-lg"
                        : "bg-black/50 text-white border border-white/20 shadow-lg"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs opacity-70 mb-2">Предложения:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs h-6 px-2 bg-white/5 hover:bg-white/10 text-white/80 backdrop-blur-sm"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs opacity-50 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {message.type === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-4 w-4 text-black" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 backdrop-blur-sm shadow-lg">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Василий думает...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода */}
            <div className="p-4 border-t border-white/10 bg-black backdrop-blur-sm">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напиши Василию..."
                  className="flex-1 bg-black border-white/20 text-white placeholder-white/50 focus:border-white/40 backdrop-blur-sm"
                  disabled={loading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  variant="default"
                  size="sm"
                  className="bg-white text-black hover:bg-white/90 backdrop-blur-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Быстрые команды */}
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput("/joke")}
                  className="text-xs text-white/60 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Smile className="h-3 w-3 mr-1" />
                  Шутка
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput("/mood")}
                  className="text-xs text-white/60 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Настроение
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput("/help")}
                  className="text-xs text-white/60 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Помощь
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
