"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface ChartData {
  date: string;
  tasks: number;
  completed: number;
  created: number;
}

const mockData: ChartData[] = [
  { date: "Пн", tasks: 12, completed: 8, created: 5 },
  { date: "Вт", tasks: 15, completed: 12, created: 7 },
  { date: "Ср", tasks: 18, completed: 15, created: 6 },
  { date: "Чт", tasks: 14, completed: 11, created: 4 },
  { date: "Пт", tasks: 16, completed: 13, created: 8 },
  { date: "Сб", tasks: 8, completed: 6, created: 2 },
  { date: "Вс", tasks: 5, completed: 4, created: 1 },
];

export function ActivityChart() {
  const maxTasks = Math.max(...mockData.map(d => d.tasks));
  const totalCompleted = mockData.reduce((sum, d) => sum + d.completed, 0);
  const totalCreated = mockData.reduce((sum, d) => sum + d.created, 0);
  const completionRate = Math.round((totalCompleted / (totalCompleted + totalCreated)) * 100);

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
          {mockData.map((data, index) => {
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
          })}
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
