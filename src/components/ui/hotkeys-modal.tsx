"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FolderKanban, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus, 
  Save, 
  X, 
  Space, 
  Code, 
  Palette,
  Brain,
  Zap,
  Keyboard,
  X as CloseIcon
} from "lucide-react";
import { useHotkeys } from "@/lib/hotkeys";

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HotkeysModal({ isOpen, onClose }: HotkeysModalProps) {
  const [activeTab, setActiveTab] = useState('all');
  const { getAllHotkeys, getHotkeysByCategory } = useHotkeys();
  const [hotkeys, setHotkeys] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHotkeys(getAllHotkeys());
    }
  }, [isOpen, getAllHotkeys]);

  const getIcon = (description: string) => {
    if (description.includes('поиск') || description.includes('Поиск')) return <Search className="h-4 w-4" />;
    if (description.includes('проект') || description.includes('Проект')) return <FolderKanban className="h-4 w-4" />;
    if (description.includes('календарь') || description.includes('Календарь')) return <Calendar className="h-4 w-4" />;
    if (description.includes('аналитика') || description.includes('Аналитика')) return <BarChart3 className="h-4 w-4" />;
    if (description.includes('настройки') || description.includes('Настройки')) return <Settings className="h-4 w-4" />;
    if (description.includes('создать') || description.includes('Создать')) return <Plus className="h-4 w-4" />;
    if (description.includes('сохранить') || description.includes('Сохранить')) return <Save className="h-4 w-4" />;
    if (description.includes('отменить') || description.includes('Отменить')) return <X className="h-4 w-4" />;
    if (description.includes('перетаскивания') || description.includes('Перетаскивания')) return <Space className="h-4 w-4" />;
    if (description.includes('Василий') || description.includes('AI')) return <Brain className="h-4 w-4" />;
    if (description.includes('генератор') || description.includes('Генератор')) return <Code className="h-4 w-4" />;
    if (description.includes('дизайн') || description.includes('Дизайн')) return <Palette className="h-4 w-4" />;
    return <Keyboard className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'actions': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'drag-drop': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'development': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'navigation': return 'Навигация';
      case 'actions': return 'Действия';
      case 'drag-drop': return 'Drag & Drop';
      case 'development': return 'Разработка';
      default: return category;
    }
  };

  const getKeyDisplay = (hotkey: any) => {
    const keys = [];
    if (hotkey.ctrl) keys.push('Ctrl');
    if (hotkey.shift) keys.push('Shift');
    if (hotkey.alt) keys.push('Alt');
    if (hotkey.meta) keys.push('Meta');
    
    let key = hotkey.key;
    if (key === ' ') key = 'Space';
    if (key === ',') key = ',';
    if (key === 'Enter') key = 'Enter';
    if (key === 'Escape') key = 'Esc';
    
    keys.push(key);
    return keys.join(' + ');
  };

  const filteredHotkeys = activeTab === 'all' 
    ? hotkeys 
    : getHotkeysByCategory(activeTab);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-black/90 backdrop-blur-xl border border-white/20 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Keyboard className="h-6 w-6" />
                Клавишные сокращения
              </DialogTitle>
              <p className="text-white/60 text-sm mt-1">
                Удобные горячие клавиши для быстрой навигации и работы
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 border-white/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/20">
              Все
            </TabsTrigger>
            <TabsTrigger value="navigation" className="data-[state=active]:bg-white/20">
              Навигация
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-white/20">
              Действия
            </TabsTrigger>
            <TabsTrigger value="drag-drop" className="data-[state=active]:bg-white/20">
              Drag & Drop
            </TabsTrigger>
            <TabsTrigger value="development" className="data-[state=active]:bg-white/20">
              Разработка
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-3 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredHotkeys.map((hotkey, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      {getIcon(hotkey.description)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{hotkey.description}</h4>
                      <Badge className={`text-xs ${getCategoryColor(hotkey.category)}`}>
                        {getCategoryName(hotkey.category)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getKeyDisplay(hotkey).split(' + ').map((key, i) => (
                      <div key={i} className="flex items-center gap-1">
                        {i > 0 && <span className="text-white/40">+</span>}
                        <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white">
                          {key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
