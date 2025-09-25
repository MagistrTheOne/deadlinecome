"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Mail, Bell, Shield, Settings, Trash2, Camera, Save } from "lucide-react";
import { toast } from "sonner";
import { seedMembers, seedProjects, seedWorkspaces } from "@/data/seed";

// Mock user data - in real app this would come from auth context
const currentUser = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@example.com",
  avatar: "",
  bio: "Product manager focused on building great user experiences.",
  timezone: "Europe/Moscow",
  language: "ru",
};

const profileSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  bio: z.string().max(500, "Биография не должна превышать 500 символов"),
  timezone: z.string(),
  language: z.string(),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  taskAssigned: z.boolean(),
  taskUpdated: z.boolean(),
  projectInvites: z.boolean(),
  weeklyDigest: z.boolean(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type NotificationForm = z.infer<typeof notificationSchema>;

export default function ProfilePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Mock current member data
  const currentMember = seedMembers.find(m => m.userId === currentUser.id && m.workspaceId === workspaceId);
  const userProjects = seedProjects.filter(p => p.workspaceId === workspaceId);
  const userWorkspaces = seedWorkspaces.filter(w => seedMembers.some(m => m.userId === currentUser.id && m.workspaceId === w.id));

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser.name,
      email: currentUser.email,
      bio: currentUser.bio,
      timezone: currentUser.timezone,
      language: currentUser.language,
    },
  });

  const notificationForm = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      taskAssigned: true,
      taskUpdated: true,
      projectInvites: true,
      weeklyDigest: false,
    },
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Профиль обновлен успешно");
    } catch (error) {
      toast.error("Ошибка при обновлении профиля");
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationForm) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Настройки уведомлений обновлены");
    } catch (error) {
      toast.error("Ошибка при обновлении настроек");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Аккаунт удален");
    } catch (error) {
      toast.error("Ошибка при удалении аккаунта");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "destructive";
      case "ADMIN":
        return "default";
      case "MEMBER":
        return "secondary";
      case "VIEWER":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Профиль пользователя</h1>
          <p className="text-muted-foreground">
            Управляйте своими личными настройками и предпочтениями
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="workspaces">Рабочие пространства</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Личная информация
              </CardTitle>
              <CardDescription>
                Обновите свою личную информацию и настройки профиля
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="text-lg">
                    {currentUser.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Изменить фото
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, GIF или PNG. Максимум 2MB.
                  </p>
                </div>
              </div>

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя</FormLabel>
                          <FormControl>
                            <Input placeholder="Ваше имя" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Биография</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Расскажите немного о себе..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Краткое описание для отображения в вашем профиле
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Часовой пояс</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Язык</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Настройки уведомлений
              </CardTitle>
              <CardDescription>
                Управляйте тем, какие уведомления вы хотите получать
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Email уведомления</FormLabel>
                        <FormDescription>
                          Получать уведомления на email
                        </FormDescription>
                      </div>
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Push уведомления</FormLabel>
                        <FormDescription>
                          Получать push уведомления в браузере
                        </FormDescription>
                      </div>
                      <FormField
                        control={notificationForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Назначение задач</FormLabel>
                        <FormDescription>
                          Когда вам назначают новую задачу
                        </FormDescription>
                      </div>
                      <FormField
                        control={notificationForm.control}
                        name="taskAssigned"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Обновления задач</FormLabel>
                        <FormDescription>
                          Когда обновляется задача, над которой вы работаете
                        </FormDescription>
                      </div>
                      <FormField
                        control={notificationForm.control}
                        name="taskUpdated"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Приглашения в проекты</FormLabel>
                        <FormDescription>
                          Когда вас приглашают в новый проект
                        </FormDescription>
                      </div>
                      <FormField
                        control={notificationForm.control}
                        name="projectInvites"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Еженедельный дайджест</FormLabel>
                        <FormDescription>
                          Еженедельная сводка активности
                        </FormDescription>
                      </div>
                      <FormField
                        control={notificationForm.control}
                        name="weeklyDigest"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Сохранение..." : "Сохранить настройки"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspaces" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ваши проекты</CardTitle>
                <CardDescription>
                  Проекты, в которых вы участвуете
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.key}</p>
                      </div>
                      <Badge variant="outline">
                        {project.leadId === currentUser.id ? "Владелец" : "Участник"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Рабочие пространства</CardTitle>
                <CardDescription>
                  Организации, к которым вы принадлежите
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userWorkspaces.map((workspace) => {
                    const memberRole = seedMembers.find(m => m.userId === currentUser.id && m.workspaceId === workspace.id)?.role;
                    return (
                      <div key={workspace.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{workspace.name}</p>
                          <p className="text-sm text-muted-foreground">{workspace.slug}</p>
                        </div>
                        <Badge variant={getRoleBadgeColor(memberRole || "MEMBER")}>
                          <Shield className="h-3 w-3 mr-1" />
                          {memberRole}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Безопасность аккаунта
              </CardTitle>
              <CardDescription>
                Управляйте паролем и настройками безопасности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Изменить пароль</h4>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Текущий пароль" />
                    <Input type="password" placeholder="Новый пароль" />
                    <Input type="password" placeholder="Подтвердите новый пароль" />
                  </div>
                  <Button className="mt-3">Обновить пароль</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2 text-destructive">Опасная зона</h4>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить аккаунт
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить. Это навсегда удалит ваш аккаунт
                          и все связанные с ним данные.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Удалить аккаунт
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
