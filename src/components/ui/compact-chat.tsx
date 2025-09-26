"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User,
  X,
  MoreVertical
} from "lucide-react";

interface ChatMessage {
  id: string;
  from: 'user' | 'ai';
  message: string;
  timestamp: Date;
  aiId?: string;
}

interface CompactChatProps {
  isOpen: boolean;
  onToggle: () => void;
  onMinimize: () => void;
}

export function CompactChat({ isOpen, onToggle, onMinimize }: CompactChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Инициализируем с приветственным сообщением
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          from: 'ai',
          message: "Привет! Я Василий, ваш AI-ассистент. Чем могу помочь?",
          timestamp: new Date(),
          aiId: 'vasily'
        }
      ]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          from: 'ai',
          message: data.message,
          timestamp: new Date(),
          aiId: 'vasily'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          from: 'ai',
          message: "Извините, произошла ошибка. Попробуйте еще раз.",
          timestamp: new Date(),
          aiId: 'vasily'
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        message: "Извините, произошла ошибка. Попробуйте еще раз.",
        timestamp: new Date(),
        aiId: 'vasily'
      };
      setMessages(prev => [...prev, aiMessage]);
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

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl z-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-white" />
            Василий AI
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              Онлайн
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col h-full p-0">
        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.from === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={message.from === 'ai' ? '/ai-avatar.jpg' : undefined} />
                <AvatarFallback className="bg-white/10 text-white text-xs">
                  {message.from === 'ai' ? 'V' : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div
                className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  message.from === 'user'
                    ? 'bg-white/10 text-white'
                    : 'bg-white/5 text-white/90'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.message}</div>
                <div className="text-xs text-white/50 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-white/10 text-white text-xs">V</AvatarFallback>
              </Avatar>
              <div className="bg-white/5 text-white/90 p-2 rounded-lg text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Ввод сообщения */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="flex-1 bg-white/5 border-white/20 text-white placeholder-white/50"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
