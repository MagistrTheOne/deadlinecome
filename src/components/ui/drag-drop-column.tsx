"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Circle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { DragDropCard } from "./drag-drop-card";
import { cn } from "@/lib/utils";

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

interface DragDropColumnProps {
  column: Column;
  onAddTask?: (columnId: string) => void;
}

export function DragDropColumn({ column, onAddTask }: DragDropColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <Circle className="h-4 w-4 text-white/60" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-400" />;
      case "DONE":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "BLOCKED":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Circle className="h-4 w-4 text-white/60" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-black/50 text-white border-white/30";
      case "IN_PROGRESS":
        return "bg-black/50 text-white border-white/30";
      case "DONE":
        return "bg-black/50 text-white border-white/30";
      case "BLOCKED":
        return "bg-black/50 text-white border-white/30";
      default:
        return "bg-black/50 text-white border-white/30";
    }
  };

  return (
    <Card 
      className={cn(
        "bg-black/30 backdrop-blur-sm border border-white/20 min-h-[600px] transition-all duration-200",
        isOver && "border-white/40 bg-black/50"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(column.status)}
            <CardTitle className="text-sm font-medium text-white">
              {column.title}
            </CardTitle>
            <Badge className={cn("text-xs", getStatusColor(column.status))}>
              {column.tasks.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask?.(column.id)}
            className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-auto"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div
          ref={setNodeRef}
          className={cn(
            "space-y-3 min-h-[500px] p-2 rounded-lg transition-all duration-200",
            isOver && "bg-white/5 border-2 border-dashed border-white/30"
          )}
        >
          <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task) => (
              <DragDropCard key={task.id} task={task} />
            ))}
          </SortableContext>
          
          {column.tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-white/40 text-sm">
              <div className="text-center">
                <div className="mb-2">
                  {getStatusIcon(column.status)}
                </div>
                <p>Нет задач</p>
                <p className="text-xs">Перетащите задачу сюда</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
