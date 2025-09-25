"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserMenu } from "@/components/auth/user-menu";
import { Save, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const user = session.user;
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || user.name,
          image: image || user.image,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении профиля");
      }

      setSuccess("Профиль успешно обновлен");
      router.refresh();
    } catch (err) {
      setError("Произошла ошибка при обновлении профиля");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Профиль</h1>
            <p className="text-muted-foreground">
              Управление настройками профиля
            </p>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Информация о профиле
              </CardTitle>
              <CardDescription>
                Обновите информацию о вашем профиле
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя</Label>
                    <Input
                      id="name"
                      type="text"
                      defaultValue={user.name || ""}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email нельзя изменить
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">URL аватара</Label>
                    <Input
                      id="image"
                      type="url"
                      defaultValue={user.image || ""}
                      onChange={(e) => setImage(e.target.value)}
                      disabled={isLoading}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Информация об аккаунте</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">ID пользователя</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {user.id}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Email подтвержден</p>
                  <p className="text-muted-foreground">
                    {user.emailVerified ? "Да" : "Нет"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
