"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { Task } from "@/src/lib/types";
import { DataTable } from "@/src/components/ui/data-table";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableEmptyState } from "@/src/components/ui/data-table-empty-state";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { useCreateTask, useUpdateTask } from "@/src/lib/query/hooks";
import { useWorkspace } from "@/src/providers";
import { createColumns } from "./columns";

interface TasksDataTableProps {
  columns?: ColumnDef<Task, unknown>[];
  data: Task[];
  workspaceId?: string;
}

export function TasksDataTable({ columns: externalColumns, data, workspaceId }: TasksDataTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { currentWorkspace } = useWorkspace();
  
  // Use workspaceId from props or fallback to context
  const activeWorkspaceId = workspaceId || currentWorkspace?.id || "1";
  
  const createTaskMutation = useCreateTask(activeWorkspaceId);
  const updateTaskMutation = useUpdateTask(activeWorkspaceId, 0);

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleAddTask = () => {
    // Create a new task with default data
    createTaskMutation.mutate({
      title: "New Task",
      status: "todo",
      priority: "medium",
    });
  };

  const handleDeleteSelected = (selectedIds: string[]) => {
    console.log("Delete selected tasks", selectedIds);
    // TODO: Implement delete functionality
  };

  const handleTaskUpdate = (
    displayId: string,
    field: string,
    value: unknown
  ) => {
    // Update task using mutation with optimistic update
    updateTaskMutation.mutate({
      displayId,
      patch: { [field]: value },
    });
  };
  
  // Create columns with update handler if not provided
  const uniqueOwners = Array.from(new Set(data.map(t => t.owner))).sort();
  const columns = useMemo(
    () => externalColumns || createColumns(uniqueOwners, handleTaskUpdate),
    [externalColumns, uniqueOwners, handleTaskUpdate]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        onRowClick={handleRowClick}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            onAdd={handleAddTask}
            onDeleteSelected={handleDeleteSelected}
            addButtonLabel="Add Task"
            deleteButtonLabel="Delete"
            searchPlaceholder="Search tasks..."
          />
        )}
        emptyState={
          <DataTableEmptyState
            title="No tasks"
            description="Get started by creating your first task."
            actionLabel="Add Task"
            onAction={handleAddTask}
          />
        }
      />

      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleTaskUpdate}
      />
    </>
  );
}

