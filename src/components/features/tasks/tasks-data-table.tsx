'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useState, useMemo, useCallback } from 'react';
import { Task } from '@/src/lib/types';
import { DataTable } from '@/src/components/ui/data-table';
import { TaskDetailDrawer } from './task-detail-drawer';
import { DynamicToolbar } from './dynamic-toolbar';
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useDeleteTasks,
  useDuplicateTask,
  useWorkspaceFields,
  useUpdateFieldVisibility,
} from '@/src/lib/query/hooks';
import { useWorkspace } from '@/src/providers';
import { buildColumnsFromFieldConfigs } from '@/src/lib/utils';

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
  workspaceId,
}: TasksDataTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { currentWorkspace } = useWorkspace();

  const activeWorkspaceId = workspaceId || currentWorkspace?.id || '1';

  const createTaskMutation = useCreateTask(activeWorkspaceId);
  const updateTaskMutation = useUpdateTask(activeWorkspaceId, 0);
  const deleteTaskMutation = useDeleteTask(activeWorkspaceId);
  const deleteTasksMutation = useDeleteTasks(activeWorkspaceId);
  const duplicateTaskMutation = useDuplicateTask(activeWorkspaceId);
  const updateFieldVisibilityMutation =
    useUpdateFieldVisibility(activeWorkspaceId);
  const { data: fieldsData, isLoading: isLoadingFields } =
    useWorkspaceFields(activeWorkspaceId);

  const fieldConfigs = fieldsData?.fields || [];

  const handleRowClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  }, []);

  const handleAddTask = useCallback(() => {
    createTaskMutation.mutate(
      {
        title: 'New Task',
        status: 'todo',
        priority: 'medium',
      },
      {
        onSuccess: (newTask) => {
          // Open drawer with the new task for immediate editing
          if (newTask) {
            const newUiTask = {
              id: newTask.displayId,
              title:
                ((newTask.data as Record<string, unknown>)?.title as string) ||
                'New Task',
              status:
                ((newTask.data as Record<string, unknown>)?.status as string) ||
                'todo',
              priority:
                ((newTask.data as Record<string, unknown>)
                  ?.priority as string) || 'medium',
              owner: '',
              assetClass: '',
              teamsInvolved: [],
              theme: '',
              problemStatement: '',
              solutionDesign: '',
              benefits: '',
              currentHrs: 0,
              savedHrs: 0,
              workedHrs: 0,
              tools: [],
              otherUseCases: '',
              tags: [],
              completionDate: null,
              createdAt: newTask.createdAt,
              updatedAt: newTask.updatedAt,
            } as Task;
            setSelectedTask(newUiTask);
            setIsDrawerOpen(true);
          }
        },
      },
    );
  }, [createTaskMutation]);

  // Map displayId to DB UUID for delete operations
  const getDbId = useCallback(
    (displayId: string): string | null => {
      const task = dbTasks.find((t) => t.displayId === displayId);
      return task?.id || null;
    },
    [dbTasks],
  );

  const handleDeleteTask = useCallback(
    (displayId: string) => {
      const dbId = getDbId(displayId);
      if (dbId) {
        deleteTaskMutation.mutate(dbId);
      }
    },
    [deleteTaskMutation, getDbId],
  );

  const handleDeleteSelected = useCallback(
    (selectedDisplayIds: string[]) => {
      const dbIds = selectedDisplayIds
        .map((displayId) => getDbId(displayId))
        .filter((id): id is string => id !== null);

      if (dbIds.length > 0) {
        deleteTasksMutation.mutate(dbIds);
      }
    },
    [deleteTasksMutation, getDbId],
  );

  const handleDuplicateTask = useCallback(
    (displayId: string) => {
      const dbId = getDbId(displayId);
      if (dbId) {
        duplicateTaskMutation.mutate(dbId);
      }
    },
    [duplicateTaskMutation, getDbId],
  );

  const handleToggleFieldVisibility = useCallback(
    (fieldId: string, visible: boolean) => {
      updateFieldVisibilityMutation.mutate({ fieldId, visible });
    },
    [updateFieldVisibilityMutation],
  );

  const handleTaskUpdate = useCallback(
    (displayId: string, field: string, value: unknown) => {
      updateTaskMutation.mutate({
        displayId,
        patch: { [field]: value },
      });

      setSelectedTask((prev) =>
        prev && prev.id === displayId ? { ...prev, [field]: value } : prev,
      );
    },
    [updateTaskMutation],
  );

  const columns = useMemo(() => {
    if (externalColumns) return externalColumns;

    if (!isLoadingFields && fieldConfigs.length > 0) {
      return buildColumnsFromFieldConfigs(
        fieldConfigs,
        data,
        handleTaskUpdate,
        handleRowClick,
        handleDeleteTask,
        handleDuplicateTask,
      );
    }
    return [];
  }, [
    externalColumns,
    fieldConfigs,
    isLoadingFields,
    data,
    handleTaskUpdate,
    handleRowClick,
    handleDeleteTask,
    handleDuplicateTask,
  ]);

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        onRowClick={handleRowClick}
        emptyStateMessage="No tasks found."
        toolbar={(table) => (
          <DynamicToolbar
            table={table}
            fieldConfigs={fieldConfigs}
            tasks={data}
            onAddTask={handleAddTask}
            onDeleteSelected={handleDeleteSelected}
            onToggleFieldVisibility={handleToggleFieldVisibility}
          />
        )}
      />

      <TaskDetailDrawer
        task={selectedTask}
        tasks={data}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleTaskUpdate}
        dbTaskId={selectedTask ? getDbId(selectedTask.id) : null}
        workspaceId={activeWorkspaceId}
        fieldConfigs={fieldConfigs}
      />
    </>
  );
}
