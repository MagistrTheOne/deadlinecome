"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Settings, 
  Star, 
  Archive, 
  Trash2, 
  Copy, 
  Eye, 
  Edit3,
  MoreHorizontal,
  Filter,
  Search,
  Grid3X3,
  List,
  Kanban,
  Calendar,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Board {
  id: string;
  name: string;
  description?: string;
  type: 'kanban' | 'scrum' | 'custom';
  workspaceId: string;
  projectId?: string;
  isDefault: boolean;
  isArchived: boolean;
  settings: {
    columns: Array<{
      id: string;
      name: string;
      status: string;
      color?: string;
      order: number;
    }>;
    filters: Array<any>;
    quickFilters: Array<{
      id: string;
      name: string;
      jql: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

interface BoardTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  isPublic: boolean;
  usageCount: number;
  template: any;
}

export default function BoardManager() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [templates, setTemplates] = useState<BoardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Форма создания доски
  const [newBoard, setNewBoard] = useState({
    name: '',
    description: '',
    type: 'kanban' as const,
    workspaceId: '',
    projectId: '',
    templateId: ''
  });

  // Форма создания шаблона
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: 'kanban',
    isPublic: false
  });

  useEffect(() => {
    fetchBoards();
    fetchTemplates();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards');
      const data = await response.json();
      if (data.success) {
        setBoards(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/boards/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const createBoard = async () => {
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoard)
      });

      const data = await response.json();
      if (data.success) {
        setBoards([...boards, data.data]);
        setShowCreateDialog(false);
        setNewBoard({
          name: '',
          description: '',
          type: 'kanban',
          workspaceId: '',
          projectId: '',
          templateId: ''
        });
      }
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const createTemplate = async () => {
    try {
      const response = await fetch('/api/boards/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });

      const data = await response.json();
      if (data.success) {
        setTemplates([...templates, data.data]);
        setShowTemplateDialog(false);
        setNewTemplate({
          name: '',
          description: '',
          type: 'kanban',
          isPublic: false
        });
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const archiveBoard = async (boardId: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/archive`, {
        method: 'POST'
      });

      if (response.ok) {
        setBoards(boards.map(board => 
          board.id === boardId ? { ...board, isArchived: true } : board
        ));
      }
    } catch (error) {
      console.error('Failed to archive board:', error);
    }
  };

  const deleteBoard = async (boardId: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBoards(boards.filter(board => board.id !== boardId));
      }
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  };

  const toggleFavorite = async (boardId: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST'
      });

      if (response.ok) {
        // Обновляем состояние избранного
        // В реальном приложении здесь нужно обновить состояние
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const filteredBoards = boards.filter(board => {
    const matchesSearch = board.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || board.type === filterType;
    return matchesSearch && matchesType;
  });

  const getBoardIcon = (type: string) => {
    switch (type) {
      case 'kanban': return <Kanban className="h-5 w-5" />;
      case 'scrum': return <BarChart3 className="h-5 w-5" />;
      case 'custom': return <Settings className="h-5 w-5" />;
      default: return <Grid3X3 className="h-5 w-5" />;
    }
  };

  const getBoardColor = (type: string) => {
    switch (type) {
      case 'kanban': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'scrum': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'custom': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Управление досками</h1>
          <p className="text-white/70 mt-2">
            Создавайте и настраивайте доски для ваших проектов
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowTemplateDialog(true)}
            variant="outline"
            className="glass-button"
          >
            <Settings className="h-4 w-4 mr-2" />
            Шаблоны
          </Button>
          
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Создать доску
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            placeholder="Поиск досок..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-input"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 glass-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="kanban">Kanban</SelectItem>
            <SelectItem value="scrum">Scrum</SelectItem>
            <SelectItem value="custom">Пользовательские</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="glass-button"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="glass-button"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Boards Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        {filteredBoards.map((board) => (
          <Card key={board.id} className="glass-card hover:glass-hover transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getBoardColor(board.type)}`}>
                    {getBoardIcon(board.type)}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{board.name}</CardTitle>
                    <CardDescription className="text-white/60">
                      {board.description || 'Без описания'}
                    </CardDescription>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="glass-button">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-modal">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Открыть
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Дублировать
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Star className="h-4 w-4 mr-2" />
                      В избранное
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Архивировать
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-400"
                      onClick={() => deleteBoard(board.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className={getBoardColor(board.type)}>
                  {board.type.toUpperCase()}
                </Badge>
                
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="h-4 w-4" />
                  {new Date(board.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Board Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {board.settings?.columns?.length || 0}
                  </div>
                  <div className="text-xs text-white/60">Колонки</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-xs text-white/60">Задачи</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-xs text-white/60">Участники</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1 glass-button">
                  <Eye className="h-4 w-4 mr-1" />
                  Открыть
                </Button>
                <Button size="sm" variant="outline" className="glass-button">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Board Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="glass-modal">
          <DialogHeader>
            <DialogTitle className="text-white">Создать новую доску</DialogTitle>
            <DialogDescription className="text-white/70">
              Выберите тип доски и настройте её параметры
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Название доски</Label>
              <Input
                id="name"
                value={newBoard.name}
                onChange={(e) => setNewBoard({...newBoard, name: e.target.value})}
                className="glass-input"
                placeholder="Введите название доски"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-white">Описание</Label>
              <Textarea
                id="description"
                value={newBoard.description}
                onChange={(e) => setNewBoard({...newBoard, description: e.target.value})}
                className="glass-input"
                placeholder="Описание доски (необязательно)"
              />
            </div>
            
            <div>
              <Label htmlFor="type" className="text-white">Тип доски</Label>
              <Select value={newBoard.type} onValueChange={(value: any) => setNewBoard({...newBoard, type: value})}>
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">Kanban</SelectItem>
                  <SelectItem value="scrum">Scrum</SelectItem>
                  <SelectItem value="custom">Пользовательская</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="glass-button">
              Отмена
            </Button>
            <Button onClick={createBoard} className="bg-gradient-to-r from-blue-500 to-purple-600">
              Создать доску
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="glass-modal">
          <DialogHeader>
            <DialogTitle className="text-white">Создать шаблон доски</DialogTitle>
            <DialogDescription className="text-white/70">
              Создайте шаблон для быстрого создания досок
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name" className="text-white">Название шаблона</Label>
              <Input
                id="template-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="glass-input"
                placeholder="Введите название шаблона"
              />
            </div>
            
            <div>
              <Label htmlFor="template-description" className="text-white">Описание</Label>
              <Textarea
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                className="glass-input"
                placeholder="Описание шаблона"
              />
            </div>
            
            <div>
              <Label htmlFor="template-type" className="text-white">Тип шаблона</Label>
              <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({...newTemplate, type: value})}>
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">Kanban</SelectItem>
                  <SelectItem value="scrum">Scrum</SelectItem>
                  <SelectItem value="bug-tracking">Отслеживание багов</SelectItem>
                  <SelectItem value="content">Контент-план</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)} className="glass-button">
              Отмена
            </Button>
            <Button onClick={createTemplate} className="bg-gradient-to-r from-green-500 to-blue-600">
              Создать шаблон
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
