"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserMenu } from "@/components/auth/user-menu";
import { Plus, Users, Calendar, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WorkspacesPage() {
  const { data: session, isPending } = useSession();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" });
  const router = useRouter();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWorkspace),
      });

      if (!response.ok) {
        throw new Error("Ошибка при создании рабочего пространства");
      }

      const workspace = await response.json();
      setWorkspaces([...workspaces, workspace]);
      setNewWorkspace({ name: "", description: "" });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="text-white/80 hover:text-white hover:bg-white/10 border border-white/10"
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Рабочие пространства</h1>
              <p className="text-white/60">
                Управление вашими рабочими пространствами
              </p>
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-white">Ваши рабочие пространства</h2>
            <p className="text-white/60">Создайте или выберите рабочее пространство для работы</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30">
                <Plus className="mr-2 h-4 w-4" />
                Создать пространство
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">Создать рабочее пространство</DialogTitle>
                <DialogDescription className="text-white/60">
                  Создайте новое рабочее пространство для вашей команды
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Название</Label>
                  <Input
                    id="name"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                    placeholder="Название рабочего пространства"
                    className="bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Описание</Label>
                  <Textarea
                    id="description"
                    value={newWorkspace.description}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                    placeholder="Описание рабочего пространства"
                    className="bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
                  >
                    {isLoading ? "Создание..." : "Создать"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Workspaces Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-white/60 mb-4">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет рабочих пространств</h3>
                <p>Создайте первое рабочее пространство для начала работы</p>
              </div>
            </div>
          ) : (
            workspaces.map((workspace: any) => (
              <Card key={workspace.id} className="bg-black/50 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 hover:bg-black/70">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    {workspace.name}
                    <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    {workspace.description || "Без описания"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>1 участник</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>0 проектов</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      asChild 
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
                    >
                      <Link href={`/w/${workspace.id}/dashboard`}>
                        Открыть
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
