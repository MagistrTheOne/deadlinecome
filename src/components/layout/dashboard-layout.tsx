"use client";

import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function DashboardLayout({ children, breadcrumbs = [] }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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
    <div className="min-h-screen bg-black">
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        showSidebarToggle={true}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <Breadcrumbs items={getBreadcrumbs()} />
            </div>
            
            {/* Main Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
