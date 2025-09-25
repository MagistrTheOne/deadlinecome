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
  Lightbulb
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

export function VasilyChat() {
  const [messages, setMessages] = useState<VasilyMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [vasilyStatus, setVasilyStatus] = useState<VasilyResponse | null>(null);
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

  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20 h-full min-h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Василий
            {vasilyStatus && (
              <span className="text-2xl">{vasilyStatus.emoji}</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearChat}
              className="text-white/60 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {vasilyStatus && (
          <div className="text-white/70 text-sm italic">
            "{vasilyStatus.statusMessage}"
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/60 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Привет! Я Василий 🤖</p>
              <p className="text-sm">
                Могу помочь с проектами, ответить на вопросы или просто поболтать!
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-xs text-white/50">Попробуй команды:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="text-xs">/joke</Badge>
                  <Badge variant="outline" className="text-xs">/mood</Badge>
                  <Badge variant="outline" className="text-xs">/help</Badge>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "vasily" && (
                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-lg">{message.emoji || "🤖"}</span>
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.type === "user"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white border border-white/20"
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
                          className="text-xs h-6 px-2 bg-white/5 hover:bg-white/10 text-white/80"
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
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-black" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2">
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
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напиши Василию..."
              className="flex-1 bg-black/50 border-white/20 text-white placeholder-white/50 focus:border-white/40"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              variant="default"
              size="sm"
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
              className="text-xs text-white/60 hover:text-white"
            >
              <Smile className="h-3 w-3 mr-1" />
              Шутка
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInput("/mood")}
              className="text-xs text-white/60 hover:text-white"
            >
              <Zap className="h-3 w-3 mr-1" />
              Настроение
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInput("/help")}
              className="text-xs text-white/60 hover:text-white"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Помощь
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
