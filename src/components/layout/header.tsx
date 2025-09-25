"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/auth/user-menu";
import { KeyboardShortcuts } from "@/components/ui/keyboard-shortcuts";
import { Search, Bell, Menu, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick?: () => void;
  showSidebarToggle?: boolean;
}

export function Header({ onMenuClick, showSidebarToggle = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  return (
    <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Левая часть */}
        <div className="flex items-center space-x-4">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden text-white/80 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Logo size="sm" />
          
          {/* Глобальный поиск */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              type="text"
              placeholder="Поиск по проектам, задачам, пользователям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80 bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:bg-black/70 transition-all duration-200"
            />
          </div>
        </div>
        
        {/* Правая часть */}
        <div className="flex items-center space-x-3">
          {/* Уведомления */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/notifications")}
            className="relative text-white/80 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-200"
          >
            <Bell className="h-5 w-5" />
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border border-red-400"
            >
              3
            </Badge>
          </Button>

          {/* Клавишные сокращения */}
          <KeyboardShortcuts />

          {/* Настройки */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/settings")}
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Профиль пользователя */}
          <UserMenu />
        </div>
      </div>

      {/* Мобильный поиск */}
      <div className="md:hidden mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:bg-black/70 transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
}
