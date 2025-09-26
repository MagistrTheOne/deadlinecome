"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Users, 
  Award,
  Zap,
  Crown,
  Medal,
  Flame
} from "lucide-react";

interface UserStats {
  userId: string;
  level: number;
  experience: number;
  totalPoints: number;
  achievements: any[];
  streak: number;
  lastActivity: string;
  rank: string;
  badges: string[];
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  level: number;
  points: number;
  rank: number;
  achievements: number;
  streak: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  rewards: {
    points: number;
    experience: number;
  };
  progress: number;
  completed: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  rarity: string;
  unlockedAt?: string;
}

export default function GamificationDashboard() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      
      // Получаем статистику пользователя
      const statsResponse = await fetch('/api/gamification?action=stats&userId=user-1');
      const statsData = await statsResponse.json();
      setUserStats(statsData.stats);

      // Получаем лидерборд
      const leaderboardResponse = await fetch('/api/gamification?action=leaderboard&limit=10');
      const leaderboardData = await leaderboardResponse.json();
      setLeaderboard(leaderboardData.leaderboard);

      // Получаем квесты
      const questsResponse = await fetch('/api/gamification?action=quests&userId=user-1');
      const questsData = await questsResponse.json();
      setQuests(questsData.quests);

      // Получаем достижения
      const achievementsResponse = await fetch('/api/gamification?action=achievements');
      const achievementsData = await achievementsResponse.json();
      setAchievements(achievementsData.achievements);

      // Получаем события
      const eventsResponse = await fetch('/api/gamification?action=events&limit=10');
      const eventsData = await eventsResponse.json();
      setEvents(eventsData.events);

    } catch (error) {
      console.error('Ошибка загрузки данных геймификации:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExperience = async (experience: number, reason: string) => {
    try {
      await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-experience',
          userId: 'user-1',
          experience,
          reason
        })
      });
      fetchGamificationData();
    } catch (error) {
      console.error('Ошибка добавления опыта:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'expert': return 'bg-red-500';
      case 'hard': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white/60 mt-2">Загрузка геймификации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            Геймификация
          </h2>
          <p className="text-white/60">Система достижений и мотивации</p>
        </div>
        <Button 
          onClick={() => addExperience(50, 'Тестовое действие')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Zap className="h-4 w-4 mr-2" />
          Получить опыт
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black/50">
          <TabsTrigger value="overview" className="text-white">Обзор</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-white">Лидерборд</TabsTrigger>
          <TabsTrigger value="quests" className="text-white">Квесты</TabsTrigger>
          <TabsTrigger value="achievements" className="text-white">Достижения</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Статистика пользователя */}
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Ваша статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Уровень</span>
                      <Badge className="bg-blue-500 text-white">{userStats.level}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Опыт</span>
                      <span className="text-white font-medium">{userStats.experience}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Очки</span>
                      <span className="text-white font-medium">{userStats.totalPoints}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Ранг</span>
                      <Badge className="bg-purple-500 text-white">{userStats.rank}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Серия</span>
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-400" />
                        <span className="text-white font-medium">{userStats.streak}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Прогресс до следующего уровня */}
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Прогресс уровня
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userStats && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">До следующего уровня</span>
                      <span className="text-white">{100 - (userStats.experience % 100)} опыта</span>
                    </div>
                    <Progress 
                      value={(userStats.experience % 100)} 
                      className="h-2 bg-white/20"
                    />
                    <div className="text-center text-white/60 text-sm">
                      {userStats.experience % 100}/100
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Последние достижения */}
            <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Последние достижения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats?.achievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{achievement.title}</div>
                        <div className="text-white/60 text-xs">{achievement.description}</div>
                      </div>
                      <Badge className="bg-green-500 text-white">+{achievement.points}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* События */}
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />
                Последние события
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.slice(0, 5).map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-white text-sm">
                        {event.type === 'level_up' && `🎉 Повышение до уровня ${event.newLevel}`}
                        {event.type === 'achievement_unlocked' && `🏆 Разблокировано достижение: ${event.achievement.title}`}
                        {event.type === 'quest_completed' && `✅ Завершен квест: ${event.quest.title}`}
                      </div>
                      <div className="text-white/60 text-xs">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Лидерборд */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                Топ игроков
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((player, index) => (
                  <div key={player.userId} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-white/60">#{player.rank}</div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback>{player.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium">{player.username}</div>
                        <div className="text-white/60 text-sm">Уровень {player.level}</div>
                      </div>
                    </div>
                    <div className="flex-1"></div>
                    <div className="text-right">
                      <div className="text-white font-medium">{player.points} очков</div>
                      <div className="text-white/60 text-sm">{player.achievements} достижений</div>
                    </div>
                    {index < 3 && (
                      <div className="text-2xl">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Квесты */}
        <TabsContent value="quests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quests.map((quest) => (
              <Card key={quest.id} className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{quest.title}</span>
                    <Badge className={`${getDifficultyColor(quest.difficulty)} text-white`}>
                      {quest.difficulty}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/70 text-sm">{quest.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Прогресс</span>
                      <span className="text-white">{quest.progress}%</span>
                    </div>
                    <Progress value={quest.progress} className="h-2 bg-white/20" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-white/70 text-sm">
                      Награда: {quest.rewards.points} очков, {quest.rewards.experience} опыта
                    </div>
                    <Badge className="bg-blue-500 text-white">{quest.type}</Badge>
                  </div>

                  {quest.completed && (
                    <div className="flex items-center gap-2 text-green-400">
                      <Medal className="h-4 w-4" />
                      <span className="text-sm">Завершен!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Достижения */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="bg-black/50 backdrop-blur-sm border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-medium">{achievement.title}</h3>
                        <Badge className={`${getRarityColor(achievement.rarity)} bg-transparent border`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-white/70 text-sm mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-yellow-500 text-white">
                          +{achievement.points} очков
                        </Badge>
                        <Badge className="bg-blue-500 text-white">
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
