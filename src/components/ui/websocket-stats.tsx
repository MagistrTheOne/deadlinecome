"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  WifiOff, 
  Users, 
  Activity, 
  RefreshCw,
  TrendingUp,
  Zap
} from "lucide-react";

interface WebSocketStats {
  totalClients: number;
  activeSubscriptions: number;
  clientsByProject: Record<string, number>;
}

export function WebSocketStats() {
  const [stats, setStats] = useState<WebSocketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/websocket/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error loading WebSocket stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Обновляем статистику каждые 5 секунд
    const interval = setInterval(loadStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardContent className="p-6">
          <div className="text-center text-white/60">
            <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>WebSocket сервер недоступен</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Real-time статистика
            </CardTitle>
            <CardDescription className="text-white/60">
              Активные подключения и подписки
            </CardDescription>
          </div>
          <Button
            onClick={loadStats}
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-3 p-4 rounded-lg bg-black/30 border border-white/10">
            <Users className="h-5 w-5 text-blue-400" />
            <div>
              <div className="text-white font-medium">Подключения</div>
              <div className="text-white text-lg font-bold">{stats.totalClients}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg bg-black/30 border border-white/10">
            <Activity className="h-5 w-5 text-green-400" />
            <div>
              <div className="text-white font-medium">Подписки</div>
              <div className="text-white text-lg font-bold">{stats.activeSubscriptions}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg bg-black/30 border border-white/10">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <div>
              <div className="text-white font-medium">Проекты</div>
              <div className="text-white text-lg font-bold">{Object.keys(stats.clientsByProject).length}</div>
            </div>
          </div>
        </div>

        {/* Статистика по проектам */}
        {Object.keys(stats.clientsByProject).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Активность по проектам
            </h4>
            <div className="space-y-2">
              {Object.entries(stats.clientsByProject).map(([projectId, clientCount]) => (
                <div
                  key={projectId}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-white text-sm">
                      {projectId === "demo-project" ? "Demo Project" : projectId}
                    </span>
                  </div>
                  <Badge className="bg-white/10 text-white/80 border-white/20">
                    {clientCount} клиентов
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {lastUpdate && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/60 text-xs">
              Последнее обновление: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
