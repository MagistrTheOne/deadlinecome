import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { seedMembers } from "@/data/seed";
import { UserPlus, Mail, Shield, Settings, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default async function MembersPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const members = seedMembers.filter(m => m.workspaceId === workspaceId);

  // Mock current user - in real app this would come from auth context
  const currentMember = members.find(m => m.userId === "demo-user") || members[0];
  const { hasPermission } = usePermissions(currentMember);

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
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage workspace members and their permissions
          </p>
        </div>
        {hasPermission("manage_members") && (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {member.userId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">
                    {member.userId === "demo-user" ? "Demo User" : `User ${member.userId.slice(-4)}`}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {member.userId === "demo-user" ? "demo@example.com" : `${member.userId}@example.com`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={getRoleBadgeColor(member.role)}>
                  <Shield className="mr-1 h-3 w-3" />
                  {member.role}
                </Badge>
                {hasPermission("manage_members") && member.id !== currentMember?.id && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
