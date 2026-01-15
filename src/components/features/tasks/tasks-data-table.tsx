"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState, useMemo, useCallback } from "react";
import { Task } from "@/src/lib/types";
import { DataTable } from "@/src/components/ui/data-table";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { TasksToolbar } from "./tasks-toolbar";
import { 
  useCreateTask, 
  useUpdateTask, 
  useWorkspaceFields 
} from "@/src/lib/query/hooks";
import { useWorkspace } from "@/src/providers";
import { buildColumnsFromFieldConfigs } from "@/src/lib/utils/column-builder";
import { createColumns } from "./columns";

interface TasksDataTableProps {
  columns?: ColumnDef<Task, unknown>[];
  data: Task[];
  workspaceId?: string;
}

export function TasksDataTable({ 
  columns: externalColumns, 
  data, 
  workspaceId 
}: TasksDataTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { currentWorkspace } = useWorkspace();
  
  const activeWorkspaceId = workspaceId || currentWorkspace?.id || "1";
  
  const createTaskMutation = useCreateTask(activeWorkspaceId);
  const updateTaskMutation = useUpdateTask(activeWorkspaceId, 0);
  const { data: fieldsData, isLoading: isLoadingFields } = useWorkspaceFields(activeWorkspaceId);
  
  const fieldConfigs = fieldsData?.fields || [];

  // Extract unique values for legacy toolbar filters
  const { uniqueOwners, uniqueAssetClasses } = useMemo(() => {
    const owners = Array.from(new Set(data.map((task) => task.owner))).filter(Boolean);
    const assetClasses = Array.from(new Set(data.map((task) => task.assetClass))).filter(Boolean);

    return {
      uniqueOwners: owners.sort(),
      uniqueAssetClasses: assetClasses.sort(),
    };
  }, [data]);

  const handleRowClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  }, []);

  const handleAddTask = useCallback(() => {
    createTaskMutation.mutate({
      title: "New Task",
      status: "todo",
      priority: "medium",
    });
  }, [createTaskMutation]);

  const handleDeleteSelected = useCallback((selectedIds: string[]) => {
    // TODO: Implement delete functionality
    console.log("Delete selected tasks", selectedIds);
  }, []);

  const handleTaskUpdate = useCallback((
    displayId: string,
    field: string,
    value: unknown
  ) => {
    updateTaskMutation.mutate({
      displayId,
      patch: { [field]: value },
    });
    
    setSelectedTask((prev) => 
      prev && prev.id === displayId 
        ? { ...prev, [field]: value } 
        : prev
    );
  }, [updateTaskMutation]);
  
  const columns = useMemo(() => {
    if (externalColumns) return externalColumns;
    
    if (!isLoadingFields && fieldConfigs.length > 0) {
      return buildColumnsFromFieldConfigs(fieldConfigs, data, handleTaskUpdate);
    }
    
    return createColumns(uniqueOwners, uniqueAssetClasses, handleTaskUpdate);
  }, [
    externalColumns, 
    fieldConfigs, 
    isLoadingFields, 
    data, 
    handleTaskUpdate, 
    uniqueOwners, 
    uniqueAssetClasses
  ]);

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
        tasks={data}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleTaskUpdate}
      />
    </>
  );
}

