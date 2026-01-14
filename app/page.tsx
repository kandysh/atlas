"use client";

import { TasksDataTable } from "@/src/components/features/tasks";
import { createColumns } from "@/src/components/features/tasks";
import { mockTasks } from "@/src/data";
import { Task } from "@/src/lib/types";
import { useWorkspace } from "@/src/providers";

export default function Page() {
  const { currentWorkspace } = useWorkspace();
  
  // Filter out completed tasks for active board
  const activeTasks: Task[] = mockTasks.filter(
    (task) => task.status !== "completed"
  );

  // Get unique owners for dropdown
  const uniqueOwners = Array.from(new Set(mockTasks.map(t => t.owner))).sort();
  const columns = createColumns(uniqueOwners);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Active Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentWorkspace?.name} • {activeTasks.length} active tasks
        </p>
      </div>

      <TasksDataTable columns={columns} data={activeTasks} />
    </div>
  );
}
