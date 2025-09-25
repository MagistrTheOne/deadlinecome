"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Zap,
  Globe,
  Shield,
  Activity,
  TrendingUp,
  Users
} from "lucide-react";
import { VasilyStatusSystem } from "@/lib/ai/vasily-status-system";
import { ActivityMonitor } from "@/lib/ai/activity-monitor";
import { RealtimeManager } from "@/lib/realtime";

interface AIStatus {
  primary: string;
  fallback: string;
  isUsingPrimary: boolean;
  vasily?: {
    mood: string;
    emoji: string;
    statusMessage: string;
    memoryStats: {
      totalMemories: number;
      memoriesByType: Record<string, number>;
    };
    isOnline: boolean;
  };
}

export function AIStatus() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [vasilyStatus, setVasilyStatus] = useState(VasilyStatusSystem.getCurrentStatus());
  const [teamMetrics, setTeamMetrics] = useState(ActivityMonitor.getDashboardMetrics());
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Ошибка получения статуса AI:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVasilyStatus = () => {
    setVasilyStatus(VasilyStatusSystem.getCurrentStatus());
    setTeamMetrics(ActivityMonitor.getDashboardMetrics());
  };

  useEffect(() => {
    fetchStatus();
    updateVasilyStatus();

    // Подписываемся на реалтайм обновления
    const subscriptionId = RealtimeManager.subscribe("status_change", (event) => {
      if (event.data.type === "vasily_status") {
        updateVasilyStatus();
      }
    });

    // Обновляем статус Василия каждые 30 секунд
    const interval = setInterval(updateVasilyStatus, 30000);
    
    return () => {
      clearInterval(interval);
      RealtimeManager.unsubscribe(subscriptionId);
    };
  }, []);

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Василий Team Lead AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-white/60" />
            <span className="text-white/70 text-sm">Проверка статуса...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Василий Team Lead AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-white/70 text-sm">Ошибка загрузки статуса</span>
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
            <Bot className="h-5 w-5" />
            Василий Team Lead AI
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              fetchStatus();
              updateVasilyStatus();
            }}
            className="text-white/60 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-white/70">
          {vasilyStatus.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Основной сервис */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status.isUsingPrimary ? (
              <Zap className="h-4 w-4 text-green-400" />
            ) : (
              <Globe className="h-4 w-4 text-blue-400" />
            )}
            <div>
              <p className="text-white text-sm font-medium">
                {status.isUsingPrimary ? status.primary : status.fallback}
              </p>
              <p className="text-white/60 text-xs">
                {status.isUsingPrimary ? "Основной сервис" : "Резервный сервис"}
              </p>
            </div>
          </div>
          <Badge 
            className={
              status.isUsingPrimary 
                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
            }
          >
            {status.isUsingPrimary ? "Активен" : "Fallback"}
          </Badge>
        </div>

        {/* Статус Василия */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{vasilyStatus.emoji}</span>
              <div>
                <p className="text-white text-sm font-medium">
                  Статус Василия: {vasilyStatus.name}
                </p>
                <p className="text-white/60 text-xs">
                  Активность: {vasilyStatus.activity}
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Онлайн
            </Badge>
          </div>
          
          <div className="text-white/70 text-sm italic">
            "{vasilyStatus.context}"
          </div>

          {/* Метрики команды */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-blue-400" />
              <div>
                <p className="text-white/60 text-xs">Продуктивность</p>
                <p className="text-white text-sm font-medium">
                  {Math.round(teamMetrics.productivity * 100)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <div>
                <p className="text-white/60 text-xs">Качество</p>
                <p className="text-white text-sm font-medium">
                  {Math.round(teamMetrics.quality * 100)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-yellow-400" />
              <div>
                <p className="text-white/60 text-xs">Счастье</p>
                <p className="text-white text-sm font-medium">
                  {Math.round(teamMetrics.teamHappiness * 100)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-purple-400" />
              <div>
                <p className="text-white/60 text-xs">Нагрузка</p>
                <p className="text-white text-sm font-medium">
                  {Math.round(teamMetrics.workload * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Рекомендации */}
          {teamMetrics.recommendations.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-white/60 text-xs mb-2">Рекомендации:</p>
              <div className="space-y-1">
                {teamMetrics.recommendations.slice(0, 2).map((rec, index) => (
                  <p key={index} className="text-white/70 text-xs">
                    • {rec}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Статус подключения */}
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <span className="text-white/70 text-sm">Подключение установлено</span>
        </div>

        {/* Информация о сервисах */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-white/60" />
            <span className="text-white/60 text-xs">
              GigaChat: Российская разработка
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3 text-white/60" />
            <span className="text-white/60 text-xs">
              OpenAI: Международный fallback
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
