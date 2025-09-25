"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { Plus, Users, FolderOpen, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Не авторизован</h1>
          <p className="text-muted-foreground mb-4">
            Войдите в систему, чтобы получить доступ к панели управления
          </p>
          <Button asChild>
            <Link href="/sign-in">Войти</Link>
          </Button>
        </div>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Панель управления</h1>
            <p className="text-muted-foreground">
              Добро пожаловать, {user.name}!
            </p>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Workspaces Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Рабочие пространства
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                У вас пока нет рабочих пространств
              </p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/workspaces">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Projects Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Проекты
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Активных проектов
              </p>
              <Button className="mt-4" size="sm" variant="outline" asChild>
                <Link href="/projects">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать проект
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Team Members Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Участники команды
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Вы единственный участник
              </p>
              <Button className="mt-4" size="sm" variant="outline" asChild>
                <Link href="/team">
                  <Users className="mr-2 h-4 w-4" />
                  Управление командой
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
            <CardDescription>
              Ваши недавние действия в системе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Пока нет активности</p>
              <p className="text-sm">Начните создавать проекты и приглашать команду</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
