"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  FolderOpen
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Проекты",
    href: "/projects",
    icon: FolderKanban,
    badge: null,
  },
  {
    name: "Мои задачи",
    href: "/tasks",
    icon: CheckSquare,
    badge: "5",
  },
  {
    name: "Календарь",
    href: "/calendar",
    icon: Calendar,
    badge: null,
  },
  {
    name: "Команда",
    href: "/team",
    icon: Users,
    badge: null,
  },
  {
    name: "Аналитика",
    href: "/analytics",
    icon: BarChart3,
    badge: null,
  },
];

const workspaceItems = [
  {
    name: "Рабочие пространства",
    href: "/workspaces",
    icon: FolderOpen,
    badge: null,
  },
];

export function Sidebar({ isOpen = true, onClose, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black/80 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          collapsed && "lg:w-16",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            {!collapsed && (
              <h2 className="text-lg font-semibold text-white">Меню</h2>
            )}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapsed}
                className="hidden lg:flex text-white/80 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-200"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden text-white/80 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {/* Главная */}
            <Link
              href="/"
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent",
                pathname === "/"
                  ? "bg-white/10 text-white border-white/20"
                  : "text-white/80 hover:text-white hover:bg-white/10 hover:border-white/10"
              )}
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Главная</span>}
            </Link>

            {/* Основная навигация */}
            <div className="space-y-1">
              {!collapsed && (
                <div className="px-3 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Основное
                </div>
              )}
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent group",
                      isActive
                        ? "bg-white/10 text-white border-white/20"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && item.badge && (
                      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Рабочие пространства */}
            <div className="space-y-1 pt-4">
              {!collapsed && (
                <div className="px-3 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Организация
                </div>
              )}
              {workspaceItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent",
                      isActive
                        ? "bg-white/10 text-white border-white/20"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>

            {/* Настройки */}
            <div className="pt-4">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent",
                  pathname === "/settings"
                    ? "bg-white/10 text-white border-white/20"
                    : "text-white/80 hover:text-white hover:bg-white/10 hover:border-white/10"
                )}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>Настройки</span>}
              </Link>
            </div>
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="p-4 border-t border-white/10">
              <div className="text-xs text-white/60 text-center">
                DeadLine v1.0.0
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
