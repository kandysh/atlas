"use client";

import { TasksDataTable } from "@/src/components/features/tasks";
import { mockTasks } from "@/src/data";
import { Task } from "@/src/lib/types";
import { useWorkspace } from "@/src/providers";
import { useWorkspaceTasks } from "@/src/lib/query/hooks";
import { useTaskEvents } from "@/src/hooks/useTaskEvents";

export default function Page() {
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  // Show loading state while workspace is loading
  if (workspaceLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Active Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Show error if no workspace available
  if (!currentWorkspace) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Active Tasks</h1>
          <p className="text-sm text-destructive mt-1">
            No workspace available. Please create or join a workspace.
          </p>
        </div>
      </div>
    );
  }

  const workspaceId = currentWorkspace.id;

  // Fetch tasks from API
  const { data, isLoading, error } = useWorkspaceTasks(workspaceId, 0);

  // Connect to SSE for live updates
  useTaskEvents(workspaceId, 0);

  // Use mock data as fallback during development
  const tasks = data?.tasks || mockTasks;

  // Filter out completed tasks for active board
  const activeTasks: Task[] = tasks.filter(
    (task) => task.status !== "completed",
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Active Tasks
          </h1>
          <p className="text-sm text-destructive mt-1">
            Error loading tasks. Using mock data.
          </p>
        </div>
        <TasksDataTable data={activeTasks} workspaceId={workspaceId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Active Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentWorkspace.name} • {activeTasks.length} active tasks
          {isLoading && " • Loading..."}
        </p>
      </div>

      <TasksDataTable data={activeTasks} workspaceId={workspaceId} />
    </div>
  );
}
