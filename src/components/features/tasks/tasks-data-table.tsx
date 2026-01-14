"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Task } from "@/src/lib/types";
import { DataTable } from "@/src/components/ui/data-table";
import { TaskDetailDrawer } from "./task-detail-drawer";

interface TasksDataTableProps {
  columns: ColumnDef<Task, unknown>[];
  data: Task[];
}

export function TasksDataTable({ columns, data }: TasksDataTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
        searchPlaceholder="Search tasks..."
        onRowClick={handleRowClick}
        onAdd={handleAddTask}
        onDeleteSelected={handleDeleteSelected}
        addButtonLabel="Add Task"
        emptyStateMessage="No tasks found."
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

