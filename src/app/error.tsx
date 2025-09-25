"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, RefreshCw, AlertTriangle, Zap, Rocket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Создаем частицы для анимации
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Анимированный фон с эффектом ошибки */}
      <div className="absolute inset-0">
        {/* Частицы */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-red-500/30 rounded-full animate-ping"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Энергетические поля */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-red-500/10 to-orange-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-yellow-500/10 to-red-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <Card className="bg-black/60 backdrop-blur-xl border border-red-500/20 shadow-2xl shadow-red-500/10">
          <CardContent className="p-8 sm:p-12">
            {/* Иконка ошибки */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                <AlertTriangle className="h-24 w-24 text-red-400 mx-auto mb-4 animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -left-2">
                  <Rocket className="h-4 w-4 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>

            {/* Заголовок */}
            <h1 className="text-5xl sm:text-7xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
              500
            </h1>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Космическая аномалия! ⚡
            </h2>
            
            <p className="text-white/70 text-lg mb-6 leading-relaxed">
              Произошла неожиданная ошибка в космическом пространстве. 
              Наши инженеры уже работают над устранением проблемы.
            </p>

            {/* Детали ошибки (только в development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-300 text-sm font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-red-400/70 text-xs mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={reset}
                size="lg"
                className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/30 text-white transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Попробовать снова
              </Button>
              
              <Button 
                asChild 
                variant="ghost"
                size="lg"
                className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  На главную
                </Link>
              </Button>
            </div>

            {/* Дополнительная информация */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/50 text-sm">
                Если проблема повторяется, обратитесь в службу поддержки
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white/50 hover:text-white/70"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Перезагрузить страницу
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Дополнительные энергетические элементы */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-red-500/10 to-orange-600/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-16 h-16 bg-gradient-to-br from-yellow-500/10 to-red-600/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  );
}
