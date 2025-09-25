"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Command, Plus, Search, Settings, Users, BarChart3, Calendar, CheckSquare } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
  icon?: React.ReactNode;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ["Ctrl", "K"], description: "Глобальный поиск", category: "Навигация", icon: <Search className="h-4 w-4" /> },
  { keys: ["Ctrl", "1"], description: "Dashboard", category: "Навигация", icon: <BarChart3 className="h-4 w-4" /> },
  { keys: ["Ctrl", "2"], description: "Проекты", category: "Навигация", icon: <CheckSquare className="h-4 w-4" /> },
  { keys: ["Ctrl", "3"], description: "Задачи", category: "Навигация", icon: <CheckSquare className="h-4 w-4" /> },
  { keys: ["Ctrl", "4"], description: "Календарь", category: "Навигация", icon: <Calendar className="h-4 w-4" /> },
  { keys: ["Ctrl", "5"], description: "Команда", category: "Навигация", icon: <Users className="h-4 w-4" /> },
  { keys: ["Ctrl", "6"], description: "Аналитика", category: "Навигация", icon: <BarChart3 className="h-4 w-4" /> },
  { keys: ["Ctrl", ","], description: "Настройки", category: "Навигация", icon: <Settings className="h-4 w-4" /> },
  
  // Actions
  { keys: ["Ctrl", "N"], description: "Создать новую задачу", category: "Действия", icon: <Plus className="h-4 w-4" /> },
  { keys: ["Ctrl", "Shift", "N"], description: "Создать новый проект", category: "Действия", icon: <Plus className="h-4 w-4" /> },
  { keys: ["Ctrl", "Shift", "W"], description: "Создать рабочее пространство", category: "Действия", icon: <Plus className="h-4 w-4" /> },
  { keys: ["Ctrl", "Enter"], description: "Сохранить изменения", category: "Действия" },
  { keys: ["Escape"], description: "Отменить/Закрыть", category: "Действия" },
  
  // Drag & Drop
  { keys: ["Space"], description: "Выбрать задачу для перетаскивания", category: "Drag & Drop" },
  { keys: ["Arrow", "Left"], description: "Переместить задачу влево", category: "Drag & Drop" },
  { keys: ["Arrow", "Right"], description: "Переместить задачу вправо", category: "Drag & Drop" },
  { keys: ["Arrow", "Up"], description: "Переместить задачу вверх", category: "Drag & Drop" },
  { keys: ["Arrow", "Down"], description: "Переместить задачу вниз", category: "Drag & Drop" },
  
  // Developer shortcuts
  { keys: ["Ctrl", "Shift", "D"], description: "Открыть DevTools", category: "Разработка" },
  { keys: ["Ctrl", "Shift", "R"], description: "Обновить страницу", category: "Разработка" },
  { keys: ["F12"], description: "Инспектор элементов", category: "Разработка" },
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Все");

  const categories = ["Все", ...Array.from(new Set(shortcuts.map(s => s.category)))];

  const filteredShortcuts = selectedCategory === "Все" 
    ? shortcuts 
    : shortcuts.filter(s => s.category === selectedCategory);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + ? для открытия справки по клавишам
      if (event.ctrlKey && event.key === "?") {
        event.preventDefault();
        setIsOpen(true);
      }
      
      // Глобальные навигационные клавиши
      if (event.ctrlKey && !event.shiftKey && !event.altKey) {
        switch (event.key) {
          case "k":
            event.preventDefault();
            // Фокус на поиск
            const searchInput = document.querySelector('input[placeholder*="Поиск"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
            break;
          case "1":
            event.preventDefault();
            window.location.href = "/dashboard";
            break;
          case "2":
            event.preventDefault();
            window.location.href = "/projects";
            break;
          case "3":
            event.preventDefault();
            window.location.href = "/tasks";
            break;
          case "4":
            event.preventDefault();
            window.location.href = "/calendar";
            break;
          case "5":
            event.preventDefault();
            window.location.href = "/team";
            break;
          case "6":
            event.preventDefault();
            window.location.href = "/analytics";
            break;
          case ",":
            event.preventDefault();
            window.location.href = "/settings";
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderKey = (key: string) => {
    const isSpecial = ["Ctrl", "Shift", "Alt", "Command", "Arrow"].includes(key);
    return (
      <Badge 
        key={key}
        className={`px-2 py-1 text-xs font-mono ${
          isSpecial 
            ? "bg-white/20 text-white/90 border border-white/30" 
            : "bg-white/10 text-white/80 border border-white/20"
        }`}
      >
        {key}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
          title="Клавишные сокращения (Ctrl + ?)"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/20 max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Клавишные сокращения
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Удобные горячие клавиши для быстрой навигации и работы
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-white/10 text-white border-white/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Shortcuts Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredShortcuts.map((shortcut, index) => (
                <Card key={index} className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {shortcut.icon && (
                          <div className="text-white/60">
                            {shortcut.icon}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {shortcut.description}
                          </p>
                          <p className="text-xs text-white/60">
                            {shortcut.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <div key={keyIndex} className="flex items-center">
                            {renderKey(key)}
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-white/40">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-white/60 text-center">
              Нажмите <Badge className="mx-1 bg-white/20 text-white/90 border border-white/30">Ctrl</Badge> + 
              <Badge className="mx-1 bg-white/20 text-white/90 border border-white/30">?</Badge> в любое время для открытия этой справки
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
