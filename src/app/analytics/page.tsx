"use client";

import { useSession } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, CheckCircle } from "lucide-react";

export default function AnalyticsPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const stats = [
    {
      title: "Всего задач",
      value: "0",
      change: "+0%",
      changeType: "neutral" as const,
      icon: CheckCircle,
    },
    {
      title: "Завершено",
      value: "0",
      change: "+0%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "В работе",
      value: "0",
      change: "+0%",
      changeType: "neutral" as const,
      icon: Clock,
    },
    {
      title: "Участников",
      value: "1",
      change: "+0%",
      changeType: "neutral" as const,
      icon: Users,
    },
  ];

  const getChangeColor = (type: "positive" | "negative" | "neutral") => {
    switch (type) {
      case "positive":
        return "text-green-400";
      case "negative":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Аналитика</h1>
          <p className="text-gray-400">
            Статистика и метрики ваших проектов
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="30">
            <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="7" className="text-white">7 дней</SelectItem>
              <SelectItem value="30" className="text-white">30 дней</SelectItem>
              <SelectItem value="90" className="text-white">90 дней</SelectItem>
              <SelectItem value="365" className="text-white">Год</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className={`text-xs ${getChangeColor(stat.changeType)}`}>
                {stat.change} с прошлого периода
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Task Completion Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Завершение задач</CardTitle>
            <CardDescription className="text-gray-400">
              Динамика выполнения задач по времени
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>График будет доступен после создания задач</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Производительность команды</CardTitle>
            <CardDescription className="text-gray-400">
              Активность участников команды
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Данные появятся при добавлении участников</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Project Breakdown */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">По проектам</CardTitle>
            <CardDescription className="text-gray-400">
              Распределение задач по проектам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-400">
              <p>Нет данных для отображения</p>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">По приоритетам</CardTitle>
            <CardDescription className="text-gray-400">
              Распределение задач по приоритетам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-400">
              <p>Нет данных для отображения</p>
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Учет времени</CardTitle>
            <CardDescription className="text-gray-400">
              Время, затраченное на задачи
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-400">
              <p>Нет данных для отображения</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
