"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserMenu } from "@/components/auth/user-menu";
import { useSession } from "@/lib/auth-client";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo size="sm" />
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  asChild
                  className="text-white/80 hover:text-white hover:bg-white/10 border border-white/10"
                >
                  <Link href="/sign-in">Войти</Link>
                </Button>
                <Button 
                  asChild
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  <Link href="/sign-up">Регистрация</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            DeadLine
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/80">
            New team dashboard by MagistrTheOne. Organize your work,
            collaborate with teams, and get things done efficiently.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {session ? (
              <Button 
                asChild 
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
              >
                <Link href="/dashboard">Панель управления</Link>
              </Button>
            ) : (
              <>
                <Button 
                  asChild 
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
                >
                  <Link href="/sign-up">Начать работу</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Link href="/demo">Демо</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 hover:bg-black/70">
            <CardHeader>
              <CardTitle className="text-white">Agile Boards</CardTitle>
              <CardDescription className="text-white/60">
                Kanban and Scrum boards to visualize your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">
                Drag and drop issues between columns, track progress, and manage sprints effectively.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 hover:bg-black/70">
            <CardHeader>
              <CardTitle className="text-white">Team Collaboration</CardTitle>
              <CardDescription className="text-white/60">
                Work together seamlessly with your entire team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">
                Assign tasks, add comments, and keep everyone in sync with real-time updates.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 hover:bg-black/70">
            <CardHeader>
              <CardTitle className="text-white">Project Analytics</CardTitle>
              <CardDescription className="text-white/60">
                Get insights into your team's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">
                Track velocity, burndown charts, and detailed reports to improve productivity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}