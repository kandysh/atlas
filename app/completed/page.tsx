"use client";

import { TasksDataTable } from "@/components/tasks-table/tasks-data-table";
import { columns } from "@/components/tasks-table/columns";
import { mockTasks } from "@/data/mock-tasks";
import { Task } from "@/data/project";
import { useWorkspace } from "@/providers/workspace-provider";

export default function CompletedPage() {
  const { currentWorkspace } = useWorkspace();
  
  // Filter only completed tasks
  const completedTasks: Task[] = mockTasks.filter(
    (task) => task.status === "completed"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Completed Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentWorkspace?.name} • {completedTasks.length} completed tasks
        </p>
      </div>

      <TasksDataTable columns={columns} data={completedTasks} />
    </div>
  );
}
