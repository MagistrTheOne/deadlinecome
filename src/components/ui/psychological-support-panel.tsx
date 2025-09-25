"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Calendar,
  RefreshCw,
  Send,
  Smile,
  Frown,
  Meh
} from "lucide-react";
import { PsychologicalSupport } from "@/lib/ai/psychological-support";
import { TeamMoodMonitor } from "@/lib/ai/team-mood-monitor";

interface SupportMessage {
  id: string;
  type: "motivation" | "encouragement" | "advice" | "celebration" | "warning" | "support";
  content: string;
  tone: "friendly" | "professional" | "caring" | "energetic" | "calm";
  priority: "low" | "medium" | "high" | "urgent";
  targetUser?: string;
  context: string;
  timestamp: Date;
  delivered: boolean;
}

export function PsychologicalSupportPanel() {
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [teamMood, setTeamMood] = useState<any>(null);
  const [activeCrises, setActiveCrises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSupportData = async () => {
    try {
      setLoading(true);
      
      // Получаем сообщения поддержки
      try {
        const supportResponse = await fetch('/api/ai/psychological-support');
        if (supportResponse.ok) {
          const supportData = await supportResponse.json();
          setSupportMessages(supportData.messages || []);
          setActiveCrises(supportData.activeCrises || []);
        } else {
          throw new Error('Failed to fetch support data');
        }
      } catch (error) {
        console.error('Error fetching support data:', error);
        setSupportMessages([]);
        setActiveCrises([]);
      }

      // Получаем настроение команды
      try {
        const moodResponse = await fetch('/api/ai/team-mood');
        if (moodResponse.ok) {
          const moodData = await moodResponse.json();
          setTeamMood(moodData);
        } else {
          throw new Error('Failed to fetch mood data');
        }
      } catch (error) {
        console.error('Error fetching mood data:', error);
        setTeamMood({ overall: 'neutral', stress: 'low', energy: 'medium' });
      }
    } catch (error) {
      console.error('Ошибка получения данных поддержки:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportData();
    
    // Обновляем данные каждые 2 минуты
    const interval = setInterval(fetchSupportData, 120000);
    return () => clearInterval(interval);
  }, []);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "motivation": return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "encouragement": return <Heart className="h-4 w-4 text-pink-400" />;
      case "advice": return <MessageCircle className="h-4 w-4 text-blue-400" />;
      case "celebration": return <Smile className="h-4 w-4 text-yellow-400" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "support": return <Users className="h-4 w-4 text-purple-400" />;
      default: return <MessageCircle className="h-4 w-4 text-white/60" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-white/20 text-white/60 border-white/30";
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy": case "excited": return <Smile className="h-4 w-4 text-green-400" />;
      case "stressed": case "frustrated": return <Frown className="h-4 w-4 text-red-400" />;
      default: return <Meh className="h-4 w-4 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Психологическая поддержка
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-white/60" />
            <span className="text-white/70 text-sm">Загрузка данных поддержки...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Психологическая поддержка
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchSupportData}
            className="text-white/60 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-white/70">
          Василий заботится о благополучии команды
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Активные кризисы */}
        {activeCrises.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-white text-sm font-medium">Активные кризисы</span>
            </div>
            {activeCrises.map((crisis) => (
              <div key={crisis.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    {crisis.severity}
                  </Badge>
                  <span className="text-white/60 text-xs">
                    {new Date(crisis.detectedAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white text-sm">{crisis.description}</p>
                <p className="text-white/60 text-xs mt-1">
                  Затронуты: {crisis.affectedUsers.length} участников
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Настроение команды */}
        {teamMood && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getMoodIcon(teamMood.overallMood)}
              <span className="text-white text-sm font-medium">Настроение команды</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <p className="text-white/60 text-xs">Общее настроение</p>
                <p className="text-white text-sm font-medium capitalize">{teamMood.overallMood}</p>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <p className="text-white/60 text-xs">Уровень стресса</p>
                <p className="text-white text-sm font-medium">
                  {Math.round(teamMood.stressLevel * 100)}%
                </p>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <p className="text-white/60 text-xs">Продуктивность</p>
                <p className="text-white text-sm font-medium">
                  {Math.round(teamMood.productivityLevel * 100)}%
                </p>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <p className="text-white/60 text-xs">Сплоченность</p>
                <p className="text-white text-sm font-medium">
                  {Math.round(teamMood.teamCohesion * 100)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Сообщения поддержки */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-blue-400" />
            <span className="text-white text-sm font-medium">Сообщения поддержки</span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {supportMessages.slice(0, 5).map((message) => (
              <div key={message.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-start gap-2">
                  {getMessageIcon(message.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      <span className="text-white/60 text-xs">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white text-sm">{message.content}</p>
                    <p className="text-white/60 text-xs mt-1">{message.context}</p>
                  </div>
                </div>
              </div>
            ))}
            {supportMessages.length === 0 && (
              <div className="text-center py-4">
                <Heart className="h-8 w-8 text-white/30 mx-auto mb-2" />
                <p className="text-white/60 text-sm">Нет активных сообщений поддержки</p>
              </div>
            )}
          </div>
        </div>

        {/* Рекомендации */}
        {teamMood?.recommendations && teamMood.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-white text-sm font-medium">Рекомендации</span>
            </div>
            <div className="space-y-1">
              {teamMood.recommendations.slice(0, 3).map((rec: string, index: number) => (
                <p key={index} className="text-white/70 text-xs">
                  • {rec}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Предупреждения */}
        {teamMood?.alerts && teamMood.alerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-white text-sm font-medium">Предупреждения</span>
            </div>
            <div className="space-y-1">
              {teamMood.alerts.map((alert: string, index: number) => (
                <p key={index} className="text-red-400 text-xs">
                  ⚠️ {alert}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
