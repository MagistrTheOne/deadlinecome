"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  ListTodo,
  Settings,
  Users,
  BarChart3,
  X,
} from "lucide-react";

interface AppSidebarProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ workspaceId, isOpen, onClose }: AppSidebarProps) {
  const navigation = [
    {
      name: "Dashboard",
      href: `/w/${workspaceId}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      href: `/w/${workspaceId}/projects`,
      icon: FolderKanban,
    },
    {
      name: "Board",
      href: `/w/${workspaceId}/projects/demo/board`,
      icon: Kanban,
    },
    {
      name: "Backlog",
      href: `/w/${workspaceId}/projects/demo/backlog`,
      icon: ListTodo,
    },
    {
      name: "Reports",
      href: `/w/${workspaceId}/reports`,
      icon: BarChart3,
    },
    {
      name: "Members",
      href: `/w/${workspaceId}/settings/members`,
      icon: Users,
    },
    {
      name: "Settings",
      href: `/w/${workspaceId}/projects/demo/settings`,
      icon: Settings,
    },
  ];
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform bg-card border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <h1 className="text-lg font-semibold">DeadLine</h1>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={onClose}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
}
