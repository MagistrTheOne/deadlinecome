"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Plus, 
  Clock, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  FileText,
  Link,
  Star
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: "task" | "project" | "team" | "analytics";
}

const quickActions: QuickAction[] = [
  {
    id: "create-task",
    title: "Быстрая задача",
    description: "Создать задачу за 30 секунд",
    icon: <Plus className="h-4 w-4" />,
    shortcut: "Ctrl + N",
    category: "task"
  },
  {
    id: "time-track",
    title: "Учет времени",
    description: "Запустить таймер для задачи",
    icon: <Clock className="h-4 w-4" />,
    shortcut: "Ctrl + T",
    category: "task"
  },
  {
    id: "assign-task",
    title: "Назначить задачу",
    description: "Быстро назначить задачу участнику",
    icon: <Users className="h-4 w-4" />,
    shortcut: "Ctrl + A",
    category: "team"
  },
  {
    id: "set-deadline",
    title: "Установить дедлайн",
    description: "Назначить срок выполнения",
    icon: <Target className="h-4 w-4" />,
    shortcut: "Ctrl + D",
    category: "task"
  },
  {
    id: "create-sprint",
    title: "Новый спринт",
    description: "Создать спринт для команды",
    icon: <TrendingUp className="h-4 w-4" />,
    shortcut: "Ctrl + S",
    category: "project"
  },
  {
    id: "schedule-meeting",
    title: "Запланировать встречу",
    description: "Создать встречу в календаре",
    icon: <Calendar className="h-4 w-4" />,
    shortcut: "Ctrl + M",
    category: "team"
  },
  {
    id: "add-comment",
    title: "Добавить комментарий",
    description: "Быстро оставить комментарий",
    icon: <MessageSquare className="h-4 w-4" />,
    shortcut: "Ctrl + /",
    category: "task"
  },
  {
    id: "create-report",
    title: "Создать отчет",
    description: "Сгенерировать отчет по проекту",
    icon: <FileText className="h-4 w-4" />,
    shortcut: "Ctrl + R",
    category: "analytics"
  }
];

export function QuickActions() {
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleActionClick = (action: QuickAction) => {
    setSelectedAction(action);
    setIsDialogOpen(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "task":
        return "bg-black/50 text-white border-white/30";
      case "project":
        return "bg-black/50 text-white border-white/30";
      case "team":
        return "bg-black/50 text-white border-white/30";
      case "analytics":
        return "bg-black/50 text-white border-white/30";
      default:
        return "bg-black/50 text-white border-white/30";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "task":
        return "Задачи";
      case "project":
        return "Проекты";
      case "team":
        return "Команда";
      case "analytics":
        return "Аналитика";
      default:
        return "Общее";
    }
  };

  return (
    <>
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Быстрые действия
          </CardTitle>
          <CardDescription className="text-white/60">
            Ускорьте свою работу с помощью быстрых действий
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                className="h-auto p-4 justify-start text-left hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200"
                onClick={() => handleActionClick(action)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-1 text-white/80">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">
                        {action.title}
                      </h4>
                      {action.shortcut && (
                        <Badge className="bg-white/10 text-white/60 border-white/20 text-xs">
                          {action.shortcut}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      {action.description}
                    </p>
                    <Badge className={cn("text-xs mt-2", getCategoryColor(action.category))}>
                      {getCategoryName(action.category)}
                    </Badge>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedAction?.icon}
              {selectedAction?.title}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {selectedAction?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedAction && (
            <div className="space-y-4">
              {selectedAction.id === "create-task" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title" className="text-white">Название задачи</Label>
                    <Input
                      id="task-title"
                      placeholder="Введите название задачи..."
                      className="bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description" className="text-white">Описание</Label>
                    <Textarea
                      id="task-description"
                      placeholder="Описание задачи..."
                      className="bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-priority" className="text-white">Приоритет</Label>
                      <Select>
                        <SelectTrigger className="bg-black/50 backdrop-blur-sm border border-white/20 text-white">
                          <SelectValue placeholder="Выберите приоритет" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 border border-white/20">
                          <SelectItem value="low" className="text-white">Низкий</SelectItem>
                          <SelectItem value="medium" className="text-white">Средний</SelectItem>
                          <SelectItem value="high" className="text-white">Высокий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-assignee" className="text-white">Исполнитель</Label>
                      <Select>
                        <SelectTrigger className="bg-black/50 backdrop-blur-sm border border-white/20 text-white">
                          <SelectValue placeholder="Назначить" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 border border-white/20">
                          <SelectItem value="me" className="text-white">Мне</SelectItem>
                          <SelectItem value="team" className="text-white">Команде</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {selectedAction.id === "time-track" && (
                <div className="text-center py-8">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-white/60" />
                  <h3 className="text-lg font-semibold text-white mb-2">Учет времени</h3>
                  <p className="text-white/60 mb-4">Выберите задачу для отслеживания времени</p>
                  <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30">
                    Запустить таймер
                  </Button>
                </div>
              )}

              {selectedAction.id === "assign-task" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assign-task" className="text-white">Выберите задачу</Label>
                    <Select>
                      <SelectTrigger className="bg-black/50 backdrop-blur-sm border border-white/20 text-white">
                        <SelectValue placeholder="Выберите задачу" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/80 border border-white/20">
                        <SelectItem value="task1" className="text-white">Создать дизайн</SelectItem>
                        <SelectItem value="task2" className="text-white">Настроить API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assign-user" className="text-white">Назначить пользователю</Label>
                    <Select>
                      <SelectTrigger className="bg-black/50 backdrop-blur-sm border border-white/20 text-white">
                        <SelectValue placeholder="Выберите пользователя" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/80 border border-white/20">
                        <SelectItem value="user1" className="text-white">MagistrTheOne</SelectItem>
                        <SelectItem value="user2" className="text-white">Другой пользователь</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
                >
                  Выполнить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
