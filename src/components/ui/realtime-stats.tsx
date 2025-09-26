"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Zap,
  Clock,
  Database,
  Cpu,
  HardDrive
} from "lucide-react";

interface RealtimeStats {
  websocket: {
    connectedUsers: number;
    activeRooms: number;
    onlineUsers: string[];
  };
  system: {
    uptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nodeVersion: string;
    platform: string;
  };
  timestamp: string;
}

export function RealtimeStats() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/realtime/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching realtime stats:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Обновляем каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}д ${hours}ч ${minutes}м`;
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-white/60" />
            <span className="ml-2 text-white/60">Загрузка статистики...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Статус подключения */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-400" />
            )}
            Real-time статус
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-white">
                {isConnected ? 'Подключено' : 'Отключено'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStats}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <>
          {/* WebSocket статистика */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                WebSocket соединения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stats.websocket.connectedUsers}
                  </div>
                  <div className="text-xs text-white/60">Подключенных пользователей</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stats.websocket.activeRooms}
                  </div>
                  <div className="text-xs text-white/60">Активных комнат</div>
                </div>
              </div>
              
              {stats.websocket.onlineUsers.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-white/60 mb-2">Онлайн пользователи:</div>
                  <div className="flex flex-wrap gap-1">
                    {stats.websocket.onlineUsers.slice(0, 5).map((userId, index) => (
                      <Badge key={index} className="bg-white/10 text-white border-white/20 text-xs">
                        {userId.slice(0, 8)}...
                      </Badge>
                    ))}
                    {stats.websocket.onlineUsers.length > 5 && (
                      <Badge className="bg-white/10 text-white border-white/20 text-xs">
                        +{stats.websocket.onlineUsers.length - 5} еще
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Системная статистика */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                Системные метрики
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/60">Время работы</div>
                    <div className="text-lg font-semibold text-white">
                      {formatUptime(stats.system.uptime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Платформа</div>
                    <div className="text-lg font-semibold text-white">
                      {stats.system.platform}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-white/60 mb-2">Использование памяти</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">RSS:</span>
                      <span className="text-white">{formatBytes(stats.system.memoryUsage.rss)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Heap Total:</span>
                      <span className="text-white">{formatBytes(stats.system.memoryUsage.heapTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Heap Used:</span>
                      <span className="text-white">{formatBytes(stats.system.memoryUsage.heapUsed)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">External:</span>
                      <span className="text-white">{formatBytes(stats.system.memoryUsage.external)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="text-xs text-white/40">
                    Последнее обновление: {new Date(stats.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
