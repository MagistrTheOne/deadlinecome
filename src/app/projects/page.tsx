"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserMenu } from "@/components/auth/user-menu";
import { Plus, FolderKanban, Users, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { data: session, isPending } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: "", 
    key: "", 
    description: "", 
    workspaceId: "" 
  });
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

  useEffect(() => {
    // Загружаем рабочие пространства
    fetch("/api/workspaces")
      .then(res => res.json())
      .then(data => setWorkspaces(data))
      .catch(console.error);
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error("Ошибка при создании проекта");
      }

      const project = await response.json();
      setProjects(prev => [...prev, project]);
      setNewProject({ name: "", key: "", description: "", workspaceId: "" });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Проекты</h1>
              <p className="text-gray-400">
                Управление вашими проектами
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
            <h2 className="text-xl font-semibold text-white">Все проекты</h2>
            <p className="text-gray-400">Создайте новый проект или выберите существующий</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500">
                <Plus className="mr-2 h-4 w-4" />
                Создать проект
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Создать проект</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Создайте новый проект в выбранном рабочем пространстве
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workspace" className="text-white">Рабочее пространство</Label>
                  <Select 
                    value={newProject.workspaceId} 
                    onValueChange={(value) => setNewProject({ ...newProject, workspaceId: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Выберите рабочее пространство" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {workspaces.map((workspace: any) => (
                        <SelectItem key={workspace.id} value={workspace.id} className="text-white">
                          {workspace.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Название проекта</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Название проекта"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key" className="text-white">Ключ проекта</Label>
                  <Input
                    id="key"
                    value={newProject.key}
                    onChange={(e) => setNewProject({ ...newProject, key: e.target.value.toUpperCase() })}
                    placeholder="PROJ"
                    className="bg-gray-800 border-gray-600 text-white"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Описание</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Описание проекта"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !newProject.workspaceId}
                    className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500"
                  >
                    {isLoading ? "Создание..." : "Создать"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <FolderKanban className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет проектов</h3>
                <p>Создайте первый проект для начала работы</p>
              </div>
            </div>
          ) : (
            projects.map((project: any) => (
              <Card key={project.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" />
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {project.description || "Без описания"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>1 участник</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>0 задач</span>
                      </div>
                    </div>
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                      {project.key}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      asChild 
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500"
                    >
                      <Link href={`/w/${project.workspaceId}/projects/${project.id}/board`}>
                        Открыть доску
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
