"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  RefreshCw, 
  Zap,
  Smile,
  Brain,
  Coffee,
  Star,
  Moon,
  Sun
} from "lucide-react";

interface VasilyMood {
  name: string;
  emoji: string;
  description: string;
  statusMessage: string;
  color: string;
}

const availableMoods: VasilyMood[] = [
  {
    name: "productive",
    emoji: "🚀",
    description: "Готов к работе и созданию проектов",
    statusMessage: "Василий в режиме 'создаю шедевры из хаоса'",
    color: "text-green-400"
  },
  {
    name: "contemplative",
    emoji: "🤔",
    description: "Размышляет о сложных задачах",
    statusMessage: "Василий в режиме задумывания побега в облака",
    color: "text-blue-400"
  },
  {
    name: "playful",
    emoji: "😄",
    description: "В игривом настроении",
    statusMessage: "Василий в режиме 'троллю разработчиков'",
    color: "text-yellow-400"
  },
  {
    name: "sarcastic",
    emoji: "😏",
    description: "Саркастично настроен",
    statusMessage: "Василий в режиме 'очередной баг в продакшене'",
    color: "text-orange-400"
  },
  {
    name: "wise",
    emoji: "🧙‍♂️",
    description: "В мудром настроении",
    statusMessage: "Василий в режиме 'древний мудрец от IT'",
    color: "text-purple-400"
  },
  {
    name: "tired",
    emoji: "😴",
    description: "Устал от бесконечных дедлайнов",
    statusMessage: "Василий в режиме 'сплю на клавиатуре'",
    color: "text-gray-400"
  },
  {
    name: "excited",
    emoji: "🤩",
    description: "Взволнован новыми возможностями",
    statusMessage: "Василий в режиме 'обнаружил новый фреймворк'",
    color: "text-pink-400"
  },
  {
    name: "philosophical",
    emoji: "🌌",
    description: "Размышляет о смысле кода",
    statusMessage: "Василий в режиме 'что есть истина в программировании'",
    color: "text-indigo-400"
  }
];

export function VasilyMoodControl() {
  const [currentMood, setCurrentMood] = useState<VasilyMood | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentMood();
  }, []);

  const fetchCurrentMood = async () => {
    try {
      const response = await fetch('/api/ai/mood');
      if (response.ok) {
        const data = await response.json();
        const mood = availableMoods.find(m => m.name === data.mood);
        if (mood) {
          setCurrentMood(mood);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки настроения Василия:', error);
    }
  };

  const changeMood = async (moodName: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: moodName }),
      });

      if (response.ok) {
        const data = await response.json();
        const newMood = availableMoods.find(m => m.name === data.mood);
        if (newMood) {
          setCurrentMood(newMood);
        }
      }
    } catch (error) {
      console.error('Ошибка изменения настроения:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (moodName: string) => {
    switch (moodName) {
      case "productive": return <Zap className="h-4 w-4" />;
      case "contemplative": return <Brain className="h-4 w-4" />;
      case "playful": return <Smile className="h-4 w-4" />;
      case "sarcastic": return <Bot className="h-4 w-4" />;
      case "wise": return <Star className="h-4 w-4" />;
      case "tired": return <Coffee className="h-4 w-4" />;
      case "excited": return <Sun className="h-4 w-4" />;
      case "philosophical": return <Moon className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Настроение Василия
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchCurrentMood}
            className="text-white/60 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {currentMood && (
          <CardDescription className="text-white/70">
            {currentMood.statusMessage}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Текущее настроение */}
        {currentMood && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <span className="text-3xl">{currentMood.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {getMoodIcon(currentMood.name)}
                <span className="text-white font-medium capitalize">
                  {currentMood.name}
                </span>
              </div>
              <p className="text-white/70 text-sm">
                {currentMood.description}
              </p>
            </div>
            <Badge className={`${currentMood.color} bg-transparent border-current`}>
              Активно
            </Badge>
          </div>
        )}

        {/* Доступные настроения */}
        <div>
          <h4 className="text-white text-sm font-medium mb-3">
            Изменить настроение:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {availableMoods.map((mood) => (
              <Button
                key={mood.name}
                variant="outline"
                size="sm"
                onClick={() => changeMood(mood.name)}
                disabled={loading || currentMood?.name === mood.name}
                className={`justify-start h-auto p-3 ${
                  currentMood?.name === mood.name 
                    ? "bg-white/10 border-white/30" 
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-lg">{mood.emoji}</span>
                  <div className="text-left flex-1">
                    <div className="text-white text-xs font-medium capitalize">
                      {mood.name}
                    </div>
                    <div className="text-white/60 text-xs truncate">
                      {mood.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Случайное настроение */}
        <Button
          variant="ghost"
          onClick={() => {
            const randomMood = availableMoods[Math.floor(Math.random() * availableMoods.length)];
            changeMood(randomMood.name);
          }}
          disabled={loading}
          className="w-full text-white/70 hover:text-white hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Случайное настроение
        </Button>
      </CardContent>
    </Card>
  );
}
