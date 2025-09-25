"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IssueCard } from "@/features/issues/components/issue-card";
import { CreateIssueDialog } from "@/features/issues/components/create-issue-dialog";
import { getIssuesByProject } from "@/features/issues/actions";
import { issuesApi } from "@/features/issues/api";
import { toast } from "sonner";
import { Issue } from "@/lib/types";
import { Plus, ListTodo } from "lucide-react";

export default function BacklogPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await getIssuesByProject(projectId);
        setIssues(data);
      } catch (error) {
        toast.error("Failed to load issues");
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [projectId]);

  const handleCreateIssue = async (issueData: Omit<Issue, "id" | "key" | "createdAt" | "updatedAt" | "order">) => {
    try {
      const newIssue = await issuesApi.create(issueData);
      setIssues(prev => [...prev, newIssue]);
      toast.success("Issue created successfully");
    } catch (error) {
      toast.error("Failed to create issue");
    }
  };

  // Group issues by status
  const backlogIssues = issues.filter(issue => issue.status === "TODO");
  const inProgressIssues = issues.filter(issue => issue.status === "IN_PROGRESS");
  const reviewIssues = issues.filter(issue => issue.status === "IN_REVIEW");
  const doneIssues = issues.filter(issue => issue.status === "DONE");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading backlog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backlog</h1>
          <p className="text-muted-foreground">
            Manage and prioritize your project backlog
          </p>
        </div>
        <CreateIssueDialog
          projectId={projectId}
          onCreate={handleCreateIssue}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Issue
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Backlog Column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ListTodo className="h-4 w-4" />
              Backlog ({backlogIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {backlogIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </CardContent>
        </Card>

        {/* In Progress Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">In Progress ({inProgressIssues.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </CardContent>
        </Card>

        {/* In Review Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">In Review ({reviewIssues.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </CardContent>
        </Card>

        {/* Done Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Done ({doneIssues.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {doneIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
