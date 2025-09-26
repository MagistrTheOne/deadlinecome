"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Clock, 
  Palette, 
  Bell, 
  Shield, 
  Save, 
  ArrowLeft,
  Upload,
  Camera,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { useHotkeys } from "@/lib/hotkeys";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Инициализируем горячие клавиши
  useHotkeys();

  const [profileData, setProfileData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    username: '',
    bio: '',
    location: '',
    website: '',
    timezone: 'Europe/Moscow',
    language: 'ru',
    theme: 'dark',
    status: 'online',
    statusMessage: 'Готов к работе!'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    taskUpdates: true,
    projectUpdates: true,
    teamUpdates: true,
    aiUpdates: true
  });

  const [preferences, setPreferences] = useState({
    autoSave: true,
    darkMode: true,
    compactMode: false,
    showTutorials: true,
    analytics: true,
    betaFeatures: false
  });

  useEffect(() => {
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }));
    }
  }, [session]);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        setIsEditing(false);
        // Показать уведомление об успехе
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Обновить аватар
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  if (isPending) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-6 bg-black text-white">
          <div className="text-center">Загрузка настроек...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-6 bg-black text-white">
          <div className="text-center">Необходима авторизация</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 p-6 bg-black text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Настройки</h1>
              <p className="text-white/60">Управление профилем и настройками</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              {isEditing ? 'Отменить' : 'Редактировать'}
            </Button>
            {isEditing && (
              <Button
                onClick={handleSave}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass-card">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/20">
              <User className="h-4 w-4 mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/20">
              <Bell className="h-4 w-4 mr-2" />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white/20">
              <Shield className="h-4 w-4 mr-2" />
              Безопасность
            </TabsTrigger>
          </TabsList>

          {/* Профиль */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Аватар и основная информация */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Основная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Аватар */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={session.user.image || ''} />
                      <AvatarFallback className="bg-white/10 text-white text-xl">
                        {session.user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Загрузить фото
                      </Button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                        }}
                      />
                      <p className="text-xs text-white/60">
                        JPG, PNG до 5MB
                      </p>
                    </div>
                  </div>

                  {/* Основные поля */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Имя</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="glass-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="glass-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="username" className="text-white">Имя пользователя</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                        disabled={!isEditing}
                        className="glass-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-white">О себе</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        className="glass-input"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Дополнительная информация */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Дополнительная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="location" className="text-white">Местоположение</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      className="glass-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-white">Веб-сайт</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                      className="glass-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timezone" className="text-white">Часовой пояс</Label>
                    <select
                      id="timezone"
                      value={profileData.timezone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full p-2 bg-white/5 border border-white/20 rounded-md text-white"
                    >
                      <option value="Europe/Moscow">Москва (UTC+3)</option>
                      <option value="Europe/London">Лондон (UTC+0)</option>
                      <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="language" className="text-white">Язык</Label>
                    <select
                      id="language"
                      value={profileData.language}
                      onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full p-2 bg-white/5 border border-white/20 rounded-md text-white"
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Уведомления */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Настройки уведомлений
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Email уведомления</h4>
                      <p className="text-white/60 text-sm">Получать уведомления на email</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                      className={notifications.email ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}
                    >
                      {notifications.email ? 'Включено' : 'Выключено'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Push уведомления</h4>
                      <p className="text-white/60 text-sm">Получать push уведомления</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                      className={notifications.push ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}
                    >
                      {notifications.push ? 'Включено' : 'Выключено'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Обновления задач</h4>
                      <p className="text-white/60 text-sm">Уведомления о изменениях в задачах</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, taskUpdates: !prev.taskUpdates }))}
                      className={notifications.taskUpdates ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}
                    >
                      {notifications.taskUpdates ? 'Включено' : 'Выключено'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">AI уведомления</h4>
                      <p className="text-white/60 text-sm">Уведомления от Василия AI</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNotifications(prev => ({ ...prev, aiUpdates: !prev.aiUpdates }))}
                      className={notifications.aiUpdates ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}
                    >
                      {notifications.aiUpdates ? 'Включено' : 'Выключено'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Настройки */}
          <TabsContent value="preferences" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Настройки приложения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Автосохранение</h4>
                      <p className="text-white/60 text-sm">Автоматически сохранять изменения</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, autoSave: !prev.autoSave }))}
                      className={preferences.autoSave ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}
                    >
                      {preferences.autoSave ? 'Включено' : 'Выключено'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Темный режим</h4>
                      <p className="text-white/60 text-sm">Использовать темную тему</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                      className={preferences.darkMode ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}
                    >
                      {preferences.darkMode ? 'Включено' : 'Выключено'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Компактный режим</h4>
                      <p className="text-white/60 text-sm">Более компактное отображение</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                      className={preferences.compactMode ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}
                    >
                      {preferences.compactMode ? 'Включено' : 'Выключено'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Бета-функции</h4>
                      <p className="text-white/60 text-sm">Доступ к экспериментальным функциям</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, betaFeatures: !prev.betaFeatures }))}
                      className={preferences.betaFeatures ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}
                    >
                      {preferences.betaFeatures ? 'Включено' : 'Выключено'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Безопасность */}
          <TabsContent value="security" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Безопасность
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password" className="text-white">Текущий пароль</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        className="glass-input pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-password" className="text-white">Новый пароль</Label>
                    <Input
                      id="new-password"
                      type="password"
                      className="glass-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password" className="text-white">Подтвердите пароль</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="glass-input"
                    />
                  </div>

                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                    <Shield className="h-4 w-4 mr-2" />
                    Изменить пароль
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}