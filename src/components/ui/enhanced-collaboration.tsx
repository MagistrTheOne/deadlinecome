"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MessageSquare, 
  Edit3, 
  Eye, 
  Clock,
  Zap,
  Globe,
  Bell,
  CheckCircle,
  AlertCircle,
  Video,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Share2,
  AtSign,
  Smile,
  Paperclip,
  Send,
  MoreVertical,
  Pin,
  Reply,
  ThumbsUp,
  Heart,
  Laugh,
  Angry,
} from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  isTyping: boolean;
  currentActivity: string;
  cursorPosition?: { x: number; y: number };
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  timestamp: Date;
  mentions: string[];
  reactions: { emoji: string; count: number; users: string[] }[];
  replies: Comment[];
  isPinned: boolean;
  isEdited: boolean;
}

interface LiveEdit {
  id: string;
  userId: string;
  userName: string;
  content: string;
  position: { start: number; end: number };
  timestamp: Date;
  color: string;
}

interface VideoCall {
  id: string;
  participants: string[];
  isActive: boolean;
  startedAt: Date;
  duration: number;
}

export function EnhancedCollaboration() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liveEdits, setLiveEdits] = useState<LiveEdit[]>([]);
  const [videoCall, setVideoCall] = useState<VideoCall | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMention, setSelectedMention] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadCollaborators();
    loadComments();
    startLiveEditing();
  }, []);

  const loadCollaborators = () => {
    const mockCollaborators: Collaborator[] = [
      {
        id: "1",
        name: "Алексей Петров",
        role: "Frontend Developer",
        isOnline: true,
        isTyping: true,
        currentActivity: "Редактирует компонент авторизации",
        cursorPosition: { x: 150, y: 200 }
      },
      {
        id: "2",
        name: "Мария Сидорова",
        role: "Backend Developer",
        isOnline: true,
        isTyping: false,
        currentActivity: "Просматривает API документацию"
      },
      {
        id: "3",
        name: "Дмитрий Козлов",
        role: "Full-stack Developer",
        isOnline: true,
        isTyping: true,
        currentActivity: "Комментирует задачу #123"
      },
      {
        id: "4",
        name: "Анна Волкова",
        role: "QA Engineer",
        isOnline: false,
        isTyping: false,
        currentActivity: "Последний раз была онлайн 2 часа назад"
      }
    ];
    
    setCollaborators(mockCollaborators);
  };

  const loadComments = () => {
    const mockComments: Comment[] = [
      {
        id: "1",
        content: "Отличная работа! Но нужно добавить валидацию для email поля @Алексей",
        author: "Мария Сидорова",
        authorAvatar: undefined,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        mentions: ["Алексей"],
        reactions: [
          { emoji: "👍", count: 3, users: ["Алексей", "Дмитрий", "Анна"] },
          { emoji: "❤️", count: 1, users: ["Алексей"] }
        ],
        replies: [
          {
            id: "1-1",
            content: "Спасибо! Уже исправляю",
            author: "Алексей Петров",
            authorAvatar: undefined,
            timestamp: new Date(Date.now() - 1000 * 60 * 25),
            mentions: [],
            reactions: [],
            replies: [],
            isPinned: false,
            isEdited: false
          }
        ],
        isPinned: false,
        isEdited: false
      },
      {
        id: "2",
        content: "Когда планируем релиз этой фичи? @все",
        author: "Дмитрий Козлов",
        authorAvatar: undefined,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        mentions: ["все"],
        reactions: [
          { emoji: "🤔", count: 2, users: ["Мария", "Анна"] }
        ],
        replies: [],
        isPinned: true,
        isEdited: false
      }
    ];
    
    setComments(mockComments);
  };

  const startLiveEditing = () => {
    // Симуляция live editing
    const interval = setInterval(() => {
      const randomCollaborator = collaborators[Math.floor(Math.random() * collaborators.length)];
      if (randomCollaborator && randomCollaborator.isOnline) {
        const newEdit: LiveEdit = {
          id: Date.now().toString(),
          userId: randomCollaborator.id,
          userName: randomCollaborator.name,
          content: "Редактирует...",
          position: { start: Math.random() * 100, end: Math.random() * 100 },
          timestamp: new Date(),
          color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };
        
        setLiveEdits(prev => [newEdit, ...prev.slice(0, 4)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  const handleCommentChange = (value: string) => {
    setNewComment(value);
    
    // Симуляция typing indicator
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    // Обработка упоминаний
    const mentionMatch = value.match(/@(\w+)/g);
    if (mentionMatch) {
      const lastMention = mentionMatch[mentionMatch.length - 1];
      setSelectedMention(lastMention.replace('@', ''));
    } else {
      setSelectedMention(null);
    }
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    const mentions = newComment.match(/@(\w+)/g)?.map(m => m.replace('@', '')) || [];
    
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: "Вы",
      authorAvatar: undefined,
      timestamp: new Date(),
      mentions,
      reactions: [],
      replies: [],
      isPinned: false,
      isEdited: false
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment("");
    setIsTyping(false);
  };

  const addReaction = (commentId: string, emoji: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const existingReaction = comment.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...comment,
            reactions: comment.reactions.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, users: [...r.users, "Вы"] }
                : r
            )
          };
        } else {
          return {
            ...comment,
            reactions: [...comment.reactions, { emoji, count: 1, users: ["Вы"] }]
          };
        }
      }
      return comment;
    }));
  };

  const startVideoCall = () => {
    const call: VideoCall = {
      id: Date.now().toString(),
      participants: collaborators.filter(c => c.isOnline).map(c => c.id),
      isActive: true,
      startedAt: new Date(),
      duration: 0
    };
    setVideoCall(call);
  };

  const endVideoCall = () => {
    setVideoCall(null);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return "только что";
    if (minutes === 1) return "1 мин назад";
    if (minutes < 60) return `${minutes} мин назад`;
    return `${Math.floor(minutes / 60)} ч назад`;
  };

  const getMentionSuggestions = () => {
    return collaborators.filter(c => 
      c.name.toLowerCase().includes(selectedMention?.toLowerCase() || '')
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Enhanced Collaboration
          </h2>
          <p className="text-white/70">
            Real-time совместное редактирование и общение команды
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {videoCall ? (
            <Button
              onClick={endVideoCall}
              className="bg-analytics-rose hover:bg-analytics-rose/80 text-white"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Завершить звонок
            </Button>
          ) : (
            <Button
              onClick={startVideoCall}
              className="bg-analytics-emerald hover:bg-analytics-emerald/80 text-white"
            >
              <Video className="h-4 w-4 mr-2" />
              Начать видеозвонок
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Live Collaborators */}
        <div className="lg:col-span-1">
          <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-analytics-cyan" />
                Участники ({collaborators.filter(c => c.isOnline).length})
              </CardTitle>
              <CardDescription className="text-white/60">
                Кто сейчас работает над проектом
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div 
                    key={collaborator.id} 
                    className="flex items-center gap-3 p-3 bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg hover:border-white/20 transition-all duration-300"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8 border border-white/20">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback className="bg-black text-white text-xs">
                          {collaborator.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-black ${
                        collaborator.isOnline ? 'bg-analytics-emerald' : 'bg-white/30'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{collaborator.name}</span>
                        {collaborator.isTyping && (
                          <Badge className="bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30 text-xs">
                            <Edit3 className="mr-1 h-2 w-2" />
                            печатает
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/60 text-xs">{collaborator.role}</p>
                      <p className="text-white/70 text-xs">{collaborator.currentActivity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments and Live Editing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Editing Indicators */}
          {liveEdits.length > 0 && (
            <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-analytics-violet" />
                  Live редактирование
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {liveEdits.map((edit) => (
                    <div 
                      key={edit.id} 
                      className="flex items-center gap-2 p-2 bg-glass-medium backdrop-blur-sm border border-white/10 rounded"
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: edit.color }}
                      ></div>
                      <span className="text-white/80 text-sm">{edit.userName}</span>
                      <span className="text-white/60 text-sm">{edit.content}</span>
                      <span className="text-white/50 text-xs ml-auto">
                        {formatTimeAgo(edit.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card className="bg-glass-dark backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-analytics-amber" />
                Комментарии и обсуждения
              </CardTitle>
              <CardDescription className="text-white/60">
                Общайтесь с командой в реальном времени
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 border border-white/20">
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback className="bg-black text-white text-xs">
                          {comment.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{comment.author}</span>
                          <span className="text-white/60 text-xs">{formatTimeAgo(comment.timestamp)}</span>
                          {comment.isPinned && (
                            <Badge className="bg-analytics-amber/20 text-analytics-amber border-analytics-amber/30 text-xs">
                              <Pin className="h-2 w-2 mr-1" />
                              Закреплено
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-white/80 text-sm mb-3 whitespace-pre-wrap">
                          {comment.content.split(' ').map((word, index) => {
                            if (word.startsWith('@')) {
                              return (
                                <span key={index} className="text-analytics-cyan font-medium">
                                  {word}{' '}
                                </span>
                              );
                            }
                            return word + ' ';
                          })}
                        </p>
                        
                        {/* Reactions */}
                        {comment.reactions.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            {comment.reactions.map((reaction, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={() => addReaction(comment.id, reaction.emoji)}
                                className="h-6 px-2 bg-glass-light hover:bg-white/10 text-white/80 hover:text-white"
                              >
                                <span className="mr-1">{reaction.emoji}</span>
                                <span className="text-xs">{reaction.count}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addReaction(comment.id, '👍')}
                            className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Нравится
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Ответить
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* New Comment Input */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    placeholder="Напишите комментарий... (используйте @ для упоминаний)"
                    className="min-h-[80px] bg-glass-medium border-white/20 text-white placeholder-white/50 focus:border-white/40 resize-none"
                  />
                  
                  {/* Mention Suggestions */}
                  {selectedMention && getMentionSuggestions().length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-2">
                      {getMentionSuggestions().map((collaborator) => (
                        <div
                          key={collaborator.id}
                          className="flex items-center gap-2 p-2 hover:bg-white/10 rounded cursor-pointer"
                          onClick={() => {
                            setNewComment(prev => prev.replace(`@${selectedMention}`, `@${collaborator.name}`));
                            setSelectedMention(null);
                          }}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-black text-white text-xs">
                              {collaborator.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white text-sm">{collaborator.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleSendComment}
                    disabled={!newComment.trim()}
                    className="bg-analytics-violet hover:bg-analytics-violet/80 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Отправить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Call Modal */}
      {videoCall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="bg-glass-dark backdrop-blur-sm border-white/20 max-w-2xl w-full mx-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-analytics-emerald" />
                Видеозвонок активен
              </CardTitle>
              <CardDescription className="text-white/60">
                Участников: {videoCall.participants.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {collaborators.filter(c => c.isOnline).map((collaborator) => (
                  <div key={collaborator.id} className="bg-glass-medium backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-white/20">
                        <AvatarFallback className="bg-black text-white">
                          {collaborator.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{collaborator.name}</p>
                        <p className="text-white/60 text-sm">{collaborator.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Микрофон
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Камера
                </Button>
                <Button
                  onClick={endVideoCall}
                  className="bg-analytics-rose hover:bg-analytics-rose/80 text-white"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Завершить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
