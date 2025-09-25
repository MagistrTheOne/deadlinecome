"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserMenu } from "@/components/auth/user-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Mail, ArrowLeft, Crown, Shield, User, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const { data: session, isPending } = useSession();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
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
    // Загружаем участников команды
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        // Показываем только текущего пользователя
        setMembers([session.user]);
      })
      .catch(console.error);
  }, [session]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Здесь можно добавить API для приглашения участников
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API вызова
      
      setInviteEmail("");
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error("Error inviting member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "ADMIN":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "MEMBER":
        return <User className="h-4 w-4 text-green-500" />;
      case "VIEWER":
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Badge className="bg-yellow-900 text-yellow-200">Владелец</Badge>;
      case "ADMIN":
        return <Badge className="bg-blue-900 text-blue-200">Администратор</Badge>;
      case "MEMBER":
        return <Badge className="bg-green-900 text-green-200">Участник</Badge>;
      case "VIEWER":
        return <Badge className="bg-gray-900 text-gray-200">Наблюдатель</Badge>;
      default:
        return <Badge className="bg-gray-900 text-gray-200">Участник</Badge>;
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
              <h1 className="text-2xl font-bold text-white">Команда</h1>
              <p className="text-gray-400">
                Управление участниками команды
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
            <h2 className="text-xl font-semibold text-white">Участники команды</h2>
            <p className="text-gray-400">Пригласите новых участников или управляйте существующими</p>
          </div>
          
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500">
                <Plus className="mr-2 h-4 w-4" />
                Пригласить участника
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Пригласить участника</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Отправьте приглашение новому участнику команды
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email участника</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500"
                  >
                    {isLoading ? "Отправка..." : "Пригласить"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Members */}
        <div className="grid gap-4">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет участников</h3>
                <p>Пригласите первых участников в вашу команду</p>
              </div>
            </div>
          ) : (
            members.map((member: any) => (
              <Card key={member.id} className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.image || ""} alt={member.name || ""} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          {member.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          {member.name}
                          {getRoleIcon("OWNER")}
                        </h3>
                        <p className="text-gray-400 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getRoleBadge("OWNER")}
                      <div className="text-sm text-gray-400">
                        <p>Последняя активность</p>
                        <p>Сейчас</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Team Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Всего участников</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{members.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Активных</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{members.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Ожидают приглашения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
