"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  MessageSquare,
  Users,
  ChevronDown,
  X,
  Plus,
  Settings,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AISpecialistType, AISpecialistInfo, aiTeamManager } from "@/lib/ai/core/ai-team-manager";
import { useSession } from "@/lib/auth-client";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  specialist?: AISpecialistInfo;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
}

interface AITeamChatProps {
  workspaceId?: string;
  projectId?: string;
  className?: string;
  compact?: boolean;
}

export function AITeamChat({ workspaceId, projectId, className, compact = false }: AITeamChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<AISpecialistType>(AISpecialistType.VASILY);
  const [specialists, setSpecialists] = useState<AISpecialistInfo[]>([]);
  const [isSpecialistSelectorOpen, setIsSpecialistSelectorOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load specialists on mount
  useEffect(() => {
    const loadSpecialists = async () => {
      try {
        const response = await fetch('/api/ai/team-chat/specialists', {
          headers: {
            'x-user-id': session?.user?.id || '',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSpecialists(data.data.available);
        } else {
          // Fallback to local data
          setSpecialists(aiTeamManager.getAvailableSpecialists());
        }
      } catch (error) {
        console.error('Failed to load specialists:', error);
        setSpecialists(aiTeamManager.getAvailableSpecialists());
      }
    };

    if (session?.user?.id) {
      loadSpecialists();
    }
  }, [session?.user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !session?.user?.id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/team-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id
        },
        body: JSON.stringify({
          message: userMessage.content,
          specialist: selectedSpecialist,
          workspaceId,
          projectId,
          context: {
            userActivity: 'chat'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.data.message,
        timestamp: new Date(data.data.timestamp),
        specialist: data.data.specialist,
        suggestions: data.data.suggestions,
        actions: data.data.actions
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "ai",
        content: "Извините, произошла ошибка. Попробуйте еще раз.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecialistChange = (specialistId: AISpecialistType) => {
    setSelectedSpecialist(specialistId);
    setIsSpecialistSelectorOpen(false);

    // Add system message about specialist change
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: "ai",
      content: `Теперь вы общаетесь с ${specialists.find(s => s.id === specialistId)?.name || specialistId}. Чем могу помочь?`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, systemMessage]);
  };

  const handleActionClick = (action: { type: string; label: string; data: any }) => {
    // Handle different action types
    switch (action.type) {
      case 'create_task':
        // Emit event or call parent function
        console.log('Create task:', action.data);
        break;
      case 'view_analytics':
        console.log('View analytics:', action.data);
        break;
      default:
        console.log('Action clicked:', action);
    }
  };

  const currentSpecialist = specialists.find(s => s.id === selectedSpecialist);

  if (compact) {
    return (
      <div className={cn("w-full max-w-md", className)}>
        <Card className="h-96 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {currentSpecialist?.avatar || '🤖'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm">{currentSpecialist?.name || 'AI'}</CardTitle>
                  <CardDescription className="text-xs">
                    {currentSpecialist?.role || 'AI Assistant'}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSpecialistSelectorOpen(!isSpecialistSelectorOpen)}
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-3">
            <ScrollArea ref={scrollAreaRef} className="flex-1 pr-3">
              <div className="space-y-3">
                {messages.slice(-3).map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2 text-sm",
                      message.type === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.type === "ai" && (
                      <Avatar className="h-6 w-6 mt-0.5">
                        <AvatarFallback className="text-xs">
                          {message.specialist?.avatar || '🤖'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2",
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="h-6 w-6 mt-0.5">
                      <AvatarFallback className="text-xs">
                        {currentSpecialist?.avatar || '🤖'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Спросите AI..."
                className="text-sm"
                disabled={isLoading}
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-lg">
                  {currentSpecialist?.avatar || '🤖'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentSpecialist?.name || 'AI Team'}
                  <Badge variant="secondary" className="text-xs">
                    {currentSpecialist?.role || 'AI Assistant'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {currentSpecialist?.specialization || 'AI-powered assistance'}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSpecialistSelectorOpen(!isSpecialistSelectorOpen)}
              >
                <Users className="h-4 w-4 mr-2" />
                Сменить специалиста
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Specialist Selector */}
          {isSpecialistSelectorOpen && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Выберите AI специалиста</CardTitle>
                <CardDescription>
                  Каждый специалист имеет уникальные навыки и экспертизу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specialists.map((specialist) => (
                    <Button
                      key={specialist.id}
                      variant={selectedSpecialist === specialist.id ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => handleSpecialistChange(specialist.id)}
                    >
                      <div className="text-2xl">{specialist.avatar}</div>
                      <div className="text-center">
                        <div className="font-medium text-sm">{specialist.name}</div>
                        <div className="text-xs text-muted-foreground">{specialist.role}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-3">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Начните разговор с {currentSpecialist?.name || 'AI'}</p>
                  <p className="text-sm mt-2">
                    {currentSpecialist?.specialization || 'Получите помощь с вашими задачами'}
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.type === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.type === "ai" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>
                        {message.specialist?.avatar || currentSpecialist?.avatar || '🤖'}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="max-w-[70%]">
                    <div
                      className={cn(
                        "rounded-lg px-4 py-3",
                        message.type === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      )}
                    >
                      {message.content}
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setInput(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleActionClick(action)}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>
                      {currentSpecialist?.avatar || '🤖'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {currentSpecialist?.name || 'AI'} думает...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-3 mt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={`Спросите ${currentSpecialist?.name || 'AI'}...`}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
