import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Archive, Trash2 } from "lucide-react";

export default function ProjectSettingsPage({ params }: { params: { workspaceId: string; projectId: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground">
          Configure project settings and manage team
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Update your project information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Key</label>
                  <Input defaultValue="WEB" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Lead</label>
                  <Select defaultValue="demo-user">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo-user">Demo User</SelectItem>
                      <SelectItem value="demo-member-1">Member 1</SelectItem>
                      <SelectItem value="demo-member-2">Member 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input defaultValue="Website Redesign" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  defaultValue="Complete redesign of company website with modern UI/UX"
                  rows={3}
                />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage who has access to this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">DU</span>
                    </div>
                    <div>
                      <p className="font-medium">Demo User</p>
                      <p className="text-sm text-muted-foreground">demo@example.com</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Remove</Button>
                </div>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add Team Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Archive Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Archive this project and all its issues
                  </p>
                </div>
                <Button variant="outline">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-destructive rounded">
                <div>
                  <h4 className="font-medium text-destructive">Delete Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this project and all its data
                  </p>
                </div>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
