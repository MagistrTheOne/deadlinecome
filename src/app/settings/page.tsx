"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/auth/user-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, Bell, Shield, Palette, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Настройки уведомлений
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [projectUpdates, setProjectUpdates] = useState(true);

  // Настройки приватности
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showEmail, setShowEmail] = useState(false);

  // Настройки темы
  const [theme, setTheme] = useState("dark");

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

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Здесь можно добавить API вызов для сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API вызова
      
      setSuccess("Настройки успешно сохранены");
    } catch (err) {
      setError("Произошла ошибка при сохранении настроек");
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
            <h1 className="text-2xl font-bold text-white">Настройки</h1>
            <p className="text-gray-400">
              Управление настройками аккаунта и приложения
            </p>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Уведомления */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="h-5 w-5" />
                Уведомления
              </CardTitle>
              <CardDescription className="text-gray-400">
                Настройте, как вы хотите получать уведомления
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Email уведомления</Label>
                  <p className="text-sm text-gray-400">
                    Получать уведомления на email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Push уведомления</Label>
                  <p className="text-sm text-gray-400">
                    Получать push уведомления в браузере
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Обновления проектов</Label>
                  <p className="text-sm text-gray-400">
                    Уведомления об изменениях в проектах
                  </p>
                </div>
                <Switch
                  checked={projectUpdates}
                  onCheckedChange={setProjectUpdates}
                />
              </div>
            </CardContent>
          </Card>

          {/* Приватность */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5" />
                Приватность
              </CardTitle>
              <CardDescription className="text-gray-400">
                Управление видимостью вашего профиля
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Видимость профиля</Label>
                <select 
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  <option value="public">Публичный</option>
                  <option value="private">Приватный</option>
                  <option value="team">Только команда</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Показывать email</Label>
                  <p className="text-sm text-gray-400">
                    Разрешить другим пользователям видеть ваш email
                  </p>
                </div>
                <Switch
                  checked={showEmail}
                  onCheckedChange={setShowEmail}
                />
              </div>
            </CardContent>
          </Card>

          {/* Внешний вид */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="h-5 w-5" />
                Внешний вид
              </CardTitle>
              <CardDescription className="text-gray-400">
                Настройки темы и отображения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Тема</Label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  <option value="dark">Темная</option>
                  <option value="light">Светлая</option>
                  <option value="system">Системная</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Язык и регион */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5" />
                Язык и регион
              </CardTitle>
              <CardDescription className="text-gray-400">
                Настройки локализации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Язык</Label>
                <select 
                  defaultValue="ru"
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Часовой пояс</Label>
                <select 
                  defaultValue="Europe/Moscow"
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Europe/London">Лондон (UTC+0)</option>
                  <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Кнопка сохранения */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Сохранение..." : "Сохранить настройки"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
