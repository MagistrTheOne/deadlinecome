import { Suspense } from "react";
import { Board } from "@/features/board/components/board";
import { getIssuesByProject } from "@/features/issues/actions";
import { Loading } from "@/components/common/loading";

interface BoardPageProps {
  params: Promise<{
    workspaceId: string;
    projectId: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { projectId } = await params;
  const issues = await getIssuesByProject(projectId);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Board</h1>
        <p className="text-muted-foreground">
          Drag and drop issues to update their status
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <Board issues={issues} />
      </Suspense>
    </div>
  );
}
