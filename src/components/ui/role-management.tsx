"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield, 
  Code, 
  Wrench, 
  Palette, 
  BarChart3,
  TestTube,
  Server,
  Brain,
  Crown,
  Star
} from "lucide-react";

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  itRole?: string;
  skills?: string;
  experience?: number;
  itRoleInfo?: {
    name: string;
    description: string;
    permissions: string[];
    color: string;
  };
  skillsArray?: string[];
}

interface ITRole {
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

interface RoleManagementProps {
  workspaceId: string;
  projectId?: string;
}

const ROLE_ICONS = {
  DEVELOPER: Code,
  TEAM_LEAD: Crown,
  CTO: Shield,
  PM: BarChart3,
  QA: TestTube,
  DEVOPS: Server,
  DESIGNER: Palette,
  ANALYST: Brain,
};

export function RoleManagement({ workspaceId, projectId }: RoleManagementProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Record<string, ITRole>>({});
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    itRole: "",
    skills: [] as string[],
    experience: 0,
  });

  useEffect(() => {
    loadMembers();
  }, [workspaceId]);

  const loadMembers = async () => {
    try {
      const response = await fetch(`/api/roles?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
        setAvailableRoles(data.availableRoles);
      } else {
        // Fallback демо-данные
        setMembers([
          {
            id: "demo-1",
            userId: "demo-user",
            role: "OWNER",
            itRole: "CTO",
            itRoleInfo: {
              name: "CTO",
              description: "Технический директор",
              permissions: ["ALL"],
              color: "bg-red-500/20 text-red-400 border-red-500/30"
            },
            skillsArray: ["Leadership", "Architecture", "Strategy"],
            experience: 10,
          },
          {
            id: "demo-2",
            userId: "user-2",
            role: "MEMBER",
            itRole: "TEAM_LEAD",
            itRoleInfo: {
              name: "Тим лид",
              description: "Руководство командой разработки",
              permissions: ["CREATE_TASK", "UPDATE_TASK", "ASSIGN_TASK", "VIEW_PROJECT", "COMMENT", "MANAGE_SPRINT"],
              color: "bg-purple-500/20 text-purple-400 border-purple-500/30"
            },
            skillsArray: ["React", "Node.js", "Team Management"],
            experience: 7,
          },
          {
            id: "demo-3",
            userId: "user-3",
            role: "MEMBER",
            itRole: "DEVELOPER",
            itRoleInfo: {
              name: "Разработчик",
              description: "Разработка и поддержка кода",
              permissions: ["CREATE_TASK", "UPDATE_TASK", "VIEW_PROJECT", "COMMENT"],
              color: "bg-blue-500/20 text-blue-400 border-blue-500/30"
            },
            skillsArray: ["TypeScript", "Next.js", "PostgreSQL"],
            experience: 4,
          },
        ]);
        setAvailableRoles({
          DEVELOPER: {
            name: "Разработчик",
            description: "Разработка и поддержка кода",
            permissions: ["CREATE_TASK", "UPDATE_TASK", "VIEW_PROJECT", "COMMENT"],
            color: "bg-blue-500/20 text-blue-400 border-blue-500/30"
          },
          TEAM_LEAD: {
            name: "Тим лид",
            description: "Руководство командой разработки",
            permissions: ["CREATE_TASK", "UPDATE_TASK", "ASSIGN_TASK", "VIEW_PROJECT", "COMMENT", "MANAGE_SPRINT"],
            color: "bg-purple-500/20 text-purple-400 border-purple-500/30"
          },
          CTO: {
            name: "CTO",
            description: "Технический директор",
            permissions: ["ALL"],
            color: "bg-red-500/20 text-red-400 border-red-500/30"
          },
          PM: {
            name: "Product Manager",
            description: "Управление продуктом и планирование",
            permissions: ["CREATE_TASK", "UPDATE_TASK", "ASSIGN_TASK", "VIEW_PROJECT", "COMMENT", "MANAGE_SPRINT", "VIEW_ANALYTICS"],
            color: "bg-green-500/20 text-green-400 border-green-500/30"
          },
          QA: {
            name: "QA Engineer",
            description: "Тестирование и контроль качества",
            permissions: ["CREATE_TASK", "UPDATE_TASK", "VIEW_PROJECT", "COMMENT", "TEST_TASK"],
            color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          },
          DEVOPS: {
            name: "DevOps",
            description: "Инфраструктура и развертывание",
            permissions: ["CREATE_TASK", "UPDATE_TASK", "VIEW_PROJECT", "COMMENT", "DEPLOY_TASK"],
            color: "bg-orange-500/20 text-orange-400 border-orange-500/30"
          },
        });
      }
    } catch (error) {
      console.error("Error loading members:", error);
      // Fallback демо-данные при ошибке
      setMembers([
        {
          id: "demo-1",
          userId: "demo-user",
          role: "OWNER",
          itRole: "CTO",
          itRoleInfo: {
            name: "CTO",
            description: "Технический директор",
            permissions: ["ALL"],
            color: "bg-red-500/20 text-red-400 border-red-500/30"
          },
          skillsArray: ["Leadership", "Architecture", "Strategy"],
          experience: 10,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setEditForm({
      itRole: member.itRole || "",
      skills: member.skillsArray || [],
      experience: member.experience || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveMember = async () => {
    if (!selectedMember) return;

    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          userId: selectedMember.userId,
          itRole: editForm.itRole || null,
          skills: editForm.skills,
          experience: editForm.experience,
        }),
      });

      if (response.ok) {
        await loadMembers();
        setIsEditDialogOpen(false);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  const getRoleIcon = (role: string) => {
    const IconComponent = ROLE_ICONS[role as keyof typeof ROLE_ICONS] || Users;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-black/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Управление ролями команды
          </CardTitle>
          <CardDescription className="text-white/60">
            Назначьте IT-роли участникам для умного распределения задач
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {member.itRole && getRoleIcon(member.itRole)}
                    <div>
                      <div className="text-white font-medium">
                        Участник {member.userId.slice(0, 8)}...
                      </div>
                      <div className="text-white/60 text-sm">
                        {member.itRoleInfo?.name || "Роль не назначена"}
                      </div>
                    </div>
                  </div>
                  
                  {member.itRole && (
                    <Badge className={member.itRoleInfo?.color}>
                      {member.itRoleInfo?.name}
                    </Badge>
                  )}
                  
                  {member.experience && (
                    <Badge className="bg-white/10 text-white/80 border-white/20">
                      {member.experience} лет опыта
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditMember(member)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {members.length === 0 && (
              <div className="text-center py-8 text-white/60">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Нет участников в команде</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Назначить IT-роль</DialogTitle>
            <DialogDescription className="text-white/60">
              Выберите роль и навыки для участника команды
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white">IT-роль</Label>
              <Select
                value={editForm.itRole}
                onValueChange={(value) => setEditForm({ ...editForm, itRole: value })}
              >
                <SelectTrigger className="bg-black/50 backdrop-blur-sm border border-white/20 text-white">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border border-white/20">
                  {Object.entries(availableRoles).map(([key, role]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(key)}
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="text-white">Опыт (лет)</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={editForm.experience}
                onChange={(e) => setEditForm({ ...editForm, experience: parseInt(e.target.value) || 0 })}
                className="bg-black/50 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-white/40"
              />
            </div>

            {editForm.itRole && availableRoles[editForm.itRole] && (
              <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                <h4 className="text-white font-medium mb-2">
                  {availableRoles[editForm.itRole].name}
                </h4>
                <p className="text-white/70 text-sm mb-2">
                  {availableRoles[editForm.itRole].description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {availableRoles[editForm.itRole].permissions.map((permission) => (
                    <Badge key={permission} className="bg-white/10 text-white/80 border-white/20 text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSaveMember}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
            >
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
