'use client';

import { TasksDataTable } from '@/src/components/features/tasks';
import { Task } from '@/src/lib/types';
import { useWorkspace } from '@/src/providers';
import { useWorkspaceTasks } from '@/src/lib/query/hooks';

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

  const workspaceId = currentWorkspace.id;

  // Fetch tasks from API
  const { data, isLoading, error } = useWorkspaceTasks(workspaceId, 0);

  // Connect to SSE for live updates
  // useTaskEvents(workspaceId, 0);

  // Get tasks from DB only - single source of truth
  const tasks = data?.tasks || [];
  const dbTasks = data?.dbTasks || [];

  // Filter out completed tasks for active board
  const activeTasks: Task[] = tasks.filter(
    (task) => task.status !== 'completed',
  );

  // Filter dbTasks to match active tasks for delete ID mapping
  const activeDbTasks = dbTasks
    .filter((dbTask) => activeTasks.some((t) => t.id === dbTask.displayId))
    .map((t) => ({ id: t.id, displayId: t.displayId }));

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Active Tasks
          </h1>
          <p className="text-sm text-destructive mt-1">
            Error loading tasks. Showing cached data if available.
          </p>
        </div>
        <TasksDataTable
          data={activeTasks}
          dbTasks={activeDbTasks}
          workspaceId={workspaceId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Active Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentWorkspace.name} • {activeTasks.length} active tasks
          {isLoading && ' • Loading...'}
        </p>
      </div>

      <TasksDataTable
        data={activeTasks}
        dbTasks={activeDbTasks}
        workspaceId={workspaceId}
      />
    </div>
  );
}
