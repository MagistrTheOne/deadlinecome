"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Star, Zap } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export function LoadingScreen({ 
  message = "Загрузка...", 
  showProgress = false, 
  progress = 0 
}: LoadingScreenProps) {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [loadingDots, setLoadingDots] = useState("");

  useEffect(() => {
    // Создаем звезды для анимации
    const newStars = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    // Анимация точек загрузки
    const interval = setInterval(() => {
      setLoadingDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Анимированный космический фон */}
      <div className="absolute inset-0">
        {/* Звезды */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Планеты */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-full blur-md animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 text-center">
        <Card className="bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl shadow-white/10">
          <CardContent className="p-8 sm:p-12">
            {/* Анимированная ракета */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                <Rocket className="h-20 w-20 text-white/80 mx-auto mb-4 animate-bounce" />
                
                {/* Эффект полета */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-8 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-sm animate-pulse" />
                </div>
                
                {/* Звезды вокруг ракеты */}
                <div className="absolute -top-2 -right-2">
                  <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -left-2">
                  <Star className="h-3 w-3 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
                <div className="absolute top-1/2 -left-4">
                  <Zap className="h-3 w-3 text-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </div>

            {/* Заголовок */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              DeadLine
            </h2>
            
            {/* Сообщение загрузки */}
            <p className="text-white/70 text-lg mb-6">
              {message}{loadingDots}
            </p>

            {/* Прогресс бар */}
            {showProgress && (
              <div className="w-full max-w-xs mx-auto mb-6">
                <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white/50 text-sm mt-2">{progress}%</p>
              </div>
            )}

            {/* Спиннер */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
