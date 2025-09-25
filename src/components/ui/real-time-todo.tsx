"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Calendar,
  Zap,
  Bot,
  Activity,
  RefreshCw
} from "lucide-react";

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  aiGenerated?: boolean;
}

interface RealTimeTodoProps {
  projectId: string;
  workspaceId: string;
}

export function RealTimeTodo({ projectId, workspaceId }: RealTimeTodoProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as const,
    assigneeId: "",
    dueDate: "",
  });
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [realTimeStatus, setRealTimeStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadTodos();
    loadTeamMembers();
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId]);

  const connectWebSocket = () => {
    setRealTimeStatus("connecting");
    
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setRealTimeStatus("connected");
      console.log("WebSocket connected");
      
      // Подписываемся на обновления проекта
      ws.send(JSON.stringify({
        type: "subscribe",
        projectId,
        workspaceId,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "todo_updated") {
        setTodos(prev => {
          const existingIndex = prev.findIndex(todo => todo.id === data.todo.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = data.todo;
            return updated;
          } else {
            return [...prev, data.todo];
          }
        });
      } else if (data.type === "todo_created") {
        setTodos(prev => [...prev, data.todo]);
      } else if (data.type === "todo_deleted") {
        setTodos(prev => prev.filter(todo => todo.id !== data.todoId));
      }
    };

    ws.onclose = () => {
      setRealTimeStatus("disconnected");
      console.log("WebSocket disconnected");
      
      // Переподключаемся через 3 секунды
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connectWebSocket();
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setRealTimeStatus("disconnected");
    };
  };

  const loadTodos = async () => {
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else {
        // Fallback демо-данные
        setTodos([
          {
            id: "demo-1",
            title: "Реализовать систему ролей",
            description: "Создать систему IT-ролей для умного распределения задач",
            status: "DONE",
            priority: "HIGH",
            assigneeId: "user-2",
            assigneeName: "Тим лид",
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            aiGenerated: false,
          },
          {
            id: "demo-2",
            title: "Настроить WebSocket для real-time",
            description: "Интегрировать WebSocket сервер для live-обновлений",
            status: "IN_PROGRESS",
            priority: "HIGH",
            assigneeId: "user-3",
            assigneeName: "Разработчик",
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            aiGenerated: false,
          },
          {
            id: "demo-3",
            title: "Улучшить Василия AI",
            description: "Добавить автораспределение задач и умные уведомления",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            assigneeId: "user-2",
            assigneeName: "Тим лид",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            aiGenerated: true,
          },
          {
            id: "demo-4",
            title: "Протестировать все компоненты",
            description: "Провести полное тестирование UI компонентов",
            status: "TODO",
            priority: "MEDIUM",
            assigneeId: "user-4",
            assigneeName: "QA Engineer",
            dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            aiGenerated: false,
          },
          {
            id: "demo-5",
            title: "Оптимизировать производительность",
            description: "Улучшить производительность real-time обновлений",
            status: "BLOCKED",
            priority: "URGENT",
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            aiGenerated: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading todos:", error);
      // Fallback демо-данные при ошибке
      setTodos([
        {
          id: "demo-1",
          title: "Реализовать систему ролей",
          description: "Создать систему IT-ролей для умного распределения задач",
          status: "DONE",
          priority: "HIGH",
          assigneeId: "user-2",
          assigneeName: "Тим лид",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          aiGenerated: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const response = await fetch(`/api/roles?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.members);
      }
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  const createTodo = async () => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTodo,
          projectId,
          status: "TODO",
        }),
      });

      if (response.ok) {
        const todo = await response.json();
        setTodos(prev => [...prev, todo]);
        setNewTodo({ title: "", description: "", priority: "MEDIUM", assigneeId: "", dueDate: "" });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const updateTodoStatus = async (todoId: string, status: TodoItem["status"]) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: todoId,
          status,
        }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(prev => prev.map(todo => 
          todo.id === todoId ? { ...todo, ...updatedTodo } : todo
        ));
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <Clock className="h-4 w-4 text-gray-400" />;
      case "IN_PROGRESS":
        return <RefreshCw className="h-4 w-4 text-blue-400" />;
      case "DONE":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "BLOCKED":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "IN_PROGRESS":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "DONE":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "BLOCKED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "URGENT":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "TODO":
        return "К выполнению";
      case "IN_PROGRESS":
        return "В работе";
      case "DONE":
        return "Выполнено";
      case "BLOCKED":
        return "Заблокировано";
      default:
        return "Неизвестно";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "Низкий";
      case "MEDIUM":
        return "Средний";
      case "HIGH":
        return "Высокий";
      case "URGENT":
        return "Срочный";
      default:
        return "Неизвестно";
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time TODO
                <div className={`w-2 h-2 rounded-full ${
                  realTimeStatus === "connected" ? "bg-green-400" : 
                  realTimeStatus === "connecting" ? "bg-yellow-400" : "bg-red-400"
                }`} />
              </CardTitle>
              <CardDescription className="text-white/60">
                Задачи с live-обновлениями и AI-автоматизацией
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать задачу
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Создать задачу</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Добавьте новую задачу в проект
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-white text-sm">Название</label>
                    <Input
                      value={newTodo.title}
                      onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                      placeholder="Название задачи..."
                      className="bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm">Описание</label>
                    <Textarea
                      value={newTodo.description}
                      onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                      placeholder="Описание задачи..."
                      className="bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white text-sm">Приоритет</label>
                      <Select
                        value={newTodo.priority}
                        onValueChange={(value: any) => setNewTodo({ ...newTodo, priority: value })}
                      >
                        <SelectTrigger className="bg-black/50 backdrop-blur-sm border border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 border border-white/20">
                          <SelectItem value="LOW" className="text-white">Низкий</SelectItem>
                          <SelectItem value="MEDIUM" className="text-white">Средний</SelectItem>
                          <SelectItem value="HIGH" className="text-white">Высокий</SelectItem>
                          <SelectItem value="URGENT" className="text-white">Срочный</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm">Исполнитель</label>
                      <Select
                        value={newTodo.assigneeId}
                        onValueChange={(value) => setNewTodo({ ...newTodo, assigneeId: value })}
                      >
                        <SelectTrigger className="bg-black/50 backdrop-blur-sm border border-white/20 text-white">
                          <SelectValue placeholder="Выберите исполнителя" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 border border-white/20">
                          {teamMembers.map((member) => (
                            <SelectItem key={member.userId} value={member.userId} className="text-white">
                              {member.itRoleInfo?.name || "Участник"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm">Срок выполнения</label>
                    <Input
                      type="date"
                      value={newTodo.dueDate}
                      onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                      className="bg-black/50 backdrop-blur-sm border border-white/20 text-white focus:border-white/40"
                    />
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
                    onClick={createTodo}
                    disabled={!newTodo.title}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
                  >
                    Создать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(todo.status)}
                    <div>
                      <div className="text-white font-medium">{todo.title}</div>
                      {todo.description && (
                        <div className="text-white/60 text-sm mt-1">{todo.description}</div>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(todo.status)}>
                          {getStatusText(todo.status)}
                        </Badge>
                        <Badge className={getPriorityColor(todo.priority)}>
                          {getPriorityText(todo.priority)}
                        </Badge>
                        {todo.aiGenerated && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            <Bot className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {todo.assigneeName && (
                    <div className="flex items-center space-x-1 text-white/60 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{todo.assigneeName}</span>
                    </div>
                  )}
                  
                  {todo.dueDate && (
                    <div className="flex items-center space-x-1 text-white/60 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <Select
                    value={todo.status}
                    onValueChange={(value: any) => updateTodoStatus(todo.id, value)}
                  >
                    <SelectTrigger className="w-32 bg-black/50 backdrop-blur-sm border border-white/20 text-white">
                      <SelectValue />
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
            ))}
            
            {todos.length === 0 && (
              <div className="text-center py-8 text-white/60">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Нет задач в проекте</p>
                <p className="text-sm">Создайте первую задачу для начала работы</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
