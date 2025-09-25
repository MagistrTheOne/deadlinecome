"use client";

import { useSession } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
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

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  // Генерируем календарную сетку
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Календарь</h1>
          <p className="text-gray-400">
            Планирование и отслеживание задач
          </p>
        </div>
        <Button className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500">
          <Plus className="mr-2 h-4 w-4" />
          Создать событие
        </Button>
      </div>

      {/* Calendar Header */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {currentMonth}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Сегодня
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 border border-gray-700 rounded-lg
                    ${isCurrentMonth ? 'bg-gray-800' : 'bg-gray-900 text-gray-500'}
                    ${isToday ? 'ring-2 ring-red-500' : ''}
                    hover:bg-gray-700 transition-colors cursor-pointer
                  `}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isToday ? 'text-red-400' : isCurrentMonth ? 'text-white' : 'text-gray-500'}
                  `}>
                    {date.getDate()}
                  </div>
                  
                  {/* Events placeholder */}
                  <div className="space-y-1">
                    {/* Здесь будут отображаться события */}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-gray-800 border-gray-700 mt-6">
        <CardHeader>
          <CardTitle className="text-white">Предстоящие события</CardTitle>
          <CardDescription className="text-gray-400">
            Ваши ближайшие задачи и встречи
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Нет предстоящих событий</p>
            <p className="text-sm">Создайте первое событие в календаре</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
