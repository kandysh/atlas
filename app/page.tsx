"use client";

import { TasksDataTable } from "@/components/tasks-table/tasks-data-table";
import { columns } from "@/components/tasks-table/columns";
import { mockTasks } from "@/data/mock-tasks";
import { Task } from "@/data/project";
import { useWorkspace } from "@/providers/workspace-provider";

export default function Page() {
  const { currentWorkspace } = useWorkspace();
  
  // Filter out completed tasks for active board
  const activeTasks: Task[] = mockTasks.filter(
    (task) => task.status !== "completed"
  );

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
