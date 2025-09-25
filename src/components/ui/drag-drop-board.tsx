"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import { DragDropColumn } from "./drag-drop-column";
import { DragDropCard } from "./drag-drop-card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, Keyboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

interface DragDropBoardProps {
  initialColumns?: Column[];
  onTaskMove?: (taskId: string, newStatus: string) => void;
  onTaskAdd?: (columnId: string) => void;
}

const defaultColumns: Column[] = [
  {
    id: "todo",
    title: "К выполнению",
    status: "TODO",
    tasks: []
  },
  {
    id: "in-progress",
    title: "В работе",
    status: "IN_PROGRESS",
    tasks: []
  },
  {
    id: "done",
    title: "Выполнено",
    status: "DONE",
    tasks: []
  },
  {
    id: "blocked",
    title: "Заблокировано",
    status: "BLOCKED",
    tasks: []
  }
];

export function DragDropBoard({ 
  initialColumns = defaultColumns, 
  onTaskMove,
  onTaskAdd 
}: DragDropBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const newColumnId = over.id as string;
    
    // Найти задачу и новую колонку
    const task = findTaskById(taskId);
    const newColumn = columns.find(col => col.id === newColumnId);
    
    if (!task || !newColumn) return;

    // Обновить статус задачи
    const updatedTask = { ...task, status: newColumn.status };
    
    // Обновить колонки
    setColumns(prevColumns => {
      return prevColumns.map(column => ({
        ...column,
        tasks: column.tasks.filter(t => t.id !== taskId)
      })).map(column => {
        if (column.id === newColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, updatedTask]
          };
        }
        return column;
      });
    });

    // Вызвать callback
    onTaskMove?.(taskId, newColumn.status);
    
    setActiveTask(null);
  };

  const findTaskById = (taskId: string): Task | null => {
    for (const column of columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const handleAddTask = (columnId: string) => {
    onTaskAdd?.(columnId);
  };

  // Keyboard navigation for tasks
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedTaskId) return;

      const selectedTask = findTaskById(selectedTaskId);
      if (!selectedTask) return;

      const currentColumnIndex = columns.findIndex(col => 
        col.tasks.some(task => task.id === selectedTaskId)
      );
      const currentColumn = columns[currentColumnIndex];
      const taskIndex = currentColumn.tasks.findIndex(task => task.id === selectedTaskId);

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (currentColumnIndex > 0) {
            moveTaskToColumn(selectedTaskId, columns[currentColumnIndex - 1].id);
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (currentColumnIndex < columns.length - 1) {
            moveTaskToColumn(selectedTaskId, columns[currentColumnIndex + 1].id);
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (taskIndex > 0) {
            // Move task up within the same column
            const newTasks = [...currentColumn.tasks];
            [newTasks[taskIndex - 1], newTasks[taskIndex]] = [newTasks[taskIndex], newTasks[taskIndex - 1]];
            setColumns(prev => prev.map(col => 
              col.id === currentColumn.id ? { ...col, tasks: newTasks } : col
            ));
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (taskIndex < currentColumn.tasks.length - 1) {
            // Move task down within the same column
            const newTasks = [...currentColumn.tasks];
            [newTasks[taskIndex], newTasks[taskIndex + 1]] = [newTasks[taskIndex + 1], newTasks[taskIndex]];
            setColumns(prev => prev.map(col => 
              col.id === currentColumn.id ? { ...col, tasks: newTasks } : col
            ));
          }
          break;
        case "Enter":
          event.preventDefault();
          // Open task details or edit mode
          console.log("Edit task:", selectedTaskId);
          break;
        case "Delete":
          event.preventDefault();
          // Delete task
          setColumns(prev => prev.map(col => ({
            ...col,
            tasks: col.tasks.filter(task => task.id !== selectedTaskId)
          })));
          setSelectedTaskId(null);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedTaskId, columns]);

  const moveTaskToColumn = (taskId: string, newColumnId: string) => {
    const task = findTaskById(taskId);
    const newColumn = columns.find(col => col.id === newColumnId);
    
    if (!task || !newColumn) return;

    const updatedTask = { ...task, status: newColumn.status };
    
    setColumns(prevColumns => {
      return prevColumns.map(column => ({
        ...column,
        tasks: column.tasks.filter(t => t.id !== taskId)
      })).map(column => {
        if (column.id === newColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, updatedTask]
          };
        }
        return column;
      });
    });

    onTaskMove?.(taskId, newColumn.status);
  };

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }));

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">Доска задач</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              type="text"
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowKeyboardShortcuts(true)}
            className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
            title="Клавишные сокращения: Ctrl + ?"
          >
            <Keyboard className="mr-2 h-4 w-4" />
            Горячие клавиши
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`border-white/20 text-white/80 hover:text-white hover:bg-white/10 ${showFilters ? 'bg-white/10' : ''}`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
          <Button
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить задачу
          </Button>
        </div>
      </div>

      {/* Drag & Drop Board */}
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredColumns.map((column) => (
            <DragDropColumn
              key={column.id}
              column={column}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <DragDropCard task={activeTask} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg">
          <h3 className="text-white font-medium mb-3">Фильтры</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-black/50 text-white border-white/30 cursor-pointer hover:bg-black/70">
              Высокий приоритет
            </Badge>
            <Badge className="bg-black/50 text-white border-white/30 cursor-pointer hover:bg-black/70">
              Средний приоритет
            </Badge>
            <Badge className="bg-black/50 text-white border-white/30 cursor-pointer hover:bg-black/70">
              Низкий приоритет
            </Badge>
            <Badge className="bg-black/50 text-white border-white/30 cursor-pointer hover:bg-black/70">
              Заблокированные
            </Badge>
            <Badge className="bg-white/10 text-white/80 border-white/20 cursor-pointer hover:bg-white/20">
              Назначенные мне
            </Badge>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Клавишные сокращения для доски задач
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Горячие клавиши для быстрой работы с задачами
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="text-white font-medium">Навигация</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Выбрать задачу</span>
                    <Badge className="bg-white/10 text-white/80">↑↓</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Редактировать задачу</span>
                    <Badge className="bg-white/10 text-white/80">Enter</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Удалить задачу</span>
                    <Badge className="bg-white/10 text-white/80">Delete</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-white font-medium">Действия</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Создать задачу</span>
                    <Badge className="bg-white/10 text-white/80">Ctrl + N</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Поиск</span>
                    <Badge className="bg-white/10 text-white/80">Ctrl + F</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Фильтры</span>
                    <Badge className="bg-white/10 text-white/80">Ctrl + Shift + F</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
