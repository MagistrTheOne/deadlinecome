"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Lock,
  Star,
  Trophy,
  Zap,
  Users,
  Settings,
  Target,
  Lightbulb,
  ChevronRight,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

export enum UserLevel {
  NEWBIE = 'newbie',         // Новичок - базовые фичи
  REGULAR = 'regular',       // Обычный - +15 фичей
  POWER_USER = 'power_user', // Продвинутый - большинство фичей
  TEAM_LEAD = 'team_lead'    // Тимлид - все фичи + админ
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  level: UserLevel;
  category: 'core' | 'productivity' | 'collaboration' | 'analytics' | 'ai' | 'advanced';
  component?: React.ComponentType;
  action?: () => void;
}

interface ProgressiveUXProps {
  children?: React.ReactNode;
  className?: string;
}

export function ProgressiveUX({ children, className }: ProgressiveUXProps) {
  const { data: session } = useSession();
  const [userLevel, setUserLevel] = useState<UserLevel>(UserLevel.NEWBIE);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState<string | null>(null);

  // Определяем уровень пользователя (в реальном приложении это будет из базы данных)
  useEffect(() => {
    if (session?.user) {
      // Имитация определения уровня - в реальности будет из user profile
      const level = localStorage.getItem(`user_level_${session.user.id}`) as UserLevel;
      if (level) {
        setUserLevel(level);
      } else {
        // Новый пользователь - начинаем с newbie
        setUserLevel(UserLevel.NEWBIE);
        setShowOnboarding(true);
      }
    }
  }, [session]);

  const features: Feature[] = [
    // Level 1: NEWBIE (Базовые фичи)
    {
      id: 'create-task',
      name: 'Создание задач',
      description: 'Основная функция для создания и управления задачами',
      icon: <Target className="h-5 w-5" />,
      level: UserLevel.NEWBIE,
      category: 'core'
    },
    {
      id: 'basic-dashboard',
      name: 'Базовый дашборд',
      description: 'Просмотр статистики проекта и активности',
      icon: <Settings className="h-5 w-5" />,
      level: UserLevel.NEWBIE,
      category: 'core'
    },
    {
      id: 'vasily-chat',
      name: 'Чат с Василием',
      description: 'Общение с AI Project Manager для помощи',
      icon: <Users className="h-5 w-5" />,
      level: UserLevel.NEWBIE,
      category: 'ai'
    },

    // Level 2: REGULAR (+15 фичей)
    {
      id: 'team-invites',
      name: 'Приглашение команды',
      description: 'Добавление новых участников в проект',
      icon: <Users className="h-5 w-5" />,
      level: UserLevel.REGULAR,
      category: 'collaboration'
    },
    {
      id: 'basic-analytics',
      name: 'Базовая аналитика',
      description: 'Просмотр основных метрик проекта',
      icon: <Trophy className="h-5 w-5" />,
      level: UserLevel.REGULAR,
      category: 'analytics'
    },
    {
      id: 'project-templates',
      name: 'Шаблоны проектов',
      description: 'Готовые шаблоны для разных типов проектов',
      icon: <Lightbulb className="h-5 w-5" />,
      level: UserLevel.REGULAR,
      category: 'productivity'
    },
    {
      id: 'time-tracking',
      name: 'Отслеживание времени',
      description: 'Ведение учета времени на задачах',
      icon: <Target className="h-5 w-5" />,
      level: UserLevel.REGULAR,
      category: 'productivity'
    },
    {
      id: 'notifications',
      name: 'Уведомления',
      description: 'Настройка оповещений о важных событиях',
      icon: <Zap className="h-5 w-5" />,
      level: UserLevel.REGULAR,
      category: 'productivity'
    },

    // Level 3: POWER_USER (Большинство фичей)
    {
      id: 'ai-team-chat',
      name: 'Команда AI-специалистов',
      description: 'Доступ ко всем AI-специалистам команды',
      icon: <Users className="h-5 w-5" />,
      level: UserLevel.POWER_USER,
      category: 'ai'
    },
    {
      id: 'advanced-analytics',
      name: 'Продвинутая аналитика',
      description: 'Детальные отчеты и предсказательная аналитика',
      icon: <Trophy className="h-5 w-5" />,
      level: UserLevel.POWER_USER,
      category: 'analytics'
    },
    {
      id: 'automations',
      name: 'Автоматизации',
      description: 'Настройка автоматических процессов',
      icon: <Settings className="h-5 w-5" />,
      level: UserLevel.POWER_USER,
      category: 'productivity'
    },
    {
      id: 'integrations',
      name: 'Интеграции',
      description: 'Подключение внешних сервисов',
      icon: <Zap className="h-5 w-5" />,
      level: UserLevel.POWER_USER,
      category: 'advanced'
    },
    {
      id: 'real-time-collab',
      name: 'Real-time коллаборация',
      description: 'Совместная работа в реальном времени',
      icon: <Users className="h-5 w-5" />,
      level: UserLevel.POWER_USER,
      category: 'collaboration'
    },

    // Level 4: TEAM_LEAD (Все фичи + админ)
    {
      id: 'team-management',
      name: 'Управление командой',
      description: 'Администрирование участников и ролей',
      icon: <Users className="h-5 w-5" />,
      level: UserLevel.TEAM_LEAD,
      category: 'advanced'
    },
    {
      id: 'advanced-reporting',
      name: 'Расширенная отчетность',
      description: 'Подробные отчеты по всем аспектам',
      icon: <Trophy className="h-5 w-5" />,
      level: UserLevel.TEAM_LEAD,
      category: 'analytics'
    },
    {
      id: 'custom-workflows',
      name: 'Кастомные воркфлоу',
      description: 'Создание собственных процессов работы',
      icon: <Settings className="h-5 w-5" />,
      level: UserLevel.TEAM_LEAD,
      category: 'advanced'
    },
    {
      id: 'api-access',
      name: 'API доступ',
      description: 'Программный доступ к функциям платформы',
      icon: <Zap className="h-5 w-5" />,
      level: UserLevel.TEAM_LEAD,
      category: 'advanced'
    }
  ];

  const getAvailableFeatures = () => {
    const levelOrder = [UserLevel.NEWBIE, UserLevel.REGULAR, UserLevel.POWER_USER, UserLevel.TEAM_LEAD];
    const currentLevelIndex = levelOrder.indexOf(userLevel);

    return features.filter(feature =>
      levelOrder.indexOf(feature.level) <= currentLevelIndex
    );
  };

  const getLevelProgress = () => {
    const levelOrder = [UserLevel.NEWBIE, UserLevel.REGULAR, UserLevel.POWER_USER, UserLevel.TEAM_LEAD];
    const currentIndex = levelOrder.indexOf(userLevel);
    return ((currentIndex + 1) / levelOrder.length) * 100;
  };

  const getLevelInfo = (level: UserLevel) => {
    const levels = {
      [UserLevel.NEWBIE]: {
        name: 'Новичок',
        description: 'Осваиваю основы',
        color: 'bg-blue-500',
        icon: <Star className="h-4 w-4" />
      },
      [UserLevel.REGULAR]: {
        name: 'Пользователь',
        description: 'Активно использую',
        color: 'bg-green-500',
        icon: <Trophy className="h-4 w-4" />
      },
      [UserLevel.POWER_USER]: {
        name: 'Продвинутый',
        description: 'Эксперт в инструменте',
        color: 'bg-purple-500',
        icon: <Award className="h-4 w-4" />
      },
      [UserLevel.TEAM_LEAD]: {
        name: 'Тимлид',
        description: 'Управляю командой',
        color: 'bg-orange-500',
        icon: <Users className="h-4 w-4" />
      }
    };
    return levels[level];
  };

  const levelUp = () => {
    const levelOrder = [UserLevel.NEWBIE, UserLevel.REGULAR, UserLevel.POWER_USER, UserLevel.TEAM_LEAD];
    const currentIndex = levelOrder.indexOf(userLevel);

    if (currentIndex < levelOrder.length - 1) {
      const newLevel = levelOrder[currentIndex + 1];
      setUserLevel(newLevel);

      if (session?.user?.id) {
        localStorage.setItem(`user_level_${session.user.id}`, newLevel);
      }
    }
  };

  const availableFeatures = getAvailableFeatures();
  const levelInfo = getLevelInfo(userLevel);

  if (showOnboarding) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Добро пожаловать в DeadLine!
            </CardTitle>
            <CardDescription>
              Давайте познакомимся с вашими новыми возможностями
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                {levelInfo.icon}
                <span className="font-medium">{levelInfo.name}</span>
                <Badge variant="secondary">{levelInfo.description}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Ваш текущий уровень мастерства
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Доступные фичи:</h3>
              <div className="grid gap-3">
                {availableFeatures.slice(0, 5).map((feature) => (
                  <div key={feature.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Следующий уровень:</h3>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Прогресс к следующему уровню</span>
                  <span className="text-sm text-muted-foreground">
                    {getLevelProgress().toFixed(0)}%
                  </span>
                </div>
                <Progress value={getLevelProgress()} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Используйте платформу активнее, чтобы разблокировать новые фичи!
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowOnboarding(false)}
                className="flex-1"
              >
                Начать работу
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* User Level Indicator */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full", levelInfo.color)}>
                {levelInfo.icon}
              </div>
              <div>
                <p className="font-medium">{levelInfo.name}</p>
                <p className="text-sm text-muted-foreground">{levelInfo.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Прогресс</p>
                <p className="font-medium">{getLevelProgress().toFixed(0)}%</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={levelUp}
                disabled={userLevel === UserLevel.TEAM_LEAD}
              >
                {userLevel === UserLevel.TEAM_LEAD ? 'Макс. уровень' : 'Повысить уровень'}
              </Button>
            </div>
          </div>

          <Progress value={getLevelProgress()} className="mt-3 h-2" />
        </CardContent>
      </Card>

      {/* Feature Discovery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Доступные возможности
          </CardTitle>
          <CardDescription>
            Функции, доступные на вашем уровне ({availableFeatures.length} из {features.length})
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const isAvailable = availableFeatures.some(f => f.id === feature.id);
              const isCompleted = completedTutorials.includes(feature.id);

              return (
                <div
                  key={feature.id}
                  className={cn(
                    "p-4 border rounded-lg transition-all",
                    isAvailable
                      ? "border-primary/20 bg-primary/5 hover:bg-primary/10 cursor-pointer"
                      : "border-muted bg-muted/50 opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isAvailable ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {feature.icon}
                    </div>
                    {isAvailable ? (
                      isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <h3 className="font-medium text-sm mb-1">{feature.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>

                  <Badge
                    variant={isAvailable ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {getLevelInfo(feature.level).name}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}
