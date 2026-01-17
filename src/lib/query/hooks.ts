"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task as DbTask, FieldConfig } from "@/src/lib/db";
import {
  getTasks,
  createTask as createTaskAction,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  deleteTasks as deleteTasksAction,
  duplicateTask as duplicateTaskAction,
  getTaskEvents as getTaskEventsAction,
  TaskEventWithUser,
} from "@/src/lib/actions/tasks";
import { 
  getFields,
  updateFieldVisibility as updateFieldVisibilityAction,
} from "@/src/lib/actions/fields";
import { toast } from "sonner";
import { queryKeys } from "./keys";

// Re-export queryKeys for backward compatibility
export { queryKeys };

/**
 * Hook to fetch workspace field configurations
 */
export function useWorkspaceFields(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.fields.byWorkspace(workspaceId),
    queryFn: async (): Promise<{ fields: FieldConfig[] }> => {
      const result = await getFields(workspaceId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { fields: result.fields };
    },
    staleTime: 300000, // 5 minutes - field configs change rarely
    enabled: !!workspaceId,
  });
}

/**
 * Hook to create a new task
 */
export function useCreateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await createTaskAction(workspaceId, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.task;
    },
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byWorkspace(workspaceId),
      });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    },
  });
}

/**
 * Hook to update a task with optimistic updates
 * Takes displayId (TSK-001-0001) and converts it to DB UUID internally
 */
export function useUpdateTask(workspaceId: string, page: number = 0) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayId,
      patch,
    }: {
      displayId: string;
      patch: Record<string, unknown>;
    }) => {
      // Get cached data to find the DB task ID
      const queryKey = queryKeys.tasks.paginated(workspaceId, page);
      const cachedData = queryClient.getQueryData(queryKey) as
        | { dbTasks?: DbTask[] }
        | undefined;

      // If no cache, we need to refetch to get the mapping
      if (!cachedData?.dbTasks || cachedData.dbTasks.length === 0) {
        // Fetch fresh data to get the DB task
        await queryClient.refetchQueries({ queryKey });
        const freshData = queryClient.getQueryData(queryKey) as
          | { dbTasks?: DbTask[] }
          | undefined;

        if (!freshData?.dbTasks) {
          throw new Error("Cannot update task: unable to fetch task data");
        }
      }

      // Get updated cache after potential refetch
      const currentData = queryClient.getQueryData(queryKey) as {
        dbTasks: DbTask[];
      };

      // Find the DB task by displayId
      const dbTask = currentData.dbTasks.find(
        (t: DbTask) => t.displayId === displayId
      );
      if (!dbTask) {
        throw new Error(`Cannot find task with displayId: ${displayId}`);
      }

      // Call action with the actual DB UUID
      const result = await updateTaskAction(dbTask.id, patch);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.task;
    },

    // Optimistic update
    onMutate: async ({ displayId, patch }) => {
      const queryKey = queryKeys.tasks.paginated(workspaceId, page);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKey,
        (old: { tasks?: DbTask[] } | undefined) => {
          if (!old?.tasks) return old;

          return {
            ...old,
            tasks: old.tasks.map((task: DbTask) =>
              task.displayId === displayId
                ? {
                    ...task,
                    data: { ...(task.data || {}), ...patch },
                    updatedAt: new Date(),
                  }
                : task
            ),
          };
        }
      );

      // Return context with previous data for rollback
      return { previousData, queryKey };
    },

    // On success, show toast and refetch
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.paginated(workspaceId, page),
      });
      toast.success("Saved");
    },

    // On error, rollback and show error
    onError: (error, _variables, context) => {
      console.error("Failed to update task:", error);

      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }

      toast.error("Failed to save changes");
    },

    // Always refetch after error or success to sync with server
    onSettled: (_data, _error, _variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

/**
 * Hook to delete a single task
 */
export function useDeleteTask(workspaceId: string, page: number = 0) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const result = await deleteTaskAction(taskId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return taskId;
    },
    onSuccess: (deletedTaskId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byWorkspace(workspaceId),
      });
      toast.success("Task deleted");
    },
    onError: (error) => {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    },
  });
}

/**
 * Hook to delete multiple tasks
 */
export function useDeleteTasks(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      const result = await deleteTasksAction(taskIds);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.deletedCount;
    },
    onSuccess: (deletedCount) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byWorkspace(workspaceId),
      });
      toast.success(`${deletedCount} task(s) deleted`);
    },
    onError: (error) => {
      console.error("Failed to delete tasks:", error);
      toast.error("Failed to delete tasks");
    },
  });
}

/**
 * Hook to duplicate a task
 */
export function useDuplicateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const result = await duplicateTaskAction(taskId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.task;
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byWorkspace(workspaceId),
      });
      toast.success("Task duplicated");
    },
    onError: (error) => {
      console.error("Failed to duplicate task:", error);
      toast.error("Failed to duplicate task");
    },
  });
}

/**
 * Hook to update field visibility
 */
export function useUpdateFieldVisibility(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fieldId, visible }: { fieldId: string; visible: boolean }) => {
      const result = await updateFieldVisibilityAction(fieldId, visible);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.field;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fields.byWorkspace(workspaceId),
      });
    },
    onError: (error) => {
      console.error("Failed to update field visibility:", error);
      toast.error("Failed to update column visibility");
    },
  });
}

/**
 * Hook to fetch task events (history)
 */
export function useTaskEvents(taskId: string | null, limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.tasks.events(taskId || ""),
    queryFn: async (): Promise<TaskEventWithUser[]> => {
      if (!taskId) return [];
      const result = await getTaskEventsAction(taskId, limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.events;
    },
    enabled: !!taskId,
    staleTime: 10000, // 10 seconds - events change frequently
  });
}
