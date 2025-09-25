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
  Shield
} from "lucide-react";

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

  useEffect(() => {
    fetchStatus();
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
            onClick={fetchStatus}
            className="text-white/60 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-white/70">
          {status?.vasily?.statusMessage || "Статус AI-сервисов"}
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
        {status?.vasily && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{status.vasily.emoji}</span>
                <div>
                  <p className="text-white text-sm font-medium">
                    Настроение: {status.vasily.mood}
                  </p>
                  <p className="text-white/60 text-xs">
                    Память: {status.vasily.memoryStats.totalMemories} воспоминаний
                  </p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Онлайн
              </Badge>
            </div>
            
            <div className="text-white/70 text-sm italic">
              "{status.vasily.statusMessage}"
            </div>
          </div>
        )}

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
