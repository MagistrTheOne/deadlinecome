"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Clock, User, AlertCircle, CheckCircle, Circle } from "lucide-react";
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

interface DragDropCardProps {
  task: Task;
  isOverlay?: boolean;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
}

export function DragDropCard({ task, isOverlay, isSelected, onSelect }: DragDropCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-black/50 text-white border-white/30";
      case "MEDIUM":
        return "bg-black/50 text-white border-white/30";
      case "LOW":
        return "bg-black/50 text-white border-white/30";
      default:
        return "bg-black/50 text-white border-white/30";
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
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 rotate-2 scale-105",
        isOverlay && "opacity-90 shadow-2xl",
        isSelected && "ring-2 ring-white/50 border-white/50"
      )}
      onClick={() => onSelect?.(task.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-white/60 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-sm font-medium text-white line-clamp-2">
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription className="text-xs text-white/60 mt-1 line-clamp-2">
                  {task.description}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-xs", getStatusColor(task.status))}>
              {getStatusIcon(task.status)}
              <span className="ml-1">{task.status}</span>
            </Badge>
            <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
              {task.priority}
            </Badge>
          </div>
        </div>
        
        {(task.assignee || task.projectName) && (
          <div className="flex items-center justify-between mt-3 text-xs text-white/60">
            {task.assignee && (
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{task.assignee}</span>
              </div>
            )}
            {task.projectName && (
              <span className="bg-white/10 px-2 py-1 rounded text-xs">
                {task.projectName}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
