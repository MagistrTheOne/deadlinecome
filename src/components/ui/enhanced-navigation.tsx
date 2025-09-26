"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  Plus,
  Menu,
  X,
  ChevronDown,
  Star,
  Zap,
  Brain,
  Code,
  Target,
  Activity,
  Shield,
  Sparkles,
  MessageSquare,
  Minimize2
} from "lucide-react";

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string;
  isNew?: boolean;
  isPro?: boolean;
  children?: NavigationItem[];
}

interface EnhancedNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onChatToggle: () => void;
  onChatMinimize: () => void;
}

export function EnhancedNavigation({ 
  isOpen, 
  onToggle, 
  onChatToggle, 
  onChatMinimize 
}: EnhancedNavigationProps) {
  const [activeItem, setActiveItem] = useState("overview");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigationItems: NavigationItem[] = [
    {
      id: "overview",
      title: "Обзор",
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard"
    },
    {
      id: "projects",
      title: "Проекты",
      icon: <FolderOpen className="h-5 w-5" />,
      badge: "12",
      children: [
        { id: "all-projects", title: "Все проекты", icon: <FolderOpen className="h-4 w-4" /> },
        { id: "my-projects", title: "Мои проекты", icon: <Star className="h-4 w-4" /> },
        { id: "archived", title: "Архив", icon: <X className="h-4 w-4" /> }
      ]
    },
    {
      id: "team",
      title: "Команда",
      icon: <Users className="h-5 w-5" />,
      badge: "8",
      children: [
        { id: "members", title: "Участники", icon: <Users className="h-4 w-4" /> },
        { id: "roles", title: "Роли", icon: <Shield className="h-4 w-4" /> },
        { id: "permissions", title: "Разрешения", icon: <Target className="h-4 w-4" /> }
      ]
    },
    {
      id: "ai",
      title: "AI Ассистенты",
      icon: <Brain className="h-5 w-5" />,
      isNew: true,
      children: [
        { id: "vasily", title: "Василий - PM", icon: <Brain className="h-4 w-4" /> },
        { id: "vladimir", title: "Владимир - Code Review", icon: <Code className="h-4 w-4" /> },
        { id: "olga", title: "Ольга - Security", icon: <Shield className="h-4 w-4" /> }
      ]
    },
    {
      id: "analytics",
      title: "Аналитика",
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { id: "performance", title: "Производительность", icon: <Activity className="h-4 w-4" /> },
        { id: "reports", title: "Отчеты", icon: <BarChart3 className="h-4 w-4" /> },
        { id: "insights", title: "Инсайты", icon: <Zap className="h-4 w-4" /> }
      ]
    },
    {
      id: "premium",
      title: "Premium",
      icon: <Sparkles className="h-5 w-5" />,
      isPro: true,
      children: [
        { id: "ai-generator", title: "AI Генератор", icon: <Code className="h-4 w-4" /> },
        { id: "design-system", title: "Дизайн-система", icon: <Sparkles className="h-4 w-4" /> },
        { id: "predictor", title: "Предсказатель", icon: <Target className="h-4 w-4" /> }
      ]
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeItem === item.id;

    return (
      <div key={item.id}>
        <Button
          variant={isActive ? "default" : "ghost"}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              setActiveItem(item.id);
            }
          }}
          className={`w-full justify-start text-left h-auto p-3 ${
            level > 0 ? 'ml-4' : ''
          } ${
            isActive
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{item.title}</span>
                {item.isNew && (
                  <Badge className="bg-white/10 text-white border-white/20 text-xs">
                    NEW
                  </Badge>
                )}
                {item.isPro && (
                  <Badge className="bg-white/10 text-white border-white/20 text-xs">
                    PRO
                  </Badge>
                )}
                {item.badge && (
                  <Badge className="bg-white/10 text-white border-white/20 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </div>
            {hasChildren && (
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            )}
          </div>
        </Button>

        {/* Подменю */}
        {hasChildren && isExpanded && (
          <div className="ml-4 space-y-1">
            {item.children?.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-black/90 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DeadLine</h1>
                <p className="text-xs text-white/60">V2.0 Premium</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Поиск..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigationItems.map(item => renderNavigationItem(item))}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-white/10">
          <div className="space-y-2">
            <Button
              onClick={onChatToggle}
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Чат с Василием
            </Button>
            <Button
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Новый проект
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://avatars.githubusercontent.com/u/12345678?v=4" />
              <AvatarFallback className="bg-white/10 text-white text-sm">MT</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">MagistrTheOne</div>
              <div className="text-white/60 text-xs">Full-Stack Developer</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
