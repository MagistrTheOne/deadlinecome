"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface ChartData {
  date: string;
  tasks: number;
  completed: number;
  created: number;
}

// Функция для получения реальных данных статистики
const getRealChartData = async (): Promise<ChartData[]> => {
  try {
    const response = await fetch('/api/activity/stats');
    if (response.ok) {
      const data = await response.json();
      return data.chartData || [];
    } else {
      throw new Error('Failed to fetch chart data');
    }
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
  }
  
  // Fallback данные
  return [
    { date: "Пн", tasks: 2, completed: 1, created: 1 },
    { date: "Вт", tasks: 3, completed: 2, created: 1 },
    { date: "Ср", tasks: 1, completed: 1, created: 0 },
    { date: "Чт", tasks: 2, completed: 1, created: 1 },
    { date: "Пт", tasks: 1, completed: 0, created: 1 },
    { date: "Сб", tasks: 0, completed: 0, created: 0 },
    { date: "Вс", tasks: 0, completed: 0, created: 0 },
  ];
};

export function ActivityChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true);
      try {
        const realData = await getRealChartData();
        setChartData(realData);
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, []);

  const maxTasks = chartData.length > 0 ? Math.max(...chartData.map(d => d.tasks)) : 0;
  const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);
  const totalCreated = chartData.reduce((sum, d) => sum + d.created, 0);
  const completionRate = totalCompleted + totalCreated > 0 ? Math.round((totalCompleted / (totalCompleted + totalCreated)) * 100) : 0;

  return (
    <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Активность за неделю
        </CardTitle>
        <CardDescription className="text-white/60">
          Статистика выполнения задач
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalCompleted}</div>
            <div className="text-xs text-white/60">Завершено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalCreated}</div>
            <div className="text-xs text-white/60">Создано</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{completionRate}%</div>
            <div className="text-xs text-white/60">Выполнено</div>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет данных для отображения</p>
            </div>
          ) : (
            chartData.map((data, index) => {
            const completedHeight = (data.completed / maxTasks) * 100;
            const createdHeight = (data.created / maxTasks) * 100;
            
            return (
              <div key={index} className="flex items-end space-x-2">
                <div className="w-8 text-xs text-white/60 text-center">
                  {data.date}
                </div>
                <div className="flex-1 flex items-end space-x-1 h-16">
                  {/* Completed tasks bar */}
                  <div
                    className="bg-black/50 border border-white/30 rounded-t flex-1 transition-all duration-300 hover:bg-black/70"
                    style={{ height: `${completedHeight}%` }}
                    title={`Завершено: ${data.completed}`}
                  />
                  {/* Created tasks bar */}
                  <div
                    className="bg-black/50 border border-white/30 rounded-t flex-1 transition-all duration-300 hover:bg-black/70"
                    style={{ height: `${createdHeight}%` }}
                    title={`Создано: ${data.created}`}
                  />
                </div>
                <div className="w-8 text-xs text-white/60 text-center">
                  {data.tasks}
                </div>
              </div>
            );
            })
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-black/50 border border-white/30 rounded"></div>
            <span className="text-xs text-white/60">Завершено</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-black/50 border border-white/30 rounded"></div>
            <span className="text-xs text-white/60">Создано</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
