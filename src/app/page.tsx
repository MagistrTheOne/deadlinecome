"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserMenu } from "@/components/auth/user-menu";
import { useSession } from "@/lib/auth-client";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">DeadLine</h1>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Войти</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Регистрация</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            DeadLine
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Powerful project management tool inspired by Jira. Organize your work,
            collaborate with teams, and get things done efficiently.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {session ? (
              <Button asChild size="lg">
                <Link href="/dashboard">Панель управления</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/sign-up">Начать работу</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/demo">Демо</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Agile Boards</CardTitle>
              <CardDescription>
                Kanban and Scrum boards to visualize your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Drag and drop issues between columns, track progress, and manage sprints effectively.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Work together seamlessly with your entire team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Assign tasks, add comments, and keep everyone in sync with real-time updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>
                Get insights into your team's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track velocity, burndown charts, and detailed reports to improve productivity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}