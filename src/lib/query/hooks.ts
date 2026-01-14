"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task as DbTask } from "@/src/lib/db";
import { Task as UiTask } from "@/src/lib/types";
import {
  getWorkspaceTasks,
  getWorkspaceFields,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
} from "./queries";
import { dbTaskToUiTask } from "@/src/lib/utils/task-mapper";
import { toast } from "sonner";

/**
 * Query keys factory
 */
export const queryKeys = {
  tasks: (workspaceId: string, page: number) => [
    "tasks",
    { workspaceId, page },
  ],
  fields: (workspaceId: string) => ["fields", { workspaceId }],
  allTasks: (workspaceId: string) => ["tasks", { workspaceId }],
};

/**
 * Hook to fetch workspace tasks with pagination
 */
export function useWorkspaceTasks(workspaceId: string, page: number = 0) {
  return useQuery({
    queryKey: queryKeys.tasks(workspaceId, page),
    queryFn: () => getWorkspaceTasks(workspaceId, page),
    staleTime: 30000, // 30 seconds
    enabled: !!workspaceId,
  });
}

/**
 * Hook to fetch workspace field configurations
 */
export function useWorkspaceFields(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.fields(workspaceId),
    queryFn: () => getWorkspaceFields(workspaceId),
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
    mutationFn: (data: Record<string, any>) =>
      createTaskApi(workspaceId, data),
    onSuccess: (newTask) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({
        queryKey: queryKeys.allTasks(workspaceId),
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
    mutationFn: async ({ displayId, patch }: { displayId: string; patch: Partial<UiTask> }) => {
      // Get cached data to find the DB task ID
      const queryKey = queryKeys.tasks(workspaceId, page);
      const cachedData = queryClient.getQueryData(queryKey) as any;
      
      // If no cache, we need to refetch to get the mapping
      if (!cachedData?.dbTasks || cachedData.dbTasks.length === 0) {
        // Fetch fresh data to get the DB task
        await queryClient.refetchQueries({ queryKey });
        const freshData = queryClient.getQueryData(queryKey) as any;
        
        if (!freshData?.dbTasks) {
          throw new Error("Cannot update task: unable to fetch task data");
        }
      }

      // Get updated cache after potential refetch
      const currentData = queryClient.getQueryData(queryKey) as any;
      
      // Find the DB task by displayId
      const dbTask = currentData.dbTasks.find((t: DbTask) => t.displayId === displayId);
      if (!dbTask) {
        throw new Error(`Cannot find task with displayId: ${displayId}`);
      }

      // Call API with the actual DB UUID
      return updateTaskApi(dbTask.id, patch);
    },
    
    // Optimistic update
    onMutate: async ({ displayId, patch }) => {
      const queryKey = queryKeys.tasks(workspaceId, page);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.tasks) return old;

        return {
          ...old,
          tasks: old.tasks.map((task: UiTask) =>
            task.id === displayId
              ? {
                  ...task,
                  ...patch,
                  updatedAt: new Date(),
                }
              : task
          ),
        };
      });

      // Return context with previous data for rollback
      return { previousData, queryKey };
    },

    // On success, show toast and update with server response
    onSuccess: (updatedDbTask) => {
      const queryKey = queryKeys.tasks(workspaceId, page);
      
      // Update cache with the server response
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.tasks || !old?.dbTasks) return old;

        const updatedUiTask = dbTaskToUiTask(updatedDbTask);
        
        return {
          ...old,
          tasks: old.tasks.map((task: UiTask) =>
            task.id === updatedDbTask.displayId ? updatedUiTask : task
          ),
          dbTasks: old.dbTasks.map((task: DbTask) =>
            task.id === updatedDbTask.id ? updatedDbTask : task
          ),
        };
      });

      toast.success("Saved");
    },

    // On error, rollback and show error
    onError: (error, variables, context) => {
      console.error("Failed to update task:", error);
      
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      
      toast.error("Failed to save changes");
    },

    // Always refetch after error or success to sync with server
    onSettled: (data, error, variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}
