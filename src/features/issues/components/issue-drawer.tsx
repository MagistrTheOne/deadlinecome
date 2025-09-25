"use client";

import { useState } from "react";
import { Issue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TypeColors, PriorityColors } from "@/lib/types";
import { Calendar, MessageCircle, Paperclip, User, Flag, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface IssueDrawerProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Issue>) => void;
}

export function IssueDrawer({ issue, isOpen, onClose, onUpdate }: IssueDrawerProps) {
  const [editedIssue, setEditedIssue] = useState<Issue | null>(issue);

  if (!issue || !editedIssue) return null;

  const handleSave = () => {
    onUpdate(editedIssue);
    onClose();
  };

  const updateField = (field: keyof Issue, value: any) => {
    setEditedIssue({ ...editedIssue, [field]: value });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="font-mono">{issue.key}</span>
            <Badge variant="secondary" className={`${TypeColors[issue.type]} border-0`}>
              {issue.type}
            </Badge>
            <Badge variant="outline" className={`${PriorityColors[issue.priority]} border-0`}>
              {issue.priority}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editedIssue.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editedIssue.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={editedIssue.type}
                  onValueChange={(value) => updateField("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TASK">Task</SelectItem>
                    <SelectItem value="BUG">Bug</SelectItem>
                    <SelectItem value="STORY">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={editedIssue.priority}
                  onValueChange={(value) => updateField("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editedIssue.status}
                  onValueChange={(value) => updateField("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Story Points</label>
                <Input
                  type="number"
                  value={editedIssue.storyPoints || ""}
                  onChange={(e) => updateField("storyPoints", parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Labels</label>
              <Input
                value={editedIssue.labels.join(", ")}
                onChange={(e) => updateField("labels", e.target.value.split(", ").filter(Boolean))}
                placeholder="bug, frontend, urgent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <p className="text-sm text-muted-foreground">Activity tab - Coming soon</p>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <p className="text-sm text-muted-foreground">History tab - Coming soon</p>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {formatDate(issue.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Reporter: Demo User
              </div>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              0 comments
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
