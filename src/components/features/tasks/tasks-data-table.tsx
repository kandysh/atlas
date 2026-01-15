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
  useDeleteTask,
  useDeleteTasks,
  useWorkspaceFields 
} from "@/src/lib/query/hooks";
import { useWorkspace } from "@/src/providers";
import { buildColumnsFromFieldConfigs } from "@/src/lib/utils";
import { createColumns } from "./columns";

interface TasksDataTableProps {
  columns?: ColumnDef<Task, unknown>[];
  data: Task[];
  dbTasks?: { id: string; displayId: string }[];
  workspaceId?: string;
}

export function TasksDataTable({ 
  columns: externalColumns, 
  data,
  dbTasks = [],
  workspaceId 
}: TasksDataTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { currentWorkspace } = useWorkspace();
  
  const activeWorkspaceId = workspaceId || currentWorkspace?.id || "1";
  
  const createTaskMutation = useCreateTask(activeWorkspaceId);
  const updateTaskMutation = useUpdateTask(activeWorkspaceId, 0);
  const deleteTaskMutation = useDeleteTask(activeWorkspaceId, 0);
  const deleteTasksMutation = useDeleteTasks(activeWorkspaceId);
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

  // Map displayId to DB UUID for delete operations
  const getDbId = useCallback((displayId: string): string | null => {
    const task = dbTasks.find((t) => t.displayId === displayId);
    return task?.id || null;
  }, [dbTasks]);

  const handleDeleteTask = useCallback((displayId: string) => {
    const dbId = getDbId(displayId);
    if (dbId) {
      deleteTaskMutation.mutate(dbId);
    }
  }, [deleteTaskMutation, getDbId]);

  const handleDeleteSelected = useCallback((selectedDisplayIds: string[]) => {
    const dbIds = selectedDisplayIds
      .map((displayId) => getDbId(displayId))
      .filter((id): id is string => id !== null);
    
    if (dbIds.length > 0) {
      deleteTasksMutation.mutate(dbIds);
    }
  }, [deleteTasksMutation, getDbId]);

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
      return buildColumnsFromFieldConfigs(
        fieldConfigs, 
        data, 
        handleTaskUpdate,
        handleRowClick,
        handleDeleteTask
      );
    }
    
    return createColumns(uniqueOwners, uniqueAssetClasses, handleTaskUpdate);
  }, [
    externalColumns, 
    fieldConfigs, 
    isLoadingFields, 
    data, 
    handleTaskUpdate,
    handleRowClick,
    handleDeleteTask,
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
        // TODO: Implement drag-and-drop reordering - currently disabled
        enableDragHandle={false}
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

