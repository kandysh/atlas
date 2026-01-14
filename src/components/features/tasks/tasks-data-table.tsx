"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { Task } from "@/src/lib/types";
import { DataTable } from "@/src/components/ui/data-table";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { TasksToolbar } from "./tasks-toolbar";

interface TasksDataTableProps {
  columns: ColumnDef<Task, unknown>[];
  data: Task[];
}

export function TasksDataTable({ columns, data }: TasksDataTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Extract unique values for filters
  const { uniqueOwners, uniqueAssetClasses } = useMemo(() => {
    const owners = Array.from(new Set(data.map((task) => task.owner))).filter(
      Boolean
    );
    const assetClasses = Array.from(
      new Set(data.map((task) => task.assetClass))
    ).filter(Boolean);

    return {
      uniqueOwners: owners.sort(),
      uniqueAssetClasses: assetClasses.sort(),
    };
  }, [data]);

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleAddTask = () => {
    console.log("Add new task");
    // TODO: Implement add task functionality
  };

  const handleDeleteSelected = (selectedIds: string[]) => {
    console.log("Delete selected tasks", selectedIds);
    // TODO: Implement delete functionality
  };

  const handleTaskUpdate = (
    taskId: string,
    field: keyof Task,
    value: unknown
  ) => {
    console.log("Update task", taskId, field, value);
    // TODO: Call API to update
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        onRowClick={handleRowClick}
        emptyStateMessage="No tasks found."
        toolbar={(table) => (
          <TasksToolbar
            table={table}
            uniqueOwners={uniqueOwners}
            uniqueAssetClasses={uniqueAssetClasses}
            onAddTask={handleAddTask}
            onDeleteSelected={handleDeleteSelected}
          />
        )}
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

