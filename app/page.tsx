"use client";

import { TasksDataTable } from "@/src/components/features/tasks";
import { useWorkspace } from "@/src/providers";

export default function Page() {
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  // Show loading state while workspace is loading
  if (workspaceLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Active Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  // Show error if no workspace available
  if (!currentWorkspace) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Active Tasks
          </h1>
          <p className="text-sm text-destructive mt-1">
            No workspace available. Please create or join a workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Active Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentWorkspace.name} • Manage your tasks
        </p>
      </div>

      <TasksDataTable data={[]} workspaceId={currentWorkspace.id} />
    </div>
  );
}
