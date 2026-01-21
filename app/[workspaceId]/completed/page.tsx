'use client';

import { TasksDataTable } from '@/src/components/features/tasks';
import { Task } from '@/src/lib/types';
import { useWorkspace } from '@/src/providers';
import { useWorkspaceTasks } from '@/src/lib/query/hooks';

export default function CompletedPage() {
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  // Always call hooks before any early returns
  const workspaceId = currentWorkspace?.id || '';
  const { data, isLoading, error } = useWorkspaceTasks(workspaceId, 0);

  // Show loading state while workspace is loading
  if (workspaceLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Completed Tasks
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
            Completed Tasks
          </h1>
          <p className="text-sm text-destructive mt-1">
            No workspace available. Please create or join a workspace.
          </p>
        </div>
      </div>
    );
  }

  // Get tasks from DB only - single source of truth
  const tasks = data?.tasks || [];
  const dbTasks = data?.dbTasks || [];

  // Filter to only show completed tasks
  const completedTasks: Task[] = tasks.filter(
    (task) => task.status === 'completed',
  );

  // Filter dbTasks to match completed tasks for delete ID mapping
  const completedDbTasks = dbTasks
    .filter((dbTask) => completedTasks.some((t) => t.id === dbTask.displayId))
    .map((t) => ({ id: t.id, displayId: t.displayId }));

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Completed Tasks
          </h1>
          <p className="text-sm text-destructive mt-1">
            Error loading tasks. Showing cached data if available.
          </p>
        </div>
        <TasksDataTable
          data={completedTasks}
          dbTasks={completedDbTasks}
          workspaceId={workspaceId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Completed Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentWorkspace.name} • {completedTasks.length} completed tasks
          {isLoading && ' • Loading...'}
        </p>
      </div>

      <TasksDataTable
        data={completedTasks}
        dbTasks={completedDbTasks}
        workspaceId={workspaceId}
      />
    </div>
  );
}
