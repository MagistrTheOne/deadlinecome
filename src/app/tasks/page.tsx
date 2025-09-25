"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DragDropBoard } from "@/components/ui/drag-drop-board";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Circle, Clock, AlertCircle, Plus, List, Kanban } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignee?: string;
  projectName?: string;
}

interface Column {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  tasks: Task[];
}

export default function TasksPage() {
  const { data: session, isPending } = useSession();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST",
    status: "TODO" as "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED",
  });
  const [activeFilter, setActiveFilter] = useState("all");

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Пример данных для демонстрации
  const initialColumns: Column[] = [
    {
      id: "todo",
      title: "К выполнению",
      status: "TODO",
      tasks: [
        {
          id: "1",
          title: "Создать дизайн главной страницы",
          description: "Разработать современный дизайн с glassmorphism эффектами",
          status: "TODO",
          priority: "HIGH",
          assignee: "MagistrTheOne",
          projectName: "DeadLine"
        },
        {
          id: "2",
          title: "Настроить аутентификацию",
          description: "Интегрировать Better Auth с Google OAuth",
          status: "TODO",
          priority: "MEDIUM",
          assignee: "MagistrTheOne",
          projectName: "DeadLine"
        }
      ]
    },
    {
      id: "in-progress",
      title: "В работе",
      status: "IN_PROGRESS",
      tasks: [
        {
          id: "3",
          title: "Реализовать Drag & Drop",
          description: "Добавить функциональность перетаскивания задач",
          status: "IN_PROGRESS",
          priority: "HIGH",
          assignee: "MagistrTheOne",
          projectName: "DeadLine"
        }
      ]
    },
    {
      id: "done",
      title: "Выполнено",
      status: "DONE",
      tasks: [
        {
          id: "4",
          title: "Создать базу данных",
          description: "Настроить Neon PostgreSQL с Drizzle ORM",
          status: "DONE",
          priority: "HIGH",
          assignee: "MagistrTheOne",
          projectName: "DeadLine"
        }
      ]
    },
    {
      id: "blocked",
      title: "Заблокировано",
      status: "BLOCKED",
      tasks: []
    }
  ];

  const handleTaskMove = (taskId: string, newStatus: string) => {
    console.log(`Task ${taskId} moved to ${newStatus}`);
    // Здесь можно добавить API вызов для обновления статуса задачи
  };

  const handleTaskAdd = (columnId: string) => {
    console.log(`Add task to column ${columnId}`);
    setIsCreateDialogOpen(true);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    setIsLoading(true);
    try {
      // Здесь будет API вызов для создания задачи
      console.log("Creating task:", newTask);
      
      // Сброс формы
      setNewTask({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Мои задачи</h1>
          <p className="text-white/60">
            Управление вашими задачами и проектами
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-1">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className={viewMode === "kanban" 
                ? "bg-white/10 text-white border-white/20" 
                : "text-white/60 hover:text-white hover:bg-white/10"
              }
            >
              <Kanban className="mr-2 h-4 w-4" />
              Доска
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" 
                ? "bg-white/10 text-white border-white/20" 
                : "text-white/60 hover:text-white hover:bg-white/10"
              }
            >
              <List className="mr-2 h-4 w-4" />
              Список
            </Button>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
              >
                <Plus className="mr-2 h-4 w-4" />
                Создать задачу
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">Создать новую задачу</DialogTitle>
                <DialogDescription className="text-white/60">
                  Заполните информацию о новой задаче
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Название задачи</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Введите название задачи..."
                    className="bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Описание</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Описание задачи..."
                    className="bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-white">Приоритет</Label>
                    <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger className="bg-black/50 backdrop-blur-sm border border-white/20 text-white">
                        <SelectValue placeholder="Выберите приоритет" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/80 border border-white/20">
                        <SelectItem value="LOWEST" className="text-white">Низший</SelectItem>
                        <SelectItem value="LOW" className="text-white">Низкий</SelectItem>
                        <SelectItem value="MEDIUM" className="text-white">Средний</SelectItem>
                        <SelectItem value="HIGH" className="text-white">Высокий</SelectItem>
                        <SelectItem value="HIGHEST" className="text-white">Высший</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-white">Статус</Label>
                    <Select value={newTask.status} onValueChange={(value: any) => setNewTask({ ...newTask, status: value })}>
                      <SelectTrigger className="bg-black/50 backdrop-blur-sm border border-white/20 text-white">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/80 border border-white/20">
                        <SelectItem value="TODO" className="text-white">К выполнению</SelectItem>
                        <SelectItem value="IN_PROGRESS" className="text-white">В работе</SelectItem>
                        <SelectItem value="DONE" className="text-white">Выполнено</SelectItem>
                        <SelectItem value="BLOCKED" className="text-white">Заблокировано</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleCreateTask}
                  disabled={isLoading || !newTask.title.trim()}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
                >
                  {isLoading ? "Создание..." : "Создать"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant={activeFilter === "all" ? "default" : "outline"}
          size="sm" 
          onClick={() => setActiveFilter("all")}
          className={activeFilter === "all" 
            ? "bg-white/10 text-white border-white/20" 
            : "border-white/20 text-white/80 hover:text-white hover:bg-white/10"
          }
        >
          Все задачи
        </Button>
        <Button 
          variant={activeFilter === "assigned" ? "default" : "ghost"}
          size="sm" 
          onClick={() => setActiveFilter("assigned")}
          className={activeFilter === "assigned" 
            ? "bg-white/10 text-white border-white/20" 
            : "text-white/60 hover:text-white hover:bg-white/10"
          }
        >
          Назначенные мне
        </Button>
        <Button 
          variant={activeFilter === "in-progress" ? "default" : "ghost"}
          size="sm" 
          onClick={() => setActiveFilter("in-progress")}
          className={activeFilter === "in-progress" 
            ? "bg-white/10 text-white border-white/20" 
            : "text-white/60 hover:text-white hover:bg-white/10"
          }
        >
          В работе
        </Button>
        <Button 
          variant={activeFilter === "completed" ? "default" : "ghost"}
          size="sm" 
          onClick={() => setActiveFilter("completed")}
          className={activeFilter === "completed" 
            ? "bg-white/10 text-white border-white/20" 
            : "text-white/60 hover:text-white hover:bg-white/10"
          }
        >
          Завершенные
        </Button>
      </div>

      {/* Tasks Content */}
      {viewMode === "kanban" ? (
        <DragDropBoard
          initialColumns={initialColumns}
          onTaskMove={handleTaskMove}
          onTaskAdd={handleTaskAdd}
        />
      ) : (
        <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Список задач</CardTitle>
            <CardDescription className="text-white/60">
              Все ваши задачи в виде списка
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-white/60">
              <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Список задач</p>
              <p className="text-sm">Переключитесь на доску для просмотра задач</p>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}