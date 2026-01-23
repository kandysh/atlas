'use client';

import Link from 'next/link';
import { BarChart3, ExternalLink } from 'lucide-react';
import { TasksDataTable } from '@/src/components/features/tasks';
import { Task } from '@/src/lib/types';
import { useWorkspace } from '@/src/providers';
import { useWorkspaceTasks } from '@/src/lib/query/hooks';
import { Button } from '@/src/components/ui/button';

export default function Page() {
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  // Always call hooks before any early returns
  const workspaceId = currentWorkspace?.id || '';
  const { data, isLoading, error } = useWorkspaceTasks(workspaceId, 0);

  // Get process dashboard URL from env
  const processDashboardUrl = process.env.NEXT_PUBLIC_PROCESS_DASHBOARD_URL;

  // Show loading state while workspace is loading
  if (workspaceLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Active Projects
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
            Active Projects
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

  // Filter out completed tasks for active board
  const activeTasks: Task[] = tasks.filter(
    (task) => task.status !== 'completed',
  );

  // Filter dbTasks to match active projects for delete ID mapping
  const activeDbTasks = dbTasks
    .filter((dbTask) => activeTasks.some((t) => t.id === dbTask.displayId))
    .map((t) => ({ id: t.id, displayId: t.displayId }));

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Active Projects
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">Active Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentWorkspace.name} • {activeTasks.length} active projects
            {isLoading && ' • Loading...'}
          </p>
        </div>
        {processDashboardUrl && (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={processDashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Process Dashboard
              <ExternalLink className="h-3 w-3 ml-2" />
            </Link>
          </Button>
        )}
      </div>

      <TasksDataTable
        data={activeTasks}
        dbTasks={activeDbTasks}
        workspaceId={workspaceId}
      />
    </div>
  );
}
