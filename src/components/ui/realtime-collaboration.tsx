"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  UserPlus,
  MessageCircle,
  Code,
  Play,
  Share,
  Copy,
  Save,
  Eye,
  EyeOff,
  Zap,
  Wifi,
  WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
  isTyping: boolean;
  lastSeen: Date;
}

interface CollaborationSession {
  id: string;
  name: string;
  language: string;
  code: string;
  collaborators: Collaborator[];
  createdAt: Date;
  isActive: boolean;
}

interface RealtimeCollaborationProps {
  className?: string;
  initialCode?: string;
  language?: string;
}

export function RealtimeCollaboration({
  className,
  initialCode = '// Начните совместное программирование\nconsole.log("Hello, World!");',
  language = 'javascript'
}: RealtimeCollaborationProps) {
  const { data: session } = useSession();
  const [code, setCode] = useState(initialCode);
  const [languageState, setLanguageState] = useState(language);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    user: string;
    message: string;
    timestamp: Date;
    type: 'message' | 'code_change' | 'join' | 'leave';
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const codeRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock collaborators for demo
  const mockCollaborators: Collaborator[] = [
    {
      id: '1',
      name: 'Алексей',
      avatar: '👨‍💻',
      color: '#3B82F6',
      cursor: { line: 2, column: 10 },
      isTyping: false,
      lastSeen: new Date()
    },
    {
      id: '2',
      name: 'Мария',
      avatar: '👩‍💼',
      color: '#EC4899',
      cursor: { line: 4, column: 5 },
      isTyping: true,
      lastSeen: new Date()
    },
    {
      id: '3',
      name: 'Дмитрий',
      avatar: '👨‍🏗️',
      color: '#10B981',
      cursor: { line: 1, column: 15 },
      isTyping: false,
      lastSeen: new Date()
    }
  ];

  // Initialize WebSocket connection
  useEffect(() => {
    if (session?.user?.id) {
      initializeWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [session?.user?.id]);

  const initializeWebSocket = () => {
    try {
      // Mock WebSocket connection (in real app, connect to actual WS server)
      setIsConnected(true);
      setCollaborators(mockCollaborators);

      // Simulate real-time updates
      const interval = setInterval(() => {
        setCollaborators(prev => prev.map(collab => ({
          ...collab,
          cursor: collab.isTyping ? {
            line: Math.floor(Math.random() * 10) + 1,
            column: Math.floor(Math.random() * 50) + 1
          } : collab.cursor,
          isTyping: Math.random() > 0.8,
          lastSeen: new Date()
        })));
      }, 3000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
    }
  };

  const createSession = () => {
    if (!sessionName.trim()) return;

    const newSession: CollaborationSession = {
      id: Date.now().toString(),
      name: sessionName,
      language: languageState,
      code: code,
      collaborators: [{
        id: session?.user?.id || 'anonymous',
        name: session?.user?.name || 'Anonymous',
        avatar: '👤',
        color: '#6366F1',
        isTyping: false,
        lastSeen: new Date()
      }],
      createdAt: new Date(),
      isActive: true
    };

    setCurrentSession(newSession);
    setIsCreatingSession(false);
    setIsConnected(true);
    setCollaborators(newSession.collaborators);

    // Add system message
    addMessage('system', `${session?.user?.name || 'Вы'} создали сессию "${sessionName}"`, 'join');
  };

  const joinSession = (sessionId: string) => {
    // Mock joining existing session
    const mockSession: CollaborationSession = {
      id: sessionId,
      name: 'Совместная разработка API',
      language: 'typescript',
      code: `interface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\nconst users: User[] = [];`,
      collaborators: mockCollaborators,
      createdAt: new Date(),
      isActive: true
    };

    setCurrentSession(mockSession);
    setCode(mockSession.code);
    setLanguageState(mockSession.language);
    setIsConnected(true);

    addMessage('system', `${session?.user?.name || 'Вы'} присоединились к сессии`, 'join');
  };

  const leaveSession = () => {
    setCurrentSession(null);
    setIsConnected(false);
    setCollaborators([]);
    setCode(initialCode);

    addMessage('system', `${session?.user?.name || 'Вы'} покинули сессию`, 'leave');
  };

  const addMessage = (user: string, message: string, type: 'message' | 'code_change' | 'join' | 'leave' = 'message') => {
    const newMsg = {
      id: Date.now().toString(),
      user,
      message,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev.slice(-49), newMsg]); // Keep last 50 messages
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);

    // Broadcast code change to collaborators
    if (isConnected && currentSession) {
      addMessage(session?.user?.name || 'Вы', 'изменил код', 'code_change');
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Broadcast typing status
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    addMessage(session?.user?.name || 'Anonymous', newMessage);
    setNewMessage('');
  };

  const copyShareLink = () => {
    if (currentSession) {
      const link = `${window.location.origin}/collaborate/${currentSession.id}`;
      navigator.clipboard.writeText(link);
      addMessage('system', 'Ссылка на сессию скопирована', 'message');
    }
  };

  const runCode = () => {
    // Mock code execution
    addMessage('system', 'Код отправлен на выполнение...', 'message');
    setTimeout(() => {
      addMessage('system', '✅ Код выполнен успешно', 'message');
    }, 2000);
  };

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      {/* Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code className="h-6 w-6" />
              <div>
                <h2 className="font-semibold">Совместное программирование</h2>
                <p className="text-sm text-muted-foreground">
                  {currentSession ? `Сессия: ${currentSession.name}` : 'Создайте или присоединитесь к сессии'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {isConnected ? 'Подключено' : 'Отключено'}
                </span>
              </div>

              {/* Collaborators Count */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <Badge variant="secondary">{collaborators.length}</Badge>
              </div>
            </div>
          </div>

          {/* Collaborators Avatars */}
          {collaborators.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm font-medium">Участники:</span>
              <div className="flex -space-x-2">
                {collaborators.map((collab) => (
                  <div key={collab.id} className="relative">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarFallback style={{ backgroundColor: collab.color + '20', color: collab.color }}>
                        {collab.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {collab.isTyping && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-background animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  <option value="cpp">C++</option>
                </select>

                <Button
                  size="sm"
                  onClick={runCode}
                  disabled={!isConnected}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Запустить
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {!currentSession ? (
              // Session Creation/Join
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <Code className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Начните совместную работу</h3>
                    <p className="text-muted-foreground mb-4">
                      Создайте новую сессию или присоединитесь к существующей
                    </p>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setIsCreatingSession(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать сессию
                    </Button>
                    <Button variant="outline" onClick={() => joinSession('demo-session')}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Присоединиться
                    </Button>
                  </div>

                  {isCreatingSession && (
                    <div className="mt-4 p-4 border rounded-lg">
                      <Input
                        placeholder="Название сессии"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && createSession()}
                      />
                      <Button onClick={createSession} className="mt-2 w-full">
                        Создать
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Code Editor
              <div className="flex-1 relative">
                <Textarea
                  ref={codeRef}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyUp={handleTyping}
                  placeholder="Напишите ваш код здесь..."
                  className="w-full h-full resize-none border-0 rounded-none font-mono text-sm"
                  style={{ minHeight: '400px' }}
                />

                {/* Session Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyShareLink}>
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={leaveSession}>
                    Выйти
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Panel */}
        {showChat && (
          <Card className="w-80 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Чат
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(false)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea ref={chatRef} className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <Avatar className="h-6 w-6 mt-1">
                        <AvatarFallback className="text-xs">
                          {msg.user === 'system' ? '🤖' : msg.user.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{msg.user}</span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                          {msg.type !== 'message' && (
                            <Badge variant="outline" className="text-xs">
                              {msg.type === 'join' ? 'присоединился' :
                               msg.type === 'leave' ? 'покинул' : 'изменил код'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Напишите сообщение..."
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!showChat && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChat(true)}
            className="self-start"
          >
            <Eye className="h-4 w-4 mr-2" />
            Показать чат
          </Button>
        )}
      </div>
    </div>
  );
}
