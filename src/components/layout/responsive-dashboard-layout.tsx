"use client";

import { useState, useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface ResponsiveDashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function ResponsiveDashboardLayout({ children, breadcrumbs = [] }: ResponsiveDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Определяем размер экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Автоматически генерируем breadcrumbs если не переданы
  const getBreadcrumbs = () => {
    if (breadcrumbs.length > 0) return breadcrumbs;

    const pathSegments = pathname.split('/').filter(Boolean);
    const generatedBreadcrumbs = [];

    if (pathSegments.length === 0) {
      return [{ label: "Dashboard" }];
    }

    // Специальные случаи
    if (pathSegments[0] === "dashboard") {
      return [{ label: "Dashboard" }];
    }

    if (pathSegments[0] === "projects") {
      return [{ label: "Проекты" }];
    }

    if (pathSegments[0] === "workspaces") {
      return [{ label: "Рабочие пространства" }];
    }

    if (pathSegments[0] === "team") {
      return [{ label: "Команда" }];
    }

    if (pathSegments[0] === "settings") {
      return [{ label: "Настройки" }];
    }

    if (pathSegments[0] === "profile") {
      return [{ label: "Профиль" }];
    }

    // Для workspace routes
    if (pathSegments[0] === "w" && pathSegments.length > 1) {
      const workspaceId = pathSegments[1];
      generatedBreadcrumbs.push({ 
        label: "Рабочие пространства", 
        href: "/workspaces" 
      });
      generatedBreadcrumbs.push({ 
        label: workspaceId === "demo" ? "Demo Workspace" : workspaceId 
      });

      if (pathSegments.length > 2) {
        const section = pathSegments[2];
        switch (section) {
          case "dashboard":
            generatedBreadcrumbs.push({ label: "Dashboard" });
            break;
          case "projects":
            generatedBreadcrumbs.push({ label: "Проекты" });
            if (pathSegments.length > 3) {
              const projectId = pathSegments[3];
              generatedBreadcrumbs.push({ 
                label: projectId,
                href: `/w/${workspaceId}/projects` 
              });
              if (pathSegments.length > 4) {
                const view = pathSegments[4];
                switch (view) {
                  case "board":
                    generatedBreadcrumbs.push({ label: "Доска" });
                    break;
                  case "backlog":
                    generatedBreadcrumbs.push({ label: "Бэклог" });
                    break;
                  case "settings":
                    generatedBreadcrumbs.push({ label: "Настройки" });
                    break;
                }
              }
            }
            break;
          case "reports":
            generatedBreadcrumbs.push({ label: "Отчеты" });
            break;
          case "settings":
            generatedBreadcrumbs.push({ label: "Настройки" });
            break;
          case "profile":
            generatedBreadcrumbs.push({ label: "Профиль" });
            break;
        }
      }

      return generatedBreadcrumbs;
    }

    // Fallback
    return pathSegments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: index < pathSegments.length - 1 ? `/${pathSegments.slice(0, index + 1).join('/')}` : undefined
    }));
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Анимированный фон с glass-morphism эффектами */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
      </div>

      {/* Header */}
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        showSidebarToggle={true}
      />
      
      <div className="flex relative z-10">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 lg:ml-0 relative">
          <div className="p-4 sm:p-6">
            {/* Breadcrumbs */}
            <div className="mb-4 sm:mb-6">
              <Breadcrumbs items={getBreadcrumbs()} />
            </div>
            
            {/* Main Content */}
            <div className="space-y-4 sm:space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Floating action button for mobile */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-white/10 hover:bg-white/20 transition-all duration-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
}
