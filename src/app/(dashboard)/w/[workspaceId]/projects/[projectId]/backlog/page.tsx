import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IssueCard } from "@/features/issues/components/issue-card";
import { CreateIssueDialog } from "@/features/issues/components/create-issue-dialog";
import { getIssuesByProject } from "@/features/issues/actions";
import { Plus, ListTodo } from "lucide-react";

interface BacklogPageProps {
  params: {
    workspaceId: string;
    projectId: string;
  };
}

export default async function BacklogPage({ params }: BacklogPageProps) {
  const issues = await getIssuesByProject(params.projectId);

  // Group issues by status
  const backlogIssues = issues.filter(issue => issue.status === "TODO");
  const inProgressIssues = issues.filter(issue => issue.status === "IN_PROGRESS");
  const reviewIssues = issues.filter(issue => issue.status === "IN_REVIEW");
  const doneIssues = issues.filter(issue => issue.status === "DONE");

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
          projectId={params.projectId}
          onCreate={() => window.location.reload()}
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
