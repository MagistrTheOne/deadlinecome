"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, Rocket, Star, Plane } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Создаем звезды для анимации
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
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

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <Card className="bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl shadow-white/10">
          <CardContent className="p-8 sm:p-12">
            {/* Иконка ракеты */}
            <div className="mb-8">
              <div className="relative inline-block">
                <Rocket className="h-24 w-24 text-white/80 mx-auto mb-4 animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <Star className="h-6 w-6 text-yellow-400 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -left-2">
                  <Plane className="h-4 w-4 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>

            {/* Заголовок */}
            <h1 className="text-6xl sm:text-8xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              404
            </h1>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Космос не найден! 🚀
            </h2>
            
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              Похоже, вы заблудились в космическом пространстве. 
              Эта страница была поглощена черной дырой или 
              отправилась в другое измерение.
            </p>

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg"
                className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  На главную
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="ghost"
                size="lg"
                className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <Link href="/projects" className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Найти проекты
                </Link>
              </Button>
            </div>

            {/* Дополнительная информация */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/50 text-sm">
                Если вы считаете, что это ошибка, свяжитесь с нами
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white/50 hover:text-white/70"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Дополнительные космические элементы */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-16 h-16 bg-gradient-to-br from-green-500/10 to-blue-600/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  );
}
